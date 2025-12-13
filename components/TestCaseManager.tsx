import React, { useState } from 'react';
import { Plus, Trash2, Play, PlayCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { TestCase, TestCaseResult } from '../types';
import { OutputComparison } from './OutputComparison';

interface TestCaseManagerProps {
    testCases: TestCase[];
    onTestCasesChange: (cases: TestCase[]) => void;
    onRunAll: () => void;
    onRunSingle: (index: number) => void;
    results?: TestCaseResult[];
    isRunning?: boolean;
}

export const TestCaseManager: React.FC<TestCaseManagerProps> = ({
    testCases,
    onTestCasesChange,
    onRunAll,
    onRunSingle,
    results = [],
    isRunning = false
}) => {
    const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

    const addTestCase = () => {
        const newTest: TestCase = {
            id: `test_${Date.now()}`,
            name: `Test Case ${testCases.length + 1}`,
            stdin: '',
            expectedOutput: ''
        };
        onTestCasesChange([...testCases, newTest]);
        // Auto-expand new test case
        setExpandedTests(new Set([...expandedTests, newTest.id]));
    };

    const removeTestCase = (id: string) => {
        onTestCasesChange(testCases.filter(tc => tc.id !== id));
        const newExpanded = new Set(expandedTests);
        newExpanded.delete(id);
        setExpandedTests(newExpanded);
    };

    const updateTestCase = (id: string, updates: Partial<TestCase>) => {
        onTestCasesChange(
            testCases.map(tc => tc.id === id ? { ...tc, ...updates } : tc)
        );
    };

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedTests);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedTests(newExpanded);
    };

    const getTestResult = (testCaseId: string): TestCaseResult | undefined => {
        return results.find(r => r.testCaseId === testCaseId);
    };

    const getPassedCount = () => results.filter(r => r.passed).length;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-white">Test Cases</h3>
                    {results.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded ${getPassedCount() === testCases.length
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {getPassedCount()}/{testCases.length} Passed
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={addTestCase}
                        className="px-3 py-1.5 bg-accent hover:bg-blue-400 text-white rounded text-xs font-medium flex items-center space-x-1 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Add Test</span>
                    </button>
                    {testCases.length > 0 && (
                        <button
                            onClick={onRunAll}
                            disabled={isRunning}
                            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1 transition-colors ${isRunning
                                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                    : 'bg-green-600 hover:bg-green-500 text-white'
                                }`}
                        >
                            <PlayCircle className="w-3 h-3" />
                            <span>{isRunning ? 'Running...' : 'Run All'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Test Cases List */}
            {testCases.length === 0 ? (
                <div className="bg-[#0d1117] border border-border rounded-lg p-8 text-center">
                    <p className="text-sm text-muted mb-2">No test cases yet</p>
                    <p className="text-xs text-muted/60">Add test cases to validate your code output</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {testCases.map((testCase, index) => {
                        const isExpanded = expandedTests.has(testCase.id);
                        const result = getTestResult(testCase.id);

                        return (
                            <div
                                key={testCase.id}
                                className={`bg-[#0d1117] border rounded-lg overflow-hidden transition-colors ${result
                                        ? result.passed
                                            ? 'border-green-500/30'
                                            : 'border-red-500/30'
                                        : 'border-border'
                                    }`}
                            >
                                {/* Test Case Header */}
                                <div className="flex items-center justify-between p-3 bg-surface/50">
                                    <div className="flex items-center space-x-2 flex-1">
                                        <button
                                            onClick={() => toggleExpanded(testCase.id)}
                                            className="text-muted hover:text-text transition-colors"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                        <input
                                            value={testCase.name}
                                            onChange={(e) => updateTestCase(testCase.id, { name: e.target.value })}
                                            className="bg-transparent text-sm font-medium text-white border-none outline-none focus:ring-0 flex-1"
                                            placeholder="Test case name"
                                        />
                                        {result && (
                                            <span className={`text-xs font-medium ${result.passed ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {result.passed ? '✓ Passed' : '✗ Failed'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onRunSingle(index)}
                                            disabled={isRunning}
                                            className="text-accent hover:text-blue-300 disabled:text-gray-600 transition-colors"
                                            title="Run this test"
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeTestCase(testCase.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                            title="Delete test"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Test Case Content (Expanded) */}
                                {isExpanded && (
                                    <div className="p-3 space-y-3 border-t border-border">
                                        {/* Input */}
                                        <div>
                                            <label className="text-xs text-muted mb-1 block">Input (stdin)</label>
                                            <textarea
                                                value={testCase.stdin}
                                                onChange={(e) => updateTestCase(testCase.id, { stdin: e.target.value })}
                                                placeholder="Enter input for this test case"
                                                className="w-full bg-black/20 border border-border rounded p-2 text-sm text-text font-mono focus:outline-none focus:border-accent resize-none"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Expected Output */}
                                        <div>
                                            <label className="text-xs text-muted mb-1 block">Expected Output</label>
                                            <textarea
                                                value={testCase.expectedOutput}
                                                onChange={(e) => updateTestCase(testCase.id, { expectedOutput: e.target.value })}
                                                placeholder="Enter expected output"
                                                className="w-full bg-black/20 border border-border rounded p-2 text-sm text-text font-mono focus:outline-none focus:border-accent resize-none"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Results */}
                                        {result && (
                                            <div className="pt-2 border-t border-border">
                                                <OutputComparison
                                                    expected={testCase.expectedOutput}
                                                    actual={result.execution.stdout || ''}
                                                    comparison={result.comparison}
                                                    showDiff={!result.passed}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Templates */}
            {testCases.length === 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-400 mb-2 font-medium">💡 Pro Tip:</p>
                    <p className="text-xs text-muted">
                        Test cases help you validate your code automatically. Add multiple test cases with different inputs and expected outputs to ensure your code works correctly.
                    </p>
                </div>
            )}
        </div>
    );
};
