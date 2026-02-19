import pandas as pd
from collections import defaultdict, deque

# -------------------------------
# STEP 1: Parse CSV using pandas
# -------------------------------
def parse_csv(file_path):
    df = pd.read_csv(file_path)
    return df


# -----------------------------------
# STEP 2: Build directed graph
# -----------------------------------
def build_graph(df):
    out_edges = defaultdict(list)
    in_edges = defaultdict(list)

    for _, row in df.iterrows():
        sender = row["sender_id"]
        receiver = row["receiver_id"]

        out_edges[sender].append(receiver)
        in_edges[receiver].append(sender)

    return out_edges, in_edges


# ------------------------------------------------
# STEP 3: Detect Layered Shell Networks
# ------------------------------------------------
def detect_layered_shell_networks(out_edges, in_edges):
    accounts = set(out_edges.keys()) | set(in_edges.keys())

    # Total transaction count per account
    tx_count = {
        acc: len(out_edges.get(acc, [])) + len(in_edges.get(acc, []))
        for acc in accounts
    }

    fraud_rings = []
    suspicious_accounts = {}
    visited_paths = set()

    ring_counter = 1
    MAX_DEPTH = 5
    MIN_HOPS = 3

    for start in accounts:
        queue = deque()
        queue.append((start, [start]))

        while queue:
            current, path = queue.popleft()

            if len(path) - 1 > MAX_DEPTH:
                continue

            for neighbor in out_edges.get(current, []):
                if neighbor in path:
                    continue

                new_path = path + [neighbor]
                hops = len(new_path) - 1

                if hops >= MIN_HOPS:
                    intermediates = new_path[1:-1]

                    # Check shell condition
                    is_shell = all(
                        2 <= tx_count.get(node, 0) <= 3
                        for node in intermediates
                    )

                    path_key = tuple(new_path)

                    if is_shell and path_key not in visited_paths:
                        visited_paths.add(path_key)

                        ring_id = f"RING_{ring_counter:03d}"
                        ring_counter += 1

                        fraud_rings.append({
                            "ring_id": ring_id,
                            "member_accounts": new_path,
                            "pattern_type": "layered_shell"
                        })

                        for acc in new_path:
                            if acc not in suspicious_accounts:
                                suspicious_accounts[acc] = {
                                    "account_id": acc,
                                    "detected_patterns": ["layered_shell"],
                                    "ring_id": ring_id
                                }

                queue.append((neighbor, new_path))

    return fraud_rings, list(suspicious_accounts.values())


# -------------------------------
# STEP 4: Run everything
# -------------------------------
def run_layered_shell_detection(csv_path):
    df = parse_csv(csv_path)
    out_edges, in_edges = build_graph(df)

    fraud_rings, suspicious_accounts = detect_layered_shell_networks(
        out_edges, in_edges
    )

    return {
        "fraud_rings": fraud_rings,
        "suspicious_accounts": suspicious_accounts
    }


# -------------------------------
# Example execution
# -------------------------------
if __name__ == "__main__":
    result = run_layered_shell_detection("test.csv")

    print("Fraud Rings Detected:")
    for ring in result["fraud_rings"]:
        print(ring)

    print("\nSuspicious Accounts:")
    for acc in result["suspicious_accounts"]:
        print(acc)
