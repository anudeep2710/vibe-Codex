import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text,
    fullScreen = false
}) => {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                {/* Outer glow ring */}
                <div className={`absolute inset-0 ${sizeClasses[size]} blur-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 animate-pulse`} />
                {/* Spinner */}
                <Loader2 className={`${sizeClasses[size]} text-accent animate-spin relative z-10`} />
            </div>
            {text && (
                <p className="text-sm text-muted animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
};
