import pandas as pd

from smurfing import detect_all_smurfing

smurf_results = detect_all_smurfing("test.csv")
print(smurf_results)
