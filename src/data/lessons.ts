import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  // --- EXAMPLE A (Prompt requirement) ---
  {
    id: 'lesson-cpp-missing-semicolon',
    title: 'Missing Semicolon at End of Statement',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Syntax',
    description:
      'In C++, omitting a semicolon at the end of a statement prevents the compiler from knowing where an instruction ends, causing cascading syntax errors.',
    buggyCode: `int age = 19`,
    correctedCode: `int age = 19;`,
    explanation:
      'C++ requires a semicolon (;) at the end of most statements, including variable declarations, function calls, and expressions. Unlike languages like Python which use newlines to separate instructions, C++ ignores whitespace and depends on semicolons to delimit instructions.',
    learningTip:
      'Whenever the C++ compiler reports an error like "expected \';\' before ...", check the line directly above the reported line number.',
    expectedOutput: 'Variable age successfully initialized to 19',
    commonErrorMessage: "error: expected ';' before '...' or at end of input",
    languageDiffNote:
      'Python does not use semicolons to end statements; it relies on newlines and indentation. In C++, semicolons are mandatory.',
    challenge: {
      question: 'Why does the C++ compiler fail on "int age = 19"?',
      options: [
        'Variable names cannot hold numbers',
        'C++ statements must terminate with a semicolon',
        'int must be written in capital letters',
        'age is a reserved keyword in C++',
      ],
      correctIndex: 1,
      reasoning:
        'C++ is a statement-delimited language where the semicolon terminates declarations and expressions.',
    },
    tags: ['semicolon', 'syntax', 'declaration', 'compiler error'],
    dateAdded: '2026-10-01',
  },

  // --- EXAMPLE B (Prompt requirement) ---
  {
    id: 'lesson-cpp-undeclared-variable',
    title: 'Using an Undeclared Variable',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Variables',
    description:
      'Attempting to use, print, or assign a variable before it has been formally declared with a data type causes a compiler error.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    cout << score;
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int score = 100;
    cout << score;
    return 0;
}`,
    explanation:
      'C++ is a statically typed language. Every variable must have an explicit type (e.g., int, double, string) declared before it can be read or modified. The compiler allocates memory and validates operations based on that declaration.',
    learningTip:
      'Declare variables at the top of their enclosing scope or right before their first use, and always provide an initial value.',
    expectedOutput: '100',
    commonErrorMessage: "error: 'score' was not declared in this scope",
    languageDiffNote:
      'In Python, you do not declare types, but you must still define and assign a variable before referencing it, otherwise a NameError is raised.',
    challenge: {
      question: 'What is required in C++ before printing "score"?',
      options: [
        'score must be declared with a data type and given a value',
        'score must be converted to a string using to_string()',
        'Variables must be imported from <string>',
        'score must be declared inside a header file',
      ],
      correctIndex: 0,
      reasoning:
        'The compiler does not recognize the symbol "score" unless its type is declared beforehand.',
    },
    tags: ['variables', 'scope', 'declaration', 'cout'],
    dateAdded: '2026-10-02',
  },

  // --- EXAMPLE C (Prompt requirement) ---
  {
    id: 'lesson-py-incorrect-indentation',
    title: 'Incorrect Indentation in Python',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Syntax',
    description:
      'Python relies on whitespace indentation instead of curly braces to define code blocks. Unindented code inside a block raises an IndentationError.',
    buggyCode: `age = 20

if age >= 18:
print("Adult")`,
    correctedCode: `age = 20

