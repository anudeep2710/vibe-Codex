// Multi-key rotation service for Gemini API with automatic failover
// Handles multiple API keys with round-robin and quota exhaustion tracking

import { GoogleGenAI } from '@google/genai';

interface APIKeyStatus {
    key: string;
    isExhausted: boolean;
    lastFailure: number | null;
    requestCount: number;
    resetTime: number; // When quota resets (daily at midnight PST)
}

class GeminiKeyManager {
    private keys: APIKeyStatus[] = [];
    private currentIndex = 0;
    private readonly COOLDOWN_PERIOD = 60 * 60 * 1000; // 1 hour cooldown after quota fail

    constructor(apiKeys: string[]) {
        // Initialize all keys
        this.keys = apiKeys.map(key => ({
            key: key.trim(),
            isExhausted: false,
            lastFailure: null,
            requestCount: 0,
            resetTime: this.getNextResetTime()
        }));

        console.log(`✅ Initialized ${this.keys.length} Gemini API keys`);
    }

    /**
     * Get next available API key using round-robin with smart failover
     */
    getNextKey(): string {
        const now = Date.now();

        // Reset exhausted keys if cooldown period passed or daily reset occurred
        this.keys.forEach(keyStatus => {
            if (keyStatus.isExhausted) {
                const cooldownPassed = keyStatus.lastFailure && (now - keyStatus.lastFailure > this.COOLDOWN_PERIOD);
                const dailyReset = now > keyStatus.resetTime;

                if (cooldownPassed || dailyReset) {
                    keyStatus.isExhausted = false;
                    keyStatus.lastFailure = null;
                    keyStatus.requestCount = 0;
                    keyStatus.resetTime = this.getNextResetTime();
                    console.log('🔄 Key reset and available again');
                }
            }
        });

        // Find next available key using round-robin
        let attempts = 0;
        while (attempts < this.keys.length) {
            const keyStatus = this.keys[this.currentIndex];

            if (!keyStatus.isExhausted) {
                const key = keyStatus.key;
                keyStatus.requestCount++;

                // Move to next key for next request (round-robin)
                this.currentIndex = (this.currentIndex + 1) % this.keys.length;

                return key;
            }

            // Try next key
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;
        }

        // All keys exhausted - return first key anyway (will throw error)
        console.error('❌ All API keys exhausted!');
        throw new Error('All Gemini API keys have exceeded their quota. Please try again later.');
    }

    /**
     * Mark a key as exhausted when it hits quota limit
     */
    markKeyExhausted(key: string) {
        const keyStatus = this.keys.find(k => k.key === key);
        if (keyStatus) {
            keyStatus.isExhausted = true;
            keyStatus.lastFailure = Date.now();

            const availableKeys = this.keys.filter(k => !k.isExhausted).length;
            console.warn(`⚠️ Key exhausted. ${availableKeys}/${this.keys.length} keys still available`);
        }
    }

    /**
     * Get statistics about key usage
     */
    getStats() {
        const available = this.keys.filter(k => !k.isExhausted).length;
        const exhausted = this.keys.length - available;

        return {
            total: this.keys.length,
            available,
            exhausted,
            keys: this.keys.map(k => ({
                exhausted: k.isExhausted,
                requests: k.requestCount,
                resetIn: k.resetTime - Date.now()
            }))
        };
    }

    /**
     * Calculate next daily quota reset time (midnight PST)
     */
    private getNextResetTime(): number {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(8, 0, 0, 0); // Midnight PST = 8:00 UTC
        return tomorrow.getTime();
    }
}

// Initialize with API keys from environment
const API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
    import.meta.env.VITE_GEMINI_API_KEY_5,
    import.meta.env.VITE_GEMINI_API_KEY_6,
    import.meta.env.VITE_GEMINI_API_KEY_7,
    import.meta.env.VITE_GEMINI_API_KEY_8,
    import.meta.env.VITE_GEMINI_API_KEY_9,
    import.meta.env.VITE_GEMINI_API_KEY_10,
].filter(key => key && key.length > 0); // Filter out undefined/empty keys

export const keyManager = new GeminiKeyManager(API_KEYS);

/**
 * Get Gemini client with automatic key rotation
 */
export function getGeminiClient(): GoogleGenAI {
    const apiKey = keyManager.getNextKey();
    return new GoogleGenAI({ apiKey });
}

/**
 * Check if error is quota-related
 */
export function isQuotaError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
        message.includes('quota') ||
        message.includes('rate limit') ||
        message.includes('429') ||
        message.includes('resource exhausted') ||
        error?.status === 429
    );
}

/**
 * Handle API call with automatic retry using different keys
 */
export async function withKeyRotation<T>(
    apiCall: (client: GoogleGenAI) => Promise<T>,
    maxRetries: number = API_KEYS.length
): Promise<T> {
    let lastError: any;
    let currentKey: string | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            currentKey = keyManager.getNextKey();
            const client = new GoogleGenAI({ apiKey: currentKey });

            const result = await apiCall(client);
            return result;

        } catch (error: any) {
            lastError = error;

            // If quota error, mark key as exhausted and try next key
            if (isQuotaError(error) && currentKey) {
                keyManager.markKeyExhausted(currentKey);
                console.log(`🔄 Quota exceeded on key ${attempt + 1}, trying next key...`);
                continue;
            }

            // For non-quota errors, throw immediately
            throw error;
        }
    }

    // All keys failed
    throw new Error(`All ${maxRetries} API keys failed. Last error: ${lastError?.message}`);
}

// Export stats for debugging
export function getKeyManagerStats() {
    return keyManager.getStats();
}
