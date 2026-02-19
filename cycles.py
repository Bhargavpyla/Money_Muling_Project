import pandas as pd
import networkx as nx

# Load CSV
df = pd.read_csv("test.csv")

# Convert timestamp to datetime (important for fraud systems)
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Create directed graph
G = nx.DiGraph()

for _, row in df.iterrows():
    G.add_edge(
        row["sender_id"],
        row["receiver_id"],
        amount=row["amount"],
        timestamp=row["timestamp"]
    )

# Detect cycles
cycles = list(nx.simple_cycles(G))

print("Detected Circular Fund Routing:")
print(cycles)