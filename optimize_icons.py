from PIL import Image
import os

def generate_icons():
    # Load source
    src_path = 'public/logo-kt.png'
    img = Image.open(src_path).convert('RGBA')
    
    # 1. Crop to content (remove transparent padding)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to {bbox}, new size: {img.size}")
    
    # 2. Make square canvas
    # We want valid square icons.
    # Dimensions of content
    w, h = img.size
    max_dim = max(w, h)
    
    # Create new square transparent canvas
    # Use max_dim as base size
    final_size = (max_dim, max_dim)
    square_img = Image.new('RGBA', final_size, (0, 0, 0, 0))
    
    # Center the cropped content
    offset = ((max_dim - w) // 2, (max_dim - h) // 2)
    square_img.paste(img, offset)
    
    # 3. Generate sizes
    targets = [
        ('src/app/icon.png', 128),      # High-res for tab (32->128 is better)
        ('src/app/apple-icon.png', 180),
        ('public/icon-192.png', 192),
        ('public/icon-512.png', 512)
    ]
    
    for path, size in targets:
        # Resize with high quality
        resized = square_img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(path, 'PNG')
        print(f"Generated {path} ({size}x{size})")

if __name__ == '__main__':
    generate_icons()