if age >= 18:
    print("Adult")`,
    explanation:
      'Python uses indentation (standard is 4 spaces) to denote the body of compound statements such as if, else, for, while, and def. If the line following an if statement has the same indentation level as the if header, Python cannot determine which code belongs inside the condition.',
    learningTip:
      'Set your code editor to insert 4 spaces whenever you press the Tab key. Never mix literal tabs and spaces in Python.',
    expectedOutput: 'Adult',
    commonErrorMessage: 'IndentationError: expected an indented block after "if" statement',
    languageDiffNote:
      'C++ uses curly braces { } to enclose code blocks and ignores indentation whitespace. In Python, indentation is strict syntax.',
    challenge: {
      question: 'Why does Python raise an IndentationError here?',
      options: [
        'The print function is deprecated in Python 3',
        'print("Adult") must be indented under the if condition',
        'if statements require parentheses around the condition',
        'Variables must be written in uppercase',
      ],
      correctIndex: 1,
      reasoning:
        'The body of the if block must be indented at least one level to indicate it is controlled by the condition.',
    },
    tags: ['indentation', 'whitespace', 'if statement', 'IndentationError'],
    dateAdded: '2026-10-03',
  },

  // --- Conditionals: Assignment vs Comparison ---
  {
    id: 'lesson-cpp-assignment-in-if',
    title: 'Using Assignment (=) Instead of Comparison (==)',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Conditionals',
    description:
      'Using a single equals sign inside an if statement assigns the value rather than checking for equality, leading to unintentional true branches and bugs.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    int score = 85;
    
    // Bug: Assigns 100 to score instead of comparing
    if (score = 100) {
        cout << "Perfect score!" << endl;
    }
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int score = 85;
    
    // Correct: uses equality comparison ==
    if (score == 100) {
        cout << "Perfect score!" << endl;
    }
    return 0;
}`,
    explanation:
      'In C++, "=" is the assignment operator, which stores a value and evaluates to that value. Because 100 is non-zero, the expression (score = 100) evaluates to true, even though score was originally 85. The comparison operator is "==".',
    learningTip:
      'Turn on compiler warnings (like -Wall in g++). The compiler will warn: "suggest parentheses around assignment used as truth value".',
    expectedOutput: '(No output because 85 != 100)',
    commonErrorMessage: 'warning: suggest parentheses around assignment used as truth value [-Wparentheses]',
    languageDiffNote:
      'In Python, writing "if score = 100:" is a syntax error because Python prohibits assignments inside conditional expressions.',
    challenge: {
      question: 'What happens when "if (score = 100)" executes in C++?',
      options: [
        'The program crashes immediately with a segmentation fault',
        'score is updated to 100, and the condition evaluates to true',
        'The compiler automatically converts it into ==',
        'The condition evaluates to false because score was 85',
      ],
      correctIndex: 1,
      reasoning:
        'Assignment in C++ yields the assigned value (100). Any non-zero integer is treated as true in boolean context.',
    },
    tags: ['conditionals', 'operators', 'equality', 'assignment'],
    dateAdded: '2026-10-04',
  },

  // --- Data Types: C++ Type Mismatch ---
  {
    id: 'lesson-cpp-data-type-mismatch',
    title: 'Assigning Incompatible Types (String to Integer)',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Data Types',
    description:
      'Assigning a string literal to an integer variable causes a compile-time type mismatch error in C++.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    int totalCount = "twenty";
    cout << totalCount;
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int totalCount = 20;
    cout << totalCount;
    return 0;
}`,
    explanation:
      'C++ enforces static type checking. An "int" variable can only store integer numbers. A string literal like "twenty" has the type "const char*", which cannot be implicitly converted into an int.',
    learningTip:
      'Match your literal values to the variable type. If you need textual representations, use std::string. If you need numbers, use numeric literals.',
    expectedOutput: '20',
    commonErrorMessage: "error: cannot convert 'const char[7]' to 'int' in initialization",
    languageDiffNote:
      'In Python, variables are dynamically typed and can refer to any type. However, attempting to perform arithmetic on strings without conversion still results in a TypeError.',
    challenge: {
      question: 'Why does "int totalCount = \\"twenty\\";" fail to compile?',
      options: [
        'C++ cannot store values greater than 10 in an int',
        'A string literal cannot be converted to an integer type in C++',
        'totalCount must be preceded by a hashtag',
        'Double quotes are not allowed in C++',
      ],
      correctIndex: 1,
      reasoning:
        'C++ requires type compatibility between the variable declaration and the assigned expression.',
    },
    tags: ['data types', 'type mismatch', 'integers', 'strings'],
    dateAdded: '2026-10-05',
  },

  // --- Data Types / Input: Python String & Int Concatenation ---
  {
    id: 'lesson-py-type-concatenation',
    title: 'Concatenating String and Integer Without Conversion',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Data Types',
    description:
      'Using the "+" operator between a string and an integer in Python triggers a TypeError because Python will not automatically coerce types.',
    buggyCode: `age = input("Enter your age: ") # user enters 18
# Bug: age is a string, and cannot be added directly to integer 5
future_age = age + 5
print("In 5 years you will be " + future_age)`,
    correctedCode: `age_input = input("Enter your age: ") # e.g. "18"
