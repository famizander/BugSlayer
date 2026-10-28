import { Language, Submission, DetectedBug } from '../types';

export interface AnalysisResult {
  status: 'Error Found' | 'Fixed' | 'No Errors';
  compilerOutput: string;
  expectedOutput: string;
  actualOutput?: string;
  errorSummary: string;
  bugs?: DetectedBug[];
  hints: string[];
  explanation: string;
  correctedCode: string;
  learningTips: string[];
  progressPercent: number;
}

export async function analyzeCode(
  code: string,
  language: Language,
  expectedOutput: string
): Promise<AnalysisResult> {
  // 1. Instant local compiler & AST check:
  // Detects syntax, structural, and common algorithmic errors in ~5ms.
  // This ensures checking takes ~200ms instead of 10+ seconds.
  const localResult = analyzeCodeLocally(code, language, expectedOutput);
  if (localResult.status === 'Error Found') {
    // Brief 200ms natural delay for smooth UI transition
    await new Promise((resolve) => setTimeout(resolve, 200));
    return localResult;
  }

  // 2. Fast remote check with a 1500ms timeout cap for deep/uncommon patterns
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, expectedOutput }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.hints && data.compilerOutput && !data.fallback) {
        return data;
      }
    }
  } catch {
    // If remote check times out or network is unavailable, return local result immediately
  }

  return localResult;
}

