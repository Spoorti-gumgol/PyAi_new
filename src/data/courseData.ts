import { type Difficulty, type Exercise, type Skill, type Unit, type Course } from './courseData';

export type { Difficulty, Exercise, Skill, Unit, Course };

export const COURSES: Course[] = [
  {
    id: 'course-1',
    title: "Artificial Intelligence Fundamentals and Applications",
    description: "Learn the core concepts of Python and how they power modern AI systems.",
    duration: "120 Hours",
    level: 'beginner',
    units: [
      {
        id: 'c1-u1',
        title: "Unit 1: Fundamentals of Communicating with a Computer",
        skills: [
          {
            id: 'c1-u1-intro',
            title: "What is Programming?",
            description: "Understanding how we talk to computers",
            exercises: [
              {
                id: 'c1-u1-intro-theory',
                type: 'theory',
                difficulty: 'easy',
                content: `Why This Matters:
Programming is how we talk to computers. Every game, mobile app, AI system, or website works because someone wrote instructions for it. If you understand programming, you can build your own tools, games, and intelligent systems.

Core Explanation:
A computer cannot think on its own. It only follows instructions that humans give it. These instructions must be written in a specific language called a programming language.

Python is one of the most popular programming languages in the world. It is simple, readable, and powerful.

When we write a program, we are writing a sequence of commands that tell the computer what to do step-by-step.

Example:
print("Hello World")

This tells the computer:
Display the text "Hello World" on the screen.

Every program is just a collection of instructions like this.

Common Mistakes:
- Forgetting quotation marks around text
- Misspelling keywords like print
- Expecting the computer to guess what you mean

Mini Reflection:
What do you think will happen if you remove the quotation marks in print("Hello")?`
              },
              { id: 'c1-u1-intro-e1', type: 'mcq', question: "What is a program?", options: ["A physical computer part", "A sequence of instructions", "A video game character", "A type of coffee"], correctAnswer: 1, difficulty: 'easy' },
              { id: 'c1-u1-intro-e2', type: 'mcq', question: "Which function displays text on the screen?", options: ["show()", "input()", "print()", "screen()"], correctAnswer: 2, difficulty: 'easy' }
            ]
          },
          {
            id: 'c1-u1-s1',
            title: "Data Types",
            description: "Understand Strings, Integers, and Floats",
            exercises: [
              {
                id: 'c1-u1-s1-theory',
                type: 'theory',
                difficulty: 'easy',
                content: `Why This Matters:
Computers store different kinds of information. A name is different from a number. A price is different from a whole number. The computer needs to know what kind of data it is handling.

Core Explanation:
In Python, we have different data types.

String (str):
Used for text.
Example:
name = "Aarav"

Integer (int):
Used for whole numbers.
Example:
age = 12

Float (float):
Used for decimal numbers.
Example:
price = 99.99

Each data type behaves differently.

For example, you cannot directly add text and numbers:
"Age: " + 12   → This causes an error.

You must convert the number:
"Age: " + str(12)

Understanding data types helps prevent errors and makes programs behave correctly.

Common Mistakes:
- Forgetting quotes for strings
- Mixing numbers and strings incorrectly
- Assuming input() returns a number automatically

Mini Reflection:
Why does Python need to know whether something is a string or a number?`
              },
              { id: 'c1-u1-s1-e1', type: 'mcq', question: "Which data type represents a whole number?", options: ["String", "Integer", "Float", "Boolean"], correctAnswer: 1, difficulty: 'easy' },
              { id: 'c1-u1-s1-e2', type: 'mcq', question: "How would you represent the text 'Hello'?", options: ["Integer", "Float", "String", "List"], correctAnswer: 2, difficulty: 'easy' },
              { id: 'c1-u1-s1-e3', type: 'mcq', question: "What is the output of: print(type(3.14))?", options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"], correctAnswer: 1, difficulty: 'medium' },
              { id: 'c1-u1-s1-e4', type: 'mcq', question: "What happens if you try: '5' + 5?", options: ["10", "55", "Error", "None"], correctAnswer: 2, difficulty: 'hard' },
              { id: 'c1-u1-s1-e5', type: 'coding', question: "Create a string variable.", initialCode: "my_text = 'Hello'\nprint(my_text)", expectedOutput: "Hello\n", difficulty: 'easy' },
              { id: 'c1-u1-s1-e6', type: 'coding', question: "Convert an integer to a string.", initialCode: "num = 10\ntext = str(num)\nprint(text + ' is a number')", expectedOutput: "10 is a number\n", difficulty: 'medium' }
            ]
          },
          {
            id: 'c1-u1-s2',
            title: "Variables",
            description: "Assigning and reassigning values",
            exercises: [
              {
                id: 'c1-u1-s2-theory',
                type: 'theory',
                difficulty: 'easy',
                content: `Why This Matters:
Variables help us store and reuse information. Without variables, we would have to rewrite values again and again.

Core Explanation:
A variable is like a labeled box that stores information.

Example:
score = 95

Here, score is the variable name, and 95 is the value stored inside it.

We can change variables:
score = 100

Now the variable stores 100.

Variable Naming Rules:
- Cannot start with a number
- Cannot contain spaces
- Should be meaningful
- Case-sensitive (Score and score are different)

Variables allow programs to become dynamic and flexible.

Common Mistakes:
- Writing variable names with spaces
- Using numbers at the start of a name
- Forgetting that variable names are case-sensitive

Mini Reflection:
Why are meaningful variable names important in large programs?`
              },
              { id: 'c1-u1-s2-e1', type: 'mcq', question: "Which is a valid variable name?", options: ["2cool", "my_var", "my-var", "class"], correctAnswer: 1, difficulty: 'easy' },
              { id: 'c1-u1-s2-e2', type: 'mcq', question: "What is the value of x? x = 5; x = x + 2", options: ["5", "2", "7", "Error"], correctAnswer: 2, difficulty: 'medium' },
              { id: 'c1-u1-s2-e3', type: 'coding', question: "Swap two variables.", initialCode: "a = 5\nb = 10\n# Swap logic here\ntemp = a\na = b\nb = temp\nprint(a, b)", expectedOutput: "10 5\n", difficulty: 'medium' },
              { id: 'c1-u1-s2-e4', type: 'coding', question: "Calculate Marks", initialCode: "math = 90\nscience = 80\ntotal = math + science\nprint(total)", expectedOutput: "170\n", difficulty: 'hard' }
            ]
          },
          {
            id: 'c1-u1-s3',
            title: "Input & Output",
            description: "Interacting with the user",
            exercises: [
              {
                id: 'c1-u1-s3-theory',
                type: 'theory',
                difficulty: 'easy',
                content: `Why This Matters:
Programs become powerful when they interact with users. Input allows users to give information. Output allows the program to respond.

Core Explanation:
The input() function allows the program to ask the user for information.

Example:
name = input("Enter your name: ")

This stores the user's response inside the variable name.

To display output, we use print():

print("Hello", name)

Important:
The input() function always returns a string.

If you want to work with numbers:
age = int(input("Enter your age: "))

Without converting, Python treats it as text.

Common Mistakes:
- Forgetting to convert input to int
- Misplacing parentheses
- Expecting input to behave like a number automatically

Mini Reflection:
Why do you think input() always returns a string instead of a number?`
              },
              { id: 'c1-u1-s3-e1', type: 'mcq', question: "Which function displays text?", options: ["input()", "print()", "show()", "display()"], correctAnswer: 1, difficulty: 'easy' },
              { id: 'c1-u1-s3-e2', type: 'mcq', question: "input() always returns a...", options: ["Integer", "Float", "String", "Boolean"], correctAnswer: 2, difficulty: 'medium' },
              { id: 'c1-u1-s3-e3', type: 'coding', question: "Ask for name and print greeting", initialCode: "name = 'Student'\nprint(f'Hello {name}')", expectedOutput: "Hello Student\n", difficulty: 'medium' },
              { id: 'c1-u1-s3-e4', type: 'coding', question: "Dynamic Response", initialCode: "age = 15\nprint(f'You are {age} years old')", expectedOutput: "You are 15 years old\n", difficulty: 'hard' }
            ]
          }
        ]
      },
      {
        id: 'c1-u2',
        title: "Unit 2: If-Else & Decision Making",
        skills: [
          {
            id: 'c1-u2-s1',
            title: "Boolean Logic",
            description: "True, False, and Operators",
            exercises: [
               { id: 'c1-u2-s1-e1', type: 'mcq', question: "True and False is...", options: ["True", "False", "Error", "None"], correctAnswer: 1, difficulty: 'easy' },
               { id: 'c1-u2-s1-e2', type: 'mcq', question: "5 > 3 or 2 > 4 is...", options: ["True", "False", "Error", "None"], correctAnswer: 0, difficulty: 'medium' }
            ]
          },
          {
            id: 'c1-u2-s2',
            title: "If-Elif-Else",
            description: "Making decisions",
            exercises: [
              { id: 'c1-u2-s2-e1', type: 'coding', question: "Check if number is positive", initialCode: "x = 10\nif x > 0:\n    print('Positive')", expectedOutput: "Positive\n", difficulty: 'medium' }
            ]
          }
        ]
      },
      {
        id: 'c1-u3',
        title: "Unit 3: Functions & Libraries",
        skills: [
          {
            id: 'c1-u3-s1',
            title: "Defining Functions",
            description: "Reusable code blocks",
            exercises: [
              { id: 'c1-u3-s1-e1', type: 'mcq', question: "Keyword to define function?", options: ["func", "def", "define", "function"], correctAnswer: 1, difficulty: 'easy' },
              { id: 'c1-u3-s1-e2', type: 'coding', question: "Create add function", initialCode: "def add(a, b):\n    return a + b\nprint(add(2, 3))", expectedOutput: "5\n", difficulty: 'medium' }
            ]
          }
        ]
      },
      {
        id: 'c1-u4',
        title: "Unit 4: Lists",
        skills: [
          {
             id: 'c1-u4-s1',
             title: "List Basics",
             description: "Creating and Indexing",
             exercises: [
               { id: 'c1-u4-s1-e1', type: 'mcq', question: "Index of first element?", options: ["1", "0", "-1", "None"], correctAnswer: 1, difficulty: 'easy' },
               { id: 'c1-u4-s1-e2', type: 'coding', question: "Get first item", initialCode: "lst = [10, 20, 30]\nprint(lst[0])", expectedOutput: "10\n", difficulty: 'easy' }
             ]
          }
        ]
      },
      {
        id: 'c1-u5',
        title: "Unit 5: Loops",
        skills: [
          {
             id: 'c1-u5-s1',
             title: "For Loops",
             description: "Iterating over sequences",
             exercises: [
               { id: 'c1-u5-s1-e1', type: 'coding', question: "Print 0 to 2", initialCode: "for i in range(3):\n    print(i)", expectedOutput: "0\n1\n2\n", difficulty: 'medium' }
             ]
          }
        ]
      },
      {
        id: 'c1-u6',
        title: "Unit 6: Dictionaries",
        skills: [
          {
             id: 'c1-u6-s1',
             title: "Dictionary Basics",
             description: "Key-Value Pairs",
             exercises: [
               { id: 'c1-u6-s1-e1', type: 'mcq', question: "Which brackets for dict?", options: ["[]", "()", "{}", "<>"], correctAnswer: 2, difficulty: 'easy' },
               { id: 'c1-u6-s1-e2', type: 'coding', question: "Access value", initialCode: "d = {'a': 1}\nprint(d['a'])", expectedOutput: "1\n", difficulty: 'medium' }
             ]
          }
        ]
      },
      {
        id: 'c1-u7',
        title: "Unit 7: Classes",
        skills: [
          {
             id: 'c1-u7-s1',
             title: "Object Oriented Programming",
             description: "Classes and Objects",
             exercises: [
               { id: 'c1-u7-s1-e1', type: 'mcq', question: "Blueprint for objects?", options: ["List", "Class", "Function", "Module"], correctAnswer: 1, difficulty: 'easy' }
             ]
          }
        ]
      },
      {
        id: 'c1-u8',
        title: "Unit 8: Data Analysis",
        skills: [
          {
             id: 'c1-u8-s1',
             title: "Pandas Basics",
             description: "DataFrames and Series",
             exercises: [
               { id: 'c1-u8-s1-e1', type: 'mcq', question: "Library for data frames?", options: ["Numpy", "Pandas", "Math", "Os"], correctAnswer: 1, difficulty: 'easy' }
             ]
          }
        ]
      },
      {
        id: 'c1-u9',
        title: "Unit 9: Data Visualization",
        skills: [
          {
             id: 'c1-u9-s1',
             title: "Plotting",
             description: "Visualizing data",
             exercises: [
               { id: 'c1-u9-s1-e1', type: 'mcq', question: "Library for plotting?", options: ["Matplotlib", "Pandas", "Requests", "Json"], correctAnswer: 0, difficulty: 'easy' }
             ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: "Artificial Intelligence: Methods and Applications",
    description: "Deep dive into neural networks, NLP, and computer vision techniques.",
    duration: "120 Hours",
    level: 'advanced',
    units: [
      {
        id: 'c2-u1',
        title: "Unit 1: State of AI Today",
        skills: [
          {
            id: 'c2-u1-s1',
            title: "What is AI",
            description: "Overview of AI landscape",
            exercises: [
              { id: 'c2-u1-s1-e1', type: 'mcq', question: "AI that generates content?", options: ["Discriminative", "Generative", "Rule-based", "None"], correctAnswer: 1, difficulty: 'easy' }
            ]
          }
        ]
      },
      {
        id: 'c2-u2',
        title: "Unit 2: Data for AI",
        skills: [
          {
            id: 'c2-u2-s1',
            title: "Data Cleaning",
            description: "Preparing data for models",
            exercises: [
              { id: 'c2-u2-s1-e1', type: 'mcq', question: "Removing missing values is part of...", options: ["Training", "Cleaning", "Deploying", "Testing"], correctAnswer: 1, difficulty: 'easy' }
            ]
          }
        ]
      },
      {
        id: 'c2-u3',
        title: "Unit 3: AI Approaches",
        skills: [
          {
            id: 'c2-u3-s1',
            title: "Machine Learning Types",
            description: "Supervised vs Unsupervised",
            exercises: [
              { id: 'c2-u3-s1-e1', type: 'mcq', question: "Labeled data is used in...", options: ["Supervised", "Unsupervised", "Reinforcement", "None"], correctAnswer: 0, difficulty: 'medium' }
            ]
          }
        ]
      },
      {
        id: 'c2-u4',
        title: "Unit 4: Neural Networks",
        skills: [
          {
            id: 'c2-u4-s1',
            title: "NN Basics",
            description: "Neurons and Layers",
            exercises: [
              { id: 'c2-u4-s1-e1', type: 'mcq', question: "Basic unit of NN?", options: ["Pixel", "Neuron", "Kernel", "Filter"], correctAnswer: 1, difficulty: 'easy' }
            ]
          }
        ]
      },
      {
        id: 'c2-u5',
        title: "Unit 5: NLP",
        skills: [
          {
            id: 'c2-u5-s1',
            title: "Text Representation",
            description: "Embeddings and Tokens",
            exercises: [
              { id: 'c2-u5-s1-e1', type: 'mcq', question: "Converting text to numbers?", options: ["Tokenization", "Encryption", "Compression", "Parsing"], correctAnswer: 0, difficulty: 'medium' }
            ]
          }
        ]
      },
      {
        id: 'c2-u6',
        title: "Unit 6: Computer Vision",
        skills: [
          {
            id: 'c2-u6-s1',
            title: "CNNs",
            description: "Convolutional Neural Networks",
            exercises: [
              { id: 'c2-u6-s1-e1', type: 'mcq', question: "Best for image processing?", options: ["RNN", "CNN", "Transformer", "Linear Regression"], correctAnswer: 1, difficulty: 'medium' }
            ]
          }
        ]
      },
      {
        id: 'c2-u7',
        title: "Unit 7: AI in Practice",
        skills: [
          {
            id: 'c2-u7-s1',
            title: "Deployment",
            description: "AI in the real world",
            exercises: [
              { id: 'c2-u7-s1-e1', type: 'mcq', question: "Phase after training?", options: ["Cleaning", "Deployment", "Design", "None"], correctAnswer: 1, difficulty: 'easy' }
            ]
          }
        ]
      }
    ]
  }
];

export const EVALUATION_MCQS = [
  {
    question: "What is the correct file extension for Python files?",
    options: [".pyt", ".pt", ".py", ".ptr"],
    correct: 2
  },
  {
    question: "Which of the following is used to define a function in Python?",
    options: ["function", "def", "fun", "define"],
    correct: 1
  },
  {
    question: "What is the output of print(2 ** 3)?",
    options: ["6", "8", "9", "5"],
    correct: 1
  },
  {
    question: "Which data type is used to store text?",
    options: ["int", "float", "str", "bool"],
    correct: 2
  },
  {
    question: "How do you start a comment in Python?",
    options: ["//", "/*", "#", "<!--"],
    correct: 2
  }
];

export const EVALUATION_CODING = [
  {
    title: "Hello World",
    description: "Write a program that prints 'Hello, World!' to the console.",
    initialCode: "# Write your code here\n",
    expectedOutput: "Hello, World!\n"
  },
  {
    title: "Sum of Two Numbers",
    description: "Calculate the sum of 5 and 7 and print the result.",
    initialCode: "a = 5\nb = 7\n# Calculate sum and print it\n",
    expectedOutput: "12\n"
  }
];
