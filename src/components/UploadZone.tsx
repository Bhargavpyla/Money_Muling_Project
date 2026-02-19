import React from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle } from 'lucide-react';
import type { Transaction } from '../types';

interface UploadZoneProps {
    onDataLoaded: (data: Transaction[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onDataLoaded }) => {
    const [error, setError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        setError(null);
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Validate headers
                const fields = results.meta.fields;
                const required = ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'];
                const missing = required.filter(field => !fields?.includes(field));

                if (missing.length > 0) {
                    setError(`Missing columns: ${missing.join(', ')}`);
                    return;
                }

                // Parse data
                const transactions: Transaction[] = results.data.map((row: any) => ({
                    transaction_id: row.transaction_id,
                    sender_id: row.sender_id,
                    receiver_id: row.receiver_id,
                    amount: parseFloat(row.amount),
                    timestamp: row.timestamp
                }));

                onDataLoaded(transactions);
            },
            error: (err) => {
                setError(`Parsing error: ${err.message}`);
            }
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div
            className={`p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer text-center relative
        ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-500'}
        ${error ? 'border-red-500' : ''}
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
            />

            {error ? (
                <div className="flex flex-col items-center text-red-400">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-300 font-medium">Drop CSV here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                </div>
            )}
        </div>
    );
};
