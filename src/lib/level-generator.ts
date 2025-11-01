// Dynamic level generator for 3000 levels
// Generates levels with progressive difficulty

import { translateOptionsToArabic } from './translations';

export interface GameLevel {
  level_number: number;
  title: string;
  question: string;
  question_ar: string;
  answer: string;
  options?: string[]; // 4 multiple choice options
  options_ar?: string[]; // Arabic options
  hint?: string;
  hint_ar?: string;
  level_type: 'math' | 'riddle' | 'detective' | 'word' | 'pattern' | 'logic';
  difficulty: 1 | 2 | 3 | 4 | 5;
  sbr_reward: number;
  estimated_time_seconds: number;
}

// Helper function to generate 4 multiple choice options
function generateOptions(correctAnswer: string, level: number): string[] {
  const correct = correctAnswer.toLowerCase().trim();
  const options = [correct];
  
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
    ].filter(w => w !== correct && w.length > 0);
    options.push(...wrongAnswers.slice(0, 3));
  }
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return options.slice(0, 4);
}

// Math puzzle generators
function generateMathPuzzle(level: number): GameLevel {
  const difficulty = Math.min(5, Math.ceil(level / 600));
  
  let question = '';
  let question_ar = '';
  let answer = '';
  let hint = '';
  let hint_ar = '';
  let reward = Math.min(3.0, 1.0 + (level / 1000));
  
  if (difficulty <= 2) {
    // Easy: Basic arithmetic
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
    
    if (op === '+') {
      answer = (a + b).toString();
      question = `What is ${a} + ${b}? (Answer with number only)`;
      question_ar = `ما هو ${a} + ${b}؟ (أجب برقم فقط)`;
    } else if (op === '-') {
      answer = (a - b).toString();
      question = `What is ${a} - ${b}? (Answer with number only)`;
      question_ar = `ما هو ${a} - ${b}؟ (أجب برقم فقط)`;
    } else {
      answer = (a * b).toString();
      question = `What is ${a} × ${b}? (Answer with number only)`;
      question_ar = `ما هو ${a} × ${b}؟ (أجب برقم فقط)`;
    }
    
    hint = `Use basic arithmetic operation`;
    hint_ar = `استخدم العملية الحسابية الأساسية`;
    
    const options = generateOptions(answer, level);
    const arabicOptions = translateOptionsToArabic(options);
    
    return {
      level_number: level,
      title: `Math Challenge ${level}`,
      question,
      question_ar,
      answer,
      options,
      options_ar: arabicOptions,
      hint,
      hint_ar,
      level_type: 'math',
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
      sbr_reward: reward,
      estimated_time_seconds: difficulty * 30,
    };
  } else if (difficulty === 3) {
    // Medium: Equations
    const x = Math.floor(Math.random() * 20) + 1;
    const coeff = Math.floor(Math.random() * 10) + 2;
    const constant = Math.floor(Math.random() * 50) + 1;
    const result = coeff * x + constant;
    
    answer = x.toString();
    question = `If ${coeff}x + ${constant} = ${result}, what is x? (Answer with number only)`;
    question_ar = `إذا كانت ${coeff}x + ${constant} = ${result}، فما قيمة x؟ (أجب برقم فقط)`;
    hint = `Subtract ${constant} from both sides, then divide by ${coeff}`;
    hint_ar = `اطرح ${constant} من كلا الجانبين، ثم اقسم على ${coeff}`;
    
    const options = generateOptions(answer, level);
    
    return {
      level_number: level,
      title: `Math Challenge ${level}`,
      question,
      question_ar,
      answer,
      options,
      options_ar: options,
      hint,
      hint_ar,
      level_type: 'math',
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
      sbr_reward: reward,
      estimated_time_seconds: difficulty * 30,
    };
  } else if (difficulty === 4) {
    // Hard: Sequences
    const start = Math.floor(Math.random() * 10) + 1;
    const pattern = Math.floor(Math.random() * 5) + 2;
    const sequence = [start, start * pattern, start * pattern * pattern];
    const next = start * pattern * pattern * pattern;
    
    answer = next.toString();
    question = `What comes next: ${sequence.join(', ')}, ? (Answer with number only)`;
    question_ar = `ما الذي يأتي بعد: ${sequence.join('، ')}, ؟ (أجب برقم فقط)`;
    hint = `Each number is multiplied by ${pattern}`;
    hint_ar = `كل رقم مضروب في ${pattern}`;
    
    const options = generateOptions(answer, level);
    
    return {
      level_number: level,
      title: `Math Challenge ${level}`,
      question,
      question_ar,
      answer,
      options,
      options_ar: options,
      hint,
      hint_ar,
      level_type: 'math',
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
      sbr_reward: reward,
      estimated_time_seconds: difficulty * 30,
    };
  } else {
    // Very Hard: Complex calculations
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 100) + 1;
    const c = Math.floor(Math.random() * 50) + 1;
    const result = (a * b) / c;
    
    answer = Math.round(result).toString();
    question = `Calculate: (${a} × ${b}) ÷ ${c}? (Answer with number only)`;
    question_ar = `احسب: (${a} × ${b}) ÷ ${c}؟ (أجب برقم فقط)`;
    hint = `Multiply first, then divide`;
    hint_ar = `اضرب أولاً، ثم اقسم`;
  }
  
  const options = generateOptions(answer, level);
  
  return {
    level_number: level,
    title: `Math Challenge ${level}`,
    question,
    question_ar,
    answer,
    options,
    options_ar: options,
    hint,
    hint_ar,
    level_type: 'math',
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    sbr_reward: reward,
    estimated_time_seconds: difficulty * 30,
  };
}

