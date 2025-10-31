// Game Engine for managing game state, progress, and logic
// This handles local state management for the embedded game

import { embeddedLevels, GameLevel } from '@/data/levels';

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

  // Get current level
  getCurrentLevel(): GameLevel | null {
    return embeddedLevels.find(level => level.level_number === this.state.currentLevel) || null;
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
    return {
      ...this.state,
      totalEmbeddedLevels: embeddedLevels.length,
      progressPercentage: Math.round((this.state.levelsCompleted / embeddedLevels.length) * 100),
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

