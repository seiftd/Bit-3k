export function createGameConfig(Phaser: any, parentEl: HTMLElement, meta: { userId?: string; jwtToken?: string; apiUrl: string; }) {
  const width = parentEl.clientWidth || 360;
  const height = Math.round(width * (16 / 9));

  // Scenes
  const PreloadScene = require('../scenes/PreloadScene').default;
  const MenuScene = require('../scenes/MenuScene').default;
  const GameScene = require('../scenes/GameScene').default;
  const GameOverScene = require('../scenes/GameOverScene').default;

  return {
    type: Phaser.AUTO,
    parent: parentEl,
    backgroundColor: '#111827',
    width,
    height,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: parentEl,
      width,
      height,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [PreloadScene, MenuScene, GameScene, GameOverScene],
    callbacks: {
      postBoot: (game: any) => {
        // Store meta for scenes to read
        game.scene.keys.preload.registry.set('zombieMeta', meta);
      }
    }
  };
}