// Riddle generators
function generateRiddle(level: number): GameLevel {
  const riddles = [
    { 
      q: "I speak without a mouth and hear without ears. What am I?", 
      qa: "أنا أتكلم بدون فم وأسمع بدون أذنين. من أنا؟", 
      a: "echo", 
      wrong: ["shadow", "wind", "mirror"],
      h: "Think about sounds...",
      ha: "فكر في الأصوات..."
    },
    { 
      q: "What has keys but no locks?", 
      qa: "ما الذي له مفاتيح لكن لا أقفال؟", 
      a: "keyboard", 
      wrong: ["door", "safe", "car"],
      h: "You're using one now!",
      ha: "أنت تستخدم واحدًا الآن!"
    },
    { 
      q: "I have cities but no houses. What am I?", 
      qa: "لدي مدن لكن لا بيوت. من أنا؟", 
      a: "map", 
      wrong: ["globe", "atlas", "book"],
      h: "Used for navigation",
      ha: "يُستخدم للتنقل"
    },
    { 
      q: "What gets wet while drying?", 
      qa: "ما الذي يبلل وهو يجف؟", 
      a: "towel", 
      wrong: ["sponge", "cloth", "paper"],
      h: "Bathroom item",
      ha: "عنصر في الحمام"
    },
    { 
      q: "I have hands but can't clap. What am I?", 
      qa: "لدي أيدي لكن لا أستطيع التصفيق. من أنا؟", 
      a: "clock", 
      wrong: ["person", "robot", "doll"],
      h: "Shows time",
      ha: "يُظهر الوقت"
    },
  ];
  
  const riddle = riddles[(level - 1) % riddles.length];
  const difficulty = Math.min(5, Math.ceil(level / 600));
  
  const options = [riddle.a, ...riddle.wrong].sort(() => Math.random() - 0.5).slice(0, 4);
  const arabicOptions = translateOptionsToArabic(options);
  
  return {
    level_number: level,
    title: `Riddle ${level}`,
    question: riddle.q,
    question_ar: riddle.qa,
    answer: riddle.a,
    options,
    options_ar: arabicOptions,
    hint: riddle.h,
    hint_ar: riddle.ha,
    level_type: 'riddle',
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    sbr_reward: Math.min(3.0, 1.0 + (level / 1000)),
    estimated_time_seconds: difficulty * 40,
  };
}

