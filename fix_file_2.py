import os

file_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/read/page.tsx"
content_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/read/restore_pemerintahan.txt"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        original_content = f.read()

    with open(content_path, "r", encoding="utf-8") as f:
        pemerintahan_content = f.read()

    # The INTERNAL_ARTICLES object ends with:
    #     }
    # };
    # We want to insert pemerintahan_content before that last closing brace of the object.
    
    # We'll look for "internal-profil-kota-surakarta" closing brace.
    # It ends with:
    #         `
    #     },
    
    # Let's find the closing brace of internal-profil-kota-surakarta
    # We can search for the end of that specific block.
    
    marker = '    "internal-profil-kota-surakarta": {'
    start_idx = original_content.find(marker)
    if start_idx == -1:
         print("Error: internal-profil-kota-surakarta not found!")
         exit(1)

    # Find the next ocurrence of `    },` after start_idx
    # Be careful, inside the body there might be `},` but unlikely with that indentation.
    # The body is a backtick string.
    
    # A safer bet: The INTERNAL_ARTICLES object closes with `};` at the start of a line (or indented).
    # In the file view it was:
    # 1261:     }
    # 1262: };
    
    end_marker = "    }\n};"
    # Actually, newline depends on file. Let's try to match `};`
    end_obj_idx = original_content.find("};", start_idx)
    
    if end_obj_idx == -1:
        print("Error: End of INTERNAL_ARTICLES object not found!")
        exit(1)
    
    # We want to insert BEFORE the closing brace of INTERNAL_ARTICLES.
    # The closing brace is at `end_obj_idx`.
    # But wait, `};` is the end of the variable declaration.
    # The closing brace of the object is the `}` before `;`.
    
    # Let's verify what's before `};`
    # It should be `    }\n` (closing of surakarta article).
    
    insertion_point = end_obj_idx 
    
    # We need to add a comma to the previous element if it doesn't have one.
    # The previous element is `internal-profil-kota-surakarta`.
    # It ends with `}`.
    
    # Check if there is a comma
    # Looking backwards from insertion_point
    # Skip whitespace
    i = insertion_point - 1
    while i > start_idx and original_content[i].isspace():
        i -= 1
        
    if original_content[i] != ',':
        # We need to prepend a comma to our new content?
        # Or append a comma to the previous content.
        # easier to prepend comma to new content if we are inserting after.
        
        # ACTUALLY, simpler approach:
        # locate `    "internal-profil-kota-surakarta": {`
        # locate the closing `},` or `}` for that key.
        # Since I just wrote it, I know it ends with `    }` (no comma) because it was the last element.
        
        # So I will replace `    }\n};` with `    },\n` + pemerintahan_content + `\n};`
        
        target_str = "    }\n};"
        # Since we might have different indentation or newlines, let's be careful.
        # I'll use simple replacement if it's unique enough.
        
        # Check uniqueness
        if original_content.count(target_str) == 1:
             new_content = original_content.replace(target_str, "    },\n" + pemerintahan_content + "\n};")
        else:
             # If ambiguous, fall back to finding position relative to start_idx
             search_region = original_content[start_idx:]
             idx_in_region = search_region.find(target_str)
             if idx_in_region == -1:
                 # maybe it's `    }\r\n};` ?
                 target_str_r = "    }\r\n};"
                 idx_in_region_r = search_region.find(target_str_r)
                 if idx_in_region_r != -1:
                      target_str = target_str_r
                      idx_in_region = idx_in_region_r
                 else:
                      print("Error: Could not find strict closing pattern.")
                      exit(1)
                      
             final_content = original_content[:start_idx + idx_in_region] + "    },\n" + pemerintahan_content + "\n};" + original_content[start_idx + idx_in_region + len(target_str):]
             new_content = final_content

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Successfully patched the file to restore pemerintahan article.")

except Exception as e:
    print(f"An error occurred: {e}")
    exit(1)