age = int(age_input)
future_age = age + 5
print(f"In 5 years you will be {future_age}")`,
    explanation:
      'Python\'s input() function always returns a string (str). When you write "age + 5", Python doesn\'t know whether you want string concatenation or mathematical addition. You must explicitly convert the input string to an int with int().',
    learningTip:
      'Use Python f-strings (f"text {variable}") for formatting outputs, and always convert input() with int() or float() before math.',
    expectedOutput: 'In 5 years you will be 23',
    commonErrorMessage: 'TypeError: can only concatenate str (not "int") to str',
    languageDiffNote:
      'In C++, std::cin reads typed data directly (cin >> age automatically parses into an int if age is declared as int).',
    challenge: {
      question: 'What does Python\'s input() function return by default?',
      options: [
        'An integer if the user typed numbers',
        'Always a string (str)',
        'A float',
        'A boolean',
      ],
      correctIndex: 1,
      reasoning:
        'input() consistently returns text as a string type, requiring int() conversion for numerical operations.',
    },
    tags: ['types', 'TypeError', 'input', 'concatenation', 'type casting'],
    dateAdded: '2026-10-06',
  },

  // --- Arrays & Indexing: C++ Out of Bounds ---
  {
    id: 'lesson-cpp-array-out-of-bounds',
    title: 'Array Index Out of Bounds',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Arrays & Indexing',
    description:
      'Accessing an index equal to or greater than the array size in C++ causes undefined behavior, often reading garbage memory or crashing.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    int scores[3] = {88, 92, 79};
    // Bug: Indices are 0, 1, 2. Index 3 is out of bounds!
    cout << "Third score: " << scores[3] << endl;
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int scores[3] = {88, 92, 79};
    // Correct: The 3rd item is at index 2
    cout << "Third score: " << scores[2] << endl;
    return 0;
}`,
    explanation:
      'Arrays in C++ are zero-indexed. For an array of size N, valid indices are from 0 up to N-1. Accessing index N (here, 3) accesses memory outside the array. C++ raw arrays do not perform bounds checking by default.',
    learningTip:
      'Remember: "Size N means last index is N - 1". Prefer std::vector or std::array with .at() which performs safe bounds checking.',
    expectedOutput: 'Third score: 79',
    commonErrorMessage: 'Undefined behavior / garbage memory read / Segmentation fault',
    languageDiffNote:
      'In Python, accessing an invalid index raises an explicit IndexError. In C++, raw arrays silently read arbitrary memory or crash.',
    challenge: {
      question: 'For an array of 3 elements, what is the index of the last element?',
      options: ['3', '2', '1', '4'],
      correctIndex: 1,
      reasoning:
        'Because indexing starts at 0, an array of length 3 has elements at positions 0, 1, and 2.',
    },
    tags: ['arrays', 'indexing', 'out of bounds', 'zero-indexing'],
    dateAdded: '2026-10-07',
  },

  // --- Arrays & Indexing: Python IndexError ---
  {
    id: 'lesson-py-index-error',
    title: 'IndexError: List Index Out of Range',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Arrays & Indexing',
    description:
      'Trying to access a list element using an index that does not exist raises an IndexError exception at runtime.',
    buggyCode: `fruits = ["apple", "banana", "cherry"]

# Bug: fruits has 3 items, so maximum index is 2
print(fruits[3])`,
    correctedCode: `fruits = ["apple", "banana", "cherry"]

# Correct: use index 2 for the 3rd element, or -1 for the last
print(fruits[2])`,
    explanation:
      'Like most languages, Python lists use 0-based indexing. A list of 3 items has indices 0, 1, and 2. Calling fruits[3] immediately stops execution with an IndexError.',
    learningTip:
      'Use negative indexing like fruits[-1] to safely fetch the last element of a list without knowing its exact length.',
    expectedOutput: 'cherry',
    commonErrorMessage: 'IndexError: list index out of range',
    languageDiffNote:
      'Python provides negative indices (e.g. -1 for last item), whereas in C++ negative indices will access memory before the array boundary.',
    challenge: {
      question: 'Which of the following is a Pythonic way to get the last item in a list?',
      options: ['fruits[len(fruits)]', 'fruits[-1]', 'fruits[last]', 'fruits.end()'],
      correctIndex: 1,
      reasoning:
        'Python supports negative indexing, where -1 points directly to the final element.',
    },
    tags: ['lists', 'IndexError', 'indexing', 'bounds'],
    dateAdded: '2026-10-08',
  },

  // --- Loops: Infinite Loop Missing Increment ---
  {
    id: 'lesson-cpp-infinite-loop',
    title: 'Infinite Loop Due to Missing Step Variable',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Loops',
    description:
      'A while loop whose condition never becomes false will run forever, freezing the program and consuming CPU.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    int i = 0;
    while (i < 5) {
        cout << i << " ";
        // Bug: i is never incremented, so i < 5 is always true!
    }
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int i = 0;
    while (i < 5) {
        cout << i << " ";
        i++; // Increment step ensures loop terminates
    }
    return 0;
}`,
    explanation:
      'The while loop repeats as long as the condition evaluates to true. If the variables governing the condition are not updated within the loop body, the condition remains permanently true, causing an infinite loop.',
    learningTip:
      'Whenever writing a while loop, write the update statement (e.g. i++) immediately after opening the loop braces.',
    expectedOutput: '0 1 2 3 4 ',
    commonErrorMessage: 'Program hangs / timeout exceeded / high CPU usage',
    languageDiffNote:
      'In Python, developers often prefer "for i in range(5):" which automatically increments and prevents infinite loop oversights.',
    challenge: {
      question: 'Why does the buggy while loop never finish executing?',
      options: [
        'cout cannot be called inside loops',
        'The variable "i" is never incremented inside the loop',
        'while loops are restricted to 1 iteration in C++',
        'i is declared as an integer instead of float',
      ],
      correctIndex: 1,
      reasoning:
        'Without "i++", "i" stays 0 forever, keeping the condition 0 < 5 perpetually true.',
    },
    tags: ['loops', 'while', 'infinite loop', 'increment'],
    dateAdded: '2026-10-09',
  },

  // --- Loops: Logic Error Off-by-One in Python ---
  {
    id: 'lesson-py-range-off-by-one',
    title: 'Range() Off-by-One Exclusion Error',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Loops',
    description:
      'Python\'s range(start, stop) excludes the stop value, leading students to miss the final intended iteration.',
    buggyCode: `# Goal: Print numbers 1 through 10
