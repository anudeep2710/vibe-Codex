import React, { useState, useEffect } from 'react';
import { Package, Download, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getRuntimes, getPackages, installPackage, uninstallPackage, PistonRuntime, PackageInfo } from '../services/pistonService';

export const RuntimeManager: React.FC = () => {
    const [runtimes, setRuntimes] = useState<PistonRuntime[]>([]);
    const [packages, setPackages] = useState<PackageInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [installing, setInstalling] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [runtimesData, packagesData] = await Promise.all([
                getRuntimes(),
                getPackages(),
            ]);
            setRuntimes(runtimesData);
            setPackages(packagesData);
        } catch (err: any) {
            setError(err.message || 'Failed to load runtime data');
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (language: string, version: string) => {
        const key = `${language}-${version}`;
        setInstalling(key);
        setError(null);
        try {
            await installPackage(language, version);
            await loadData(); // Reload to get updated package list
        } catch (err: any) {
            setError(err.message || 'Failed to install package');
        } finally {
            setInstalling(null);
        }
    };

    const handleUninstall = async (language: string, version: string) => {
        const key = `${language}-${version}`;
        setInstalling(key);
        setError(null);
        try {
            await uninstallPackage(language, version);
            await loadData(); // Reload to get updated package list
        } catch (err: any) {
            setError(err.message || 'Failed to uninstall package');
        } finally {
            setInstalling(null);
        }
    };

    const isInstalled = (language: string, version: string) => {
        return packages.some(
            (pkg) => pkg.language === language && pkg.language_version === version && pkg.installed
        );
    };

    if (loading && runtimes.length === 0) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="ml-3 text-muted">Loading runtimes...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-accent" />
                    Runtime & Package Manager
                </h2>
                <p className="text-sm text-muted">
                    Available language runtimes from Piston API
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-400">Error</p>
                        <p className="text-xs text-red-300 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {runtimes.map((runtime) => {
                    const installed = isInstalled(runtime.language, runtime.version);
                    const key = `${runtime.language}-${runtime.version}`;
                    const isProcessing = installing === key;

                    return (
                        <div
                            key={key}
                            className="glass-card p-4 hover:border-accent/50 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-white">{runtime.language}</h3>
                                    <p className="text-xs text-muted">v{runtime.version}</p>
                                    {runtime.runtime && (
                                        <p className="text-xs text-muted/60">Runtime: {runtime.runtime}</p>
                                    )}
                                </div>
                                {installed && (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                            </div>

                            {runtime.aliases && runtime.aliases.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-muted mb-1">Aliases:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {runtime.aliases.map((alias) => (
                                            <span
                                                key={alias}
                                                className="badge badge-primary text-xs"
                                            >
                                                {alias}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-2">
                                {!installed ? (
                                    <button
                                        onClick={() => handleInstall(runtime.language, runtime.version)}
                                        disabled={isProcessing}
                                        className="flex-1 px-3 py-2 bg-accent hover:bg-blue-400 text-white rounded text-sm font-medium flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Installing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>Install</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUninstall(runtime.language, runtime.version)}
                                        disabled={isProcessing}
                                        className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-sm font-medium flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Removing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Uninstall</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {runtimes.length === 0 && !loading && (
                <p className="text-center text-muted py-8">No runtimes available</p>
            )}
        </div>
    );
};
