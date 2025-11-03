export default class GameOverScene extends Phaser.Scene {
  constructor() { super('gameover'); }

  create(data: { score: number }) {
    const meta = this.registry.get('zombieMeta') as { userId?: string; jwtToken?: string; apiUrl: string } | undefined;
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(0, 0, w * 2, h * 2, 0x111827).setOrigin(0);

    this.add.text(w / 2, h * 0.35, 'Game Over', { color: '#fff', fontSize: '28px' }).setOrigin(0.5);
    this.add.text(w / 2, h * 0.45, `Score: ${data.score}`, { color: '#9ca3af', fontSize: '18px' }).setOrigin(0.5);

    const retry = this.add.text(w / 2, h * 0.6, 'Retry', { color: '#10b981', fontSize: '20px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerup', () => this.scene.start('menu'));

    // Submit score securely if we have token
    if (meta?.jwtToken && meta.apiUrl) {
      import('../lib/zombie-client').then(({ postScore }) => {
        postScore(meta.apiUrl, meta.jwtToken as string, Math.max(0, Math.floor(data.score)))
          .then((res) => {
            const text = `Reward: ${res.reward_sbr} SBR`;
            this.add.text(w / 2, h * 0.52, text, { color: '#fbbf24', fontSize: '16px' }).setOrigin(0.5);
          })
          .catch(() => {
            // show nothing; keep UX simple
          });
      });
    }
  }
}