for i in range(1, 10):
    print(i, end=" ")
# Bug: range(1, 10) stops at 9!`,
    correctedCode: `# Goal: Print numbers 1 through 10
for i in range(1, 11):
    print(i, end=" ")
# Correct: stop value must be 11 to include 10`,
    explanation:
      'In Python, range(start, stop) generates numbers up to, but not including, the stop value (half-open interval [start, stop)). To include the number 10, the stop parameter must be 11.',
    learningTip:
      'Think of range(a, b) as: "Start at a, keep going while i < b". If you need to include N, use range(start, N + 1).',
    expectedOutput: '1 2 3 4 5 6 7 8 9 10 ',
    commonErrorMessage: 'Logic bug: Loop stops one step earlier than expected',
    languageDiffNote:
      'In C++, developers explicitly choose between "i < 10" or "i <= 10" in the loop condition header.',
    challenge: {
      question: 'What is the last number printed by "for i in range(1, 10):"?',
      options: ['10', '9', '11', '0'],
      correctIndex: 1,
      reasoning:
        'Python range excludes the upper bound, stopping at stop - 1, which is 9.',
    },
    tags: ['loops', 'range', 'off-by-one', 'logic'],
    dateAdded: '2026-10-10',
  },

  // --- Functions: C++ Missing Return Statement ---
  {
    id: 'lesson-cpp-missing-return',
    title: 'Non-Void Function Missing Return Statement',
    language: 'cpp',
    difficulty: 'Intermediate',
    category: 'Functions',
    description:
      'A non-void C++ function that reaches the end of its body without returning a value produces undefined behavior.',
    buggyCode: `#include <iostream>
using namespace std;

// Function declared to return an int
int calculateArea(int width, int height) {
    int area = width * height;
    // Bug: Forgot return statement!
}

int main() {
    int a = calculateArea(5, 4);
    cout << "Area: " << a << endl;
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int calculateArea(int width, int height) {
    int area = width * height;
    return area; // Explicitly return the calculated value
}

int main() {
    int a = calculateArea(5, 4);
    cout << "Area: " << a << endl;
    return 0;
}`,
    explanation:
      'If a function signature declares a return type other than "void" (like int, double, or bool), every execution path must end with a return statement that provides a value of that type. Reaching the closing brace without returning results in undefined behavior.',
    learningTip:
      'If your function doesn\'t need to pass data back, declare its return type as "void". Otherwise, ensure every return branch is covered.',
    expectedOutput: 'Area: 20',
    commonErrorMessage: 'warning/error: control reaches end of non-void function [-Wreturn-type]',
    languageDiffNote:
      'In Python, functions without an explicit return statement automatically return None, avoiding memory crashes.',
    challenge: {
      question: 'What does a C++ function declared as "int" return if there is no return statement?',
      options: [
        'It defaults to returning 0',
        'It causes undefined behavior and returns garbage/invalid memory',
        'It returns NULL',
        'It automatically prints the result to console',
      ],
      correctIndex: 1,
      reasoning:
        'C++ does not automatically default to 0; failing to return a value from a non-void function leads to undefined behavior.',
    },
    tags: ['functions', 'return type', 'undefined behavior', 'compiler warning'],
    dateAdded: '2026-10-11',
  },

  // --- Functions: Python UnboundLocalError ---
  {
    id: 'lesson-py-unbound-local',
    title: 'UnboundLocalError: Modifying Outer Variable',
    language: 'python',
    difficulty: 'Intermediate',
    category: 'Functions',
    description:
      'Assigning to a variable inside a function marks it as local to that function. Referencing it before that assignment triggers UnboundLocalError.',
    buggyCode: `visitor_count = 0

def register_visit():
    # Bug: Python treats visitor_count as local because of the += assignment,
    # but it has not been defined locally yet!
    visitor_count += 1
    print(f"Total: {visitor_count}")

register_visit()`,
    correctedCode: `visitor_count = 0

def register_visit():
    global visitor_count # Declares intent to modify the global variable
    visitor_count += 1
    print(f"Total: {visitor_count}")

register_visit()`,
    explanation:
      'When Python compiles a function, any variable assigned to (e.g. visitor_count += 1) is automatically scoped as local throughout the entire function. Since it hasn\'t been assigned a local value when evaluating the right-hand side, Python raises an UnboundLocalError.',
    learningTip:
      'Whenever possible, pass values into functions as parameters and return the modified result instead of modifying global variables.',
    expectedOutput: 'Total: 1',
    commonErrorMessage: "UnboundLocalError: local variable 'visitor_count' referenced before assignment",
    languageDiffNote:
      'In C++, global variables can be modified directly within functions unless shadowed by a local variable with the exact same name.',
    challenge: {
      question: 'Why does Python consider "visitor_count" local inside register_visit()?',
      options: [
        'All variables in Python functions are global',
        'Because an assignment operator (+=) appears in the function',
        'Variables cannot start with the letter v',
        'It is a reserved keyword',
      ],
      correctIndex: 1,
      reasoning:
        'Any assignment in a function body causes Python to bind that variable name to local scope unless declared "global".',
    },
    tags: ['functions', 'scope', 'global', 'UnboundLocalError'],
    dateAdded: '2026-10-12',
  },

  // --- Logic: C++ Integer Division Truncation ---
  {
    id: 'lesson-cpp-integer-division',
    title: 'Integer Division Truncating Decimal Values',
    language: 'cpp',
    difficulty: 'Beginner',
    category: 'Logic',
    description:
      'Dividing two integers in C++ performs integer division, discarding any fractional portion even when assigned to a double or float.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    int totalPoints = 7;
    int items = 2;
    // Bug: 7 / 2 performs integer division (yields 3), then converts 3 to 3.0
    double average = totalPoints / items;
    cout << "Average: " << average << endl;
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int totalPoints = 7;
    int items = 2;
    // Correct: Cast one operand to double to trigger floating-point division
    double average = static_cast<double>(totalPoints) / items;
    cout << "Average: " << average << endl;
    return 0;
}`,
    explanation:
      'In C++, if both operands of "/" are integers, the result is truncated toward zero as an integer (7 / 2 = 3). Assigning the result to a double variable happens after the truncation has already taken place.',
    learningTip:
      'Cast at least one operand to double (or use 2.0 instead of 2) to perform floating-point division.',
    expectedOutput: 'Average: 3.5',
    commonErrorMessage: 'Logic Error: Output is 3 instead of expected 3.5',
    languageDiffNote:
      'Python 3 uses "/" for true floating-point division (7 / 2 = 3.5) and provides "//" specifically for floor division (7 // 2 = 3).',
    challenge: {
      question: 'What is the evaluated result of 7 / 2 in C++ when both operands are ints?',
      options: ['3.5', '3', '4', 'Compilation error'],
      correctIndex: 1,
      reasoning:
        'C++ integer division discards the remainder, truncating 3.5 to 3.',
    },
    tags: ['logic', 'math', 'division', 'casting', 'floating point'],
    dateAdded: '2026-10-13',
  },

  // --- Python Quirks: Mutable Default Argument ---
  {
    id: 'lesson-py-mutable-default-arg',
    title: 'Mutable Default Arguments Retaining State',
    language: 'python',
    difficulty: 'Intermediate',
    category: 'Language Quirks',
    description:
      'Using a mutable object (like a list or dict) as a default function argument causes the object to be shared across all function calls.',
    buggyCode: `# Bug: target_list=[] is created ONCE when the function is defined
