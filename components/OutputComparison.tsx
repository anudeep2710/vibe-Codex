import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { ComparisonResult } from '../types';

interface OutputComparisonProps {
    expected: string;
    actual: string;
    comparison: ComparisonResult;
    showDiff?: boolean;
}

export const OutputComparison: React.FC<OutputComparisonProps> = ({
    expected,
    actual,
    comparison,
    showDiff = true
}) => {
    const getStatusIcon = () => {
        if (comparison.matched) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        } else if (comparison.similarity > 50) {
            return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        } else {
            return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusColor = () => {
        if (comparison.matched) return 'bg-green-500/10 border-green-500';
        if (comparison.similarity > 50) return 'bg-yellow-500/10 border-yellow-500';
        return 'bg-red-500/10 border-red-500';
    };

    const getStatusText = () => {
        if (comparison.matched) return 'Perfect Match';
        if (comparison.similarity > 50) return 'Partial Match';
        return 'Output Mismatch';
    };

    return (
        <div className="space-y-3">
            {/* Status Header */}
            <div className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getStatusColor()}`}>
                <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className="text-sm font-medium text-text">{getStatusText()}</span>
                </div>
                <div className="text-xs text-muted">
                    Similarity: {comparison.similarity}%
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0d1117] border border-border rounded p-2">
                    <p className="text-xs text-muted mb-1">Total Lines</p>
                    <p className="text-lg font-bold text-text">{comparison.stats.totalLines}</p>
                </div>
                <div className="bg-[#0d1117] border border-green-500/20 rounded p-2">
                    <p className="text-xs text-muted mb-1">Matched</p>
                    <p className="text-lg font-bold text-green-400">{comparison.stats.matchedLines}</p>
                </div>
                <div className="bg-[#0d1117] border border-red-500/20 rounded p-2">
                    <p className="text-xs text-muted mb-1">Different</p>
                    <p className="text-lg font-bold text-red-400">{comparison.stats.differentLines}</p>
                </div>
            </div>

            {/* Diff View */}
            {showDiff && comparison.differences.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Differences ({comparison.differences.length})
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {comparison.differences.map((diff, idx) => (
                            <div
                                key={idx}
                                className="bg-[#0d1117] border border-border rounded-lg p-3 space-y-2"
                            >
                                <p className="text-xs text-muted font-mono">Line {diff.line}</p>
                                <div className="space-y-1">
                                    <div className="flex items-start space-x-2">
                                        <span className="text-xs text-red-400 font-bold">-</span>
                                        <pre className="flex-1 text-xs text-red-300 bg-red-500/10 rounded px-2 py-1 overflow-x-auto">
                                            {diff.expected || '(empty)'}
                                        </pre>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-xs text-green-400 font-bold">+</span>
                                        <pre className="flex-1 text-xs text-green-300 bg-green-500/10 rounded px-2 py-1 overflow-x-auto">
                                            {diff.actual || '(empty)'}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Side-by-side view */}
            {!comparison.matched && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-green-400">Expected Output</p>
                        <pre className="text-xs text-gray-300 bg-[#0d1117] border border-green-500/20 rounded p-3 max-h-48 overflow-auto">
                            {expected || '(empty)'}
                        </pre>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-red-400">Actual Output</p>
                        <pre className="text-xs text-gray-300 bg-[#0d1117] border border-red-500/20 rounded p-3 max-h-48 overflow-auto">
                            {actual || '(empty)'}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};
