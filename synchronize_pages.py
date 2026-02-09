
import os

files_to_update = [
    r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/page.tsx",
    r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/page.tsx"
]

# Mapping of old text snippets to new text
# We need to be careful with exact matches or use unique substrings.

# For page.tsx:
# Old: Pesona Kota Solo: The Spirit of Java yang Tak Lekang oleh Waktu
# New: Profil Kota Surakarta (Solo) Lengkap: Sejarah, Wisata, & 54 Kelurahan
# Also need to check if the description needs update?
# Old Desc: Surakarta (Solo) adalah jantung budaya Jawa. Wisata sejarah Keraton, kuliner legendaris (Tengkleng, Serabi), dan harmoni tradisi modern yang memikat.
# New Desc: Panduan lengkap Kota Solo: Sejarah Mataram Islam, destinasi wisata, kuliner legendaris, dan profil detail 54 Kelurahan di 5 Kecamatan.

# For berita/page.tsx:
# Similar update.

updates = [
    {
        "old": "Pesona Kota Solo: The Spirit of Java yang Tak Lekang oleh Waktu",
        "new": "Profil Kota Surakarta (Solo) Lengkap: Sejarah, Wisata, & 54 Kelurahan"
    },
    {
        "old": "Surakarta (Solo) adalah jantung budaya Jawa. Wisata sejarah Keraton, kuliner legendaris (Tengkleng, Serabi), dan harmoni tradisi modern yang memikat.",
        "new": "Panduan lengkap Kota Solo: Sejarah Mataram Islam, destinasi wisata, kuliner legendaris, dan profil detail 54 Kelurahan di 5 Kecamatan."
    }
]

def update_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        modified_content = content
        changes_count = 0
        
        for update in updates:
            if update["old"] in modified_content:
                modified_content = modified_content.replace(update["old"], update["new"])
                changes_count += 1
            else:
                print(f"Warning: String not found in {os.path.basename(path)}: '{update['old'][:30]}...'")

        if content != modified_content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(modified_content)
            print(f"Updated {os.path.basename(path)} with {changes_count} changes.")
        else:
             print(f"No changes made to {os.path.basename(path)}.")
             
    except Exception as e:
        print(f"Error updating {path}: {e}")

for file_path in files_to_update:
    update_file(file_path)
