#!/usr/bin/env python3
"""
Generate simple game sprites for Zombie Rush game
Requires: pip install Pillow
"""

from PIL import Image, ImageDraw
import os

output_dir = os.path.join(os.path.dirname(__file__), '../public/assets/zombie')
os.makedirs(output_dir, exist_ok=True)

def create_player():
    """Create player sprite (blue character)"""
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Body (light blue)
    draw.rectangle([10, 10, 54, 54], fill=(74, 144, 226), outline=(44, 90, 160), width=3)
    
    # Eyes
    draw.rectangle([20, 25, 28, 33], fill=(255, 255, 255))
    draw.rectangle([36, 25, 44, 33], fill=(255, 255, 255))
    
    # Mouth
    draw.rectangle([24, 40, 40, 44], fill=(255, 255, 255))
    
    img.save(os.path.join(output_dir, 'player.png'))
    print('✓ Created player.png')

def create_zombie():
    """Create zombie sprite (green character with red eyes)"""
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Body (dark green)
    draw.rectangle([10, 10, 54, 54], fill=(107, 142, 35), outline=(74, 95, 26), width=3)
    
    # Red eyes
    draw.rectangle([18, 25, 26, 33], fill=(255, 0, 0))
    draw.rectangle([38, 25, 46, 33], fill=(255, 0, 0))
    
    # Blood mouth
    draw.rectangle([22, 38, 42, 46], fill=(139, 0, 0))
    
    # Teeth
    for i in range(4):
        draw.rectangle([24 + i*5, 38, 27 + i*5, 46], fill=(255, 255, 255))
    
    img.save(os.path.join(output_dir, 'zombie.png'))
    print('✓ Created zombie.png')

def create_bullet():
    """Create bullet sprite (yellow circle)"""
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Yellow bullet
    draw.ellipse([4, 4, 28, 28], fill=(255, 215, 0), outline=(255, 165, 0), width=2)
    
    # Highlight
    draw.ellipse([8, 8, 16, 16], fill=(255, 255, 153))
    
    img.save(os.path.join(output_dir, 'bullet.png'))
    print('✓ Created bullet.png')

def create_background():
    """Create dark background texture"""
    import random
    img = Image.new('RGB', (800, 600), (26, 26, 26))
    draw = ImageDraw.Draw(img)
    
    # Add texture with random noise
    for _ in range(5000):
        x = random.randint(0, 799)
        y = random.randint(0, 599)
        gray = random.randint(0, 30)
        draw.rectangle([x, y, x+2, y+2], fill=(gray, gray, gray))
    
    # Add blood stains
    for _ in range(10):
        x = random.randint(0, 800)
        y = random.randint(0, 600)
        radius = random.randint(10, 40)
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                    fill=(139, 0, 0, 76))  # Semi-transparent
    
    img.save(os.path.join(output_dir, 'bg.png'))
    print('✓ Created bg.png')

if __name__ == '__main__':
    try:
        create_player()
        create_zombie()
        create_bullet()
        create_background()
        print('\n✅ All sprites generated successfully!')
    except ImportError:
        print('⚠️  Error: Pillow library not found. Install it with: pip install Pillow')
    except Exception as e:
        print(f'⚠️  Error: {e}')

