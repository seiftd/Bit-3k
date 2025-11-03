#!/usr/bin/env python3
"""
Generate simple sound effects for Zombie Rush game
Requires: pip install numpy soundfile
Creates basic beep sounds as placeholder MP3s
"""

import os
import numpy as np

try:
    import soundfile as sf
    
    output_dir = os.path.join(os.path.dirname(__file__), '../public/assets/zombie')
    os.makedirs(output_dir, exist_ok=True)
    
    sample_rate = 44100
    
    def create_hit_sound():
        """Create hit sound (short beep)"""
        duration = 0.1
        t = np.linspace(0, duration, int(sample_rate * duration))
        # Short beep at 440Hz
        sound = np.sin(2 * np.pi * 440 * t) * np.exp(-t * 10)
        sound = (sound * 32767).astype(np.int16)
        # Save as WAV (simpler, we can convert later)
        sf.write(os.path.join(output_dir, 'hit.wav'), sound, sample_rate)
        print('✓ Created hit.wav')
    
    def create_gun_sound():
        """Create gun sound (lower pitch beep)"""
        duration = 0.15
        t = np.linspace(0, duration, int(sample_rate * duration))
        # Lower beep at 220Hz
        sound = np.sin(2 * np.pi * 220 * t) * np.exp(-t * 8)
        sound = (sound * 32767).astype(np.int16)
        sf.write(os.path.join(output_dir, 'gun.wav'), sound, sample_rate)
        print('✓ Created gun.wav')
    
    if __name__ == '__main__':
        create_hit_sound()
        create_gun_sound()
        print('\n✅ Sound files created!')
        print('⚠️  Note: These are WAV files. For MP3, convert using:')
        print('   ffmpeg -i hit.wav hit.mp3')
        print('   ffmpeg -i gun.wav gun.mp3')

except ImportError:
    print('⚠️  soundfile not installed. Creating silent placeholder files...')
    # Create empty files as placeholders
    output_dir = os.path.join(os.path.dirname(__file__), '../public/assets/zombie')
    os.makedirs(output_dir, exist_ok=True)
    
    # Create empty WAV files (minimal valid WAV header)
    wav_header = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
    
    with open(os.path.join(output_dir, 'hit.wav'), 'wb') as f:
        f.write(wav_header)
    with open(os.path.join(output_dir, 'gun.wav'), 'wb') as f:
        f.write(wav_header)
    
    print('✓ Created placeholder hit.wav')
    print('✓ Created placeholder gun.wav')
    print('\n⚠️  Install soundfile for real sounds: pip install numpy soundfile')

