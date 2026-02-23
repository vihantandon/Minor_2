import pandas as pd

splits = {
    "train": "data/train-00000-of-00001.parquet",
    "test": "data/test-00000-of-00001.parquet",
}
df = pd.read_parquet("hf://datasets/nlile/hendrycks-MATH-benchmark/" + splits["train"])

df.to_csv("dataset.csv", index=True, index_label="id")
print(df.columns)
