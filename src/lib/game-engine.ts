// Game Engine for managing game state, progress, and logic
// This handles local state management for the embedded game

import { embeddedLevels, GameLevel } from '@/data/levels';
import { getLevel as generateLevel } from '@/lib/level-generator';

export interface GameState {
  currentLevel: number;
  sbrBalance: number;
  totalEarned: number;
  levelsCompleted: number;
  totalAdsWatched: number;
  attempts: Record<number, number>;
  completedLevels: number[];
  lastPlayedAt: Date;
}

export const DEFAULT_GAME_STATE: GameState = {
  currentLevel: 1,
  sbrBalance: 0,
  totalEarned: 0,
  levelsCompleted: 0,
  totalAdsWatched: 0,
  attempts: {},
  completedLevels: [],
  lastPlayedAt: new Date(),
};

export class GameEngine {
  private state: GameState;
  private storageKey = 'bit3k_game_state';

  constructor() {
    this.state = this.loadState();
  }

  // Load game state from localStorage
  private loadState(): GameState {
    if (typeof window === 'undefined') return DEFAULT_GAME_STATE;
    
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GAME_STATE,
          ...parsed,
          lastPlayedAt: new Date(parsed.lastPlayedAt || new Date()),
        };
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
    
    return DEFAULT_GAME_STATE;
  }

  // Save game state to localStorage
  private saveState(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }

  // Get current game state
  getState(): GameState {
    return { ...this.state };
  }

  // Helper function to generate options for a level if missing
  private generateOptionsForLevel(level: GameLevel): GameLevel {
    if (level.options && level.options.length > 0) {
      return level; // Already has options
    }

    const correct = level.answer.toLowerCase().trim();
    const options: string[] = [correct];
    
    // Generate wrong answers based on level type
    if (!isNaN(Number(correct))) {
      // Numeric answer
      const num = Number(correct);
      const wrong1 = (num + Math.floor(Math.random() * 10) + 1).toString();
      const wrong2 = Math.max(0, num - Math.floor(Math.random() * 10) - 1).toString();
      const wrong3 = (num * (1 + Math.floor(Math.random() * 3))).toString();
      options.push(wrong1, wrong2, wrong3);
    } else {
      // Text answer - generate similar wrong answers
      const wrongAnswers = [
        correct.split('').reverse().join(''), // reversed
        correct + 'x', // add character
        correct.slice(0, -1) || correct + 's', // remove last or add s
        correct.charAt(0).toUpperCase() + correct.slice(1) + 'ing', // variation
        'shadow', 'wind', 'mirror', 'sound', // common wrong answers
        'door', 'safe', 'car', 'house', // more common wrongs
      ].filter(w => w !== correct && w.length > 0 && w.length < 20);
      
      // Pick 3 unique wrong answers
      const uniqueWrongs = [...new Set(wrongAnswers)].slice(0, 3);
      options.push(...uniqueWrongs);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      ...level,
      options: options.slice(0, 4),
      options_ar: options.slice(0, 4), // Same for now
    };
  }

  // Get current level (supports up to 3000 levels)
  getCurrentLevel(): GameLevel | null {
    // Try embedded levels first (for levels 1-50)
    if (this.state.currentLevel <= 50) {
      const embedded = embeddedLevels.find(level => level.level_number === this.state.currentLevel);
      if (embedded) {
        // Generate options if missing
        return this.generateOptionsForLevel(embedded);
      }
    }
    
    // Generate level dynamically for all levels (1-3000)
    if (this.state.currentLevel >= 1 && this.state.currentLevel <= 3000) {
      return generateLevel(this.state.currentLevel);
    }
    
    return null;
  }

  // Submit answer for current level
  submitAnswer(userAnswer: string): {
    correct: boolean;
    message: string;
    sbrEarned: number;
    needsAd?: boolean;
  } {
    const level = this.getCurrentLevel();
    if (!level) {
      return {
        correct: false,
        message: 'Level not found!',
        sbrEarned: 0,
      };
    }

    // Normalize answers
    const normalizedCorrect = level.answer.toLowerCase().trim();
    const normalizedUser = userAnswer.toLowerCase().trim();
    const isCorrect = normalizedCorrect === normalizedUser;

    // Track attempt
    this.state.attempts[level.level_number] = (this.state.attempts[level.level_number] || 0) + 1;

    if (isCorrect) {
      // Award SBR
      const sbrEarned = level.sbr_reward;
      this.state.sbrBalance += sbrEarned;
      this.state.totalEarned += sbrEarned;
      
      // Track completion
      if (!this.state.completedLevels.includes(level.level_number)) {
        this.state.completedLevels.push(level.level_number);
        this.state.levelsCompleted += 1;
      }

      // Determine if ad is needed
      // Show ad every 3 levels
      const needsAd = level.level_number % 3 === 0 && level.level_number > 0;

      this.saveState();

      return {
        correct: true,
        message: '🎉 Correct! Well done!',
        sbrEarned,
        needsAd,
      };
    } else {
      this.saveState();
      
      return {
        correct: false,
        message: '❌ Incorrect! Try again.',
        sbrEarned: 0,
      };
    }
  }

  // Move to next level
  nextLevel(): GameLevel | null {
    const nextLevelNum = this.state.currentLevel + 1;
    
    // Check if level exists
    if (nextLevelNum > embeddedLevels.length) {
      return null; // Game completed!
    }

    this.state.currentLevel = nextLevelNum;
    this.saveState();
    
    return embeddedLevels.find(level => level.level_number === nextLevelNum) || null;
  }

  // Skip current level (costs SBR)
  skipLevel(): boolean {
    const level = this.getCurrentLevel();
    if (!level) return false;

    const skipCost = level.sbr_reward * 2; // Costs 2x the reward to skip
    
    if (this.state.sbrBalance < skipCost) {
      return false; // Not enough balance
    }

    this.state.sbrBalance -= skipCost;
    return this.nextLevel() !== null;
  }

  // Use hint (costs SBR)
  useHint(): { hint: string; hintAr?: string; cost: number; success: boolean } {
    const level = this.getCurrentLevel();
    if (!level) {
      return { hint: '', cost: 0, success: false };
    }

    const hintCost = level.sbr_reward * 0.5; // Costs 50% of reward for hint
    
    if (this.state.sbrBalance < hintCost) {
      return { hint: '', cost: 0, success: false };
    }

    this.state.sbrBalance -= hintCost;
    this.saveState();

    return {
      hint: level.hint || 'No hint available',
      hintAr: level.hint_ar,
      cost: hintCost,
      success: true,
    };
  }

  // Mark ad as watched
  watchAd(): void {
    this.state.totalAdsWatched += 1;
    this.saveState();
  }

  // Reset game progress
  resetGame(): void {
    this.state = DEFAULT_GAME_STATE;
    this.saveState();
  }

  // Get leaderboard (simulated)
  getLeaderboard(): Array<{ rank: number; name: string; score: number }> {
    return [
      { rank: 1, name: 'Top Player', score: 1000 },
      { rank: 2, name: 'Smart Solver', score: 850 },
      { rank: 3, name: 'Puzzle Master', score: 720 },
      { rank: 4, name: 'Level Hunter', score: 600 },
      { rank: 5, name: 'Riddle King', score: 550 },
    ];
  }

  // Get statistics
  getStats() {
    const totalLevels = 3000; // Total levels supported
    return {
      ...this.state,
      totalEmbeddedLevels: totalLevels,
      progressPercentage: Math.round((this.state.levelsCompleted / totalLevels) * 100),
      averageAttempts: this.getAverageAttempts(),
    };
  }

  // Get average attempts per level
  private getAverageAttempts(): number {
    const attemptsArray = Object.values(this.state.attempts);
    if (attemptsArray.length === 0) return 0;
    
    const sum = attemptsArray.reduce((a, b) => a + b, 0);
    return Math.round((sum / attemptsArray.length) * 10) / 10;
  }

  // Get completion status
  isLevelCompleted(levelNumber: number): boolean {
    return this.state.completedLevels.includes(levelNumber);
  }

  // Check if level is unlocked
  isLevelUnlocked(levelNumber: number): boolean {
    return levelNumber <= this.state.currentLevel;
  }

  // Get difficulty color
  getDifficultyColor(difficulty: number): string {
    const colors: Record<number, string> = {
      1: 'green',
      2: 'blue',
      3: 'orange',
      4: 'red',
      5: 'purple',
    };
    return colors[difficulty] || 'gray';
  }

  // Get difficulty badge
  getDifficultyBadge(difficulty: number): string {
    const badges: Record<number, string> = {
      1: '🟢 Easy',
      2: '🔵 Medium',
      3: '🟠 Hard',
      4: '🔴 Expert',
      5: '🟣 Master',
    };
    return badges[difficulty] || '⚪ Unknown';
  }
}

// Export singleton instance
export const gameEngine = new GameEngine();

