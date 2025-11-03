// Script to generate simple game sprites using Canvas
const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

const outputDir = path.join(__dirname, '../public/assets/zombie');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Player sprite (blue square with face)
function createPlayerSprite() {
  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');
  
  // Body (light blue)
  ctx.fillStyle = '#4A90E2';
  ctx.fillRect(10, 10, 44, 44);
  
  // Outline
  ctx.strokeStyle = '#2C5AA0';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 44, 44);
  
  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(20, 25, 8, 8);
  ctx.fillRect(36, 25, 8, 8);
  
  // Mouth
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(24, 40, 16, 4);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'player.png'), buffer);
  console.log('✓ Created player.png');
}

// Zombie sprite (green/red square with scary face)
function createZombieSprite() {
  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');
  
  // Body (dark green)
  ctx.fillStyle = '#6B8E23';
  ctx.fillRect(10, 10, 44, 44);
  
  // Outline
  ctx.strokeStyle = '#4A5F1A';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 44, 44);
  
  // Red eyes
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(18, 25, 8, 8);
  ctx.fillRect(38, 25, 8, 8);
  
  // Blood mouth
  ctx.fillStyle = '#8B0000';
  ctx.fillRect(22, 38, 20, 8);
  
  // Teeth
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(24 + i * 5, 38, 3, 8);
  }
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'zombie.png'), buffer);
  console.log('✓ Created zombie.png');
}

// Bullet sprite (yellow circle)
function createBulletSprite() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');
  
  // Yellow bullet
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Outline
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Highlight
  ctx.fillStyle = '#FFFF99';
  ctx.beginPath();
  ctx.arc(12, 12, 4, 0, Math.PI * 2);
  ctx.fill();
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'bullet.png'), buffer);
  console.log('✓ Created bullet.png');
}

// Background (dark grunge texture)
function createBackgroundSprite() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Dark base
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 800, 600);
  
  // Add texture with random noise
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const gray = Math.random() * 30;
    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
    ctx.fillRect(x, y, 2, 2);
  }
  
  // Add some blood stains
  ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 30 + 10, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'bg.png'), buffer);
  console.log('✓ Created bg.png');
}

// Generate all sprites
try {
  createPlayerSprite();
  createZombieSprite();
  createBulletSprite();
  createBackgroundSprite();
  console.log('\n✅ All sprites generated successfully!');
} catch (error) {
  console.error('Error generating sprites:', error);
  console.log('\n⚠️  Note: Install canvas package: npm install canvas');
}

