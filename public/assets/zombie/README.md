# Zombie Game Assets

## الأصول المتوفرة / Available Assets

### الصور / Images
- `player.png` - Player sprite (64x64)
- `zombie.png` - Zombie sprite (64x64)
- `bullet.png` - Bullet sprite (32x32)
- `bg.png` - Background texture (800x600)
- `bg.jpg` - Alternative background (from reference project)

### الخط / Font
- `font.png` - Bitmap font texture
- `font.xml` - Bitmap font definition

### الأصوات / Audio
- `hit.wav` - Hit sound effect (placeholder)
- `gun.wav` - Gunshot sound effect (placeholder)

## كيفية تحديث الأصول / How to Update Assets

### استبدال الصور / Replace Images
يمكنك استبدال أي ملف PNG بصورة أفضل. تأكد من الحفاظ على نفس أسماء الملفات:
You can replace any PNG file with better graphics. Make sure to keep the same file names.

### استبدال الأصوات / Replace Audio
1. يمكنك استبدال ملفات WAV بصوت أفضل
2. أو تحويلها إلى MP3 وتحديث `PreloadScene.ts`:
   ```typescript
   this.load.audio('hit', '/assets/zombie/hit.mp3');
   this.load.audio('gun', '/assets/zombie/gun.mp3');
   ```

### إعادة إنشاء الأصول / Regenerate Assets
```bash
# Python script (requires Pillow)
cd frontend
python scripts/generate_sprites.py
python scripts/generate_sounds.py
```

## ملاحظات / Notes
- جميع الأصول الحالية هي placeholders بسيطة يمكن استبدالها بأصول أفضل
- All current assets are simple placeholders that can be replaced with better graphics
- الأصوات الحالية هي ملفات WAV صامتة - استبدلها بأصوات حقيقية
- Current sounds are silent WAV placeholders - replace with real sound effects

