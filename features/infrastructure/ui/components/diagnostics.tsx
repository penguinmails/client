"use client";

import React, { useState, useEffect } from 'react';
import { runInfrastructureDiagnostics, DiagnosticResult } from '../../actions/diagnostics';
import { CheckCircle, AlertTriangle, RefreshCcw, Activity, Shield, Mail, Globe } from 'lucide-react';

export const InfrastructureDiagnostics = () => {
    const [results, setResults] = useState<DiagnosticResult[]>([]);
    const [loading, setLoading] = useState(false);

    const checkConnectivity = async () => {
        setLoading(true);
        try {
            const data = await runInfrastructureDiagnostics();
            setResults(data);
        } catch (err) {
            console.error("Diagnostic failure:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkConnectivity();
    }, []);

    const getIcon = (service: string) => {
        if (service.includes('Hestia')) return <Globe className="w-5 h-5" />;
        if (service.includes('KumoMTA')) return <Mail className="w-5 h-5" />;
        if (service.includes('Mautic')) return <Shield className="w-5 h-5" />;
        return <Activity className="w-5 h-5" />;
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Infrastructure Diagnostics
                    </h1>
                    <p className="text-slate-400 text-sm">Verifying connectivity to Flynet Pro backend services</p>
                </div>
                <button 
                    onClick={checkConnectivity}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-all text-white font-medium"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.length > 0 ? results.map((res, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm transition-all hover:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                                {getIcon(res.service)}
                            </div>
                            {res.status === 'healthy' ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                            )}
                        </div>
                        <h3 className="font-semibold text-slate-200 mb-1">{res.service}</h3>
                        <p className="text-xs text-slate-400 mb-3">{res.message}</p>
                        
                        <div className="flex items-center gap-2 mt-auto">
                            <span className={`h-2 w-2 rounded-full ${res.status === 'healthy' ? 'bg-emerald-500 shadow-sm' : 'bg-rose-500 shadow-sm'}`} />
                            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                {res.status}
                            </span>
                            {res.latency && (
                                <span className="ml-auto text-xs text-slate-500 font-mono">
                                    {res.latency}ms
                                </span>
                            )}
                        </div>
                    </div>
                )) : Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 animate-pulse h-40" />
                ))}
            </div>

            <div className="bg-amber-900/10 border border-amber-900/20 rounded-lg p-4 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="text-sm text-amber-200/80">

                    <p className="font-semibold text-amber-400 mb-1">Testing Note</p>
                    These diagnostics run from your Next.js server directly to the VPS. 
                    If a service shows unhealthy, verify the <code className="bg-black/30 px-1 rounded text-amber-300">SERVER_HOSTNAME</code> 
                    and credentials in your <code className="bg-black/30 px-1 rounded text-amber-300">.env.local</code>.
                </div>
            </div>
        </div>
    );
};
