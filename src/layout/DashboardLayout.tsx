import React, { useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { GraphView } from '../components/GraphView';
import { ResultsTable } from '../components/ResultsTable';
import type { Transaction, AnalysisResult } from '../types';

import { FraudDetectionEngine } from '../utils/FraudDetectionEngine';
import { downloadAnalysis } from '../utils/exporter';
import { Download, Activity } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const handleDataLoaded = (data: Transaction[]) => {
        console.log("Loaded transactions:", data.length);
        setTransactions(data);

        // Run analysis
        setTimeout(() => { // Small timeout to allow UI to update
            const engine = new FraudDetectionEngine(data);
            const result = engine.analyze();
            setAnalysisResult(result);
        }, 100);
    };

    const handleExport = () => {
        if (analysisResult) {
            downloadAnalysis(analysisResult);
        }
    };

    return (
        <div className="flex h-screen bg-background text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-gray-700 flex flex-col p-4 gap-4">
                <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    FinCrime Engine
                </h1>
                <UploadZone onDataLoaded={handleDataLoaded} />

                {analysisResult && (
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded transition-colors mb-4"
                    >
                        <Download className="h-4 w-4" />
                        Export JSON
                    </button>
                )}

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 bg-slate-800/50 rounded text-sm space-y-2">
                        <h3 className="font-semibold text-gray-400 border-b border-gray-700 pb-1">Statistics</h3>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Transactions:</span>
                            <span className="font-mono">{transactions.length}</span>
                        </div>
                        {analysisResult && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Accounts:</span>
                                    <span className="font-mono">{analysisResult.summary.total_accounts_analyzed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Rings:</span>
                                    <span className="font-mono text-danger">{analysisResult.summary.fraud_rings_detected}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Graph Area */}
                <div className="flex-1 relative bg-slate-900/50 overflow-hidden">
                    <GraphView transactions={transactions} analysisResult={analysisResult} />
                </div>

                {/* Bottom Panel (Table) */}
                <div className="h-72 bg-surface border-t border-gray-700 overflow-hidden flex flex-col">
                    <ResultsTable analysisResult={analysisResult} />
                </div>
            </main>
        </div>
    );
};