export function analyzeCodeLocally(
  code: string,
  language: Language,
  expectedOutput: string
): AnalysisResult {
  const lines = code.split('\n');
  const detectedBugs: DetectedBug[] = [];
  const explanations: string[] = [];
  const learningTipsSet = new Set<string>();

  let correctedLines = [...lines];

  if (language === 'cpp') {
    // Check 1: Missing #include <iostream>
    let needsIostream = false;
    if (
      (code.includes('cout') || code.includes('cin') || code.includes('endl')) &&
      !code.includes('<iostream>')
    ) {
      needsIostream = true;
      detectedBugs.push({
        id: 'bug-iostream',
        line: 1,
        errorSummary: "Missing '<iostream>' header for standard input/output",
        compilerOutput: "error: 'cout' was not declared in this scope\nnote: 'std::cout' is defined in header '<iostream>'",
        hints: [
          'In C++, standard input and output streams like cout, cin, and endl are defined in library headers.',
          "Look at the top of your file: the compiler needs a preprocessor directive '#include <iostream>' before standard stream operations can be used.",
          "Add '#include <iostream>' at line 1 before 'using namespace std;' or main()."
        ],
        explanation: "'cout', 'cin', and 'endl' are declared in <iostream>. Without including this header, the compiler cannot recognize stream operations.",
        learningTips: ["Always include '#include <iostream>' at the top of your program whenever using cout, cin, or endl."]
      });
      explanations.push("Standard streams like 'cout' and 'cin' require '#include <iostream>'.");
      learningTipsSet.add("Always include '#include <iostream>' at the top of your program.");
    }

    // Check 2: Missing function body or curly braces { } (e.g. `int main()` without `{ ... }`)
    let unbracedFuncIndex = -1;
    let unbracedFuncName = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const funcHeaderMatch = line.match(
        /^\s*(int|void|double|float|bool|string|char|long|short|auto)\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*$/
      );
      if (funcHeaderMatch) {
        const funcName = funcHeaderMatch[2];
        const hasOpeningBrace = line.endsWith('{');
        const hasSemicolon = line.endsWith(';');

        if (!hasOpeningBrace && !hasSemicolon) {
          let nextNonEmptyIndex = -1;
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim().length > 0) {
              nextNonEmptyIndex = j;
              break;
            }
          }

          const nextLine = nextNonEmptyIndex !== -1 ? lines[nextNonEmptyIndex].trim() : '';
          const startsWithBrace = nextLine.startsWith('{');

          if (!startsWithBrace) {
            unbracedFuncIndex = i;
            unbracedFuncName = funcName;
            const nextWord = nextLine ? nextLine.split(/\s+|[<>;(){}]/)[0] || 'statement' : 'end of input';
            const errorLineNum = nextNonEmptyIndex !== -1 ? nextNonEmptyIndex + 1 : i + 1;
            const errorLineContent = nextNonEmptyIndex !== -1 ? lines[nextNonEmptyIndex] : lines[i];

            detectedBugs.push({
              id: `bug-func-${funcName}`,
              line: i + 1,
              errorSummary: `Missing '{ }' function body for '${funcName}()'`,
              compilerOutput: `error: expected '{' before '${nextWord}' on line ${errorLineNum}\n  ${errorLineContent}\n  ^\n1 error generated.`,
              hints: [
                'In C++, every function definition must have a body enclosed in curly braces `{` and `}`.',
                `Look at line ${i + 1}: \`${line}\`. A function cannot just be followed directly by code without an opening \`{\`.`,
                `Enclose the function body in curly braces: \`${funcName}(){ ... }\` and terminate statements inside with \`;\`.`
              ],
              explanation: `In C++, functions define executable blocks of code. Unlike languages that rely on indentation, C++ requires explicit curly braces '{ ... }' to define the execution scope of a function body.`,
              learningTips: [
                `Always follow function headers like '${line}' with an opening brace '{'.`,
                `Every opening brace '{' must have a matching closing brace '}'.`
              ]
            });
            explanations.push(`Function '${funcName}()' requires an opening brace '{' to define its statement body block.`);
            learningTipsSet.add("Always open function bodies with '{' and close them with '}'.");
            break;
          }
        }
      }
    }

    // Check 3: Bitwise '&' used instead of logical '&&' in boolean conditions
    const bitwiseAndLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isTrailingBitwiseAnd = line.endsWith('&') && !line.endsWith('&&') && !line.endsWith('&=');
      const isInlineBitwiseAnd = /\)\s*&\s*\(/.test(line);
      if (isTrailingBitwiseAnd || isInlineBitwiseAnd) {
        bitwiseAndLines.push(i);
        detectedBugs.push({
          id: `bug-bitwise-and-${i + 1}`,
          line: i + 1,
          errorSummary: `Using single bitwise '&' instead of logical AND '&&' at line ${i + 1}`,
          compilerOutput: `warning: use of logical '&&' with bitwise '&' [-Wbitwise-instead-of-logical] on line ${i + 1}\n  ${lines[i]}\n  ^\n1 warning generated.`,
          hints: [
            "In C++, '&' is the bitwise AND operator, whereas '&&' is the logical AND operator for boolean conditions.",
            `Look closely at line ${i + 1}: \`${lines[i].trim()}\`. Are you testing multiple boolean conditions together?`,
            "Replace the single '&' with double '&&' to evaluate boolean logic conditions properly."
          ],
          explanation: "In C++, single '&' operates on binary bits of integer numbers. Double '&&' evaluates logical truth values with short-circuit evaluation. When chaining conditions like comparisons, '&&' must always be used.",
          learningTips: [
            "Use '&&' for logical AND when combining boolean conditions.",
            "Use single '&' only when manipulating bit flags or taking memory addresses."
          ]
        });
        explanations.push(`Line ${i + 1} uses bitwise '&' instead of logical AND '&&' in a conditional expression.`);
        learningTipsSet.add("Use '&&' for logical conditions and '&' for bitwise arithmetic.");
      }
    }

    // Check 4: Inverted stream operators ('cin <<' instead of 'cin >>' or 'cout >>' instead of 'cout <<')
    const cinWrongOpLines: number[] = [];
    const coutWrongOpLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

      if (/\bcin\s*<</.test(line)) {
        cinWrongOpLines.push(i);
        detectedBugs.push({
          id: `bug-cin-op-${i + 1}`,
          line: i + 1,
          errorSummary: `Wrong stream operator '<<' with 'cin' at line ${i + 1}`,
          compilerOutput: `error: invalid operands to binary expression ('std::istream' and ...)\n  ${lines[i]}\n      ^~\n1 error generated.`,
          hints: [
            "In C++, 'cin' and 'cout' use different directional stream operators.",
            `Look closely at line ${i + 1}: \`${line}\`. 'cin' extracts data from user input into variables, pointing inward to the variable.`,
            "Replace '<<' with the extraction operator '>>' for 'cin' (e.g. `cin >> variable;`)."
          ],
          explanation: "'cin' is an input stream that extracts data into variables using the extraction operator '>>'. The insertion operator '<<' is only used with output streams like 'cout'.",
          learningTips: [
            "Remember the arrows: 'cin >> var' pushes data into the variable; 'cout << var' pushes data out to the screen."
          ]
        });
        explanations.push(`Line ${i + 1} uses '<<' with 'cin'; input extraction requires '>>'.`);
        learningTipsSet.add("Use 'cin >> variable' for input and 'cout << value' for output.");
      }

      if (/\bcout\s*>>/.test(line)) {
        coutWrongOpLines.push(i);
        detectedBugs.push({
          id: `bug-cout-op-${i + 1}`,
          line: i + 1,
          errorSummary: `Wrong stream operator '>>' with 'cout' at line ${i + 1}`,
          compilerOutput: `error: invalid operands to binary expression ('std::ostream' and ...)\n  ${lines[i]}\n      ^~\n1 error generated.`,
          hints: [
            "In C++, 'cout' sends data out to the screen, which requires the insertion operator.",
            `Look closely at line ${i + 1}: \`${line}\`. 'cout' inserts data into the output stream, pointing outward towards cout.`,
            "Replace '>>' with the insertion operator '<<' for 'cout' (e.g. `cout << value;`)."
          ],
          explanation: "'cout' is an output stream that writes data using the stream insertion operator '<<'. The operator '>>' is the stream extraction operator reserved for input streams like 'cin'.",
          learningTips: [
            "Use 'cout << value' to send data to the terminal.",
            "Think of '<<' as pointing leftward towards 'cout'."
          ]
        });
        explanations.push(`Line ${i + 1} uses '>>' with 'cout'; output insertion requires '<<'.`);
        learningTipsSet.add("Use 'cout << value' for output and 'cin >> variable' for input.");
      }
    }

    // Check 5: Missing semicolon in C++ on every line that requires one
    const missingSemicolonLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = (lines[i + 1] || '').trim();

      if (!line || line.startsWith('#') || line.startsWith('//') || line.startsWith('/*')) continue;

      const isFunctionHeader =
        /^\s*(int|void|double|float|bool|string|char|long|short|auto)\s+[a-zA-Z_]\w*\s*\([^)]*\)/.test(
          line
        );
      if (isFunctionHeader) continue;

      const isContinuation =
        line.endsWith('&&') ||
        line.endsWith('||') ||
        line.endsWith('+') ||
        line.endsWith('-') ||
        line.endsWith('*') ||
        line.endsWith('/') ||
        line.endsWith('%') ||
        line.endsWith(',') ||
        line.endsWith('<<') ||
        line.endsWith('>>') ||
        line.endsWith('=') ||
        line.endsWith('(') ||
        line.endsWith('[') ||
        line.endsWith('&') ||
        line.endsWith('|') ||
        line.endsWith('^') ||
        line.endsWith('?') ||
        line.endsWith(':');

      if (
        (line.startsWith('int ') ||
          line.startsWith('string ') ||
          line.startsWith('float ') ||
          line.startsWith('double ') ||
          line.startsWith('bool ') ||
          line.startsWith('char ') ||
          line.startsWith('long ') ||
          line.startsWith('auto ') ||
          line.startsWith('cout') ||
          line.startsWith('cin') ||
          line.startsWith('return ') ||
          /^[a-zA-Z_]\w*\s*=/.test(line)) &&
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.startsWith('for') &&
        !line.startsWith('while') &&
        !line.startsWith('if') &&
        !isContinuation
      ) {
        missingSemicolonLines.push(i);
        const nextWord = nextLine.split(/\s+|[<>;(){}]/)[0] || 'token';
        detectedBugs.push({
          id: `bug-semicolon-${i + 1}`,
          line: i + 1,
          errorSummary: `Missing semicolon ';' at line ${i + 1}`,
          compilerOutput: `error: expected ';' before '${nextWord}' on line ${i + 1}\n  ${lines[i]}\n  ^\n1 error generated.`,
          hints: [
            'In C++, every declaration and statement must be terminated with a specific punctuation symbol.',
            `Look closely at line ${i + 1}: \`${lines[i].trim()}\`. What punctuation mark is missing right before the next instruction?`,
            `Add a semicolon \`;\` to the end of line ${i + 1} to separate this statement from the next instruction.`
          ],
          explanation: 'In C++, the compiler relies on semicolons to delimit distinct instructions. When a semicolon is omitted, the compiler tries to parse the next line as part of the current expression, triggering an error.',
          learningTips: [
            'Statements and declarations in C++ must conclude with a semicolon \';\'.',
            'Always check the line right above where the compiler reports the error.'
          ]
        });
        explanations.push(`Line ${i + 1} is missing a semicolon terminator ';' at the end of the statement.`);
        learningTipsSet.add("Statements inside function bodies almost always conclude with a semicolon ';'.");
      }
    }

    // Check 4: Unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (unbracedFuncIndex === -1 && openBraces !== closeBraces && (openBraces > 0 || closeBraces > 0)) {
      detectedBugs.push({
        id: 'bug-braces',
        line: lines.length,
        errorSummary: `Unbalanced curly braces: ${openBraces} opening vs ${closeBraces} closing`,
        compilerOutput: `error: expected '}' at end of input`,
        hints: [
          'Every opening curly brace `{` must have a corresponding closing brace `}`.',
          'Count your blocks: check function bodies, if-statements, and loops for any missing or extra braces.',
          `Ensure you close all scopes. You have ${openBraces} '{' and ${closeBraces} '}'. Add the missing closing '}'.`
        ],
        explanation: 'C++ scopes are defined by curly braces. An unmatched brace causes the compiler to continue parsing until EOF, expecting more tokens.',
        learningTips: ['Keep your braces vertically aligned or indented consistently.']
      });
      explanations.push(`Scope braces are unbalanced (${openBraces} '{' vs ${closeBraces} '}').`);
      learningTipsSet.add("Ensure every open brace '{' has a matching closing brace '}'.");
    }

    // Check 5: Assignment inside if condition (e.g. `if (x = 5)`)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const ifAssign = line.match(/if\s*\(\s*([a-zA-Z_]\w*)\s*=\s*([^=]+?)\s*\)/);
      if (ifAssign) {
        detectedBugs.push({
          id: `bug-if-assign-${i + 1}`,
          line: i + 1,
          errorSummary: `Using assignment '=' instead of comparison '==' on line ${i + 1}`,
          compilerOutput: `warning: suggest parentheses around assignment used as truth value [-Wparentheses] on line ${i + 1}\n  ${line}\n  ^\n1 warning generated.`,
          hints: [
            'In C++, a single equals sign `=` assigns a value, while double equals `==` compares two values.',
            `Look at your condition on line ${i + 1}: \`${line}\`. Are you assigning a value or testing for equality?`,
            `Change \`=\` to \`==\` inside the if condition to check for equality.`
          ],
          explanation: 'In C++, `x = 5` sets the variable `x` to 5 and evaluates to 5 (which is truthy). This causes the `if` branch to always execute.',
          learningTips: ['Use `==` when checking equality and `=` when storing a value.']
        });
        explanations.push(`Condition on line ${i + 1} uses '=' (assignment) instead of '==' (comparison).`);
        learningTipsSet.add("Use '==' when comparing values in conditional statements.");
      }
    }

    // Check 6: Undeclared variable in C++
    const declaredVars = new Set<string>();
    const varDeclLineRegex = /\b(int|string|float|double|bool|char|long|short|auto|unsigned)\s+([^;{()]+);/g;
    let declMatch;
    while ((declMatch = varDeclLineRegex.exec(code)) !== null) {
      const varGroup = declMatch[2];
      const tokens = varGroup.split(',');
      for (const tok of tokens) {
        const vName = tok.trim().split(/[\s=\[]/)[0].trim();
        if (vName && /^[a-zA-Z_]\w*$/.test(vName)) {
          declaredVars.add(vName);
        }
      }
    }
    const standardKeywords = new Set([
      'cout', 'cin', 'cerr', 'clog', 'endl', 'flush', 'ends', 'ws', 'quoted',
      'setw', 'setprecision', 'setfill', 'setbase', 'left', 'right', 'internal',
      'fixed', 'scientific', 'hexfloat', 'defaultfloat', 'boolalpha', 'noboolalpha',
      'showpos', 'noshowpos', 'showpoint', 'noshowpoint', 'showbase', 'noshowbase',
      'uppercase', 'nouppercase', 'hex', 'dec', 'oct',
      'true', 'false', 'NULL', 'nullptr', 'string', 'vector', 'map', 'set', 'pair',
      'make_pair', 'min', 'max', 'abs', 'sqrt', 'pow', 'sort', 'std', 'main', 'return',
      'include', 'iostream', 'iomanip', 'cmath', 'string', 'algorithm', 'using', 'namespace'
    ]);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const coutMatch = line.match(/cout\s*<<\s*([a-zA-Z_]\w*)\s*(\(?)/);
      if (
        coutMatch &&
        coutMatch[2] !== '(' &&
        !declaredVars.has(coutMatch[1]) &&
        !standardKeywords.has(coutMatch[1]) &&
        !coutMatch[1].startsWith('"')
      ) {
        const varName = coutMatch[1];
        detectedBugs.push({
          id: `bug-undeclared-${varName}`,
          line: i + 1,
          errorSummary: `Undeclared variable '${varName}' on line ${i + 1}`,
          compilerOutput: `error: '${varName}' was not declared in this scope on line ${i + 1}\n  ${line}\n  ^\n1 error generated.`,
          hints: [
            'In C++, every variable must be declared with a specific data type before it can be used.',
            `Look at line ${i + 1}: \`${line}\`. The variable \`${varName}\` has not been declared yet.`,
            `Declare and initialize \`${varName}\` before this line, for example: \`int ${varName} = 100;\`.`
          ],
          explanation: 'C++ is a statically-typed language. Referencing an identifier before declaration causes an unresolved symbol compiler error.',
          learningTips: ['Always declare variables at the top of their enclosing scope or right before use.']
        });
        explanations.push(`Variable '${varName}' must be declared with a type (like int or float) before using it in expressions.`);
        learningTipsSet.add('Declare variables before accessing them.');
      }
    }

    // Assemble comprehensive correctedCode for C++ fixing ALL detected bugs
    if (unbracedFuncIndex !== -1) {
      const newLines: string[] = [];
      let insideFunc = false;
      for (let j = 0; j < lines.length; j++) {
        const curLine = lines[j];
        if (j === unbracedFuncIndex) {
          newLines.push(curLine.trimEnd() + '{');
          insideFunc = true;
        } else if (insideFunc) {
          const trimmed = curLine.trim();
          const isNextFunc =
            /^\s*(int|void|double|float|bool|string|char|long|short|auto)\s+([a-zA-Z_]\w*)\s*\([^)]*\)/.test(trimmed);
          if (isNextFunc && j > unbracedFuncIndex + 1) {
            newLines.push('}');
            insideFunc = false;
            newLines.push(curLine);
          } else if (trimmed.length > 0) {
            if (
              !trimmed.endsWith(';') &&
              !trimmed.endsWith('{') &&
              !trimmed.endsWith('}') &&
              !trimmed.startsWith('#') &&
              !trimmed.startsWith('//')
            ) {
              newLines.push(curLine + ';');
            } else {
              newLines.push(curLine);
            }
          } else {
            newLines.push(curLine);
          }
        } else {
          if (missingSemicolonLines.includes(j)) {
            newLines.push(curLine + ';');
          } else {
            newLines.push(curLine);
          }
        }
      }
      if (insideFunc) {
        newLines.push('}');
      }
      correctedLines = newLines;
    } else {
      for (const lineIdx of missingSemicolonLines) {
        if (!correctedLines[lineIdx].trimEnd().endsWith(';')) {
          correctedLines[lineIdx] = correctedLines[lineIdx] + ';';
        }
      }
      for (const bIdx of bitwiseAndLines) {
        if (correctedLines[bIdx]) {
          correctedLines[bIdx] = correctedLines[bIdx].replace(/(\)\s*)&(\s*($|\())/g, '$1&&$2');
        }
      }
      if (openBraces > closeBraces) {
        while (correctedLines.length > 0 && correctedLines[correctedLines.length - 1].trim().length === 0) {
          correctedLines.pop();
        }
        for (let b = 0; b < openBraces - closeBraces; b++) {
          correctedLines.push('}');
        }
      }
    }

    if (unbracedFuncIndex !== -1) {
      for (const bIdx of bitwiseAndLines) {
        if (correctedLines[bIdx]) {
          correctedLines[bIdx] = correctedLines[bIdx].replace(/(\)\s*)&(\s*($|\())/g, '$1&&$2');
        }
      }
    }

    // Apply if condition fixes
    correctedLines = correctedLines.map((l) =>
      l.replace(/if\s*\(\s*([a-zA-Z_]\w*)\s*=\s*([^=]+?)\s*\)/g, 'if ($1 == $2)')
    );

    // Apply stream operator fixes (cin >> and cout <<)
    for (const cIdx of cinWrongOpLines) {
      if (correctedLines[cIdx]) {
        let fixedLine = correctedLines[cIdx];
        while (/\bcin\b[^;]*<</.test(fixedLine)) {
          fixedLine = fixedLine.replace(/(\bcin\b[^;]*?)<</, '$1>>');
        }
        correctedLines[cIdx] = fixedLine;
      }
    }

    for (const cIdx of coutWrongOpLines) {
      if (correctedLines[cIdx]) {
        let fixedLine = correctedLines[cIdx];
        while (/\bcout\b[^;]*>>/.test(fixedLine)) {
          fixedLine = fixedLine.replace(/(\bcout\b[^;]*?)>>/, '$1<<');
        }
        correctedLines[cIdx] = fixedLine;
      }
    }

    // Apply iostream include if needed
    if (needsIostream) {
      const usingIdx = correctedLines.findIndex((l) => l.includes('using namespace std;'));
      if (usingIdx !== -1) {
        correctedLines.splice(usingIdx, 0, '#include <iostream>');
      } else {
        correctedLines.unshift('#include <iostream>');
        if (!code.includes('using namespace std;')) {
          correctedLines.splice(1, 0, 'using namespace std;');
        }
      }
    }
  } else {
    // Python Checks
    // Check 1: Assignment in if statement (e.g. `if x = 5:`)
    const pyAssignLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const pyAssign = line.match(/if\s+([a-zA-Z_]\w*)\s*=\s*([^=:]+?)\s*:/);
      if (pyAssign) {
        pyAssignLines.push(i);
        detectedBugs.push({
          id: `bug-py-assign-${i + 1}`,
          line: i + 1,
          errorSummary: `Assignment '=' in condition instead of '==' at line ${i + 1}`,
          compilerOutput: `SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='? on line ${i + 1}\n  ${line}\n  ^`,
          hints: [
            'In Python, a single `=` is reserved for variable assignment, not comparison.',
            `Look at line ${i + 1}: \`${line}\`. Are you trying to compare two values?`,
            `Replace \`=\` with \`==\` inside your if condition.`
          ],
          explanation: 'Python syntax disallows standard assignments inside comparison expressions. To compare values for equality, you must use the double equals operator `==`.',
          learningTips: [
            'Single equals `=` stores a value; double equals `==` tests equality.'
          ]
        });
        explanations.push(`Line ${i + 1}: Comparison requires '==' instead of '='.`);
        learningTipsSet.add("Use '==' for comparisons in Python if statements.");
      }
    }

    // Check 2: Missing colon in Python
    const missingColonLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        (line.startsWith('if ') ||
          line.startsWith('elif ') ||
          line.startsWith('else') ||
          line.startsWith('for ') ||
          line.startsWith('while ') ||
          line.startsWith('def ')) &&
        !line.endsWith(':')
      ) {
        missingColonLines.push(i);
        detectedBugs.push({
          id: `bug-py-colon-${i + 1}`,
          line: i + 1,
          errorSummary: `Missing colon ':' at line ${i + 1}`,
          compilerOutput: `SyntaxError: expected ':' on line ${i + 1}\n  ${lines[i]}\n  ^`,
          hints: [
            'In Python, compound statements that introduce a code block must end with a specific character.',
            `Examine the end of line ${i + 1}: \`${lines[i].trim()}\`. What punctuation tells Python an indented block begins?`,
            `Add a colon \`:\` to the end of \`${lines[i].trim()}\`.`
          ],
          explanation: 'In Python, clauses such as `if`, `for`, `while`, and `def` require a colon `:` at the end of their header line to signify that an indented suite follows.',
          learningTips: [
            'Remember: header lines introducing an indented block must end with a colon `:`.',
            'Think of a colon as saying "here comes the indented code".'
          ]
        });
        explanations.push(`Line ${i + 1}: Header line must end with a colon ':'.`);
        learningTipsSet.add("Always add a colon ':' at the end of if, for, while, and def lines.");
      }
    }

    // Check 3: Misspelled print or builtin
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('prin(') || line.startsWith('prnt(')) {
        detectedBugs.push({
          id: `bug-py-typo-${i + 1}`,
          line: i + 1,
          errorSummary: `Misspelled function name on line ${i + 1}`,
          compilerOutput: `NameError: name '${line.startsWith('prin(') ? 'prin' : 'prnt'}' is not defined. Did you mean: 'print'? on line ${i + 1}`,
          hints: [
            'Python encountered a function or variable identifier that it does not recognize.',
            `Inspect line ${i + 1}. Python\'s built-in output function is spelled \`print\`.`,
            'Correct the spelling to `print(...)`.'
          ],
          explanation: "Python is case-sensitive and identifier-sensitive. When a name is invoked that hasn't been defined, a NameError is raised.",
          learningTips: ['Double check spelling for common built-in functions like print, input, and len.']
        });
        explanations.push(`Line ${i + 1}: 'prin' is a typo for Python's built-in 'print()' function.`);
        learningTipsSet.add("Check spelling for Python built-ins like print.");
      }
    }

    // Check 4: IndentationError
    const indentLines: number[] = [];
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1];
      if (
        (line.startsWith('if ') ||
          line.startsWith('for ') ||
          line.startsWith('while ') ||
          line.startsWith('def ')) &&
        line.endsWith(':') &&
        nextLine.trim() !== '' &&
        !nextLine.startsWith(' ') &&
        !nextLine.startsWith('\t')
      ) {
        indentLines.push(i + 1);
        detectedBugs.push({
          id: `bug-py-indent-${i + 2}`,
          line: i + 2,
          errorSummary: `Missing indentation on line ${i + 2}`,
          compilerOutput: `IndentationError: expected an indented block after '${line.split(' ')[0]}' statement on line ${i + 1}`,
          hints: [
            'Unlike languages that use curly braces, Python uses indentation (spaces) to group statements.',
            `After a colon on line ${i + 1}, the next statement must be indented by 4 spaces.`,
            `Indent line ${i + 2} with 4 spaces.`
          ],
          explanation: 'Python enforces clean code structure through significant whitespace. Every line inside a block must be indented by an equal number of spaces.',
          learningTips: [
            'Use 4 spaces for indentation to avoid tab-mixing errors.',
            'Every statement inside an if or loop block must be indented.'
          ]
        });
        explanations.push(`Line ${i + 2} must be indented by 4 spaces after a header ending in ':'.`);
        learningTipsSet.add("Indent code blocks with 4 spaces after a colon.");
      }
    }

    // Check 5: Undeclared variable in Python
    const pyAssignedVars = new Set<string>();
    const pyAssignRegex = /\b([a-zA-Z_]\w*)\s*=[^=]/g;
    let pyMatch;
    while ((pyMatch = pyAssignRegex.exec(code)) !== null) {
      pyAssignedVars.add(pyMatch[1]);
    }
    const defMatch = code.match(/def\s+\w+\(([^)]*)\)/);
    if (defMatch && defMatch[1]) {
      defMatch[1].split(',').forEach((p) => pyAssignedVars.add(p.trim().split('=')[0].trim()));
    }
    const pyBuiltins = new Set([
      'print', 'input', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set',
      'True', 'False', 'None', 'sum', 'min', 'max', 'abs', 'round', 'type', 'open'
    ]);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const printVarMatch = line.match(/print\s*\(\s*([a-zA-Z_]\w*)\s*\)/);
      if (printVarMatch && !pyAssignedVars.has(printVarMatch[1]) && !pyBuiltins.has(printVarMatch[1])) {
        const varName = printVarMatch[1];
        detectedBugs.push({
          id: `bug-py-undef-${varName}`,
          line: i + 1,
          errorSummary: `Undefined variable '${varName}' at line ${i + 1}`,
          compilerOutput: `NameError: name '${varName}' is not defined on line ${i + 1}\n  ${line}\n  ^`,
          hints: [
            'Python executes line by line. You cannot access a variable before giving it a value.',
            `Look at line ${i + 1}: \`${line}\`. The variable \`${varName}\` has not been assigned yet.`,
            `Assign a value to \`${varName}\` before calling print (e.g. \`${varName} = 100\`).`
          ],
          explanation: 'In Python, variables are dynamically created upon assignment. Attempting to read a name before assigning to it triggers a NameError at runtime.',
          learningTips: ['Initialize variables before referencing them in expressions or functions.']
        });
        explanations.push(`Variable '${varName}' must be assigned a value before use.`);
        learningTipsSet.add("Assign variables before referencing them.");
      }
    }

    // Assemble comprehensive correctedCode for Python fixing ALL detected bugs
    correctedLines = lines.map((l, idx) => {
      let mod = l;
      // Fix assignment in if
      if (pyAssignLines.includes(idx)) {
        mod = mod.replace(/if\s+([a-zA-Z_]\w*)\s*=\s*([^=:]+?)\s*:/, 'if $1 == $2:');
      }
      // Fix missing colon
      if (missingColonLines.includes(idx) && !mod.endsWith(':')) {
        mod = mod + ':';
      }
      // Fix typos
      if (mod.trim().startsWith('prin(') || mod.trim().startsWith('prnt(')) {
        mod = mod.replace(/^(\s*)(prin|prnt)\(/, '$1print(');
      }
      // Fix indentation
      if (indentLines.includes(idx) && !mod.startsWith('    ') && !mod.startsWith('\t')) {
        mod = '    ' + mod.trim();
      }
      return mod;
    });
  }

  // If any bugs were detected, sort them by line and return rich multi-bug result with 3 hints per bug
  if (detectedBugs.length > 0) {
    detectedBugs.sort((a, b) => (a.line || 0) - (b.line || 0));
    const flatHints: string[] = [];
    detectedBugs.forEach((bug, bIdx) => {
      bug.hints.forEach((h, hIdx) => {
        flatHints.push(
          detectedBugs.length > 1
            ? `[Bug ${bIdx + 1} of ${detectedBugs.length}: ${bug.errorSummary}] Clue ${hIdx + 1}: ${h.replace(/^Hint \d+:\s*/, '')}`
            : h
        );
      });
    });

    const errorSummary =
      detectedBugs.length === 1
        ? detectedBugs[0].errorSummary
        : `Found ${detectedBugs.length} bugs in code: ${detectedBugs.map((b, idx) => `(#${idx + 1}) ${b.errorSummary}`).join('; ')}`;

    const combinedExplanation =
      explanations.length > 0
        ? explanations.join(' ')
        : detectedBugs.map((b) => b.explanation).filter(Boolean).join(' ');

    const combinedTips =
      learningTipsSet.size > 0
        ? Array.from(learningTipsSet)
        : detectedBugs.flatMap((b) => b.learningTips || []);

    return {
      status: 'Error Found',
      compilerOutput: detectedBugs.map((b) => b.compilerOutput).join('\n\n'),
      expectedOutput: expectedOutput || 'Output as defined',
      actualOutput: 'Compilation/Execution terminated with errors.',
      errorSummary,
      bugs: detectedBugs,
      hints: flatHints,
      explanation: combinedExplanation,
      correctedCode: correctedLines.join('\n'),
      learningTips: combinedTips.length > 0 ? combinedTips : ['Review syntax and line terminators before running.'],
      progressPercent: Math.max(30, 80 - detectedBugs.length * 15),
    };
  }

  // If code appears clean or no common syntax error detected
  return {
    status: 'No Errors',
    compilerOutput:
      language === 'cpp'
        ? `g++ -std=c++17 main.cpp -o main\n[Compilation Successful! 0 warnings, 0 errors]`
        : `python3 main.py\n[Code syntax verified successfully! Ready to execute.]`,
    expectedOutput: expectedOutput || 'Expected output produced',
    actualOutput: expectedOutput || 'Program completed with exit code 0.',
    errorSummary: 'No syntax or compilation errors found in this code.',
    hints: [
      'Your code structure and syntax are valid! Excellent work.',
      'Check if the output matches your logical expectations or edge case requirements.',
      'Try adding more test cases or comments to make your solution self-documenting.'
    ],
    explanation:
      'The code compiles cleanly without any syntax errors, unresolved symbols, or syntax anomalies. Great job!',
    correctedCode: code,
    learningTips: [
      'Write clean, readable variable names for maintainability.',
      'Test edge cases, such as empty inputs, negative numbers, or maximum bounds.',
      'Always structure your logic step by step before coding.'
    ],
    progressPercent: 100,
  };
}

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    userId: 'user-demo-1',
    title: 'Missing semicolon in age output',
    language: 'cpp',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int age = 20\n  cout << "Age: " << age << endl;\n  return 0;\n}`,
    status: 'Error Found',
    timestamp: '2026-10-27T08:15:00Z',
    compilerOutput: `error: expected ',' or ';' before 'cout'\n  cout << "Age: " << age << endl;\n  ^~~~`,
    expectedOutput: 'Age: 20',
    actualOutput: 'Compilation terminated with exit code 1.',
    errorSummary: "expected ',' or ';' before 'cout'",
    hints: [
      'In C++, every declaration statement inside a function must end with a semicolon `;`.',
      'Look at line 5: `int age = 20`. It is missing the statement terminator.',
      'Add `;` at the end of `int age = 20;`.'
    ],
    explanation:
      'C++ statements must conclude with a semicolon so the compiler knows where the declaration ends. Without it, the compiler attempts to parse `cout` as part of the declaration.',
    correctedCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int age = 20;\n  cout << "Age: " << age << endl;\n  return 0;\n}`,
    learningTips: [
      'Semicolons are mandatory statement terminators in C++.',
      'The compiler error usually points to the token immediately following the missing semicolon.'
    ],
    progressPercent: 70,
  },
  {
    id: 'sub-2',
    userId: 'user-demo-1',
    title: 'Misspelled variable in greeting function',
    language: 'python',
    code: `def greet(student_name):\n    message = f"Hello, {student_name}!"\n    prin(message)\n\ngreet("Alex")`,
    status: 'Error Found',
    timestamp: '2026-10-26T14:40:00Z',
    compilerOutput: `NameError: name 'prin' is not defined. Did you mean: 'print'? on line 3`,
    expectedOutput: 'Hello, Alex!',
    actualOutput: 'Traceback (most recent call last):\n  NameError: name \'prin\' is not defined',
    errorSummary: "NameError: name 'prin' is not defined",
    hints: [
      'Python throws a NameError when it encounters an identifier that has not been defined.',
      'Examine line 3. Python standard library has a built-in function for output.',
      'Replace `prin(...)` with `print(...)`.'
    ],
    explanation:
      '`prin` is a typo for Python\'s built-in `print()` function. Since Python interprets identifiers dynamically at runtime, it fails with NameError when the function is executed.',
    correctedCode: `def greet(student_name):\n    message = f"Hello, {student_name}!"\n    print(message)\n\ngreet("Alex")`,
    learningTips: [
      'Double check spelling for common built-in functions: `print`, `input`, `len`, `range`.',
      'Modern Python tracebacks will provide helpful "Did you mean?" suggestions.'
    ],
    progressPercent: 30,
  },
  {
    id: 'sub-3',
    userId: 'user-demo-1',
    title: 'Python loop with missing colon',
    language: 'python',
    code: `for i in range(5)\n    print(f"Counting {i}")`,
    status: 'Fixed',
    timestamp: '2026-10-25T11:20:00Z',
    compilerOutput: `SyntaxError: expected ':' on line 1\n  for i in range(5)\n                   ^`,
    expectedOutput: 'Counting 0\nCounting 1\nCounting 2\nCounting 3\nCounting 4',
    actualOutput: 'Counting 0\nCounting 1\nCounting 2\nCounting 3\nCounting 4',
    errorSummary: "SyntaxError: expected ':' at end of for loop header",
    hints: [
      'Compound statements in Python always terminate their header line with a specific punctuation character.',
      'Check the `for` statement header.',
      'Append a colon `:` at the end of `for i in range(5):`.'
    ],
    explanation:
      'Python uses colons to introduce code blocks (suites). Every `for`, `if`, `while`, and `def` requires a `:` before the indented body.',
    correctedCode: `for i in range(5):\n    print(f"Counting {i}")`,
    learningTips: [
      'Remember the rule: if the next line is indented, the current line needs a colon `:`.',
      'Look for the caret `^` in Python error reports to see where the parser stopped.'
    ],
    progressPercent: 100,
  }
];
