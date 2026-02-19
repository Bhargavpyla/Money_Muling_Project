export interface Transaction {
    transaction_id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    timestamp: string; // ISO string
}

export interface Node {
    id: string; // account_id
    riskScore: number;
    isSuspicious: boolean;
    flags: string[];
}

export interface Link {
    source: string;
    target: string;
    amount: number;
    timestamp: string;
}

export interface FraudRing {
    ringId: string;
    patternType: 'cycle' | 'smurfing' | 'shell' | 'other';
    memberCount: number;
    riskScore: number;
    members: string[]; // member account IDs
}

export interface SuspiciousAccount {
    account_id: string;
    suspicion_score: number;
    detected_patterns: string[];
    ring_id?: string;
}

export interface AnalysisResult {
    suspicious_accounts: SuspiciousAccount[];
    fraud_rings: FraudRing[];
    summary: {
        total_accounts_analyzed: number;
        suspicious_accounts_flagged: number;
        fraud_rings_detected: number;
        processing_time_seconds: number;
    };
}
