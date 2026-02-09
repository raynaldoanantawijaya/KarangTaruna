import os

file_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/read/page.tsx"
content_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/read/correct_content.txt"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        original_content = f.read()

    with open(content_path, "r", encoding="utf-8") as f:
        correct_content = f.read()

    start_marker = '    "internal-profil-kota-surakarta": {'
    end_marker = '    "internal-pemerintahan-surakarta": {'

    start_idx = original_content.find(start_marker)
    end_idx = original_content.find(end_marker)

    if start_idx == -1:
        print("Error: Start marker not found!")
        exit(1)
    
    if end_idx == -1:
        print("Error: End marker not found!")
        exit(1)

    print(f"Found start at {start_idx}, end at {end_idx}")

    # Construct new content
    # We keep everything before start_idx
    # We insert correct_content
    # We keep everything from end_idx onwards
    new_content = original_content[:start_idx] + correct_content + "\n" + original_content[end_idx:]

    # Also fix the specific < div error globally if it exists elsewhere (like in pemerintahan article)
    new_content = new_content.replace("< div", "<div")
    new_content = new_content.replace("< !--", "<!--") # Fix potential bad comments
    new_content = new_content.replace("-- >", "-->")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Successfully patched the file.")

except Exception as e:
    print(f"An error occurred: {e}")
    exit(1)
