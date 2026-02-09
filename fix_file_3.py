import os

file_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/read/page.tsx"
content_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/kelurahan_details.txt"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        original_content = f.read()

    with open(content_path, "r", encoding="utf-8") as f:
        kelurahan_content = f.read()

    # Target String to Replace
    # <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>
    
    target_str = '<h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>'
    
    # We want to replace this line AND Insert the new content BEFORE it (or rather, replace it with new content + renamed header).
    # The kelurahan_content ALREADY contains the renamed header at the end:
    # <div>
    #    <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait</h3>
    
    # Wait, my kelurahan_details.txt ended with:
    #                 <!-- 7. INDEKS PENCARIAN (RENAMED) -->
    #                 <div>
    #                     <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait</h3>
    
    # So I just need to find the `target_str` and replace it with `kelurahan_content`.
    # AND I should also remove the `<div>` wrapper of the original SEO section?
    # No, the original structure was:
    # <!-- 6. ULTIMATE KEYWORDS -->
    # <div>
    #     <h3 ...>Indeks Pencarian Terkait (SEO Ultimate)</h3>
    #     <div class="p-6 ..."> ... </div>
    # </div>
    
    # If I replace lines 1102 (the H3) with my massive block, I need to be careful about the closing divs.
    # My massive block starts with:
    # <!-- 6. DAFTAR KELURAHAN (DETAILED) -->
    # <div> ... </div> (many divs)
    # ...
    # <!-- 7. INDEKS PENCARIAN (RENAMED) -->
    # <div>
    #    <h3 ...>Indeks Pencarian Terkait</h3>
    
    # The original file has:
    # 1100:                 <!-- 6. ULTIMATE KEYWORDS -->
    # 1101:                 <div>
    # 1102:                     <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>
    # 1103:                     <div class="p-6 ...">
    
    # I want to insert my content BEFORE line 1100.
    # AND then change line 1102 to "Indeks Pencarian Terkait".
    
    # Actually, simpler:
    # 1. Find `<!-- 6. ULTIMATE KEYWORDS -->`
    # 2. Replace it with `kelurahan_content`.
    # 3. But `kelurahan_content` ends with the *start* of the Next section (Indeks Pencarian).
    # so I need to make sure the original H3 is gone or replaced.
    
    # Strategy:
    # Replace:
    # <!-- 6. ULTIMATE KEYWORDS -->
    #                 <div>
    #                     <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>
    
    # WITH:
    # kelurahan_content
    
    # Let's verify exact string in file.
    
    search_block = '<!-- 6. ULTIMATE KEYWORDS -->\n                <div>\n                    <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>'
    
    # Since indentation might vary (tabs vs spaces), I should be careful.
    # I'll use find for the unique H3 string first.
    
    idx_h3 = original_content.find(target_str)
    if idx_h3 == -1:
        print("Error: Target H3 not found!")
        exit(1)
        
    # Now look backwards for `<!-- 6. ULTIMATE KEYWORDS -->`
    # It should be close.
    
    start_search = max(0, idx_h3 - 200)
    chunk_before = original_content[start_search:idx_h3]
    
    marker_comment = "<!-- 6. ULTIMATE KEYWORDS -->"
    idx_comment = chunk_before.find(marker_comment)
    
    if idx_comment == -1:
        print("Warning: Comment marker not found nearby. Proceeding with H3 replacement only.")
        # If comment not found, just replace H3 and prepend content?
        # But I want to inject BEFORE the parent div of H3 if possible, or close the previous div?
        # The previous section closed with `</div>`.
        
        # Let's just replace the H3 line.
        # But my new content has a huge block AND the new H3.
        # So replacing H3 line matches perfectly.
        
        new_content = original_content.replace(target_str, kelurahan_content)
        
        # But wait, `kelurahan_details.txt` starts directly with `<!-- 6. DAFTAR KELURAHAN ... -->`.
        # And the original H3 was inside a `<div>`.
        # If I replace H3 with my block, my block will be INSIDE that `<div>`.
        # That `<div>` (line 1101) wraps the Ultimate Keywords section.
        # If I put my 54 kelurahan INSIDE that div, it might be fine, but structurally maybe not what I want if I want to separate them.
        
        # Original:
        # <!-- 6. ULTIMATE KEYWORDS -->
        # <div>
        #    <h3>...</h3>
        #    <div>...keywords...</div>
        # </div>
        
        # If I replace H3, I get:
        # <!-- 6. ULTIMATE KEYWORDS -->
        # <div>
        #    <!-- 6. DAFTAR KELURAHAN -->
        #    <div>...</div>
        #    ...
        #    <h3>...</h3>
        #    <div>...keywords...</div>
        # </div>
        
        # This nests my huge section inside the keyword section's container.
        # It's better to close the container before my section?
        # Or replace the container start `<div>` as well.
        
        # Let's find `<div>` before H3.
        # We can try to replace the whole block from `<!-- 6. ULTIMATE KEYWORDS -->` down to H3.
        
        # We need to construct the exact string to replace.
        # From `view_file`:
        # 1100:                 <!-- 6. ULTIMATE KEYWORDS -->
        # 1101:                 <div>
        # 1102:                     <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>
        
        # Check indentation.
        # It seems to be 16 spaces? (4 tabs or 16 spaces).
        # Let's try to match loosely.
        
        pass

    else:
        # Found comment.
        full_start_idx = start_search + idx_comment
        # We want to replace from `full_start_idx` up to end of H3.
        end_replace_idx = idx_h3 + len(target_str)
        
        # Check what is being replaced:
        # <!-- 6. ULTIMATE KEYWORDS -->
        #                 <div>
        #                     <h3 class="text-2xl font-bold mt-8 mb-4">Indeks Pencarian Terkait (SEO Ultimate)</h3>
        
        # My replacement `kelurahan_content` starts with:
        #
        #                <!-- 6. DAFTAR KELURAHAN (DETAILED) -->
        #                <div>
        
        # And ends with:
        #    <h3 ...>Indeks Pencarian Terkait</h3>
        
        # So I am replacing the wrapper div opening as well?
        # Be careful. If I replace line 1101 `<div>`, then I start my own `<div>` definitions.
        # But wait, my content has `<div>` for the section.
        # AND at the end, I have:
        # <div>
        #    <h3>...</h3>
        
        # So `kelurahan_content` OPENS a div for the "Indeks Pencarian" section at the end.
        
        # The original code had:
        # <div>
        #    <h3>...</h3>
        #    <div> ... keywords ... </div>
        # </div>
        
        # If I replace up to H3, the `<div> ... keywords ... </div>` and closing `</div>` are still there.
        # So my new content ends with `<div>` (OPENING).
        # And then the existing `<div> ... keywords ... </div>` follows.
        # And then the existing closing `</div>`.
        # So structure becomes:
        # [My Huge Block (closed divs)]
        # [Opening Div for Keywords]
        # [H3 Keywords]
        # [Keywords Content]
        # [Closing Div Keywords]
        
        # This seems correct!
        
        new_content = original_content[:full_start_idx] + kelurahan_content + original_content[end_replace_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Successfully injected kelurahan details.")

except Exception as e:
    print(f"An error occurred: {e}")
    exit(1)