def add_item(item, target_list=[]):
    target_list.append(item)
    return target_list

print(add_item("apple"))  # ['apple']
print(add_item("banana")) # Expected ['banana'], but gets ['apple', 'banana']!`,
    correctedCode: `def add_item(item, target_list=None):
    if target_list is None:
        target_list = [] # Fresh list created on every call
    target_list.append(item)
    return target_list

print(add_item("apple"))  # ['apple']
print(add_item("banana")) # ['banana']`,
    explanation:
      'Python evaluates default parameter expressions once, at the time the function is defined, not each time it is called. If you modify a mutable default argument, future calls will see those mutations.',
    learningTip:
      'Always use "None" as the default value for mutable parameters and initialize a new list/dict inside the function body.',
    expectedOutput: "['apple']\n['banana']",
    commonErrorMessage: 'Logic bug: List accumulates values from previous calls',
    languageDiffNote:
      'C++ default arguments are evaluated on the caller side and cannot silently share a heap-allocated container across separate calls.',
    challenge: {
      question: 'When does Python evaluate default parameter values in a function header?',
      options: [
        'Every time the function is invoked',
        'Only once, when the function definition is executed',
        'When the program terminates',
        'Never, they are evaluated on the fly by the garbage collector',
      ],
      correctIndex: 1,
      reasoning:
        'Default parameter values are bound at definition time, meaning mutable defaults persist mutations.',
    },
    tags: ['functions', 'defaults', 'mutability', 'python quirks'],
    dateAdded: '2026-10-14',
  },

  // --- Input/Output: C++ cin >> followed by getline() ---
  {
    id: 'lesson-cpp-cin-getline-trap',
    title: 'Leftover Newline Trap with cin and getline()',
    language: 'cpp',
    difficulty: 'Intermediate',
    category: 'Input/Output',
    description:
      'Using "cin >> number" leaves a newline character in the input buffer, causing a subsequent "getline(cin, text)" to read an empty line immediately.',
    buggyCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int age;
    string fullName;

    cout << "Enter age: ";
    cin >> age; // Leaves '\\n' in the input stream

    cout << "Enter full name: ";
    // Bug: getline immediately consumes the leftover '\\n' and returns ""
    getline(cin, fullName); 

    cout << "Name: " << fullName << ", Age: " << age << endl;
    return 0;
}`,
    correctedCode: `#include <iostream>
