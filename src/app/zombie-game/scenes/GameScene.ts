export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private zombies!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private health = 3;
  private timeLeft = 60;
  private hud!: { score: Phaser.GameObjects.Text; timer: Phaser.GameObjects.Text; health: Phaser.GameObjects.Text };

  constructor() { super('game'); }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.image(w / 2, h / 2, 'bg').setDisplaySize(w, h);

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.player = this.physics.add.sprite(w / 2, h / 2, 'player').setCollideWorldBounds(true);
    this.player.setScale(0.6);

    this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, runChildUpdate: true, maxSize: 40 });
    this.zombies = this.physics.add.group();

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      this.timeLeft -= 1;
      this.hud.timer.setText(`⏱ ${this.timeLeft}s`);
      if (this.timeLeft <= 0) this.endGame();
      // spawn a zombie every second
      const zx = Phaser.Math.Between(0, w);
      const zy = Phaser.Math.Between(0, h);
      const z = this.zombies.create(zx, zy, 'zombie') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      z.setScale(0.6);
    }});

    // HUD
    this.hud = {
      score: this.add.text(10, 10, '⚑ 0', { color: '#fff' }).setDepth(10),
      timer: this.add.text(w / 2, 10, `⏱ ${this.timeLeft}s`, { color: '#fff' }).setOrigin(0.5, 0).setDepth(10),
      health: this.add.text(w - 10, 10, '♥ 3', { color: '#f87171' }).setOrigin(1, 0).setDepth(10),
    };

    // Interactions
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet') as Phaser.Physics.Arcade.Image | null;
      if (!bullet) return;
      bullet.setActive(true).setVisible(true).setDepth(5);
      bullet.setPosition(this.player.x, this.player.y);
      this.physics.moveTo(bullet, pointer.worldX, pointer.worldY, 600);
      this.sound.play('gun', { volume: 0.3 });
    });

    this.physics.add.overlap(this.bullets, this.zombies, (_b, z) => {
      (z as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
      _b.destroy();
      this.sound.play('hit', { volume: 0.5 });
      this.score += 5;
      this.hud.score.setText(`⚑ ${this.score}`);
    });

    this.physics.add.overlap(this.player, this.zombies, () => {
      this.health -= 1;
      this.hud.health.setText(`♥ ${this.health}`);
      if (this.health <= 0) this.endGame();
    });
  }

  update() {
    if (!this.player) return;
    const speed = 200;
    this.player.setVelocity(0);
    if (this.cursors.left?.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right?.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up?.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down?.isDown) this.player.setVelocityY(speed);
  }

  private endGame() {
    this.scene.start('gameover', { score: this.score });
  }
}



