// Game Engine for managing game state, progress, and logic
// This handles local state management for the embedded game

import { embeddedLevels, GameLevel } from '@/data/levels';
import { getLevel as generateLevel } from '@/lib/level-generator';
import { translateOptionsToArabic, translateArabicToEnglish } from '@/lib/translations';

export interface GameState {
  currentLevel: number;
  sbrBalance: number;
  totalEarned: number;
  levelsCompleted: number;
  totalAdsWatched: number;
  attempts: Record<number, number>;
  completedLevels: number[];
  lastPlayedAt: Date;
  // Reward pending until user watches the ad
  pendingAd?: { level: number; sbrEarned: number } | null;
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
  pendingAd: null,
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
    
    // Generate wrong answers based on level type and answer
    if (!isNaN(Number(correct))) {
      // Numeric answer - generate reasonable wrong numbers
      const num = Number(correct);
      const wrongAnswers: number[] = [];
      
      // Add numbers close to the correct answer but not too close
      wrongAnswers.push(num + Math.floor(Math.random() * 20) + 5);
      wrongAnswers.push(Math.max(0, num - Math.floor(Math.random() * 20) - 5));
      wrongAnswers.push(Math.round(num * 1.5));
      wrongAnswers.push(Math.round(num * 0.5));
      wrongAnswers.push(num + 10);
      wrongAnswers.push(num - 10);
      
      // Remove duplicates and the correct answer, then take 3
      const uniqueWrongs = [...new Set(wrongAnswers)]
        .filter(w => w !== num && w >= 0)
        .slice(0, 3);
      
      options.push(...uniqueWrongs.map(w => w.toString()));
    } else {
      // Text answer - generate logical wrong answers based on level type
      let wrongAnswers: string[] = [];
      
      // Get wrong answers based on level type
      switch (level.level_type) {
        case 'riddle':
        case 'detective':
          // For riddles, use related but incorrect words
          wrongAnswers = [
            'shadow', 'wind', 'mirror', 'sound', 'voice', 'light',
            'dark', 'silence', 'music', 'noise', 'whisper',
            'door', 'key', 'lock', 'window', 'house', 'room',
            'clock', 'time', 'hour', 'minute', 'second',
            'map', 'globe', 'world', 'earth', 'planet',
            'towel', 'cloth', 'sponge', 'paper', 'tissue'
          ];
          break;
          
        case 'word':
          // For word puzzles, use similar length words
          wrongAnswers = [
            'apple', 'water', 'music', 'light', 'happy', 'sad',
            'word', 'text', 'letter', 'sentence', 'phrase',
            'book', 'page', 'read', 'write', 'draw', 'paint'
          ];
          break;
          
        default:
          // Generic wrong answers
          wrongAnswers = [
            'answer', 'solution', 'result', 'choice', 'option',
            'question', 'puzzle', 'riddle', 'challenge', 'game'
          ];
      }
      
      // Filter out the correct answer and similar ones
      const filtered = wrongAnswers
        .filter(w => {
          const lower = w.toLowerCase();
          // Remove if too similar to correct answer
          if (lower === correct) return false;
          if (lower.includes(correct) || correct.includes(lower)) return false;
          if (lower.length < 3 || lower.length > 15) return false;
          return true;
        });
      
      // Pick 3 unique wrong answers
      const uniqueWrongs = [...new Set(filtered)].slice(0, 3);
      options.push(...uniqueWrongs);
      
      // If we don't have enough, add some generic ones
      while (options.length < 4) {
        const generic = ['choice', 'answer', 'option', 'result'][options.length - 1];
        if (generic && !options.includes(generic)) {
          options.push(generic);
        } else {
          break;
        }
      }
    }
    