#include <string>
#include <limits>
using namespace std;

int main() {
    int age;
    string fullName;

    cout << "Enter age: ";
    cin >> age;

    // Correct: Ignore the trailing newline before calling getline
    cin.ignore(numeric_limits<streamsize>::max(), '\\n');

    cout << "Enter full name: ";
    getline(cin, fullName);

    cout << "Name: " << fullName << ", Age: " << age << endl;
    return 0;
}`,
    explanation:
      'Formatted input operators like "cin >>" extract tokens but stop reading at whitespace or newlines, leaving the newline (\\n) in the input buffer. When getline() is called next, it sees that newline and finishes reading without waiting for user input.',
    learningTip:
      'Always call "cin.ignore()" between a "cin >>" and a "getline(cin, str)" to flush the leftover newline.',
    expectedOutput: 'Name: Ada Lovelace, Age: 25',
    commonErrorMessage: 'Input skipped: getline reads an empty string without user input',
    languageDiffNote:
      'Python\'s input() reads a complete line and automatically strips the terminating newline, avoiding stream buffer synchronization bugs.',
    challenge: {
      question: 'What is left in the input buffer after "cin >> age"?',
      options: [
        'The integer value',
        'The newline character \\n from pressing Enter',
        'An EOF signal',
        'Nothing, the buffer is emptied',
      ],
      correctIndex: 1,
      reasoning:
        'cin >> stops before the newline character, leaving it in the buffer for getline() to encounter.',
    },
    tags: ['input/output', 'cin', 'getline', 'streams', 'buffer'],
    dateAdded: '2026-10-15',
  },

  // --- Python Loops: Modifying List While Iterating ---
  {
    id: 'lesson-py-modifying-list-while-iterating',
    title: 'Modifying a List While Iterating Over It',
    language: 'python',
    difficulty: 'Intermediate',
    category: 'Loops',
    description:
      'Removing items from a list while iterating over it with a for loop skips elements because the internal iteration index continues incrementing.',
    buggyCode: `numbers = [1, 2, 2, 3, 4]

# Bug: When 2 is removed, the second 2 shifts to index 1 and gets skipped!
for num in numbers:
    if num == 2:
        numbers.remove(num)

