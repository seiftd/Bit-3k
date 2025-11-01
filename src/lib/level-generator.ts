// Dynamic level generator for 3000 levels
// Generates levels with progressive difficulty

export interface GameLevel {
  level_number: number;
  title: string;
  question: string;
  question_ar: string;
  answer: string;
  hint?: string;
  hint_ar?: string;
  level_type: 'math' | 'riddle' | 'detective' | 'word' | 'pattern' | 'logic';
  difficulty: 1 | 2 | 3 | 4 | 5;
  sbr_reward: number;
  estimated_time_seconds: number;
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
  
  return {
    level_number: level,
    title: `Math Challenge ${level}`,
    question,
    question_ar,
    answer,
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
    { q: "I speak without a mouth and hear without ears. What am I?", qa: "أنا أتكلم بدون فم وأسمع بدون أذنين. من أنا؟", a: "echo", h: "Think about sounds..." },
    { q: "What has keys but no locks?", qa: "ما الذي له مفاتيح لكن لا أقفال؟", a: "keyboard", h: "You're using one now!" },
    { q: "I have cities but no houses. What am I?", qa: "لدي مدن لكن لا بيوت. من أنا؟", a: "map", h: "Used for navigation" },
    { q: "What gets wet while drying?", qa: "ما الذي يبلل وهو يجف؟", a: "towel", h: "Bathroom item" },
    { q: "I have hands but can't clap. What am I?", qa: "لدي أيدي لكن لا أستطيع التصفيق. من أنا؟", a: "clock", h: "Shows time" },
  ];
  
  const riddle = riddles[(level - 1) % riddles.length];
  const difficulty = Math.min(5, Math.ceil(level / 600));
  
  return {
    level_number: level,
    title: `Riddle ${level}`,
    question: riddle.q,
    question_ar: riddle.qa,
    answer: riddle.a,
    hint: riddle.h,
    hint_ar: riddle.h,
    level_type: 'riddle',
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    sbr_reward: Math.min(3.0, 1.0 + (level / 1000)),
    estimated_time_seconds: difficulty * 40,
  };
}

// Word puzzle generators
function generateWordPuzzle(level: number): GameLevel {
  const words = [
    { word: "apple", hint: "A red fruit" },
    { word: "water", hint: "You drink it" },
    { word: "music", hint: "Sounds that make songs" },
    { word: "light", hint: "Opposite of dark" },
    { word: "happy", hint: "Feeling of joy" },
  ];
  
  const wordData = words[(level - 1) % words.length];
  const scrambled = wordData.word.split('').sort(() => Math.random() - 0.5).join('');
  
  const difficulty = Math.min(5, Math.ceil(level / 600));
  
  return {
    level_number: level,
    title: `Word Puzzle ${level}`,
    question: `Unscramble this word: ${scrambled.toUpperCase()}. What is the word?`,
    question_ar: `أرتب هذه الأحرف لتكوين كلمة: ${scrambled.toUpperCase()}. ما هي الكلمة؟`,
    answer: wordData.word,
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
  
  return {
    level_number: level,
    title: `Pattern Puzzle ${level}`,
    question: `What comes next: ${pattern.seq.join(', ')}, ? (Answer with number only)`,
    question_ar: `ما الذي يأتي بعد: ${pattern.seq.join('، ')}, ؟ (أجب برقم فقط)`,
    answer: pattern.next.toString(),
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

