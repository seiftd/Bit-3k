export default class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(0, 0, w * 2, h * 2, 0x111827).setOrigin(0);
    this.add.text(w / 2, h * 0.35, 'Zombie Rush', { color: '#fff', fontSize: '28px' }).setOrigin(0.5);

    const start = this.add.text(w / 2, h * 0.55, 'Tap to Start', { color: '#10b981', fontSize: '20px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    start.on('pointerup', () => {
      this.scene.start('game');
    });
  }
}



