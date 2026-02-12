
import os

file_path = r'c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/read/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-based indexing in mind, but list is 0-based.
# We want to keep lines 1 to 21. (indices 0 to 20)
# We want to remove lines 22 to 1547. (indices 21 to 1546)
# We want to keep lines 1548 to end. (indices 1547 to end)

# Let's verify content of the lines we are about to delete
print(f"Deleting lines 22 to 1547. Total: {1547 - 22 + 1} lines.")
print(f"Line 22 starts with: {lines[21]}")
print(f"Line 1547 starts with: {lines[1546]}")

# Slice
new_lines = lines[:21] + lines[1547:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("File updated.")
