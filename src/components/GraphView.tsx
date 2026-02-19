import React, { useMemo, useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { Transaction, AnalysisResult } from '../types';

interface GraphViewProps {
    transactions: Transaction[];
    analysisResult: AnalysisResult | null;
}

export const GraphView: React.FC<GraphViewProps> = ({ transactions, analysisResult }) => {
    const fgRef = useRef<any>(null);
    const [width, setWidth] = useState(window.innerWidth);

    // Prepare Graph Data
    const graphData = useMemo(() => {
        if (transactions.length === 0) return { nodes: [], links: [] };

        const nodesMap = new Map<string, any>();
        const links: any[] = [];

        transactions.forEach(tx => {
            if (!nodesMap.has(tx.sender_id)) nodesMap.set(tx.sender_id, { id: tx.sender_id, val: 1 });
            if (!nodesMap.has(tx.receiver_id)) nodesMap.set(tx.receiver_id, { id: tx.receiver_id, val: 1 });

            // Aggregate volume for node size?
            nodesMap.get(tx.sender_id).val += tx.amount;
            nodesMap.get(tx.receiver_id).val += tx.amount;

            links.push({
                source: tx.sender_id,
                target: tx.receiver_id,
                amount: tx.amount,
                id: tx.transaction_id
            });
        });

        // Augment nodes with Analysis Result
        if (analysisResult) {
            analysisResult.suspicious_accounts.forEach(acc => {
                if (nodesMap.has(acc.account_id)) {
                    const node = nodesMap.get(acc.account_id);
                    node.isSuspicious = true;
                    node.riskScore = acc.suspicion_score;
                    node.patterns = acc.detected_patterns;
                    node.ringId = acc.ring_id;
                }
            });
        }

        return {
            nodes: Array.from(nodesMap.values()),
            links
        };
    }, [transactions, analysisResult]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth > 300 ? window.innerWidth - 320 : window.innerWidth);
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full h-full bg-slate-950 flex flex-col">
            {transactions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    Upload a processed CSV file to visualize the graph.
                </div>
            ) : (
                <ForceGraph2D
                    ref={fgRef}
                    width={width} // Use dynamic width
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.id} ${node.isSuspicious ? '(Suspicious)' : ''}`}
                    nodeColor={(node: any) => node.isSuspicious ? (node.riskScore > 90 ? '#ef4444' : '#f59e0b') : '#3b82f6'}
                    nodeRelSize={4}
                    linkColor={() => '#475569'}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    backgroundColor="#020617" // slate-950
                    onNodeClick={(node) => {
                        // Focus on node
                        fgRef.current?.centerAt(node.x, node.y, 1000);
                        fgRef.current?.zoom(4, 2000);
                    }}
                    // Custom styling for suspicious nodes
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.id;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        // Draw Circle
                        // const r = Math.sqrt(node.val || 1) * 0.5 + 2; 
                        const radius = 5;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.isSuspicious ? (node.riskScore > 90 ? '#ef4444' : '#f59e0b') : '#3b82f6';
                        ctx.fill();

                        // Draw Ring/Border if suspicious
                        if (node.isSuspicious) {
                            ctx.lineWidth = 2 / globalScale;
                            ctx.strokeStyle = '#fff';
                            ctx.stroke();
                        }

                        // Text
                        if (globalScale > 2 || node.isSuspicious) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.fillText(label, node.x - textWidth / 2, node.y + radius + fontSize);
                        }

                        // Active area for interaction
                        //  node.__bckgDimensions = bckgDimensions; // if needing background
                    }}
                />
            )}
        </div>
    );
};
