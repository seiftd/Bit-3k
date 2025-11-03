export default class PreloadScene extends Phaser.Scene {
  constructor() { super('preload'); }

  preload() {
    // Load images
    this.load.image('bg', '/assets/zombie/bg.png');
    this.load.image('player', '/assets/zombie/player.png');
    this.load.image('zombie', '/assets/zombie/zombie.png');
    this.load.image('bullet', '/assets/zombie/bullet.png');
    
    // Load bitmap font
    this.load.bitmapFont('font', '/assets/zombie/font.png', '/assets/zombie/font.xml');
    
    // Load audio (WAV format - can be replaced with MP3 later)
    this.load.audio('hit', '/assets/zombie/hit.wav');
    this.load.audio('gun', '/assets/zombie/gun.wav');

    // Loading progress
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      this.scene.start('menu');
    });
  }

  create() {
    // Fallback if loading didn't trigger complete
    if (!this.scene.isActive('menu')) {
      this.scene.start('menu');
    }
  }
}