print(numbers) # Output: [1, 2, 3, 4] - Still has a 2!`,
    correctedCode: `numbers = [1, 2, 2, 3, 4]

# Correct: Use list comprehension to filter without modifying in-place
numbers = [num for num in numbers if num != 2]

print(numbers) # Output: [1, 3, 4]`,
    explanation:
      'When you iterate directly through a list, Python maintains an internal index (0, 1, 2...). When you remove an item, all subsequent items shift left by one position. The loop then increments its counter, effectively skipping the item that just moved into the current index.',
    learningTip:
      'Never mutate a collection while looping through it. Use a list comprehension "[x for x in list if ...]" or iterate over a copy "for x in numbers[:]:".',
    expectedOutput: '[1, 3, 4]',
    commonErrorMessage: 'Logic Bug: Duplicate elements are missed or skipped',
    languageDiffNote:
      'In C++, erasing an element from a vector during iteration invalidates iterators, leading to crashes unless using the return value of vec.erase().',
    challenge: {
      question: 'Why did the second "2" stay in the list in the buggy code?',
      options: [
        'remove() only works on strings',
        'Removing the first 2 shifted the second 2 into the current index, skipping it on the next loop increment',
        'Python lists cannot hold duplicate values',
        'for loops cannot be used with remove()',
      ],
      correctIndex: 1,
      reasoning:
        'Removing an item shifts subsequent elements to the left, but the loop counter advances, skipping the shifted element.',
    },
    tags: ['loops', 'lists', 'mutation', 'iteration', 'logic'],
    dateAdded: '2026-10-16',
  },

  // --- Syntax: Python Missing Colon ---
  {
    id: 'lesson-py-missing-colon',
    title: 'Missing Colon in Header Statements',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Syntax',
    description:
      'Compound statements in Python (if, else, for, while, def, class) must conclude with a colon (:) to signal the start of an indented block.',
    buggyCode: `temperatures = [72, 68, 75]

# Bug: Missing colon at the end of the for header
for temp in temperatures
    print(f"Temperature: {temp}")`,
    correctedCode: `temperatures = [72, 68, 75]

# Correct: Includes the terminating colon
for temp in temperatures:
    print(f"Temperature: {temp}")`,
    explanation:
      'The colon is the syntactic signal in Python that indicates an indented suite of statements follows. Forgetting the colon triggers an immediate SyntaxError before the code can run.',
    learningTip:
      'Whenever you write if, elif, else, for, while, try, except, def, or class, verify that the line ends with a colon.',
    expectedOutput: 'Temperature: 72\nTemperature: 68\nTemperature: 75',
    commonErrorMessage: 'SyntaxError: expected ":"',
    languageDiffNote:
      'C++ uses parentheses ( ) to enclose control conditions and braces { } for blocks; it does not use header colons.',
    challenge: {
      question: 'Which punctuation mark is required at the end of a Python for-loop header?',
      options: ['; (semicolon)', ': (colon)', '{ (brace)', '. (period)'],
      correctIndex: 1,
      reasoning:
        'Python requires a colon (:) at the end of header statements to introduce an indented block.',
    },
    tags: ['syntax', 'colon', 'for loop', 'SyntaxError'],
    dateAdded: '2026-10-17',
  },

  // --- Logic: C++ Floating Point Direct Equality ---
  {
    id: 'lesson-cpp-float-equality',
    title: 'Direct Equality Comparison with Floating-Point Numbers',
    language: 'cpp',
    difficulty: 'Intermediate',
    category: 'Logic',
    description:
      'Comparing floating-point numbers with "==" often fails due to binary representation limits and precision rounding.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    double a = 0.1;
    double b = 0.2;
    double sum = a + b;

    // Bug: 0.1 + 0.2 evaluates to 0.30000000000000004 in IEEE 754
    if (sum == 0.3) {
        cout << "Equal!" << endl;
    } else {
        cout << "Not equal!" << endl;
    }
    return 0;
}`,
    correctedCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double a = 0.1;
    double b = 0.2;
    double sum = a + b;
    const double EPSILON = 1e-9;

    // Correct: Compare absolute difference against an epsilon tolerance
    if (std::abs(sum - 0.3) < EPSILON) {
        cout << "Equal!" << endl;
    } else {
        cout << "Not equal!" << endl;
    }
    return 0;
}`,
    explanation:
      'Computers represent floating-point numbers using base-2 (binary). Fractions like 0.1 and 0.2 cannot be represented with infinite precision in binary, resulting in tiny rounding discrepancies (e.g. 0.30000000000000004). Direct equality checks fail.',
    learningTip:
      'Never compare floats or doubles with "==". Check whether std::abs(a - b) is smaller than a tiny tolerance value (epsilon).',
    expectedOutput: 'Equal!',
    commonErrorMessage: 'Logic Bug: Branch evaluates false because 0.30000000000000004 != 0.3',
    languageDiffNote:
      'Both C++ and Python share IEEE 754 floating point arithmetic. Python includes math.isclose(a, b) in its standard library for this purpose.',
    challenge: {
      question: 'Why does 0.1 + 0.2 == 0.3 evaluate to false in standard float arithmetic?',
      options: [
        'C++ doubles cannot store positive numbers',
        '0.1 and 0.2 have repeating fractions in binary, causing tiny representation errors',
        '0.3 is automatically rounded to 0',
        'Floating-point addition is disabled in main()',
      ],
      correctIndex: 1,
      reasoning:
        'Binary representation of decimal fractions causes minute precision discrepancies, breaking strict equality.',
    },
    tags: ['logic', 'floating point', 'precision', 'epsilon'],
    dateAdded: '2026-10-18',
  },

  // --- Python: KeyError ---
  {
    id: 'lesson-py-key-error',
    title: 'Accessing Missing Dictionary Keys (KeyError)',
    language: 'python',
    difficulty: 'Beginner',
    category: 'Data Types',
    description:
      'Accessing a dictionary key that does not exist with square brackets [] raises a KeyError exception.',
    buggyCode: `user_profile = {
    "name": "Sarah",
    "role": "Student"
}

# Bug: "email" key was not defined in the dictionary!
print(user_profile["email"])`,
    correctedCode: `user_profile = {
    "name": "Sarah",
    "role": "Student"
}

# Correct: Use .get() with a safe default fallback
email = user_profile.get("email", "No email provided")
print(email)`,
    explanation:
      'Unlike some languages where missing keys return null, Python explicitly raises a KeyError when using dict[key] if the key is absent. Using dict.get(key, default) safely returns None or a custom fallback without crashing.',
    learningTip:
      'Use dict.get(key, default) for optional keys, or check "if key in dict:" before indexing.',
    expectedOutput: 'No email provided',
    commonErrorMessage: "KeyError: 'email'",
    languageDiffNote:
      'In C++ std::map, accessing map[key] will automatically insert a default-constructed value, while std::unordered_map::at() throws std::out_of_range.',
    challenge: {
      question: 'How do you safely fetch an optional key from a Python dictionary?',
      options: [
        'dict["key"].safe()',
        'dict.get("key", default_value)',
        'dict.fetch("key")',
        'dict[key] or null',
      ],
      correctIndex: 1,
      reasoning:
        'The .get() method looks up keys without raising KeyError, returning the specified default if missing.',
    },
    tags: ['dictionary', 'KeyError', 'get', 'data types'],
    dateAdded: '2026-10-19',
  },

  // --- C++: Uninitialized Pointer / Nullptr ---
  {
    id: 'lesson-cpp-uninitialized-pointer',
    title: 'Dereferencing an Uninitialized Pointer',
    language: 'cpp',
    difficulty: 'Advanced',
    category: 'Variables',
    description:
      'Dereferencing an uninitialized or wild pointer points to an unpredictable memory address, resulting in segmentation faults.',
    buggyCode: `#include <iostream>
using namespace std;

int main() {
    int* ptr; // Bug: Uninitialized pointer contains random memory address
    *ptr = 42; // Writing to wild memory!
    cout << *ptr << endl;
    return 0;
}`,
    correctedCode: `#include <iostream>
using namespace std;

int main() {
    int value = 0;
    int* ptr = &value; // Initialize pointer with address of a valid variable
    *ptr = 42;
    cout << *ptr << endl;
    return 0;
}`,
    explanation:
      'Local pointer variables in C++ are not initialized automatically. They hold whatever residual bits were in that stack memory location. Dereferencing (*ptr) attempts to read or write to that random memory, triggering an OS memory protection fault.',
    learningTip:
      'Always initialize pointers when declaring them: either point to a valid address (&var) or set them to nullptr (int* ptr = nullptr;).',
    expectedOutput: '42',
    commonErrorMessage: 'Segmentation fault (core dumped)',
    languageDiffNote:
      'Python manages memory automatically with references and garbage collection, preventing wild memory pointer crashes.',
    challenge: {
      question: 'What does a local raw pointer "int* ptr;" contain before initialization?',
      options: [
        'Automatically nullptr',
        'Garbage / whatever random bits were in memory',
        'Address 0x00000000',
        'The address of main',
      ],
      correctIndex: 1,
      reasoning:
        'C++ does not zero-initialize local primitive variables; uninitialized pointers point to random memory.',
    },
    tags: ['pointers', 'memory', 'segmentation fault', 'variables', 'advanced'],
    dateAdded: '2026-10-20',
  },
];