// Word puzzle generators
function generateWordPuzzle(level: number): GameLevel {
  const words = [
    { word: "apple", hint: "A red fruit", wrong: ["orange", "banana", "grape"] },
    { word: "water", hint: "You drink it", wrong: ["juice", "milk", "coffee"] },
    { word: "music", hint: "Sounds that make songs", wrong: ["sound", "noise", "voice"] },
    { word: "light", hint: "Opposite of dark", wrong: ["bright", "shine", "glow"] },
    { word: "happy", hint: "Feeling of joy", wrong: ["sad", "angry", "calm"] },
  ];
  
  const wordData = words[(level - 1) % words.length];
  const scrambled = wordData.word.split('').sort(() => Math.random() - 0.5).join('');
  
  const difficulty = Math.min(5, Math.ceil(level / 600));
  
  const options = [wordData.word, ...wordData.wrong].sort(() => Math.random() - 0.5).slice(0, 4);
  const arabicOptions = translateOptionsToArabic(options);
  
  return {
    level_number: level,
    title: `Word Puzzle ${level}`,
    question: `Unscramble this word: ${scrambled.toUpperCase()}. What is the word?`,
    question_ar: `أرتب هذه الأحرف لتكوين كلمة: ${scrambled.toUpperCase()}. ما هي الكلمة؟`,
    answer: wordData.word,
    options,
    options_ar: arabicOptions,
    hint: wordData.hint,
    hint_ar: wordData.hint,
    level_type: 'word',
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    sbr_reward: Math.min(3.0, 1.0 + (level / 1000)),
    estimated_time_seconds: difficulty * 45,
  };
}

// Pattern puzzle generators
function generatePatternPuzzle(level: number): GameLevel {
  const difficulty = Math.min(5, Math.ceil(level / 600));
  const patterns = [
    { seq: [2, 4, 8, 16], next: 32, hint: "Each number is doubled" },
    { seq: [1, 4, 9, 16], next: 25, hint: "Perfect squares" },
    { seq: [1, 3, 6, 10], next: 15, hint: "Triangular numbers" },
    { seq: [1, 1, 2, 3, 5], next: 8, hint: "Fibonacci sequence" },
  ];
  
  const pattern = patterns[(level - 1) % patterns.length];
  const options = generateOptions(pattern.next.toString(), level);
  const arabicOptions = translateOptionsToArabic(options);
  
  return {
    level_number: level,
    title: `Pattern Puzzle ${level}`,
    question: `What comes next: ${pattern.seq.join(', ')}, ?`,
    question_ar: `ما الذي يأتي بعد: ${pattern.seq.join('، ')}, ؟`,
    answer: pattern.next.toString(),
    options,
    options_ar: arabicOptions,
    hint: pattern.hint,
    hint_ar: pattern.hint,
    level_type: 'pattern',
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    sbr_reward: Math.min(3.0, 1.0 + (level / 1000)),
    estimated_time_seconds: difficulty * 50,
  };
}

// Generate a level based on number
export function generateLevel(levelNumber: number): GameLevel {
  // Determine level type based on level number (cycle through types)
  const typeIndex = (levelNumber - 1) % 4;
  
  switch (typeIndex) {
    case 0:
      return generateMathPuzzle(levelNumber);
    case 1:
      return generateRiddle(levelNumber);
    case 2:
      return generateWordPuzzle(levelNumber);
    case 3:
      return generatePatternPuzzle(levelNumber);
    default:
      return generateMathPuzzle(levelNumber);
  }
}

// Generate multiple levels
export function generateLevels(start: number, count: number): GameLevel[] {
  const levels: GameLevel[] = [];
  for (let i = start; i < start + count; i++) {
    levels.push(generateLevel(i));
  }
  return levels;
}

// Get level on demand (for 3000 levels, we generate dynamically)
export function getLevel(levelNumber: number): GameLevel | null {
  if (levelNumber < 1 || levelNumber > 3000) {
    return null;
  }
  
  // Use embedded levels for first 50, generate others
  if (levelNumber <= 50) {
    // Return from embedded if exists, otherwise generate
    return generateLevel(levelNumber);
  }
  
  return generateLevel(levelNumber);
}

