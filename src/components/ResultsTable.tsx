import React from 'react';
import type { AnalysisResult } from '../types';
import { AlertTriangle, Users, Activity } from 'lucide-react';

interface ResultsTableProps {
    analysisResult: AnalysisResult | null;
    onRingClick?: (ringId: string, members: string[]) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ analysisResult, onRingClick }) => {
    if (!analysisResult || analysisResult.fraud_rings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Activity className="h-12 w-12 mb-2 opacity-20" />
                <p>No fraud rings detected yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 bg-surface flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertTriangle className="text-danger h-5 w-5" />
                    Detected Fraud Rings
                    <span className="bg-danger/20 text-danger text-xs px-2 py-0.5 rounded-full">
                        {analysisResult.fraud_rings.length}
                    </span>
                </h3>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/50 text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 font-medium">Ring ID</th>
                            <th className="p-3 font-medium">Pattern</th>
                            <th className="p-3 font-medium">Risk Score</th>
                            <th className="p-3 font-medium">Members</th>
                            <th className="p-3 font-medium text-right">Count</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {analysisResult.fraud_rings.map((ring) => (
                            <tr
                                key={ring.ringId}
                                className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                                onClick={() => onRingClick?.(ring.ringId, ring.members)}
                            >
                                <td className="p-3 font-mono text-primary">{ring.ringId}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs border ${ring.patternType === 'cycle' ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                                            ring.patternType === 'smurfing' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                                'border-gray-500/50 text-gray-400'
                                        }`}>
                                        {ring.patternType.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${ring.riskScore > 90 ? 'bg-danger' : 'bg-warning'}`}
                                                style={{ width: `${ring.riskScore}%` }}
                                            />
                                        </div>
                                        <span className={ring.riskScore > 90 ? 'text-danger' : 'text-warning'}>
                                            {ring.riskScore}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3 max-w-xs truncate text-gray-400" title={ring.members.join(', ')}>
                                    {ring.members.join(', ')}
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1 text-gray-300">
                                        <Users className="h-3 w-3" />
                                        {ring.memberCount}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
