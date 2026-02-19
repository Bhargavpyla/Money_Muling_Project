import pandas as pd
import networkx as nx
from datetime import timedelta
import json, time, io

# ── CONSTANTS (per problem statement) ─────────────────
FAN_IN_THRESHOLD   = 10   # 10+ senders → 1 receiver
FAN_OUT_THRESHOLD  = 10   # 1 sender → 10+ receivers
TIME_WINDOW_HOURS  = 72   # 72-hour window
MERCHANT_OUT_LIMIT = 50   # False positive filter

# ── STEP 1: LOAD CSV ───────────────────────────────────
def load_transactions(csv_path):
    df = pd.read_csv(csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)
    return df

# ── STEP 2: 72H WINDOW FILTER ─────────────────────────
def get_window_transactions(account_id, df):
    acct_txns = df[(df["sender_id"] == account_id) |
                   (df["receiver_id"] == account_id)]
    if acct_txns.empty:
        return pd.DataFrame()
    first_seen = acct_txns["timestamp"].min()
    window_end = first_seen + timedelta(hours=TIME_WINDOW_HOURS)
    return df[(df["timestamp"] >= first_seen) &
              (df["timestamp"] <= window_end)]

# ── STEP 3: DETECT SMURFING PER ACCOUNT ───────────────
def detect_smurfing_for_account(account_id, df):
    windowed = get_window_transactions(account_id, df)
    if windowed.empty:
        return None

    G = nx.DiGraph()
    for _, row in windowed.iterrows():
        G.add_edge(row["sender_id"], row["receiver_id"],
                   amount=row["amount"])

    if account_id not in G:
        return None

    in_deg  = G.in_degree(account_id)
    out_deg = G.out_degree(account_id)
    total   = in_deg + out_deg

    # False positive filters
    if out_deg > MERCHANT_OUT_LIMIT and in_deg <= 2:
        return None  # Legit merchant
    if in_deg > MERCHANT_OUT_LIMIT and out_deg <= 2:
        return None  # Legit payroll

    patterns = []
    score = 0

    if in_deg >= FAN_IN_THRESHOLD:
        patterns.append("smurfing_fan_in")
        score += 35

    if out_deg >= FAN_OUT_THRESHOLD:
        patterns.append("smurfing_fan_out")
        score += 35

    time_span_hrs = (windowed["timestamp"].max() -
                     windowed["timestamp"].min()).total_seconds() / 3600
    if total > 5 and time_span_hrs < 24:
        patterns.append("high_velocity")
        score += 15

    if not patterns:
        return None

    return {
        "account_id":        account_id,
        "suspicion_score":   round(min(score, 100), 1),
        "detected_patterns": patterns,
        "ring_id":           "SMURF_" + account_id,
        "in_degree":         in_deg,
        "out_degree":        out_deg
    }

# ── STEP 4: RUN ON ALL ACCOUNTS ───────────────────────
def detect_all_smurfing(csv_path):
    start = time.time()
    df = load_transactions(csv_path)

    all_accounts = set(df["sender_id"].tolist() +
                       df["receiver_id"].tolist())
    suspicious = []

    for acc in all_accounts:
        result = detect_smurfing_for_account(acc, df)
        if result:
            suspicious.append(result)

    suspicious.sort(key=lambda x: x["suspicion_score"], reverse=True)

    return {
        "suspicious_accounts": suspicious,
        "fraud_rings": [
            {
                "ring_id":         a["ring_id"],
                "member_accounts": [a["account_id"]],
                "pattern_type":    "smurfing",
                "risk_score":      a["suspicion_score"]
            }
            for a in suspicious
        ],
        "summary": {
            "total_accounts_analyzed":     len(all_accounts),
            "suspicious_accounts_flagged": len(suspicious),
            "fraud_rings_detected":        len(suspicious),
            "processing_time_seconds":     round(time.time()-start, 2)
        }
    }

# ── MAIN ──────────────────────────────────────────────
if __name__ == "__main__":
    result = detect_all_smurfing("smurfing_test.csv")
    print(json.dumps(result, indent=2))
