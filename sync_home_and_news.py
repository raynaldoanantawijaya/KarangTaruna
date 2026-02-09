
import os

# Define file paths
home_page_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/page.tsx"
news_page_path = r"c:/Users/rayna/Pictures/Website Karang Taruna/karang-taruna-app/src/app/berita/page.tsx"

# 1. Update News Page (berita/page.tsx)
# We need to find the specific static article entry and update it.
# It is Article #4 in the list.

try:
    with open(news_page_path, "r", encoding="utf-8") as f:
        news_content = f.read()

    # Strings to find in news_page
    old_news_title = "Pesona Kota Solo: The Spirit of Java yang Tak Lekang oleh Waktu"
    new_news_title = "Profil Kota Surakarta (Solo) Lengkap: Sejarah, Wisata, & 54 Kelurahan"
    
    old_news_desc = "Surakarta (Solo) adalah jantung budaya Jawa. Wisata sejarah Keraton, kuliner legendaris (Tengkleng, Serabi), dan harmoni tradisi modern yang memikat."
    new_news_desc = "Panduan lengkap Kota Solo: Sejarah Mataram Islam, destinasi wisata, kuliner legendaris, dan profil detail 54 Kelurahan di 5 Kecamatan."

    if old_news_title in news_content:
        news_content = news_content.replace(old_news_title, new_news_title)
        news_content = news_content.replace(old_news_desc, new_news_desc)
        
        with open(news_page_path, "w", encoding="utf-8") as f:
            f.write(news_content)
        print("Successfully updated src/app/berita/page.tsx")
    else:
        print("Warning: Could not find old title in news page. Already updated?")

except Exception as e:
    print(f"Error updating news page: {e}")


# 2. Update Home Page (page.tsx)
# We want to replace the current featured internal news with the Surakarta one.
# Current Featured: internal-profil-mojo
# We will do a robust replacement of the specific block if possible, or string replacement.

try:
    with open(home_page_path, "r", encoding="utf-8") as f:
        home_content = f.read()

    # Target strings in Home Page
    # Link
    old_home_link = '/berita/read?url=internal-profil-mojo'
    new_home_link = '/berita/read?url=internal-profil-kota-surakarta'
    
    # Image
    old_home_img = 'src="/visi-misi.png"'
    new_home_img = 'src="/surakarta.jpg"'
    
    # Title
    old_home_title = "Mengenal Lebih Dekat Karang Taruna Asta Wira Dipta Kelurahan Mojo"
    # Note: In the file it might be split across lines or have surrounding tags.
    # In step 4790:
    # 258:                   <h3 className="text-2xl font-bold mb-4 leading-tight">
    # 259:                     Mengenal Lebih Dekat Karang Taruna Asta Wira Dipta Kelurahan Mojo
    # 260:                   </h3>
    
    # Description
    old_home_desc = "Profil lengkap organisasi kepemudaan resmi Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta. Visi, misi, dan program kerja unggulan untuk pemuda Solo."

    # Since there are multiple occurrences of 'internal-profil-mojo' (maybe?), we should target the one in the "Kabar Internal" section.
    # The file has a section: {/* SECTION BARU: Kabar Karang Taruna Mojo (Internal) */}
    
    # Let's simple replace the strings if they are unique enough in this context.
    # The title and desc are definitely unique to that card.
    
    changes = 0
    
    if old_home_title in home_content:
        home_content = home_content.replace(old_home_title, new_news_title) # Use same new title
        changes += 1
    
    if old_home_desc in home_content:
        home_content = home_content.replace(old_home_desc, new_news_desc)
        changes += 1

    # For link, it appears twice in that block (button and text).
    if old_home_link in home_content:
        home_content = home_content.replace(old_home_link, new_home_link)
        changes += 1
        
    # For Image
    # src="/visi-misi.png" appears multiple times (Hero, Sambutan, Internal).
    # We only want to replace the one in the Internal Update section.
    # The internal update section starts with `Kabar Internal` (line 235).
    # It has `<img src="/visi-misi.png" alt="Profil Karang Taruna Mojo" ...`
    
    # Let's find the specific block index.
    idx_section = home_content.find("Kabar Internal")
    if idx_section != -1:
        # Search forward from there for the image
        idx_img = home_content.find('src="/visi-misi.png"', idx_section)
        if idx_img != -1:
            # Check if this is indeed the one we want (e.g. check ALT text nearby?)
            # The alt is `alt="Profil Karang Taruna Mojo"`
            # Let's construct a unique replacement for this image tag line.
            
            # Original: src="/visi-misi.png"
            #           alt="Profil Karang Taruna Mojo"
            
            # Let's just do a specific string replace for the img tag attributes if possible, OR
            # Just replace `src="/visi-misi.png"` ONLY IF followed by `alt="Profil Karang Taruna Mojo"`?
            # Regex might be safer, or just manual chunk replacement.
            
            old_img_block = 'src="/visi-misi.png"\n                    alt="Profil Karang Taruna Mojo"'
            new_img_block = 'src="/surakarta.jpg"\n                    alt="Profil Kota Surakarta"'
            
            if old_img_block in home_content:
               home_content = home_content.replace(old_img_block, new_img_block)
               changes += 1
            else:
                # Try simpler match (maybe whitespace diff)
                pass

    if changes > 0:
        with open(home_page_path, "w", encoding="utf-8") as f:
            f.write(home_content)
        print(f"Successfully updated src/app/page.tsx with {changes} replacements.")
    else:
        print("Warning: No changes made to Home Page. content might differ from expectation.")

except Exception as e:
    print(f"Error updating home page: {e}")
