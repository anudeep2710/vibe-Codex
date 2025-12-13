import { GoogleGenAI, Type } from "@google/genai";
import { GenerationPlan, FileSystemState, ChatMessage } from '../types';
import { withKeyRotation } from './keyManager';

// Cache for API responses to prevent duplicate calls
const responseCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Retry helper with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (maxRetries <= 0) throw error;

    // Don't retry on authentication errors
    if (error.message?.includes('API Key') || error.message?.includes('401')) {
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
};

// Generate cache key from inputs
const getCacheKey = (prefix: string, ...args: any[]): string => {
  return `${prefix}_${JSON.stringify(args)}`;
};

const formatContext = (files: FileSystemState, history: ChatMessage[]) => {
  let contextStr = "CURRENT PROJECT FILES:\n";
  if (Object.keys(files).length === 0) {
    contextStr += "(No files created yet)\n";
  } else {
    Object.values(files).forEach(file => {
      // Truncate very large files to save tokens if necessary, 
      // but for this scale we send full content for better context.
      contextStr += `--- FILE: ${file.path} ---\n${file.content}\n\n`;
    });
  }

  let historyStr = "CONVERSATION HISTORY:\n";
  // Get last 10 messages to maintain context without overflowing
  const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
  recentHistory.forEach(msg => {
    historyStr += `${msg.role.toUpperCase()}: ${msg.content}\n`;
  });

  return { contextStr, historyStr };
};

export const generatePlan = async (goal: string, files: FileSystemState, history: ChatMessage[]): Promise<GenerationPlan> => {
  // Check cache first
  const historyArray = Array.isArray(history) ? history : [];
  const cacheKey = getCacheKey('plan', goal, Object.keys(files), historyArray.slice(-5));
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Use multi-key rotation for automatic failover
  const plan = await withKeyRotation(async (ai) => {
    const { contextStr, historyStr } = formatContext(files, history);

    const systemPrompt = `You are a Senior Polyglot Software Architect. 
    Your goal is to analyze a coding request and create a detailed implementation plan.
    
    CONTEXT:
    You have access to the current file system state and conversation history.
    Always analyze the EXISTING files before creating new ones. 
    If the user asks to modify something, your plan should involve updating existing files.
    
    The plan should be appropriate for the requested language or framework.
    Focus on file structure, dependencies, and technical approach.`;

    const prompt = `
    ${contextStr}
    
    ${historyStr}
    
    USER REQUEST: "${goal}"
    
    Create a JSON execution plan including a summary, list of files to create or modify, and technical approach.
    `;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              filesToCreate: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of files to create OR overwrite."
              },
              technicalApproach: { type: Type.STRING }
            },
            required: ["summary", "filesToCreate", "technicalApproach"]
          }
        }
      })
    );

    if (!response.text) {
      throw new Error("Failed to generate plan - empty response from API");
    }

    return JSON.parse(response.text) as GenerationPlan;
  });

  // Store in cache
  responseCache.set(cacheKey, { data: plan, timestamp: Date.now() });

  return plan;
};

export const generateCode = async (goal: string, plan: GenerationPlan, files: FileSystemState, history: ChatMessage[]): Promise<Record<string, string>> => {
  // Use multi-key rotation for automatic failover
  return await withKeyRotation(async (ai) => {
    const { contextStr, historyStr } = formatContext(files, history);

    const systemPrompt = `You are an expert Polyglot Developer (React, TypeScript, Python, HTML, CSS).
    Generate production-ready code based on the user's goal and the provided architectural plan.
    
    RULES:
    1. Detect the target language based on the file extension.
    2. For React: Use Functional Components with Hooks and Tailwind CSS.
    3. For Python: Use PEP 8 standards.
    4. Ensure all imports are valid for the given context.
    5. OUTPUT FORMAT:
       FILE: [path]
       [code content]
    6. IMPORTANT: You must output the FULL content of the file, even if you are just editing a small part. Do not output diffs.
    7. Do not include markdown code blocks.
    `;

    const prompt = `
    ${contextStr}
    
    ${historyStr}
    
    CURRENT GOAL: ${goal}
    PLAN SUMMARY: ${plan.summary}
    TECHNICAL APPROACH: ${plan.technicalApproach}
    FILES TO GENERATE/UPDATE: ${plan.filesToCreate.join(', ')}
    
    Generate the code now.
    `;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4,
        }
      })
    );

    const text = response.text || '';

    // Parse the output
    const generatedFiles: Record<string, string> = {};
    const chunks = text.split(/FILE:\s*/);

    chunks.forEach(chunk => {
      if (!chunk.trim()) return;

      const firstLineEnd = chunk.indexOf('\n');
      if (firstLineEnd === -1) return;

      const filePath = chunk.substring(0, firstLineEnd).trim();
      let content = chunk.substring(firstLineEnd + 1).trim();

      // Cleanup markdown if present (fallback)
      content = content.replace(/^```(typescript|tsx|ts|javascript|js|python|py|html|css|json|md)?/gm, '').replace(/```$/gm, '');

      if (filePath && content) {
        generatedFiles[filePath] = content;
      }
    });

    return generatedFiles;
  });
};