    // Ensure we have exactly 4 options
    while (options.length < 4) {
      const fallback = !isNaN(Number(correct)) 
        ? (Number(correct) + options.length * 10).toString()
        : `option${options.length}`;
      if (!options.includes(fallback)) {
        options.push(fallback);
      } else {
        break;
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Generate Arabic translations for options
    const arabicOptions = translateOptionsToArabic(options.slice(0, 4));
    
    return {
      ...level,
      options: options.slice(0, 4),
      options_ar: arabicOptions,
    };
  }

  // Get current level (supports up to 3200 levels)
  getCurrentLevel(): GameLevel | null {
    // Try embedded levels first (for levels 1-50)
    if (this.state.currentLevel <= 50) {
      const embedded = embeddedLevels.find(level => level.level_number === this.state.currentLevel);
      if (embedded) {
        // Generate options if missing
        return this.generateOptionsForLevel(embedded);
      }
    }
    
    // Generate level dynamically for all levels (1-3200)
    if (this.state.currentLevel >= 1 && this.state.currentLevel <= 3200) {
      const generated = generateLevel(this.state.currentLevel);
      // Ensure options are present (generateLevel always returns GameLevel, but TypeScript needs this check)
      if (generated) {
        return this.generateOptionsForLevel(generated);
      }
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
    // If user selected an Arabic option, convert it back to English for comparison
    let normalizedUser = userAnswer.toLowerCase().trim();
    if (level.options && level.options.length > 0) {
      // Check if the answer is in Arabic format
      const isArabicOption = level.options_ar?.includes(userAnswer);
      if (isArabicOption && level.options) {
        // Convert Arabic back to English
        normalizedUser = translateArabicToEnglish(userAnswer, level.options).toLowerCase().trim();
      }
    }
    
    const normalizedCorrect = level.answer.toLowerCase().trim();
    const isCorrect = normalizedCorrect === normalizedUser;

    // Track attempt
    this.state.attempts[level.level_number] = (this.state.attempts[level.level_number] || 0) + 1;

    if (isCorrect) {
      // If already awaiting ad for this level, do not re-award
      if (this.state.pendingAd && this.state.pendingAd.level === level.level_number) {
        return {
          correct: true,
          message: '🎉 Correct! Watch the ad to claim your reward.',
          sbrEarned: this.state.pendingAd.sbrEarned,
          needsAd: true,
        };
      }

      // Set pending reward; actual reward will be granted after ad
      const sbrEarned = level.sbr_reward;
      this.state.pendingAd = { level: level.level_number, sbrEarned };
      this.saveState();

      return {
        correct: true,
        message: '🎉 Correct! Watch the ad to claim your reward.',
        sbrEarned,
        needsAd: true,
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
    
    // Check if level exists (max 3200 levels)
    if (nextLevelNum > 3200) {
      return null; // Game completed!
    }

    this.state.currentLevel = nextLevelNum;
    this.saveState();
    
    // Use getCurrentLevel to ensure options are generated
    return this.getCurrentLevel();
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

  // Grant pending reward and advance to the next level after ad
  completeAdAndAdvance(): GameLevel | null {
    const current = this.getCurrentLevel();
    const pending = this.state.pendingAd;
    if (!pending) {
      return current;
    }

    // If pending belongs to the current level (normal flow)
    if (current && pending.level === current.level_number) {
      this.state.sbrBalance += pending.sbrEarned;
      this.state.totalEarned += pending.sbrEarned;
      if (!this.state.completedLevels.includes(current.level_number)) {
        this.state.completedLevels.push(current.level_number);
        this.state.levelsCompleted += 1;
      }
      this.state.pendingAd = null;
      this.saveState();
      return this.nextLevel();
    }

    // If user refreshed and currentLevel already incremented, still clear pending
    if (pending.level === this.state.currentLevel - 1) {
      this.state.sbrBalance += pending.sbrEarned;
      this.state.totalEarned += pending.sbrEarned;
      if (!this.state.completedLevels.includes(pending.level)) {
        this.state.completedLevels.push(pending.level);
        this.state.levelsCompleted += 1;
      }
      this.state.pendingAd = null;
      this.saveState();
      return this.getCurrentLevel();
    }

    return current;
  }

  // Reset game progress
  resetGame(): void {
    this.state = DEFAULT_GAME_STATE;
    this.saveState();
  }

  // Get leaderboard (from localStorage - real data)
  getLeaderboard(): Array<{ rank: number; name: string; score: number }> {
    if (typeof window === 'undefined') {
      return [];
    }

    // Get all leaderboard entries from localStorage
    const leaderboardKey = 'bit3k_leaderboard';
    let leaderboard: Array<{ userId: string; name: string; score: number }> = [];
    
    try {
      const stored = localStorage.getItem(leaderboardKey);
      if (stored) {
        leaderboard = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    }

    // Add current user if available
    const currentUser = this.getCurrentUserData();
    if (currentUser) {
      const existingIndex = leaderboard.findIndex(entry => entry.userId === currentUser.id);
      if (existingIndex >= 0) {
        // Update existing entry
        leaderboard[existingIndex] = {
          userId: currentUser.id,
          name: currentUser.name,
          score: this.state.sbrBalance,
        };
      } else {
        // Add new entry
        leaderboard.push({
          userId: currentUser.id,
          name: currentUser.name,
          score: this.state.sbrBalance,
        });
      }
    }

    // Sort by score (descending) and take top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    // Save updated leaderboard
    try {
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    } catch (e) {
      console.error('Error saving leaderboard:', e);
    }

    // Return formatted leaderboard with ranks
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      score: entry.score,
    }));
  }

  // Get current user data from Telegram or localStorage
  private getCurrentUserData(): { id: string; name: string } | null {
    if (typeof window === 'undefined') return null;

    // Try to get from Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      return {
        id: user.id?.toString() || 'unknown',
        name: user.username ? `@${user.username}` : user.first_name || 'Guest',
      };
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('bit3k_user');
      if (stored) {
        const user = JSON.parse(stored);
        return {
          id: user.id || 'guest',
          name: user.name || 'Guest',
        };
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }

    return null;
  }

  // Get statistics
  getStats() {
    const totalLevels = 3200; // Total levels supported
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

