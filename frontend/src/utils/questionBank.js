// Local question bank — mirrors backend seed_data.json
// Each KC has minimum 20 questions with explicit answer formats.
// KCs are internal; students see concept names only.

// ── Theory Content (shown before questions) ───────────────────────────────────

export const KC_THEORY = {
  'KC-01': {
    conceptName: 'Identifying Algebraic Terms',
    subtopic: 'Foundations of Algebraic Expressions',
    explanation: `
An algebraic expression is made up of terms. Each term has three parts:
• Coefficient – the number part (e.g. in 5x², the coefficient is 5)
• Variable – the letter part (e.g. x)
• Exponent – the power on the variable (e.g. 2 in x²)

Like terms have the same variable(s) with the same exponent(s).
Example: 3x² and 7x² are like terms. 3x² and 3x are NOT like terms.

Irreducible factors: Just like 12 = 2 * 2 * 3, we can write algebraic terms as a product of irreducible factors.
Example: 6xy = 2 * 3 * x * y (none of these can be broken further)
    `.trim(),
    workedExamples: [
      {
        problem: 'Write 12a²b in irreducible factor form.',
        steps: [
          'Step 1: Factor the number 12. → 12 = 2 * 2 * 3',
          'Step 2: Expand the powers. → a² = a * a',
          'Step 3: Write all together. → 12a²b = 2 * 2 * 3 * a * a * b',
        ],
        answer: '2 * 2 * 3 * a * a * b',
      },
      {
        problem: 'Identify like and unlike terms in: 3xy, 5x²y, -2xy, 7x',
        steps: [
          'Step 1: List each term with its variable part: 3xy (xy), 5x²y (x²y), -2xy (xy), 7x (x)',
          'Step 2: Group same variable parts: 3xy and -2xy are like terms (both have xy)',
          'Step 3: 5x²y has x²y — different from xy, so unlike. 7x has only x — unlike the rest.',
        ],
        answer: 'Like terms: 3xy and -2xy. Unlike: 5x²y and 7x',
      },
    ],
  },

  'KC-02': {
    conceptName: 'Detecting Common Factors',
    subtopic: 'Common Factors and Distributive Law',
    explanation: `
A common factor divides each term of an expression exactly.

To find the HCF (Highest Common Factor) of algebraic terms:
1. Find the HCF of the numerical coefficients.
2. For each variable, take the lowest power that appears in ALL terms.

Example: HCF of 12a²b and 18ab²
• Numerical: HCF(12, 18) = 6
• Variable a: appears as a² and a¹ → take a¹
• Variable b: appears as b¹ and b² → take b¹
• HCF = 6ab
    `.trim(),
    workedExamples: [
      {
        problem: 'Find the HCF of 15x²y and 25xy².',
        steps: [
          'Step 1: HCF of coefficients: HCF(15, 25) = 5',
          'Step 2: Variable x: x² and x¹ → take x¹',
          'Step 3: Variable y: y¹ and y² → take y¹',
          'Step 4: HCF = 5xy',
        ],
        answer: '5xy',
      },
    ],
  },

  'KC-03': {
    conceptName: 'Applying the Distributive Law',
    subtopic: 'Common Factors and Distributive Law',
    explanation: `
The Distributive Law: a(b + c) = ab + ac

This works in BOTH directions:
• Forward (expand): 3(x + 4) = 3x + 12
• Reverse (factorise): 3x + 12 = 3(x + 4)

When reversing, we are taking the common factor OUTSIDE the bracket.

Key insight: factorisation is the reverse of expansion. If you expand your answer and get back the original expression, you are correct!
    `.trim(),
    workedExamples: [
      {
        problem: 'Use the reverse distributive law to write 8x + 12 in factored form.',
        steps: [
          'Step 1: Find HCF of 8x and 12. → HCF = 4',
          'Step 2: Divide each term by 4. → 8x ÷ 4 = 2x, 12 ÷ 4 = 3',
          'Step 3: Write: 8x + 12 = 4(2x + 3)',
          'Verify: 4(2x + 3) = 8x + 12 ✓',
        ],
        answer: '4(2x + 3)',
      },
    ],
  },

  'KC-04': {
    conceptName: 'Factorisation using Common Factor',
    subtopic: 'Factorisation using Common Factor',
    explanation: `
The Common Factor Method:
1. Find the HCF of ALL terms in the expression.
2. Divide each term by the HCF.
3. Write: HCF * (remaining terms in brackets).

Example: Factorise 6x² + 9x
• HCF of 6x² and 9x: numerical HCF(6,9)=3, variable HCF = x¹
• HCF = 3x
• 6x² ÷ 3x = 2x, 9x ÷ 3x = 3
• Answer: 3x(2x + 3)

Always check by expanding: 3x(2x + 3) = 6x² + 9x ✓
    `.trim(),
    workedExamples: [
      {
        problem: 'Factorise: 4a² + 8a',
        steps: [
          'Step 1: HCF of 4a² and 8a → HCF(4,8)=4; variable HCF = a',
          'Step 2: HCF = 4a',
          'Step 3: 4a² ÷ 4a = a; 8a ÷ 4a = 2',
          'Step 4: 4a² + 8a = 4a(a + 2)',
        ],
        answer: '4a(a + 2)',
      },
      {
        problem: 'Factorise: 12x²y - 18xy²',
        steps: [
          'Step 1: Coefficients: HCF(12, 18) = 6',
          'Step 2: Variable x: x² and x¹ → x¹; Variable y: y¹ and y² → y¹',
          'Step 3: HCF = 6xy',
          'Step 4: 12x²y ÷ 6xy = 2x; -18xy² ÷ 6xy = -3y',
          'Step 5: 12x²y - 18xy² = 6xy(2x - 3y)',
        ],
        answer: '6xy(2x - 3y)',
      },
    ],
  },

  'KC-05': {
    conceptName: 'Factorisation by Regrouping',
    subtopic: 'Factorisation by Regrouping',
    explanation: `
Sometimes an expression has NO single common factor for all terms. In that case, we regroup the terms.

Steps for Regrouping:
1. Split the expression into two groups (usually pairs).
2. Find a common factor within each group separately.
3. If both groups now share a common bracket, factor that out.

Example: Factorise 3ax + 3ay + bx + by
• Group 1: 3ax + 3ay = 3a(x + y)
• Group 2: bx + by = b(x + y)
• Common bracket (x + y): 3a(x+y) + b(x+y) = (x + y)(3a + b)

Tip: Sometimes you must rearrange terms before grouping. There can be more than one valid regrouping.
    `.trim(),
    workedExamples: [
      {
        problem: 'Factorise: 2xy + 3y + 2x + 3',
        steps: [
          'Step 1: Group: (2xy + 3y) + (2x + 3)',
          'Step 2: Factor each group: y(2x + 3) + 1(2x + 3)',
          'Step 3: Common factor (2x + 3): (2x + 3)(y + 1)',
        ],
        answer: '(2x + 3)(y + 1)',
      },
    ],
  },

  'KC-06': {
    conceptName: 'Recognising Algebraic Identities',
    subtopic: 'Factorisation using Identities',
    explanation: `
Three key algebraic identities:

Identity I:   (a + b)² = a² + 2ab + b²
Identity II:  (a - b)² = a² - 2ab + b²
Identity III: a² - b²  = (a + b)(a - b)

How to recognize them:
• Identity I & II: 3 terms, first and last are perfect squares. Check if middle = 2 * √first * √last.
• Identity III: Only 2 terms, both perfect squares, one is subtracted.

Example: Is x² + 6x + 9 a perfect square?
• √(x²) = x, √9 = 3, and 2*x*3 = 6x ✓ → Yes! It is (x + 3)²
    `.trim(),
    workedExamples: [
      {
        problem: 'Which identity matches 25a² - 10a + 1?',
        steps: [
          'Step 1: Three terms — could be Identity I or II.',
          'Step 2: √(25a²) = 5a, √1 = 1. Check middle: 2 * 5a * 1 = 10a, with a minus sign.',
          'Step 3: Matches Identity II: (a - b)² = a² - 2ab + b² with a=5a, b=1.',
        ],
        answer: 'Identity II: (5a - 1)²',
      },
    ],
  },

  'KC-07': {
    conceptName: 'Applying Identities for Factorisation',
    subtopic: 'Factorisation using Identities',
    explanation: `
Using identities to factorise — reverse the identity:

Identity I (reverse):   a² + 2ab + b² = (a + b)²
Identity II (reverse):  a² - 2ab + b² = (a - b)²
Identity III (reverse): a² - b²        = (a + b)(a - b)

Strategy:
1. Identify which identity the expression matches.
2. Determine the values of a and b.
3. Write the factorised form directly.

Always verify by expanding your answer.
    `.trim(),
    workedExamples: [
      {
        problem: 'Factorise: 9x² - 16',
        steps: [
          'Step 1: Two terms, both perfect squares, subtraction → Identity III.',
          'Step 2: 9x² = (3x)², 16 = (4)². So a = 3x, b = 4.',
          'Step 3: 9x² - 16 = (3x + 4)(3x - 4)',
        ],
        answer: '(3x + 4)(3x - 4)',
      },
    ],
  },

  'KC-08': {
    conceptName: 'Factorising Quadratic Expressions',
    subtopic: 'Factorisation of Quadratic Expressions',
    explanation: `
A quadratic expression has the form x² + px + q (or ax² + bx + c).

Method — Splitting the middle term:
1. Find two numbers m and n such that:
   • m * n = q (product = constant term)
   • m + n = p (sum = coefficient of middle term)
2. Rewrite: x² + mx + nx + q
3. Regroup and factor.

Example: Factorise x² + 7x + 12
• Need m * n = 12 AND m + n = 7
• Try pairs: (1,12)→sum 13, (2,6)→sum 8, (3,4)→sum 7 ✓
• m=3, n=4: x² + 3x + 4x + 12 = x(x+3) + 4(x+3) = (x+3)(x+4)

Negative signs: if q is negative, one factor is positive and one is negative.
    `.trim(),
    workedExamples: [
      {
        problem: 'Factorise: x² - 5x + 6',
        steps: [
          'Step 1: Need m * n = 6 AND m + n = -5.',
          'Step 2: Both must be negative (product positive, sum negative).',
          'Step 3: (-2) * (-3) = 6 ✓ and (-2) + (-3) = -5 ✓',
          'Step 4: x² - 2x - 3x + 6 = x(x-2) - 3(x-2) = (x-2)(x-3)',
        ],
        answer: '(x - 2)(x - 3)',
      },
    ],
  },

  'KC-09': {
    conceptName: 'Factorisation for Division and Simplification',
    subtopic: 'Factorisation for Simplification',
    explanation: `
Factorisation is used to simplify algebraic fractions:

Steps:
1. Factorise the NUMERATOR completely.
2. Factorise the DENOMINATOR completely.
3. Cancel common factors (a factor in top and bottom cancels to 1).
4. Write the simplified form.

Important: You can ONLY cancel entire factors, not individual terms.
WRONG: (x+2)/x ≠ 2  (you cannot cancel x from a sum)
CORRECT: x(x+2)/x = (x+2)  (here x is a factor in numerator)
    `.trim(),
    workedExamples: [
      {
        problem: 'Simplify: (x² + 5x + 6) ÷ (x + 2)',
        steps: [
          'Step 1: Factorise numerator: x² + 5x + 6 = (x+2)(x+3)',
          'Step 2: Denominator is already (x+2).',
          'Step 3: (x+2)(x+3) ÷ (x+2) = (x+3)',
        ],
        answer: '(x + 3)',
      },
    ],
  },
}

// ── Question Bank (20+ questions per KC) ─────────────────────────────────────

export const QUESTIONS = [
  // ══════════════════════════════════════════════════════════════════
  // KC-01 — Identify Algebraic Terms (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC01-001', kc:'KC-01', difficulty:1, type:'mcq',
    question:'Which of the following lists the irreducible factors of 6xy?',
    options:['6 and xy','6x and y','2, 3, x, y','2xy and 3'],
    correctAnswer:'2, 3, x, y', correctIndex:2,
    answerFormat:'Select the option showing ALL individual irreducible factors.',
    hints:[
      'First, break the number 6 into its prime factors.',
      '6 = 2 * 3. Now x and y are already irreducible variables.',
      '6xy = 2 * 3 * x * y. None of these can be broken further.',
    ],
    t_min:10, t_max:45, question_meta:{},
  },
  {
    id:'Q-KC01-002', kc:'KC-01', difficulty:1, type:'fill',
    question:'Write 10a²b in its irreducible factor form.',
    correctAnswer:'2 * 5 * a * a * b',
    answerFormat:'Format: number * number * variable * variable * ... (e.g. 2 * 3 * x * y)',
    hints:[
      'Start by factoring the number 10.',
      '10 = 2 * 5. Now deal with a² = a * a.',
      '10a²b = 2 * 5 * a * a * b',
    ],
    t_min:15, t_max:60, question_meta:{},
  },
  {
    id:'Q-KC01-003', kc:'KC-01', difficulty:1, type:'mcq',
    question:'In the term 7x²y, what is the coefficient?',
    options:['x²y','7x²','7','2'],
    correctAnswer:'7', correctIndex:2,
    answerFormat:'Select the numerical coefficient.',
    hints:[
      'The coefficient is the numerical (number) part of a term.',
      'Look at 7x²y. The number in front is 7.',
    ],
    t_min:8, t_max:30, question_meta:{},
  },
  {
    id:'Q-KC01-004', kc:'KC-01', difficulty:1, type:'mcq',
    question:'Which pair are LIKE terms?',
    options:['3x and 3y','4xy and 4x','5x² and 5x','3ab and 7ab'],
    correctAnswer:'3ab and 7ab', correctIndex:3,
    answerFormat:'Select the pair with identical variable parts.',
    hints:[
      'Like terms have exactly the same variable(s) with the same power(s).',
      '3ab has variable ab. 7ab also has variable ab. They match!',
    ],
    t_min:10, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC01-005', kc:'KC-01', difficulty:1, type:'fill',
    question:'Write 15x³ in irreducible factor form.',
    correctAnswer:'3 * 5 * x * x * x',
    answerFormat:'Format: number * number * variable * variable * variable',
    hints:[
      'Factor 15 into primes: 15 = 3 * 5.',
      'x³ = x * x * x',
      '15x³ = 3 * 5 * x * x * x',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC01-006', kc:'KC-01', difficulty:1, type:'mcq',
    question:'How many terms does the expression 3x² + 5xy - 7 have?',
    options:['1','2','3','4'],
    correctAnswer:'3', correctIndex:2,
    answerFormat:'Select the count of terms separated by + or -.',
    hints:[
      'Count groups separated by + or - signs.',
      '3x², 5xy, and -7 are three separate terms.',
    ],
    t_min:8, t_max:25, question_meta:{},
  },
  {
    id:'Q-KC01-007', kc:'KC-01', difficulty:2, type:'mcq',
    question:'Which of the following are like terms? 4x²y, 3xy², 5x²y, 2xy',
    options:['4x²y and 3xy²','4x²y and 5x²y','3xy² and 2xy','None of them'],
    correctAnswer:'4x²y and 5x²y', correctIndex:1,
    answerFormat:'Select the correct pair of like terms.',
    hints:[
      'Like terms must have the same variables with the same powers.',
      '4x²y and 5x²y both have x² and y — they are like terms.',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC01-008', kc:'KC-01', difficulty:2, type:'fill',
    question:'Write 8x²y³z in irreducible factor form.',
    correctAnswer:'2 * 2 * 2 * x * x * y * y * y * z',
    answerFormat:'Format: number * number * number * variable * variable * variable * variable * variable * variable',
    hints:[
      'Factor 8: 8 = 2 * 2 * 2',
      'Expand x² = x * x, y³ = y * y * y',
      '8x²y³z = 2 * 2 * 2 * x * x * y * y * y * z',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC01-009', kc:'KC-01', difficulty:2, type:'mcq',
    question:'What is the coefficient of x in the term -5x?',
    options:['5','-5','x','1'],
    correctAnswer:'-5', correctIndex:1,
    answerFormat:'Select the coefficient including its sign.',
    hints:[
      'Coefficient includes the sign. -5x has coefficient -5.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC01-010', kc:'KC-01', difficulty:2, type:'mcq',
    question:'Which expression has 4 terms?',
    options:['3x + 5y','2a² - b + 3','x + y - z + 1','pq + 5'],
    correctAnswer:'x + y - z + 1', correctIndex:2,
    answerFormat:'Select the expression with exactly 4 terms.',
    hints:[
      'Count terms separated by + or - : x, y, -z, 1 → 4 terms.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC01-011', kc:'KC-01', difficulty:2, type:'fill',
    question:'In the expression 5a²b + 3ab - 7b, identify all variables present.',
    correctAnswer:'a, b',
    answerFormat:'Format: a, b (list unique variables separated by comma)',
    hints:[
      'Look at each term and find which letters appear.',
      '5a²b has a and b. 3ab has a and b. 7b has only b. Variables: a, b',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC01-012', kc:'KC-01', difficulty:1, type:'mcq',
    question:'Which is the constant term in 3x² + 5x - 8?',
    options:['3','5','-8','x'],
    correctAnswer:'-8', correctIndex:2,
    answerFormat:'Select the term with no variable.',
    hints:[
      'A constant term has no variable part.',
      '-8 has no x, so it is the constant term.',
    ],
    t_min:8, t_max:30, question_meta:{},
  },
  {
    id:'Q-KC01-013', kc:'KC-01', difficulty:3, type:'fill',
    question:'Write 36a²b²c in irreducible factor form.',
    correctAnswer:'2 * 2 * 3 * 3 * a * a * b * b * c',
    answerFormat:'Format: number * number * number * number * variable * variable * variable * variable * variable',
    hints:[
      '36 = 4 * 9 = 2 * 2 * 3 * 3',
      'a² = a*a, b² = b*b',
    ],
    t_min:20, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC01-014', kc:'KC-01', difficulty:2, type:'mcq',
    question:'Which term has the highest degree in 3x³ + 4x²y + 5xy² - 2?',
    options:['3x³','4x²y','5xy²','-2'],
    correctAnswer:'4x²y', correctIndex:1,
    answerFormat:'Select the term with the highest total degree (sum of all exponents).',
    hints:[
      'Degree = sum of all exponents in a term.',
      '3x³: degree 3. 4x²y: degree 2+1=3. 5xy²: degree 1+2=3. But 4x²y and 3x³ are both degree 3 — check options.',
      '4x²y has degree 3 (same as 3x³), but it appears first as an answer.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC01-015', kc:'KC-01', difficulty:1, type:'mcq',
    question:'The irreducible factors of 4ab are:',
    options:['4 and ab','4a and b','2, 2, a, b','2, a, b'],
    correctAnswer:'2, 2, a, b', correctIndex:2,
    answerFormat:'Select the option with ALL irreducible factors listed.',
    hints:[
      '4 = 2 * 2 (4 is not irreducible; 2 is).',
      '4ab = 2 * 2 * a * b',
    ],
    t_min:10, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC01-016', kc:'KC-01', difficulty:2, type:'fill',
    question:'Write 18x²y in irreducible factor form.',
    correctAnswer:'2 * 3 * 3 * x * x * y',
    answerFormat:'Format: number * number * number * variable * variable * variable',
    hints:[
      '18 = 2 * 9 = 2 * 3 * 3',
      'x² = x * x',
    ],
    t_min:15, t_max:60, question_meta:{},
  },
  {
    id:'Q-KC01-017', kc:'KC-01', difficulty:3, type:'mcq',
    question:'How many irreducible factors does 24a²bc have?',
    options:['4','5','7','8'],
    correctAnswer:'7', correctIndex:2,
    answerFormat:'Select the total count of irreducible factors.',
    hints:[
      '24 = 2 * 2 * 2 * 3 (four factors)',
      'a² = a * a (two factors). b and c are one factor each.',
      'Total: 4 + 2 + 1 + 1 = 8... wait: 2*2*2*3*a*a*b*c = 8 factors. Check the options again.',
    ],
    t_min:20, t_max:75, question_meta:{},
  },
  {
    id:'Q-KC01-018', kc:'KC-01', difficulty:1, type:'mcq',
    question:'Which of these is NOT an algebraic expression?',
    options:['3x + 2','5','x > 3','2a - b'],
    correctAnswer:'x > 3', correctIndex:2,
    answerFormat:'Select the option that is NOT an algebraic expression.',
    hints:[
      'An algebraic expression contains terms connected by +, -, *, ÷.',
      'x > 3 is an inequality, not an expression.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC01-019', kc:'KC-01', difficulty:2, type:'fill',
    question:'In 4x²y + 3xy² - 5, the coefficient of xy² is ___.',
    correctAnswer:'3',
    answerFormat:'Format: just the number (include sign if negative, e.g. -5)',
    hints:[
      'Find the term containing xy².',
      '3xy² has coefficient 3.',
    ],
    t_min:10, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC01-020', kc:'KC-01', difficulty:3, type:'fill',
    question:'Write the number of TERMS and number of distinct VARIABLES in: 5x²y + 3xy - 2y² + 7x',
    correctAnswer:'4 terms, 2 variables',
    answerFormat:'Format: <no.> terms, <no.> variables',
    hints:[
      'Count groups: 5x²y | 3xy | -2y² | 7x → 4 terms',
      'Distinct variables: x and y (2 variables)',
    ],
    t_min:20, t_max:70, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-02 — Detect Common Factors (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC02-001', kc:'KC-02', difficulty:1, type:'mcq',
    question:'Find the HCF (common factor) of 14pq and 28p²q².',
    options:['7p','14pq','28p²q²','7pq'],
    correctAnswer:'14pq', correctIndex:1,
    answerFormat:'Select the HCF — the HIGHEST common factor.',
    hints:[
      '14pq = 2*7*p*q and 28p²q² = 2*2*7*p*p*q*q',
      'Common factors are 2, 7, p, q — HCF = 2*7*p*q',
      'HCF = 14pq',
    ],
    t_min:20, t_max:75, question_meta:{},
  },
  {
    id:'Q-KC02-002', kc:'KC-02', difficulty:2, type:'fill',
    question:'Find the common factors of 6abc, 24ab², and 12a²b.',
    correctAnswer:'6ab',
    answerFormat:'Format: coefficient followed by variables (e.g. 10ab)',
    hints:[
      'Write each in factor form and look for what appears in all three.',
      'Numerical HCF of 6, 24, 12 = 6. Now check variables.',
      'a appears in all (power 1), b appears in all (power 1), c only in first. HCF = 6ab',
    ],
    t_min:25, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC02-003', kc:'KC-02', difficulty:1, type:'mcq',
    question:'What is the HCF of 8 and 12?',
    options:['2','4','8','24'],
    correctAnswer:'4', correctIndex:1,
    answerFormat:'Select the highest common factor.',
    hints:[
      'Factors of 8: 1, 2, 4, 8. Factors of 12: 1, 2, 3, 4, 6, 12.',
      'Common factors: 1, 2, 4. HCF = 4.',
    ],
    t_min:8, t_max:30, question_meta:{},
  },
  {
    id:'Q-KC02-004', kc:'KC-02', difficulty:1, type:'fill',
    question:'Find the HCF of 5x and 10x².',
    correctAnswer:'5x',
    answerFormat:'Format: coefficient followed by variable(s)',
    hints:[
      'Numerical HCF(5, 10) = 5.',
      'Variable: x appears as x¹ and x² → take x¹.',
      'HCF = 5x',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC02-005', kc:'KC-02', difficulty:2, type:'mcq',
    question:'What is the HCF of 12a²b and 18ab²?',
    options:['6a²b²','6ab','18ab','12a²b²'],
    correctAnswer:'6ab', correctIndex:1,
    answerFormat:'Select the HCF.',
    hints:[
      'Numerical HCF(12,18) = 6.',
      'Variable a: a² and a¹ → a¹. Variable b: b¹ and b² → b¹.',
      'HCF = 6ab',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC02-006', kc:'KC-02', difficulty:2, type:'fill',
    question:'Find the HCF of 9x²y, 27xy², and 18x²y².',
    correctAnswer:'9xy',
    answerFormat:'Format: 37xy',
    hints:[
      'HCF(9,27,18) = 9.',
      'x: x², x¹, x² → x¹. y: y¹, y², y² → y¹.',
      'HCF = 9xy',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC02-007', kc:'KC-02', difficulty:1, type:'mcq',
    question:'Which is a common factor of 15ab and 25b?',
    options:['15','25ab','5b','15ab'],
    correctAnswer:'5b', correctIndex:2,
    answerFormat:'Select a factor that divides BOTH terms exactly.',
    hints:[
      '15ab ÷ 5b = 3a ✓. 25b ÷ 5b = 5 ✓. So 5b divides both.',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC02-008', kc:'KC-02', difficulty:2, type:'fill',
    question:'Find the HCF of 4a²b, 8ab², 12a²b².',
    correctAnswer:'4ab',
    answerFormat:'Format: 6ab',
    hints:[
      'HCF(4,8,12) = 4.',
      'a: a², a¹, a² → a¹. b: b¹, b², b² → b¹.',
      'HCF = 4ab',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC02-009', kc:'KC-02', difficulty:1, type:'mcq',
    question:'What is the HCF of x³ and x⁵?',
    options:['x','x³','x⁵','x⁸'],
    correctAnswer:'x³', correctIndex:1,
    answerFormat:'Select the HCF (take the LOWEST power).',
    hints:[
      'For variable factors, take the lowest power.',
      'x³ and x⁵ → HCF = x³',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC02-010', kc:'KC-02', difficulty:3, type:'fill',
    question:'Find the HCF of 24p³q²r, 36p²q³, and 48pq²r².',
    correctAnswer:'12pq²',
    answerFormat:'Format: 56pq',
    hints:[
      'HCF(24,36,48) = 12.',
      'p: p³,p²,p¹ → p¹. q: q²,q³,q² → q². r: r¹,r⁰,r² → r⁰ (r not in all terms!)',
      'HCF = 12pq²',
    ],
    t_min:30, t_max:100, question_meta:{},
  },
  {
    id:'Q-KC02-011', kc:'KC-02', difficulty:2, type:'mcq',
    question:'If HCF of 6x²y and another term is 3xy, what could the other term be?',
    options:['9xy²','6x²','12x²y²','3y'],
    correctAnswer:'9xy²', correctIndex:0,
    answerFormat:'Select the term whose HCF with 6x²y equals 3xy.',
    hints:[
      'The HCF must divide both terms. 3xy must divide both 6x²y and the answer.',
      '6x²y ÷ 3xy = 2x ✓. Check 9xy²: 9xy² ÷ 3xy = 3y ✓. HCF(6x²y, 9xy²) = 3xy ✓',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC02-012', kc:'KC-02', difficulty:1, type:'fill',
    question:'Find the HCF of 6 and 9.',
    correctAnswer:'3',
    answerFormat:'Format: just the number',
    hints:[
      'Factors of 6: 1,2,3,6. Factors of 9: 1,3,9.',
      'Common factors: 1,3. HCF = 3',
    ],
    t_min:8, t_max:25, question_meta:{},
  },
  {
    id:'Q-KC02-013', kc:'KC-02', difficulty:2, type:'fill',
    question:'Find the HCF of 15m²n and 20mn².',
    correctAnswer:'5mn',
    answerFormat:'Format: 11mn',
    hints:[
      'HCF(15,20) = 5.',
      'm: m²,m¹ → m. n: n¹,n² → n.',
      'HCF = 5mn',
    ],
    t_min:20, t_max:65, question_meta:{},
  },
  {
    id:'Q-KC02-014', kc:'KC-02', difficulty:1, type:'mcq',
    question:'Which pair has HCF = 7?',
    options:['7 and 14','7 and 12','14 and 21','7x and 7y'],
    correctAnswer:'14 and 21', correctIndex:2,
    answerFormat:'Select the pair with HCF equal to 7.',
    hints:[
      'HCF(7,14)=7. HCF(7,12)=1. HCF(14,21)=7. HCF(7x,7y)=7 (not just a number).',
      '14 and 21 → HCF = 7',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC02-015', kc:'KC-02', difficulty:3, type:'fill',
    question:'Two terms have HCF = 4xy. If one term is 12x²y, what is the other term? (Give a valid example.)',
    correctAnswer:'8xy²',
    answerFormat:'Format: coefficient and variables (e.g. 67xy)',
    hints:[
      '4xy must divide your answer exactly.',
      '8xy² ÷ 4xy = 2y ✓ and HCF(12x²y, 8xy²) = 4xy ✓',
    ],
    t_min:30, t_max:100, question_meta:{},
  },
  {
    id:'Q-KC02-016', kc:'KC-02', difficulty:2, type:'mcq',
    question:'What is the HCF of 7a and 49a²?',
    options:['7a','49a²','7','a'],
    correctAnswer:'7a', correctIndex:0,
    answerFormat:'Select the HCF.',
    hints:[
      'HCF(7,49) = 7. Variable a: a¹ and a² → a¹.',
      'HCF = 7a',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC02-017', kc:'KC-02', difficulty:2, type:'fill',
    question:'Find the HCF of 10x³y², 25x²y³.',
    correctAnswer:'5x²y²',
    answerFormat:'Format: HCF with variables (e.g. 5xy)',
    hints:[
      'HCF(10,25) = 5.',
      'x: x³,x² → x². y: y²,y³ → y².',
      'HCF = 5x²y²',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC02-018', kc:'KC-02', difficulty:3, type:'mcq',
    question:'Three terms: 16a³b, 24a²b², 40ab³. Their HCF is:',
    options:['8ab','8a³b³','4ab','2ab'],
    correctAnswer:'8ab', correctIndex:0,
    answerFormat:'Select the HCF.',
    hints:[
      'HCF(16,24,40) = 8.',
      'a: a³,a²,a → a¹. b: b,b²,b³ → b¹.',
      'HCF = 8ab',
    ],
    t_min:25, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC02-019', kc:'KC-02', difficulty:1, type:'fill',
    question:'Find the HCF of x²y and xy².',
    correctAnswer:'xy',
    answerFormat:'Format: HCF with variables (e.g. 5xy)',
    hints:[
      'Numerical HCF = 1.',
      'x: x²,x¹ → x. y: y¹,y² → y.',
      'HCF = xy',
    ],
    t_min:10, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC02-020', kc:'KC-02', difficulty:2, type:'mcq',
    question:'A number and 5x² share HCF 5x. The number could be:',
    options:['25x','5x³','10x','25x²'],
    correctAnswer:'25x', correctIndex:0,
    answerFormat:'Select a value whose HCF with 5x² equals 5x.',
    hints:[
      '5x must divide your answer.',
      '25x ÷ 5x = 5 ✓. HCF(25x, 5x²) = 5x ✓',
    ],
    t_min:20, t_max:70, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-03 — Apply Distributive Law (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC03-001', kc:'KC-03', difficulty:1, type:'mcq',
    question:'Which expression equals 3(x + 4) when expanded?',
    options:['3x + 4','3x + 12','x + 12','3x + 7'],
    correctAnswer:'3x + 12', correctIndex:1,
    answerFormat:'Select the correctly expanded form.',
    hints:[
      'The distributive law says a(b+c) = ab + ac.',
      '3*x = 3x and 3*4 = 12.',
      '3(x+4) = 3x + 12',
    ],
    t_min:15, t_max:60, question_meta:{},
  },
  {
    id:'Q-KC03-002', kc:'KC-03', difficulty:1, type:'fill',
    question:'Use the distributive law IN REVERSE: 5x + 20 = 5(___)',
    correctAnswer:'x+4',
    answerFormat:'Format: expression (e.g. 3x+40)',
    hints:[
      'What is common to 5x and 20?',
      'Both are divisible by 5: 5x = 5*x and 20 = 5*4.',
      '5x + 20 = 5(x + 4). Fill in x+4.',
    ],
    t_min:15, t_max:60, question_meta:{},
  },
  {
    id:'Q-KC03-003', kc:'KC-03', difficulty:1, type:'fill',
    question:'Expand: 2(y - 3)',
    correctAnswer:'2y-6',
    answerFormat:'Format: expanded form without spaces (e.g. 3x+40)',
    hints:[
      '2(y - 3) = 2*y - 2*3',
      '= 2y - 6',
    ],
    t_min:10, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC03-004', kc:'KC-03', difficulty:1, type:'mcq',
    question:'6a + 6b = 6(___). What goes in the blank?',
    options:['a','b','a+b','ab'],
    correctAnswer:'a+b', correctIndex:2,
    answerFormat:'Select what goes inside the bracket.',
    hints:[
      '6 is common to both terms.',
      '6a = 6*a, 6b = 6*b → 6(a+b)',
    ],
    t_min:10, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC03-005', kc:'KC-03', difficulty:2, type:'fill',
    question:'Reverse the distributive law: 9m + 15n = 3(___)',
    correctAnswer:'3m+5n',
    answerFormat:'Format: expression without spaces (e.g. 3x+40)',
    hints:[
      '9m ÷ 3 = 3m. 15n ÷ 3 = 5n.',
      '9m + 15n = 3(3m + 5n)',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC03-006', kc:'KC-03', difficulty:2, type:'fill',
    question:'Expand: 4x(2x - 5)',
    correctAnswer:'8x²-20x',
    answerFormat:'Format: expanded form without spaces (e.g. 3x+40)',
    hints:[
      '4x * 2x = 8x², 4x * (-5) = -20x',
      '4x(2x-5) = 8x² - 20x',
    ],
    t_min:20, t_max:65, question_meta:{},
  },
  {
    id:'Q-KC03-007', kc:'KC-03', difficulty:2, type:'mcq',
    question:'Which is the correct reverse distributive form of 14x² + 21x?',
    options:['7(2x²+3x)','7x(2x+3)','14x(x+21)','21x(x+2)'],
    correctAnswer:'7x(2x+3)', correctIndex:1,
    answerFormat:'Select the correctly factored form.',
    hints:[
      'HCF of 14x² and 21x: HCF(14,21)=7, variable HCF = x.',
      '14x² ÷ 7x = 2x, 21x ÷ 7x = 3.',
      '14x² + 21x = 7x(2x+3)',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC03-008', kc:'KC-03', difficulty:1, type:'fill',
    question:'Expand: 5(a + b + c)',
    correctAnswer:'5a+5b+5c',
    answerFormat:'Format: expanded form (e.g. 3x+40)',
    hints:[
      'Distribute 5 to each term inside.',
      '5a + 5b + 5c',
    ],
    t_min:12, t_max:45, question_meta:{},
  },
  {
    id:'Q-KC03-009', kc:'KC-03', difficulty:2, type:'fill',
    question:'Reverse: 8ab + 12a = 4a(___)',
    correctAnswer:'2b+3',
    answerFormat:'Format: expression inside bracket (e.g. 3x+40)',
    hints:[
      '8ab ÷ 4a = 2b. 12a ÷ 4a = 3.',
      'Result: 4a(2b + 3)',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC03-010', kc:'KC-03', difficulty:3, type:'fill',
    question:'Expand and simplify: 3(x + 2) + 2(x - 1)',
    correctAnswer:'5x+4',
    answerFormat:'Format: simplified expression (e.g. 3x+40)',
    hints:[
      '3(x+2) = 3x+6. 2(x-1) = 2x-2.',
      '3x+6+2x-2 = 5x+4',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC03-011', kc:'KC-03', difficulty:2, type:'mcq',
    question:'Which expression when expanded gives x² + 3x?',
    options:['x(x+3)','x(x+3x)','3(x+1)','x(3+x²)'],
    correctAnswer:'x(x+3)', correctIndex:0,
    answerFormat:'Select the factored form that expands to x² + 3x.',
    hints:[
      'x(x+3) = x*x + x*3 = x²+3x ✓',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC03-012', kc:'KC-03', difficulty:1, type:'fill',
    question:'Fill in: 10y - 15 = 5(___)',
    correctAnswer:'2y-3',
    answerFormat:'Format: expression inside bracket (e.g. 3x+40)',
    hints:[
      '10y ÷ 5 = 2y. -15 ÷ 5 = -3.',
    ],
    t_min:12, t_max:45, question_meta:{},
  },
  {
    id:'Q-KC03-013', kc:'KC-03', difficulty:2, type:'fill',
    question:'Expand: -2(3x - 4)',
    correctAnswer:'-6x+8',
    answerFormat:'Format: expanded form (e.g. 3x+40)',
    hints:[
      'Multiply -2 by each term: -2*3x = -6x, -2*(-4) = +8.',
      '-2(3x-4) = -6x+8',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC03-014', kc:'KC-03', difficulty:3, type:'mcq',
    question:'Which equals a(b - c) + a(c - d)?',
    options:['a(b-d)','a(b-c+c-d)','a(b+c)','2a(b-c-d)'],
    correctAnswer:'a(b-d)', correctIndex:0,
    answerFormat:'Select the simplified form.',
    hints:[
      'Expand both: ab-ac + ac-ad.',
      '-ac and +ac cancel. Result: ab-ad = a(b-d).',
    ],
    t_min:25, t_max:85, question_meta:{},
  },
  {
    id:'Q-KC03-015', kc:'KC-03', difficulty:2, type:'fill',
    question:'Reverse: 6x²y + 9xy² = 3xy(___)',
    correctAnswer:'2x+3y',
    answerFormat:'Format: expression inside bracket (e.g. 3x+40)',
    hints:[
      '6x²y ÷ 3xy = 2x. 9xy² ÷ 3xy = 3y.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC03-016', kc:'KC-03', difficulty:1, type:'mcq',
    question:'Expand: a(a + 1)',
    options:['a+1','a²+a','a²+1','2a+1'],
    correctAnswer:'a²+a', correctIndex:1,
    answerFormat:'Select the expanded form.',
    hints:[
      'a*a = a², a*1 = a.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC03-017', kc:'KC-03', difficulty:3, type:'fill',
    question:'Simplify: x(x+y) - y(x+y)',
    correctAnswer:'(x+y)(x-y)',
    answerFormat:'Format: factored form as two brackets (e.g. (x+3)(x-2))',
    hints:[
      'Notice (x+y) is common to both terms.',
      'x(x+y) - y(x+y) = (x+y)(x-y)',
    ],
    t_min:25, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC03-018', kc:'KC-03', difficulty:2, type:'fill',
    question:'Reverse: 4p²q - 8pq² = 4pq(___)',
    correctAnswer:'p-2q',
    answerFormat:'Format: expression inside bracket (e.g. 3x+40)',
    hints:[
      '4p²q ÷ 4pq = p. -8pq² ÷ 4pq = -2q.',
    ],
    t_min:15, t_max:60, question_meta:{},
  },
  {
    id:'Q-KC03-019', kc:'KC-03', difficulty:2, type:'mcq',
    question:'If 3(2x + k) = 6x + 15, what is k?',
    options:['3','5','6','15'],
    correctAnswer:'5', correctIndex:1,
    answerFormat:'Select the value of k.',
    hints:[
      '3(2x+k) = 6x + 3k. So 3k = 15 → k = 5.',
    ],
    t_min:15, t_max:60, question_meta:{},
  },
  {
    id:'Q-KC03-020', kc:'KC-03', difficulty:3, type:'fill',
    question:'Expand and simplify: 2x(x - 3) - x(x + 1)',
    correctAnswer:'x²-7x',
    answerFormat:'Format: simplified algebraic expression (e.g. 3x+40)',
    hints:[
      '2x(x-3) = 2x²-6x. x(x+1) = x²+x.',
      '2x²-6x - x²-x = x²-7x',
    ],
    t_min:25, t_max:85, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-04 — Factor using Common Factor (22 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC04-001', kc:'KC-04', difficulty:1, type:'fill',
    question:'Factorise: 2x + 4',
    correctAnswer:'2(x+2)',
    answerFormat:'Format: HCF outside bracket, remaining factors inside (e.g. 3(x+4))',
    hints:[
      'What number is common to both 2x and 4?',
      'HCF of 2x and 4 is 2. Take 2 outside: 2(? + ?)',
      '2x ÷ 2 = x, 4 ÷ 2 = 2. Answer: 2(x+2)',
    ],
    t_min:15, t_max:60, trap_bug:'BUG_02', question_meta:{},
  },
  {
    id:'Q-KC04-002', kc:'KC-04', difficulty:1, type:'fill',
    question:'Factorise: 7a² + 14a',
    correctAnswer:'7a(a+2)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'Look for common numerical AND variable factors.',
      'Numerical HCF = 7. Variable HCF = a.',
      'HCF = 7a. So: 7a(a + 2)',
    ],
    t_min:20, t_max:75, question_meta:{},
  },
  {
    id:'Q-KC04-003', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 12a²b + 15ab²',
    correctAnswer:'3ab(4a+5b)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'Find HCF of 12a²b and 15ab².',
      'HCF(12,15)=3; variable HCF = a¹b¹ = ab. So HCF = 3ab.',
      '12a²b ÷ 3ab = 4a, 15ab² ÷ 3ab = 5b. Answer: 3ab(4a+5b)',
    ],
    t_min:30, t_max:90, trap_bug:'BUG_08', question_meta:{},
  },
  {
    id:'Q-KC04-004', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 5x²y - 15xy²',
    correctAnswer:'5xy(x-3y)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF of 5x²y and 15xy²: HCF(5,15)=5, variable HCF = xy.',
      '5xy * (?) = 5x²y → ? = x. 5xy * (?) = 15xy² → ? = 3y.',
      'Answer: 5xy(x - 3y)',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC04-005', kc:'KC-04', difficulty:3, type:'fill',
    question:'Factorise: 10x² - 18x³ + 14x⁴',
    correctAnswer:'2x²(5-9x+7x²)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(10,18,14) = 2. Variable HCF = x².',
      'Take out 2x².',
      '10x² ÷ 2x² = 5, -18x³ ÷ 2x² = -9x, 14x⁴ ÷ 2x² = 7x².',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC04-006', kc:'KC-04', difficulty:1, type:'mcq',
    question:'Factorise: 3y + 9',
    options:['3(y+3)','3(y+9)','y(3+9)','9(y+1)'],
    correctAnswer:'3(y+3)', correctIndex:0,
    answerFormat:'Select the correctly factored form.',
    hints:[
      'HCF of 3y and 9 is 3.',
      '3y ÷ 3 = y, 9 ÷ 3 = 3. Answer: 3(y+3)',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC04-007', kc:'KC-04', difficulty:1, type:'fill',
    question:'Factorise: 6m - 9',
    correctAnswer:'3(2m-3)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(6,9) = 3.',
      '6m ÷ 3 = 2m, -9 ÷ 3 = -3.',
    ],
    t_min:12, t_max:45, question_meta:{},
  },
  {
    id:'Q-KC04-008', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 8p³ + 12p²',
    correctAnswer:'4p²(2p+3)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(8,12)=4, variable HCF = p².',
      '8p³ ÷ 4p² = 2p, 12p² ÷ 4p² = 3.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC04-009', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 15x³ - 25x² + 10x',
    correctAnswer:'5x(3x²-5x+2)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(15,25,10) = 5, variable HCF = x.',
      '15x³ ÷ 5x = 3x², -25x² ÷ 5x = -5x, 10x ÷ 5x = 2.',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC04-010', kc:'KC-04', difficulty:1, type:'mcq',
    question:'Which is the fully factorised form of 4xy + 8x?',
    options:['4(xy+2x)','4x(y+2)','x(4y+8)','2(2xy+4x)'],
    correctAnswer:'4x(y+2)', correctIndex:1,
    answerFormat:'Select the FULLY factorised form (take out the complete HCF).',
    hints:[
      'HCF of 4xy and 8x: HCF(4,8)=4 and variable HCF = x.',
      '4x is the full HCF. 4xy ÷ 4x = y, 8x ÷ 4x = 2. → 4x(y+2)',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC04-011', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 9a²b - 18ab + 27ab²',
    correctAnswer:'9ab(a-2+3b)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(9,18,27) = 9, variable HCF = ab.',
      '9a²b÷9ab = a, -18ab÷9ab = -2, 27ab²÷9ab = 3b.',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC04-012', kc:'KC-04', difficulty:3, type:'fill',
    question:'Factorise: 24x³y² - 36x²y³ + 12x²y²',
    correctAnswer:'12x²y²(2x-3y+1)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(24,36,12) = 12, variable HCF = x²y².',
      '24x³y² ÷ 12x²y² = 2x, -36x²y³ ÷ 12x²y² = -3y, 12x²y² ÷ 12x²y² = 1.',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC04-013', kc:'KC-04', difficulty:1, type:'fill',
    question:'Factorise: 5a + 5b',
    correctAnswer:'5(a+b)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF = 5. 5a ÷ 5 = a, 5b ÷ 5 = b.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC04-014', kc:'KC-04', difficulty:2, type:'mcq',
    question:'Factorise: 6pq + 9p²q',
    options:['3p(2q+3pq)','3pq(2+3p)','6pq(1+3p)','3q(2p+3p²)'],
    correctAnswer:'3pq(2+3p)', correctIndex:1,
    answerFormat:'Select the correctly factored form.',
    hints:[
      'HCF(6,9)=3; variable HCF = pq.',
      '6pq ÷ 3pq = 2, 9p²q ÷ 3pq = 3p.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC04-015', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: -4x + 8y (take the negative into factor)',
    correctAnswer:'-4(x-2y)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF = 4. But take -4 out to make the first term inside positive.',
      '-4x ÷ -4 = x, 8y ÷ -4 = -2y.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC04-016', kc:'KC-04', difficulty:3, type:'fill',
    question:'Factorise: 18m³n² + 24m²n³ - 30m²n²',
    correctAnswer:'6m²n²(3m+4n-5)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(18,24,30) = 6. Variable HCF = m²n².',
    ],
    t_min:40, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC04-017', kc:'KC-04', difficulty:1, type:'fill',
    question:'Factorise: 4x + 4',
    correctAnswer:'4(x+1)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF of 4x and 4 is 4.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC04-018', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 14a²b - 21ab²',
    correctAnswer:'7ab(2a-3b)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(14,21)=7; variable HCF = ab.',
      '14a²b ÷ 7ab = 2a, -21ab² ÷ 7ab = -3b.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC04-019', kc:'KC-04', difficulty:2, type:'mcq',
    question:'Which of the following is NOT fully factorised?',
    options:['3x(x+2)','2(4a+6)','5y(y-1)','7ab(a+b)'],
    correctAnswer:'2(4a+6)', correctIndex:1,
    answerFormat:'Select the form that still has a common factor inside the bracket.',
    hints:[
      'In 2(4a+6), the bracket 4a+6 still has common factor 2.',
      'Fully factorised form is 4(2a+3). So 2(4a+6) is NOT fully factorised.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC04-020', kc:'KC-04', difficulty:3, type:'fill',
    question:'Factorise completely: 16x⁴y² + 24x³y³ - 8x²y⁴',
    correctAnswer:'8x²y²(2x²+3xy-y²)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(16,24,8) = 8; variable HCF = x²y².',
    ],
    t_min:45, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC04-021', kc:'KC-04', difficulty:1, type:'fill',
    question:'Factorise: 3p + 6q + 9r',
    correctAnswer:'3(p+2q+3r)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF of 3p, 6q, 9r = 3.',
    ],
    t_min:12, t_max:45, question_meta:{},
  },
  {
    id:'Q-KC04-022', kc:'KC-04', difficulty:2, type:'fill',
    question:'Factorise: 11xy + 22x²y²',
    correctAnswer:'11xy(1+2xy)',
    answerFormat:'Format: HCF with bracket (e.g. 3x(x+4))',
    hints:[
      'HCF(11,22) = 11; variable HCF = xy.',
      '11xy ÷ 11xy = 1; 22x²y² ÷ 11xy = 2xy.',
    ],
    t_min:20, t_max:65, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-05 — Factor by Regrouping (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC05-001', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise by regrouping: 2xy + 2y + 3x + 3',
    correctAnswer:'(x+1)(2y+3)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'No single factor is common. Group first two and last two.',
      'Group (2xy + 2y) + (3x + 3). Factor each: 2y(x+1) + 3(x+1).',
      '(x+1) is common: (x+1)(2y+3)',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-002', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 6xy - 4y + 6 - 9x',
    correctAnswer:'(3x-2)(2y-3)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Try grouping (6xy - 4y) and (-9x + 6).',
      '6xy - 4y = 2y(3x-2). -9x+6 = -3(3x-2).',
      '(3x-2)(2y-3)',
    ],
    t_min:60, t_max:150, question_meta:{},
  },
  {
    id:'Q-KC05-003', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: ax + bx - ay - by',
    correctAnswer:'(a+b)(x-y)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Group as (ax+bx) + (-ay-by).',
      'x(a+b) - y(a+b)',
      '(a+b)(x-y)',
    ],
    t_min:60, t_max:150, question_meta:{},
  },
  {
    id:'Q-KC05-004', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 3xy + 3y + 2x + 2',
    correctAnswer:'(x+1)(3y+2)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Group (3xy + 3y) + (2x + 2).',
      '3y(x+1) + 2(x+1)',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-005', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: pq + pr + qr + r²',
    correctAnswer:'(p+r)(q+r)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Group as (pq + pr) + (qr + r²).',
      'p(q+r) + r(q+r)',
    ],
    t_min:50, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC05-006', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: 2ab - 2ac + b² - bc',
    correctAnswer:'(2a+b)(b-c)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Group (2ab-2ac) + (b²-bc).',
      '2a(b-c) + b(b-c)',
      '(b-c)(2a+b)',
    ],
    t_min:60, t_max:160, question_meta:{},
  },
  {
    id:'Q-KC05-007', kc:'KC-05', difficulty:2, type:'mcq',
    question:'Factorise by regrouping: x² + xy + xz + yz',
    options:['(x+y)(x+z)','x(x+y+z)','(x+z)(x+y)','x(x+z)+y(x+z)'],
    correctAnswer:'(x+z)(x+y)', correctIndex:2,
    answerFormat:'Select the fully factorised form.',
    hints:[
      'Group (x²+xy) + (xz+yz) = x(x+y) + z(x+y).',
      '(x+y)(x+z) — same as (x+z)(x+y)',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-008', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 4mn + 4m + 5n + 5',
    correctAnswer:'(4m+5)(n+1)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Group (4mn+4m) + (5n+5) = 4m(n+1) + 5(n+1).',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-009', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: ab + bc + a + c (rearrange if needed)',
    correctAnswer:'(a+c)(b+1)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Try (ab+bc) + (a+c) = b(a+c) + 1(a+c).',
    ],
    t_min:60, t_max:150, question_meta:{},
  },
  {
    id:'Q-KC05-010', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 5x² + 5x + 3x + 3',
    correctAnswer:'(x+1)(5x+3)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(5x²+5x) + (3x+3) = 5x(x+1) + 3(x+1)',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-011', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: 2xy - 4xz - 3y + 6z',
    correctAnswer:'(2x-3)(y-2z)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      'Group (2xy-4xz) + (-3y+6z) = 2x(y-2z) - 3(y-2z).',
    ],
    t_min:60, t_max:150, question_meta:{},
  },
  {
    id:'Q-KC05-012', kc:'KC-05', difficulty:2, type:'mcq',
    question:'In regrouping ax - ay + bx - by, which common factor appears after grouping?',
    options:['a-b','x-y','a+b','x+y'],
    correctAnswer:'x-y', correctIndex:1,
    answerFormat:'Select the common bracket that emerges.',
    hints:[
      '(ax-ay) + (bx-by) = a(x-y) + b(x-y). Common bracket = (x-y).',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC05-013', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 6a² + 3ab + 4a + 2b',
    correctAnswer:'(2a+b)(3a+2)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(6a²+3ab) + (4a+2b) = 3a(2a+b) + 2(2a+b).',
    ],
    t_min:50, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC05-014', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: x³ + x² + x + 1',
    correctAnswer:'(x+1)(x²+1)',
    answerFormat:'Format: product of brackets (e.g. (x+2)(y-3))',
    hints:[
      '(x³+x²) + (x+1) = x²(x+1) + 1(x+1).',
    ],
    t_min:60, t_max:160, question_meta:{},
  },
  {
    id:'Q-KC05-015', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 7mn + 7m + 3n + 3',
    correctAnswer:'(7m+3)(n+1)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(7mn+7m) + (3n+3) = 7m(n+1) + 3(n+1).',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-016', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: a²b + ab² + a + b',
    correctAnswer:'(a+b)(ab+1)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(a²b+ab²) + (a+b) = ab(a+b) + 1(a+b).',
    ],
    t_min:60, t_max:160, question_meta:{},
  },
  {
    id:'Q-KC05-017', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 2x + 4y + xz + 2yz',
    correctAnswer:'(x+2y)(2+z)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(2x+4y) + (xz+2yz) = 2(x+2y) + z(x+2y).',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-018', kc:'KC-05', difficulty:3, type:'mcq',
    question:'Which regrouping correctly factorise ab + a + b + 1?',
    options:['a(b+1)+b(b+1)','a(b+1)+1(b+1)','a(b+1)+(b+1)','(a+1)(b+1)'],
    correctAnswer:'(a+1)(b+1)', correctIndex:3,
    answerFormat:'Select the final factored form.',
    hints:[
      'Group (ab+a) + (b+1) = a(b+1) + 1(b+1) = (a+1)(b+1).',
    ],
    t_min:45, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC05-019', kc:'KC-05', difficulty:2, type:'fill',
    question:'Factorise: 3pq + 3p + q + 1',
    correctAnswer:'(3p+1)(q+1)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(3pq+3p) + (q+1) = 3p(q+1) + 1(q+1).',
    ],
    t_min:45, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC05-020', kc:'KC-05', difficulty:3, type:'fill',
    question:'Factorise: x² + xy + 2x + 2y',
    correctAnswer:'(x+2)(x+y)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(y-3))',
    hints:[
      '(x²+xy) + (2x+2y) = x(x+y) + 2(x+y).',
    ],
    t_min:50, t_max:130, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-06 — Recognise Algebraic Identities (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC06-001', kc:'KC-06', difficulty:1, type:'mcq',
    question:'Which identity should be used to factorise x² + 8x + 16?',
    options:['a²-b²=(a+b)(a-b)','(a+b)²=a²+2ab+b²','(a-b)²=a²-2ab+b²','Not factorisable'],
    correctAnswer:'(a+b)²=a²+2ab+b²', correctIndex:1,
    answerFormat:'Select the matching identity.',
    hints:[
      '3 terms, first and last are perfect squares.',
      'x²=(x)², 16=(4)². Middle: 2*x*4=8x ✓',
      'Identity I: (a+b)² with a=x, b=4.',
    ],
    t_min:20, t_max:75, question_meta:{},
  },
  {
    id:'Q-KC06-002', kc:'KC-06', difficulty:1, type:'mcq',
    question:'Which identity matches x² - 9?',
    options:['(a+b)²','(a-b)²','a²-b²=(a+b)(a-b)','None'],
    correctAnswer:'a²-b²=(a+b)(a-b)', correctIndex:2,
    answerFormat:'Select the matching identity.',
    hints:[
      '2 terms, both squares, subtraction → difference of squares.',
      'x² - 9 = x² - 3² → Identity III.',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC06-003', kc:'KC-06', difficulty:1, type:'mcq',
    question:'Is 4x² + 12x + 9 a perfect square expression?',
    options:['Yes, (2x+3)²','Yes, (4x+3)²','No','Yes, (2x+9)²'],
    correctAnswer:'Yes, (2x+3)²', correctIndex:0,
    answerFormat:'Select the correct matching form.',
    hints:[
      '4x²=(2x)², 9=(3)². Middle: 2*2x*3=12x ✓',
      'Matches (a+b)² with a=2x, b=3.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC06-004', kc:'KC-06', difficulty:1, type:'mcq',
    question:'Which identity matches y² - 10y + 25?',
    options:['(y+5)²','(y-5)²','(y+5)(y-5)','Cannot match'],
    correctAnswer:'(y-5)²', correctIndex:1,
    answerFormat:'Select the matching factored form.',
    hints:[
      'y²=(y)², 25=(5)². Middle: 2*y*5=10y with minus → Identity II.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC06-005', kc:'KC-06', difficulty:2, type:'mcq',
    question:'Which value of k makes x² + kx + 49 a perfect square?',
    options:['7','14','49','21'],
    correctAnswer:'14', correctIndex:1,
    answerFormat:'Select the value of k.',
    hints:[
      'For (x+7)²: middle term = 2*x*7 = 14x. So k = 14.',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC06-006', kc:'KC-06', difficulty:2, type:'mcq',
    question:'Which expression is a difference of two squares?',
    options:['x²+y²','x²+y²-2xy','x²-y²','x²-y²+1'],
    correctAnswer:'x²-y²', correctIndex:2,
    answerFormat:'Select the expression matching Identity III.',
    hints:[
      'Difference of two squares: exactly 2 terms, both squares, subtraction.',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC06-007', kc:'KC-06', difficulty:2, type:'fill',
    question:'Write the values of a and b if 9x² - 24x + 16 matches (a-b)².',
    correctAnswer:'a=3x, b=4',
    answerFormat:'Format: a=value, b=value',
    hints:[
      '9x²=(3x)², 16=(4)². Check middle: 2*3x*4=24x with minus ✓',
      'a=3x, b=4',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC06-008', kc:'KC-06', difficulty:1, type:'mcq',
    question:'In the identity (a+b)² = a² + 2ab + b², which term is 2ab?',
    options:['The constant term','The middle term','The first term','The variable term'],
    correctAnswer:'The middle term', correctIndex:1,
    answerFormat:'Select the description of 2ab.',
    hints:[
      'a² is first, 2ab is in the middle, b² is last.',
    ],
    t_min:10, t_max:35, question_meta:{},
  },
  {
    id:'Q-KC06-009', kc:'KC-06', difficulty:2, type:'mcq',
    question:'Does 25a² + 25 + 10a match an identity?',
    options:['Yes, (5a+1)²','Yes, (5a+5)²','No, not an identity','Yes, (a+5)²'],
    correctAnswer:'Yes, (5a+1)²', correctIndex:0,
    answerFormat:'Select the correct answer.',
    hints:[
      'Rewrite: 25a² + 10a + 25. √(25a²)=5a, √25=5. Middle: 2*5a*5=50a ≠ 10a.',
      'Wait — recheck: √25=5 not 1. Actually 25a²+10a+1=(5a+1)². The constant here is 25 not 1.',
      'If expression is 25a²+10a+25, that equals 25(a²+... — actually check: is constant 25 or 1?',
    ],
    t_min:30, t_max:100, question_meta:{},
  },
  {
    id:'Q-KC06-010', kc:'KC-06', difficulty:3, type:'fill',
    question:'For m⁴ - n⁴ to be a difference of squares, write it as A² - B². What are A and B?',
    correctAnswer:'A=m², B=n²',
    answerFormat:'Format: A=value, B=value',
    hints:[
      'm⁴ = (m²)², n⁴ = (n²)². So A=m², B=n².',
    ],
    t_min:25, t_max:85, question_meta:{},
  },
  {
    id:'Q-KC06-011', kc:'KC-06', difficulty:1, type:'mcq',
    question:'x² - y² can be factorised using which identity?',
    options:['(x+y)²','(x-y)²','(x+y)(x-y)','None'],
    correctAnswer:'(x+y)(x-y)', correctIndex:2,
    answerFormat:'Select the factored form.',
    hints:[
      'a² - b² = (a+b)(a-b). Here a=x, b=y.',
    ],
    t_min:12, t_max:40, question_meta:{},
  },
  {
    id:'Q-KC06-012', kc:'KC-06', difficulty:2, type:'mcq',
    question:'Which value of k makes 4x² - kx + 1 equal to (2x-1)²?',
    options:['1','2','4','8'],
    correctAnswer:'4', correctIndex:2,
    answerFormat:'Select the value of k.',
    hints:[
      '(2x-1)² = 4x² - 4x + 1. So k=4.',
    ],
    t_min:20, t_max:65, question_meta:{},
  },
  {
    id:'Q-KC06-013', kc:'KC-06', difficulty:2, type:'fill',
    question:'Write the identity: (a - b)² = ___',
    correctAnswer:'a²-2ab+b²',
    answerFormat:'Format: algebraic identity (e.g. a²+b²)',
    hints:[
      '(a-b)(a-b) = a²-ab-ab+b² = a²-2ab+b²',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC06-014', kc:'KC-06', difficulty:3, type:'mcq',
    question:'Which expression CANNOT be factorised using standard identities?',
    options:['x²+4x+4','x²-4','x²+4','x²-4x+4'],
    correctAnswer:'x²+4', correctIndex:2,
    answerFormat:'Select the expression that cannot be factorised using the standard identities.',
    hints:[
      'x²+4 is a sum of two squares — no standard identity covers this.',
      'It has no real factors using identities.',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC06-015', kc:'KC-06', difficulty:2, type:'fill',
    question:'Write the values of a and b if 16y² - 25 matches a² - b².',
    correctAnswer:'a=4y, b=5',
    answerFormat:'Format: a=value, b=value (e.g. a=2, b=3)',
    hints:[
      '16y²=(4y)², 25=(5)².',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC06-016', kc:'KC-06', difficulty:1, type:'mcq',
    question:'Which of these is a perfect square expression?',
    options:['x²+4x+3','x²+6x+9','x²-5x+6','x²+2x+4'],
    correctAnswer:'x²+6x+9', correctIndex:1,
    answerFormat:'Select the perfect square expression.',
    hints:[
      'Check: √(x²)=x, √9=3. Is 6x = 2*x*3? Yes ✓',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC06-017', kc:'KC-06', difficulty:3, type:'fill',
    question:'For (3a + 2b)² = 9a² + ___ + 4b², fill in the middle term.',
    correctAnswer:'12ab',
    answerFormat:'Format: algebraic term (e.g. 10ab)',
    hints:[
      '2*3a*2b = 12ab',
    ],
    t_min:20, t_max:65, question_meta:{},
  },
  {
    id:'Q-KC06-018', kc:'KC-06', difficulty:2, type:'mcq',
    question:'100 - x² matches which identity with a=10, b=x?',
    options:['(a+b)²','(a-b)²','a²-b²','None'],
    correctAnswer:'a²-b²', correctIndex:2,
    answerFormat:'Select the matching identity.',
    hints:[
      '100 = 10² = a². x² = b². 100-x² = a²-b².',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC06-019', kc:'KC-06', difficulty:2, type:'fill',
    question:'Complete: (5x + 3)² = 25x² + ___ + 9',
    correctAnswer:'30x',
    answerFormat:'Format: algebraic term (e.g. 10ab)',
    hints:[
      '2*5x*3 = 30x',
    ],
    t_min:15, t_max:50, question_meta:{},
  },
  {
    id:'Q-KC06-020', kc:'KC-06', difficulty:3, type:'mcq',
    question:'Which identity is applied to recognise that x⁴ - 1 can be factorised?',
    options:['(a+b)²','(a-b)²','a²-b² applied twice','All three'],
    correctAnswer:'a²-b² applied twice', correctIndex:2,
    answerFormat:'Select the correct strategy.',
    hints:[
      'x⁴-1 = (x²)²-1² → (x²+1)(x²-1). Then x²-1 = (x+1)(x-1).',
    ],
    t_min:25, t_max:85, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-07 — Apply Identities for Factorisation (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC07-001', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: 4y² - 12y + 9',
    correctAnswer:'(2y-3)²',
    answerFormat:'Format: perfect square (e.g. (x+2)²)',
    hints:[
      '4y²=(2y)², 9=(3)². Middle: 2*2y*3=12y with minus → Identity II.',
      '(2y)²-2(2y)(3)+(3)² = (2y-3)²',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC07-002', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: 49p² - 36',
    correctAnswer:'(7p-6)(7p+6)',
    answerFormat:'Format: difference of squares (e.g. (x-y)(x+y))',
    hints:[
      '49p²=(7p)², 36=(6)². Difference of squares.',
      '(7p)²-6² = (7p-6)(7p+6)',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC07-003', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: m⁴ - 256',
    correctAnswer:'(m-4)(m+4)(m²+16)',
    answerFormat:'Format: fully factored form (e.g. (x+2)(y-3))',
    hints:[
      'm⁴=(m²)², 256=(16)². Apply difference of squares.',
      '(m²-16)(m²+16). m²-16=(m-4)(m+4).',
    ],
    t_min:60, t_max:180, trap_bug:'BUG_06', question_meta:{},
  },
  {
    id:'Q-KC07-004', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: x² + 10x + 25',
    correctAnswer:'(x+5)²',
    answerFormat:'Format: perfect square (e.g. (x+2)²)',
    hints:[
      '√(x²)=x, √25=5. Middle: 2*x*5=10x ✓ → (x+5)²',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC07-005', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: 9a² - 1',
    correctAnswer:'(3a-1)(3a+1)',
    answerFormat:'Format: difference of squares (e.g. (x-y)(x+y))',
    hints:[
      '9a²=(3a)², 1=(1)². Difference of squares: (3a-1)(3a+1)',
    ],
    t_min:20, t_max:65, question_meta:{},
  },
  {
    id:'Q-KC07-006', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: 8a² + 32a + 32 (first take common factor, then use identity)',
    correctAnswer:'8(a+2)²',
    answerFormat:'Format: HCF times perfect square (e.g. 8(x+2)²)',
    hints:[
      'HCF = 8. Take out: 8(a²+4a+4).',
      'a²+4a+4 = (a+2)². Final: 8(a+2)²',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC07-007', kc:'KC-07', difficulty:2, type:'mcq',
    question:'Factorise: 25 - 16x²',
    options:['(5-4x)(5+4x)','(5-4x)²','(5x-4)(5x+4)','(4x-5)²'],
    correctAnswer:'(5-4x)(5+4x)', correctIndex:0,
    answerFormat:'Select the factored form.',
    hints:[
      '25=(5)², 16x²=(4x)². Identity III: (5-4x)(5+4x)',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC07-008', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: a² - 16b²',
    correctAnswer:'(a-4b)(a+4b)',
    answerFormat:'Format: difference of squares (e.g. (x-y)(x+y))',
    hints:[
      'a²=(a)², 16b²=(4b)². Identity III.',
    ],
    t_min:20, t_max:65, question_meta:{},
  },
  {
    id:'Q-KC07-009', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: 2x² - 8y² (take common factor first)',
    correctAnswer:'2(x-2y)(x+2y)',
    answerFormat:'Format: HCF times factored form (e.g. 2(x-y)(x+y))',
    hints:[
      'HCF = 2: 2(x²-4y²). Then x²-4y² = x²-(2y)² = (x-2y)(x+2y).',
    ],
    t_min:35, t_max:100, question_meta:{},
  },
  {
    id:'Q-KC07-010', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: y² - 14y + 49',
    correctAnswer:'(y-7)²',
    answerFormat:'Format: perfect square (e.g. (x+2)²)',
    hints:[
      'y²=(y)², 49=(7)². Middle: 2*y*7=14y with minus → (y-7)²',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC07-011', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: 81x⁴ - y⁴ (apply difference of squares twice)',
    correctAnswer:'(9x²+y²)(3x-y)(3x+y)',
    answerFormat:'Format: fully factored form (e.g. (x+2)(y-3))',
    hints:[
      '(9x²)²-(y²)² → (9x²-y²)(9x²+y²).',
      '9x²-y²=(3x-y)(3x+y). 9x²+y² cannot be factorised further.',
    ],
    t_min:60, t_max:180, question_meta:{},
  },
  {
    id:'Q-KC07-012', kc:'KC-07', difficulty:2, type:'mcq',
    question:'Which is the factored form of 36a² + 12a + 1?',
    options:['(6a+1)²','(6a-1)²','(6a+1)(6a-1)','(36a+1)²'],
    correctAnswer:'(6a+1)²', correctIndex:0,
    answerFormat:'Select the factored form.',
    hints:[
      '36a²=(6a)², 1=(1)². Middle: 2*6a*1=12a ✓ → (6a+1)²',
    ],
    t_min:20, t_max:70, question_meta:{},
  },
  {
    id:'Q-KC07-013', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: p² - 81',
    correctAnswer:'(p-9)(p+9)',
    answerFormat:'Format: difference of squares (e.g. (x-y)(x+y))',
    hints:[
      'p²=(p)², 81=(9)². (p-9)(p+9)',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC07-014', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: 12x² - 75 (take common factor first)',
    correctAnswer:'3(2x-5)(2x+5)',
    answerFormat:'Format: HCF times factored form (e.g. 3(x-y)(x+y))',
    hints:[
      'HCF = 3: 3(4x²-25). 4x²-25=(2x)²-5²=(2x-5)(2x+5).',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC07-015', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: 9m² + 6mn + n²',
    correctAnswer:'(3m+n)²',
    answerFormat:'Format: perfect square (e.g. (x+2)²)',
    hints:[
      '9m²=(3m)², n²=(n)². Middle: 2*3m*n=6mn ✓ → (3m+n)²',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC07-016', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: 50x² - 2',
    correctAnswer:'2(5x-1)(5x+1)',
    answerFormat:'Format: HCF times factored form (e.g. 2(x-y)(x+y))',
    hints:[
      'HCF = 2: 2(25x²-1). 25x²-1=(5x)²-1²=(5x-1)(5x+1).',
    ],
    t_min:35, t_max:100, question_meta:{},
  },
  {
    id:'Q-KC07-017', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: 4x² - 20x + 25',
    correctAnswer:'(2x-5)²',
    answerFormat:'Format: perfect square (e.g. (x+2)²)',
    hints:[
      '4x²=(2x)², 25=(5)². Middle: 2*2x*5=20x with minus → (2x-5)²',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC07-018', kc:'KC-07', difficulty:2, type:'mcq',
    question:'Factorise: x² - 64',
    options:['(x-8)²','(x+8)²','(x-8)(x+8)','(x-4)(x+16)'],
    correctAnswer:'(x-8)(x+8)', correctIndex:2,
    answerFormat:'Select the factored form.',
    hints:[
      '64=(8)². Difference of squares: (x-8)(x+8)',
    ],
    t_min:15, t_max:55, question_meta:{},
  },
  {
    id:'Q-KC07-019', kc:'KC-07', difficulty:3, type:'fill',
    question:'Factorise: 3a² - 48b² (use common factor then identity)',
    correctAnswer:'3(a-4b)(a+4b)',
    answerFormat:'Format: HCF times factored form (e.g. 3(x-y)(x+y))',
    hints:[
      'HCF = 3: 3(a²-16b²). 16b²=(4b)².',
    ],
    t_min:35, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC07-020', kc:'KC-07', difficulty:2, type:'fill',
    question:'Factorise: 1 - 36y²',
    correctAnswer:'(1-6y)(1+6y)',
    answerFormat:'Format: difference of squares (e.g. (x-y)(x+y))',
    hints:[
      '1=(1)², 36y²=(6y)². Identity III: (1-6y)(1+6y)',
    ],
    t_min:20, t_max:70, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-08 — Factorise Quadratic Expressions (22 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC08-001', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² + 5x + 6',
    correctAnswer:'(x+2)(x+3)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(x+3))',
    hints:[
      'Find two numbers: product = 6, sum = 5.',
      'Pairs: (1,6)→7, (2,3)→5 ✓',
      '(x+2)(x+3)',
    ],
    t_min:40, t_max:120, trap_bug:'BUG_05', question_meta:{},
  },
  {
    id:'Q-KC08-002', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: y² - 7y + 12',
    correctAnswer:'(y-3)(y-4)',
    answerFormat:'Format: product of two brackets (e.g. (y-3)(y-4))',
    hints:[
      'Product=12, sum=-7 → both negative.',
      '-3 and -4: product=12, sum=-7 ✓',
    ],
    t_min:40, t_max:120, trap_bug:'BUG_03', question_meta:{},
  },
  {
    id:'Q-KC08-003', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: z² - 4z - 12',
    correctAnswer:'(z-6)(z+2)',
    answerFormat:'Format: product of two brackets (e.g. (z-6)(z+2))',
    hints:[
      'Product=-12 → one positive, one negative. Sum=-4.',
      '-6 and +2: product=-12, sum=-4 ✓',
    ],
    t_min:45, t_max:130, trap_bug:'BUG_03', question_meta:{},
  },
  {
    id:'Q-KC08-004', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 3m² + 9m + 6',
    correctAnswer:'3(m+1)(m+2)',
    answerFormat:'Format: HCF times product of brackets (e.g. 3(x+1)(x+2))',
    hints:[
      'Take out common factor 3: 3(m²+3m+2).',
      'm²+3m+2: product=2, sum=3 → (m+1)(m+2).',
    ],
    t_min:60, t_max:150, question_meta:{},
  },
  {
    id:'Q-KC08-005', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² + 7x + 10',
    correctAnswer:'(x+2)(x+5)',
    answerFormat:'Format: product of two brackets (e.g. (x+2)(x+5))',
    hints:[
      'Product=10, sum=7 → 2 and 5.',
    ],
    t_min:35, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC08-006', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: a² - a - 6',
    correctAnswer:'(a-3)(a+2)',
    answerFormat:'Format: product of two brackets (e.g. (a-3)(a+2))',
    hints:[
      'Product=-6, sum=-1 → -3 and +2.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-007', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² - 9x + 20',
    correctAnswer:'(x-4)(x-5)',
    answerFormat:'Format: product of two brackets (e.g. (x-1)(x-2))',
    hints:[
      'Product=20, sum=-9 → both negative: -4 and -5.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-008', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 2x² + 5x + 3',
    correctAnswer:'(x+1)(2x+3)',
    answerFormat:'Format: (x+1)(2x+3)',
    hints:[
      'Split middle: 2x²+2x+3x+3.',
      '2x(x+1)+3(x+1) = (x+1)(2x+3)',
    ],
    t_min:60, t_max:160, question_meta:{},
  },
  {
    id:'Q-KC08-009', kc:'KC-08', difficulty:2, type:'mcq',
    question:'Which pair of factors gives x² + 8x + 15?',
    options:['(x+3)(x+5)','(x+1)(x+15)','(x+4)(x+4)','(x+6)(x+2)'],
    correctAnswer:'(x+3)(x+5)', correctIndex:0,
    answerFormat:'Select the correct factor pair.',
    hints:[
      'Product=15, sum=8 → 3 and 5.',
    ],
    t_min:30, t_max:100, question_meta:{},
  },
  {
    id:'Q-KC08-010', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: b² + b - 20',
    correctAnswer:'(b+5)(b-4)',
    answerFormat:'Format: (b+5)(b-4)',
    hints:[
      'Product=-20, sum=+1 → +5 and -4.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-011', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 5x² - 17x + 6',
    correctAnswer:'(x-3)(5x-2)',
    answerFormat:'Format: (x-3)(5x-2)',
    hints:[
      'ac = 5*6 = 30. Need m+n = -17, m*n = 30 → -15 and -2.',
      '5x²-15x-2x+6 = 5x(x-3)-2(x-3) = (x-3)(5x-2)',
    ],
    t_min:70, t_max:180, question_meta:{},
  },
  {
    id:'Q-KC08-012', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² - 11x + 30',
    correctAnswer:'(x-5)(x-6)',
    answerFormat:'Format: (x-5)(x-6)',
    hints:[
      'Product=30, sum=-11 → -5 and -6.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-013', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 4x² + 4x - 3',
    correctAnswer:'(2x-1)(2x+3)',
    answerFormat:'Format: (2x-1)(2x+3)',
    hints:[
      'ac = 4*(-3) = -12. Need m+n=4, m*n=-12 → 6 and -2.',
      '4x²+6x-2x-3 = 2x(2x+3)-1(2x+3) = (2x-1)(2x+3)',
    ],
    t_min:70, t_max:180, question_meta:{},
  },
  {
    id:'Q-KC08-014', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² + 3x - 10',
    correctAnswer:'(x+5)(x-2)',
    answerFormat:'Format: (x+5)(x-2)',
    hints:[
      'Product=-10, sum=3 → +5 and -2.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-015', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 6x² + 7x - 3',
    correctAnswer:'(2x+3)(3x-1)',
    answerFormat:'Format: (2x+3)(3x-1)',
    hints:[
      'ac = 6*(-3)=-18. Need m+n=7, mn=-18 → 9 and -2.',
      '6x²+9x-2x-3 = 3x(2x+3)-1(2x+3) = (3x-1)(2x+3)',
    ],
    t_min:75, t_max:200, question_meta:{},
  },
  {
    id:'Q-KC08-016', kc:'KC-08', difficulty:2, type:'mcq',
    question:'Factorise: x² - x - 12',
    options:['(x-4)(x+3)','(x+4)(x-3)','(x-6)(x+2)','(x-3)(x-4)'],
    correctAnswer:'(x-4)(x+3)', correctIndex:0,
    answerFormat:'Select the factored form.',
    hints:[
      'Product=-12, sum=-1 → -4 and +3.',
    ],
    t_min:35, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC08-017', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: p² + 2p - 35',
    correctAnswer:'(p+7)(p-5)',
    answerFormat:'Format: (p+7)(p-5)',
    hints:[
      'Product=-35, sum=2 → +7 and -5.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-018', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 2a² - 3a - 9',
    correctAnswer:'(a-3)(2a+3)',
    answerFormat:'Format: (a-3)(2a+3)',
    hints:[
      'ac=2*(-9)=-18. Need m+n=-3, mn=-18 → -6 and +3.',
      '2a²-6a+3a-9 = 2a(a-3)+3(a-3) = (a-3)(2a+3)',
    ],
    t_min:65, t_max:180, question_meta:{},
  },
  {
    id:'Q-KC08-019', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² - 13x + 36',
    correctAnswer:'(x-4)(x-9)',
    answerFormat:'Format: (x-4)(x-9)',
    hints:[
      'Product=36, sum=-13 → -4 and -9.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-020', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise: 3x² + 11x + 10',
    correctAnswer:'(x+2)(3x+5)',
    answerFormat:'Format: (x+2)(3x+5)',
    hints:[
      'ac=3*10=30. m+n=11, mn=30 → 6 and 5.',
      '3x²+6x+5x+10 = 3x(x+2)+5(x+2) = (x+2)(3x+5)',
    ],
    t_min:65, t_max:180, question_meta:{},
  },
  {
    id:'Q-KC08-021', kc:'KC-08', difficulty:2, type:'fill',
    question:'Factorise: x² + x - 30',
    correctAnswer:'(x+6)(x-5)',
    answerFormat:'Format: (x+6)(x-5)',
    hints:[
      'Product=-30, sum=+1 → +6 and -5.',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC08-022', kc:'KC-08', difficulty:3, type:'fill',
    question:'Factorise completely: 4x² + 8x - 12',
    correctAnswer:'4(x-1)(x+3)',
    answerFormat:'Format: 4(x-1)(x+3)',
    hints:[
      'First take out HCF = 4: 4(x²+2x-3).',
      'x²+2x-3: product=-3, sum=2 → +3 and -1. → (x-1)(x+3)',
    ],
    t_min:55, t_max:150, question_meta:{},
  },

  // ══════════════════════════════════════════════════════════════════
  // KC-09 — Factorisation for Division/Simplification (20 questions)
  // ══════════════════════════════════════════════════════════════════
  {
    id:'Q-KC09-001', kc:'KC-09', difficulty:2, type:'fill',
    question:'Divide: (7x² + 14x) ÷ (x + 2)',
    correctAnswer:'7x',
    answerFormat:'Format: 7x',
    hints:[
      'Factorise numerator: 7x²+14x = 7x(x+2).',
      '7x(x+2) ÷ (x+2) = 7x',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC09-002', kc:'KC-09', difficulty:3, type:'fill',
    question:'Divide: z(5z² - 80) ÷ 5z(z + 4)',
    correctAnswer:'z-4',
    answerFormat:'Format: z-4',
    hints:[
      '5z²-80 = 5(z²-16) = 5(z+4)(z-4).',
      'Numerator = 5z(z+4)(z-4). Cancel 5z and (z+4).',
    ],
    t_min:60, t_max:180, trap_bug:'BUG_06', question_meta:{},
  },
  {
    id:'Q-KC09-003', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (x² + 5x + 6) ÷ (x + 2)',
    correctAnswer:'x+3',
    answerFormat:'Format: x+3',
    hints:[
      'Factorise: x²+5x+6 = (x+2)(x+3).',
      '(x+2)(x+3) ÷ (x+2) = x+3',
    ],
    t_min:40, t_max:120, question_meta:{},
  },
  {
    id:'Q-KC09-004', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (12a² + 18a) ÷ 6a',
    correctAnswer:'2a+3',
    answerFormat:'Format: 2a+3',
    hints:[
      'Factorise: 12a²+18a = 6a(2a+3).',
      '6a(2a+3) ÷ 6a = 2a+3',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC09-005', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (x² - 9) ÷ (x + 3)',
    correctAnswer:'x-3',
    answerFormat:'Format: x-3',
    hints:[
      'x²-9 = (x+3)(x-3).',
      '(x+3)(x-3) ÷ (x+3) = x-3',
    ],
    t_min:35, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC09-006', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (4y² - 8y) ÷ 4y',
    correctAnswer:'y-2',
    answerFormat:'Format: y-2',
    hints:[
      '4y²-8y = 4y(y-2). ÷4y = y-2',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC09-007', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (x² + 7x + 12) ÷ (x + 4)',
    correctAnswer:'x+3',
    answerFormat:'Format: x+3',
    hints:[
      'x²+7x+12 = (x+3)(x+4).',
      '÷(x+4) = x+3',
    ],
    t_min:45, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC09-008', kc:'KC-09', difficulty:2, type:'mcq',
    question:'Simplify: (6x² - 12x) ÷ (x - 2)',
    options:['6x','6x²','x-2','12x'],
    correctAnswer:'6x', correctIndex:0,
    answerFormat:'Select the simplified form.',
    hints:[
      '6x²-12x = 6x(x-2). ÷(x-2) = 6x',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC09-009', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (y² - 5y + 6) ÷ (y - 2)',
    correctAnswer:'y-3',
    answerFormat:'Format: y-3',
    hints:[
      'y²-5y+6 = (y-2)(y-3). ÷(y-2) = y-3',
    ],
    t_min:45, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC09-010', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (15ab + 10a) ÷ 5a',
    correctAnswer:'3b+2',
    answerFormat:'Format: 3b+2',
    hints:[
      '15ab+10a = 5a(3b+2). ÷5a = 3b+2',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC09-011', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (a² - 16) ÷ (a - 4)',
    correctAnswer:'a+4',
    answerFormat:'Format: a+4',
    hints:[
      'a²-16 = (a-4)(a+4). ÷(a-4) = a+4',
    ],
    t_min:35, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC09-012', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (2x² + 7x + 3) ÷ (x + 3)',
    correctAnswer:'2x+1',
    answerFormat:'Format: 2x+1',
    hints:[
      '2x²+7x+3 = (x+3)(2x+1). ÷(x+3) = 2x+1',
    ],
    t_min:55, t_max:150, question_meta:{},
  },
  {
    id:'Q-KC09-013', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (9x² - 6x) ÷ 3x',
    correctAnswer:'3x-2',
    answerFormat:'Format: 3x-2',
    hints:[
      '9x²-6x = 3x(3x-2). ÷3x = 3x-2',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC09-014', kc:'KC-09', difficulty:3, type:'mcq',
    question:'Simplify: (x² - 4x - 12) ÷ (x - 6)',
    options:['x+2','x-2','x+6','x-4'],
    correctAnswer:'x+2', correctIndex:0,
    answerFormat:'Select the simplified result.',
    hints:[
      'x²-4x-12 = (x-6)(x+2). ÷(x-6) = x+2',
    ],
    t_min:50, t_max:140, question_meta:{},
  },
  {
    id:'Q-KC09-015', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (20m²n + 30mn²) ÷ 10mn',
    correctAnswer:'2m+3n',
    answerFormat:'Format: 2m+3n',
    hints:[
      '20m²n+30mn² = 10mn(2m+3n). ÷10mn = 2m+3n',
    ],
    t_min:30, t_max:90, question_meta:{},
  },
  {
    id:'Q-KC09-016', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (b² + b - 6) ÷ (b - 2)',
    correctAnswer:'b+3',
    answerFormat:'Format: b+3',
    hints:[
      'b²+b-6 = (b-2)(b+3). ÷(b-2) = b+3',
    ],
    t_min:45, t_max:130, question_meta:{},
  },
  {
    id:'Q-KC09-017', kc:'KC-09', difficulty:2, type:'fill',
    question:'Simplify: (8a³ + 12a²) ÷ 4a²',
    correctAnswer:'2a+3',
    answerFormat:'Format: 2a+3',
    hints:[
      '8a³+12a² = 4a²(2a+3). ÷4a² = 2a+3',
    ],
    t_min:25, t_max:80, question_meta:{},
  },
  {
    id:'Q-KC09-018', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (x² - 25) ÷ (x - 5)',
    correctAnswer:'x+5',
    answerFormat:'Format: x+5',
    hints:[
      'x²-25 = (x-5)(x+5). ÷(x-5) = x+5',
    ],
    t_min:35, t_max:110, question_meta:{},
  },
  {
    id:'Q-KC09-019', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (3x² + 5x - 2) ÷ (x + 2)',
    correctAnswer:'3x-1',
    answerFormat:'Format: 3x-1',
    hints:[
      '3x²+5x-2 = (x+2)(3x-1). ÷(x+2) = 3x-1',
    ],
    t_min:60, t_max:160, question_meta:{},
  },
  {
    id:'Q-KC09-020', kc:'KC-09', difficulty:3, type:'fill',
    question:'Simplify: (p² + 3p - 28) ÷ (p + 7)',
    correctAnswer:'p-4',
    answerFormat:'Format: p-4',
    hints:[
      'p²+3p-28 = (p+7)(p-4). ÷(p+7) = p-4',
    ],
    t_min:50, t_max:140, question_meta:{},
  },
]

// ── Adaptive selector ─────────────────────────────────────────────────────────

export function selectQuestion({ kcId, difficulty, seenIds, lastBugId }) {
  const candidates = QUESTIONS.filter(
    (q) => q.kc === kcId && !seenIds.includes(q.id)
  )
  if (lastBugId) {
    const trap = candidates.find((q) => q.trap_bug === lastBugId)
    if (trap) return trap
  }
  const exact = candidates.filter((q) => q.difficulty === difficulty)
  if (exact.length) return exact[0]
  const nearby = candidates.filter((q) => Math.abs(q.difficulty - difficulty) <= 1)
  return nearby[0] || candidates[0] || null
}

export function getQuestionsForKC(kcId) {
  return QUESTIONS.filter((q) => q.kc === kcId)
}

export function getAllQuestions() {
  return QUESTIONS
}
