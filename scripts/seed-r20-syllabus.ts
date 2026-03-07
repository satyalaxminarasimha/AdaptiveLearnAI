/**
 * R20 Syllabus Seed Script for CSE (AI&ML)
 * ANITS (Anil Neerukonda Institute of Technology and Sciences)
 * 
 * Uses ACTUAL CSM course codes from the official R20 curriculum
 * Batch format uses just the starting year (e.g., "2022") to match student records
 * 
 * Usage: npx ts-node scripts/seed-r20-syllabus.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Syllabus Schema (inline for script)
const TopicCompletionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed'], 
    default: 'not-started' 
  },
  isCompleted: { type: Boolean, default: false },
  completedDate: { type: Date },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { _id: false });

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  credits: { type: Number },
  category: { type: String },
  topics: [TopicCompletionSchema],
  units: { type: Number },
  totalTopics: { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  inProgressTopics: { type: Number, default: 0 },
  textbooks: [{ type: String }],
  references: [{ type: String }],
  courseObjectives: [{ type: String }],
  courseOutcomes: [{ type: String }],
});

const SyllabusSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, required: true },
  section: { type: String, required: true },
  program: { type: String, default: 'CSE(AI&ML)' },
  regulation: { type: String, default: 'R20' },
  subjects: [SubjectSchema],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const Syllabus = mongoose.models.Syllabus || mongoose.model('Syllabus', SyllabusSchema);

// Helper: create topic array from strings
const t = (topics: string[]) => topics.map(topic => ({ topic, status: 'not-started' as const }));

// ================================================================
// R20 CSE(AI&ML) CURRICULUM — OFFICIAL CSM CODES
// ================================================================
const r20Curriculum = {
  // ============================================
  // YEAR 1 SEMESTER 1
  // ============================================
  'Y1S1': {
    year: '1',
    semester: '1',
    subjects: [
      {
        name: 'Engineering Mathematics - I',
        code: 'CSM111',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Matrices - Types, Rank, Echelon Form',
          'UNIT I: System of Linear Equations - Consistency',
          'UNIT I: Gauss Elimination and Jordan Method',
          'UNIT I: Eigenvalues, Eigenvectors, Cayley-Hamilton',
          'UNIT I: Diagonalization of Matrices',
          'UNIT II: Mean Value Theorems - Rolle, Lagrange, Cauchy',
          'UNIT II: Taylor and Maclaurin Series',
          'UNIT II: Indeterminate Forms, Curvature',
          'UNIT III: Partial Derivatives, Total Derivatives',
          'UNIT III: Euler Theorem, Jacobians',
          'UNIT III: Maxima and Minima, Lagrange Multipliers',
          'UNIT IV: Double and Triple Integrals',
          'UNIT IV: Change of Order, Polar Coordinates',
          'UNIT IV: Applications - Area, Volume',
          'UNIT V: Beta and Gamma Functions',
          'UNIT V: Properties and Applications',
        ]),
      },
      {
        name: 'Communicative English',
        code: 'CSM112',
        credits: 3,
        category: 'HS',
        units: 5,
        topics: t([
          'UNIT I: Vocabulary Building',
          'UNIT I: Synonyms, Antonyms, One Word Substitutes',
          'UNIT II: Grammar - Parts of Speech, Tenses',
          'UNIT II: Active/Passive Voice, Direct/Indirect Speech',
          'UNIT III: Reading Comprehension Techniques',
          'UNIT IV: Writing - Paragraph, Essay, Letter, Report',
          'UNIT V: Communication Skills - Verbal, Non-verbal',
          'UNIT V: Presentation, Group Discussion, Interview',
        ]),
      },
      {
        name: 'Basic Electronics',
        code: 'CSM113',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Semiconductors, PN Junction Diode',
          'UNIT I: Rectifiers - Half Wave, Full Wave, Bridge',
          'UNIT I: Zener Diode, Voltage Regulation',
          'UNIT II: BJT - Construction, Configurations, Biasing',
          'UNIT II: FET and MOSFET',
          'UNIT III: Amplifiers - CE, Frequency Response',
          'UNIT III: Power Amplifiers',
          'UNIT IV: Op-Amp - Inverting, Non-Inverting, Summing',
          'UNIT IV: Differentiator, Integrator, Comparator',
          'UNIT V: Number Systems, Logic Gates, Boolean Algebra',
          'UNIT V: Flip-Flops, Counters, Registers',
        ]),
      },
      {
        name: 'Digital Logic Design',
        code: 'CSM114',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Number Systems and Conversions',
          'UNIT I: Binary Arithmetic, Codes',
          'UNIT II: Boolean Algebra, Logic Gates',
          'UNIT II: K-Maps, SOP/POS',
          'UNIT III: Combinational Circuits - Adder, MUX, Decoder',
          'UNIT IV: Sequential Circuits - Flip-Flops, Registers, Counters',
          'UNIT V: Memory - RAM, ROM, PLA, PAL',
        ]),
      },
      {
        name: 'Problem Solving with C',
        code: 'CSM115',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Introduction to Programming, Algorithms',
          'UNIT I: C Program Structure, Data Types, Operators',
          'UNIT II: Decision Making and Loops',
          'UNIT III: Functions, Recursion, Storage Classes',
          'UNIT III: Arrays - 1D, 2D, Multi-dimensional',
          'UNIT IV: Pointers, Dynamic Memory Allocation, Strings',
          'UNIT V: Structures, Unions, File Handling',
        ]),
      },
      {
        name: 'English Language Lab',
        code: 'CSM116',
        credits: 1.5,
        category: 'HS',
        units: 3,
        topics: t([
          'Lab: Phonetics and Pronunciation',
          'Lab: Listening Comprehension',
          'Lab: Group Discussion and Role Play',
        ]),
      },
      {
        name: 'Problem Solving with C Lab',
        code: 'CSM117',
        credits: 1.5,
        category: 'ES',
        units: 3,
        topics: t([
          'Lab: Basic C - I/O, Operators, Control Flow',
          'Lab: Functions, Arrays, Strings',
          'Lab: Pointers, Structures, Files',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 1 SEMESTER 2
  // ============================================
  'Y1S2': {
    year: '1',
    semester: '2',
    subjects: [
      {
        name: 'Engineering Mathematics - II',
        code: 'CSM121',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: ODEs - Variable Separable, Homogeneous, Linear',
          'UNIT I: Bernoulli, Exact Equations',
          'UNIT II: Higher Order ODEs, Variation of Parameters',
          'UNIT III: Laplace Transforms and Applications',
          'UNIT IV: Vector Calculus - Gradient, Divergence, Curl',
          'UNIT IV: Green, Stokes, Gauss Theorems',
          'UNIT V: Complex Analysis - Analytic Functions',
        ]),
      },
      {
        name: 'Engineering Physics',
        code: 'CSM122',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Interference and Diffraction',
          'UNIT II: Lasers and Fiber Optics',
          'UNIT III: Quantum Mechanics - Schrodinger Equation',
          'UNIT IV: Electromagnetic Theory',
          'UNIT V: Superconductivity and Nanomaterials',
        ]),
      },
      {
        name: 'Engineering Chemistry',
        code: 'CSM123',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Water Technology',
          'UNIT II: Electrochemistry and Corrosion',
          'UNIT III: Polymers',
          'UNIT IV: Engineering Materials',
          'UNIT V: Spectroscopy',
        ]),
      },
      {
        name: 'Elements of Electrical Engineering',
        code: 'CSM124',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: DC Circuits',
          'UNIT II: AC Circuits',
          'UNIT III: Transformers',
          'UNIT IV: DC Machines',
          'UNIT V: AC Machines',
        ]),
      },
      {
        name: 'Engineering Drawing',
        code: 'CSM125',
        credits: 3.5,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Scales and Curves',
          'UNIT II: Projection of Points and Lines',
          'UNIT III: Projection of Planes',
          'UNIT IV: Projection of Solids',
          'UNIT V: Sections and Isometric Views',
        ]),
      },
      {
        name: 'Engineering Physics Lab',
        code: 'CSM126',
        credits: 1.5,
        category: 'BS',
        units: 2,
        topics: t([
          'Lab: Optics Experiments',
          'Lab: Laser and Fiber Optics',
        ]),
      },
      {
        name: 'Engineering Chemistry Lab',
        code: 'CSM127',
        credits: 1.5,
        category: 'BS',
        units: 2,
        topics: t([
          'Lab: Water Analysis',
          'Lab: Electrochemistry',
        ]),
      },
      {
        name: 'Engineering Workshop',
        code: 'CSM128',
        credits: 1.5,
        category: 'ES',
        units: 2,
        topics: t([
          'Workshop: Carpentry, Fitting, Welding',
          'Workshop: Sheet Metal, House Wiring',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 2 SEMESTER 1
  // ============================================
  'Y2S1': {
    year: '2',
    semester: '1',
    subjects: [
      {
        name: 'Data Structures & Algorithms',
        code: 'CSM211',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Arrays, Linked Lists (Singly, Doubly, Circular)',
          'UNIT II: Stacks and Queues (Array, Linked, Circular, Priority)',
          'UNIT III: Trees - Binary Trees, BST, AVL, B-Trees, Heaps',
          'UNIT IV: Graphs - BFS, DFS, MST (Kruskal, Prim), Shortest Path',
          'UNIT V: Sorting (Bubble, Selection, Insertion, Merge, Quick, Heap)',
          'UNIT V: Searching (Linear, Binary, Hashing)',
        ]),
      },
      {
        name: 'Computer Organization and Microprocessors',
        code: 'CSM212',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Computer Organization - Basic Structure, Bus, ALU',
          'UNIT II: CPU Design - Instruction Formats, Addressing, Pipeline',
          'UNIT III: Memory Hierarchy - Cache, Virtual Memory',
          'UNIT IV: 8086 Architecture and Assembly Programming',
          'UNIT V: I/O Organization - Interrupts, DMA, 8255/8259',
        ]),
      },
      {
        name: 'Java Programming',
        code: 'CSM213',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: OOP - Classes, Objects, Encapsulation, Inheritance, Polymorphism',
          'UNIT II: Packages, Interfaces, Exception Handling',
          'UNIT III: Multithreading, IO Streams',
          'UNIT IV: Collections Framework, Generics',
          'UNIT V: JDBC, Servlets, Event Handling',
        ]),
      },
      {
        name: 'Data Communication and Computer Networks',
        code: 'CSM214',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: OSI and TCP/IP Models, Transmission Media',
          'UNIT II: Data Link Layer - Framing, Error Detection, MAC',
          'UNIT III: Network Layer - IP Addressing, Subnetting, Routing',
          'UNIT IV: Transport Layer - TCP, UDP, Congestion Control',
          'UNIT V: Application Layer - HTTP, DNS, FTP, Email',
        ]),
      },
      {
        name: 'Discrete Mathematical Structures',
        code: 'CSM215',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Propositional and Predicate Logic',
          'UNIT II: Sets, Relations, Functions',
          'UNIT III: Counting - Permutations, Combinations, Recurrence',
          'UNIT IV: Graph Theory - Eulerian, Hamiltonian, Coloring',
          'UNIT V: Algebraic Structures - Groups, Rings, Lattices',
        ]),
      },
      {
        name: 'Design Thinking & Product Innovation',
        code: 'CSM216',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Introduction to Design Thinking',
          'UNIT II: Empathize and Define',
          'UNIT III: Ideation',
          'UNIT IV: Prototyping and Testing',
          'UNIT V: Product Innovation',
        ]),
      },
      {
        name: 'Java Programming Lab',
        code: 'CSM217',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: OOP, Inheritance, Polymorphism',
          'Lab: Exception Handling, Collections',
          'Lab: Multithreading, IO, JDBC',
        ]),
      },
      {
        name: 'Data Structures Lab using C',
        code: 'CSM218',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Linked Lists, Stacks, Queues',
          'Lab: Trees, Graphs',
          'Lab: Sorting and Searching',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 2 SEMESTER 2
  // ============================================
  'Y2S2': {
    year: '2',
    semester: '2',
    subjects: [
      {
        name: 'Probability, Statistics and Queuing Theory',
        code: 'CSM221',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Probability - Axioms, Conditional, Bayes Theorem',
          'UNIT II: Random Variables and Distributions',
          'UNIT III: Sampling and Estimation',
          'UNIT IV: Hypothesis Testing',
          'UNIT V: Queuing Theory - M/M/1, M/M/c',
        ]),
      },
      {
        name: 'Artificial Intelligence',
        code: 'CSM222',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: AI Introduction - Agents, PEAS',
          'UNIT II: Search - BFS, DFS, A*, Game Playing',
          'UNIT III: Knowledge Representation - Logic, Resolution',
          'UNIT IV: Planning, Probabilistic Reasoning',
          'UNIT V: ML Basics, NLP Fundamentals',
        ]),
      },
      {
        name: 'Operating Systems',
        code: 'CSM223',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: OS Introduction, Process Concept',
          'UNIT II: CPU Scheduling, Process Synchronization',
          'UNIT III: Deadlocks - Prevention, Avoidance, Detection',
          'UNIT IV: Memory Management - Paging, Segmentation, Virtual Memory',
          'UNIT V: File Systems, Disk Scheduling',
        ]),
      },
      {
        name: 'Python Programming',
        code: 'CSM224',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Python Basics - Variables, Control Flow',
          'UNIT II: Functions, Modules, Packages',
          'UNIT III: OOP in Python, Exception Handling',
          'UNIT IV: File Handling, NumPy, Pandas',
          'UNIT V: Matplotlib, Web Scraping, GUI',
        ]),
      },
      {
        name: 'Theory of Computation and Compilers',
        code: 'CSM225',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Finite Automata - DFA, NFA',
          'UNIT II: CFG, Parse Trees, PDA',
          'UNIT III: Turing Machines, Decidability',
          'UNIT IV: Lexical and Syntax Analysis',
          'UNIT V: Intermediate Code, Optimization, Code Gen',
        ]),
      },
      {
        name: 'Design & Analysis of Algorithms',
        code: 'CSM226',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Algorithm Analysis - Complexity, Asymptotic Notation',
          'UNIT II: Divide and Conquer - Merge Sort, Quick Sort',
          'UNIT III: Greedy - Knapsack, Job Sequencing, Huffman',
          'UNIT IV: Dynamic Programming - LCS, 0/1 Knapsack, MCM',
          'UNIT V: Backtracking, Branch & Bound, NP-Completeness',
        ]),
      },
      {
        name: 'Python Programming Lab',
        code: 'CSM227',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Python Basics, Functions, OOP',
          'Lab: File Handling, Exception Handling',
          'Lab: NumPy, Pandas, Matplotlib',
        ]),
      },
      {
        name: 'Microprocessor Interfacing Lab',
        code: 'CSM228',
        credits: 1.5,
        category: 'PC',
        units: 2,
        topics: t([
          'Lab: 8086 Assembly Programs',
          'Lab: Interfacing - 8255, 8259',
        ]),
      },
      {
        name: 'Operating System Lab',
        code: 'CSM229',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Process Scheduling Algorithms',
          'Lab: Memory Management Simulations',
          'Lab: File System and Disk Scheduling',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 3 SEMESTER 1
  // ============================================
  'Y3S1': {
    year: '3',
    semester: '1',
    subjects: [
      {
        name: 'Open Elective - I (Block Chain)',
        code: 'CSM311',
        credits: 3,
        category: 'OE',
        units: 5,
        topics: t([
          'UNIT I: Blockchain Fundamentals - Distributed Ledger',
          'UNIT II: Cryptographic Hash Functions, Merkle Trees',
          'UNIT III: Consensus Mechanisms - PoW, PoS',
          'UNIT IV: Smart Contracts - Ethereum, Solidity',
          'UNIT V: Blockchain Applications and Use Cases',
        ]),
      },
      {
        name: 'Professional Elective - I',
        code: 'CSM312',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Professional Elective I - Topic 1',
          'UNIT II: Professional Elective I - Topic 2',
          'UNIT III: Professional Elective I - Topic 3',
          'UNIT IV: Professional Elective I - Topic 4',
          'UNIT V: Professional Elective I - Topic 5',
        ]),
      },
      {
        name: 'Machine Learning',
        code: 'CSM313',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: ML Introduction, Feature Engineering',
          'UNIT II: Regression, Decision Trees',
          'UNIT III: SVM, KNN, Naive Bayes, Ensemble Methods',
          'UNIT IV: Unsupervised - K-Means, PCA',
          'UNIT V: Model Evaluation, Regularization',
        ]),
      },
      {
        name: 'Competitive Programming',
        code: 'CSM314',
        credits: 3,
        category: 'SOC',
        units: 5,
        topics: t([
          'UNIT I: Problem Solving Strategies',
          'UNIT II: Data Structures for CP',
          'UNIT III: Graph Algorithms, DP',
          'UNIT IV: Number Theory, Combinatorics',
          'UNIT V: Segment Trees, Tries',
        ]),
      },
      {
        name: 'Database Management Systems',
        code: 'CSM315',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: DBMS - ER Model, Relational Model',
          'UNIT II: SQL - DDL, DML, Joins, Subqueries',
          'UNIT III: Normalization - 1NF, 2NF, 3NF, BCNF',
          'UNIT IV: Transactions - ACID, Concurrency Control',
          'UNIT V: Indexing, Hashing, NoSQL Overview',
        ]),
      },
      {
        name: 'Machine Learning Lab',
        code: 'CSM316',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Data Preprocessing, Visualization',
          'Lab: Regression, Classification Models',
          'Lab: Clustering, PCA, Model Evaluation',
        ]),
      },
      {
        name: 'Database Management Systems Lab',
        code: 'CSM317',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: SQL Queries',
          'Lab: PL/SQL - Cursors, Triggers',
          'Lab: Normalization, ER Modeling',
        ]),
      },
      {
        name: 'Competitive Programming Lab',
        code: 'CSM318',
        credits: 1.5,
        category: 'SOC',
        units: 3,
        topics: t([
          'Lab: Online Judge Problem Solving',
          'Lab: Contest Participation',
        ]),
      },
      {
        name: 'QA-I & Soft Skills',
        code: 'CSM319',
        credits: 1.5,
        category: 'HS',
        units: 3,
        topics: t([
          'Quantitative Aptitude',
          'Logical Reasoning',
          'Soft Skills',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 3 SEMESTER 2
  // ============================================
  'Y3S2': {
    year: '3',
    semester: '2',
    subjects: [
      {
        name: 'Open Elective - II',
        code: 'CSM321',
        credits: 3,
        category: 'OE',
        units: 5,
        topics: t([
          'UNIT I: Open Elective II - Topic 1',
          'UNIT II: Open Elective II - Topic 2',
          'UNIT III: Open Elective II - Topic 3',
          'UNIT IV: Open Elective II - Topic 4',
          'UNIT V: Open Elective II - Topic 5',
        ]),
      },
      {
        name: 'Professional Elective - II',
        code: 'CSM322',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Professional Elective II - Topic 1',
          'UNIT II: Professional Elective II - Topic 2',
          'UNIT III: Professional Elective II - Topic 3',
          'UNIT IV: Professional Elective II - Topic 4',
          'UNIT V: Professional Elective II - Topic 5',
        ]),
      },
      {
        name: 'Professional Elective - III',
        code: 'CSM323',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Professional Elective III - Topic 1',
          'UNIT II: Professional Elective III - Topic 2',
          'UNIT III: Professional Elective III - Topic 3',
          'UNIT IV: Professional Elective III - Topic 4',
          'UNIT V: Professional Elective III - Topic 5',
        ]),
      },
      {
        name: 'Object Oriented Software Engineering',
        code: 'CSM324',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: SE Process Models',
          'UNIT II: Requirements, Use Cases',
          'UNIT III: OO Design, UML',
          'UNIT IV: Testing',
          'UNIT V: Project Management, Agile',
        ]),
      },
      {
        name: 'Web Technologies',
        code: 'CSM325',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: HTML5, CSS3, Responsive Design',
          'UNIT II: JavaScript, DOM Manipulation',
          'UNIT III: Node.js, Express.js',
          'UNIT IV: React.js / Angular',
          'UNIT V: RESTful APIs, Database Integration',
        ]),
      },
      {
        name: 'Deep Learning',
        code: 'CSM326',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Neural Networks, Backpropagation',
          'UNIT II: CNNs - Convolution, Pooling, Architectures',
          'UNIT III: RNNs - LSTM, GRU, Sequence Models',
          'UNIT IV: Generative Models - Autoencoders, GANs',
          'UNIT V: Transfer Learning, Transformers',
        ]),
      },
      {
        name: 'Web Technologies Lab',
        code: 'CSM327',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: HTML/CSS/JS Web Pages',
          'Lab: Node.js Server and API',
          'Lab: Full Stack Application',
        ]),
      },
      {
        name: 'Deep Learning Lab',
        code: 'CSM328',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Neural Networks with TensorFlow/Keras',
          'Lab: CNN for Image Classification',
          'Lab: RNN/LSTM for Text Processing',
        ]),
      },
      {
        name: 'QA-II & Verbal Ability',
        code: 'CSM329',
        credits: 1.5,
        category: 'HS',
        units: 3,
        topics: t([
          'Quantitative Aptitude - Advanced',
          'Verbal Ability',
          'Placement Preparation',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 4 SEMESTER 1
  // ============================================
  'Y4S1': {
    year: '4',
    semester: '1',
    subjects: [
      {
        name: 'Open Elective - III (React JS)',
        code: 'CSM411',
        credits: 3,
        category: 'OE',
        units: 5,
        topics: t([
          'UNIT I: React Fundamentals - JSX, Components, Props',
          'UNIT II: State Management - Hooks, Context API',
          'UNIT III: React Router, Navigation',
          'UNIT IV: API Integration, Axios, Fetch',
          'UNIT V: Testing, Deployment, Performance',
        ]),
      },
      {
        name: 'Professional Elective - IV',
        code: 'CSM412',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Professional Elective IV - Topic 1',
          'UNIT II: Professional Elective IV - Topic 2',
          'UNIT III: Professional Elective IV - Topic 3',
          'UNIT IV: Professional Elective IV - Topic 4',
          'UNIT V: Professional Elective IV - Topic 5',
        ]),
      },
      {
        name: 'Professional Elective - V / MOOC',
        code: 'CSM413',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: MOOC / PE-V - Topic 1',
          'UNIT II: MOOC / PE-V - Topic 2',
          'UNIT III: MOOC / PE-V - Topic 3',
          'UNIT IV: MOOC / PE-V - Topic 4',
          'UNIT V: MOOC / PE-V - Topic 5',
        ]),
      },
      {
        name: 'Introduction to Intelligent Systems',
        code: 'CSM414',
        credits: 3,
        category: 'HS',
        units: 5,
        topics: t([
          'UNIT I: Intelligent Systems Overview',
          'UNIT II: Expert Systems',
          'UNIT III: Fuzzy Logic',
          'UNIT IV: Genetic Algorithms',
          'UNIT V: Hybrid Intelligent Systems',
        ]),
      },
      {
        name: 'Artificial Intelligence in Robotics',
        code: 'CSM415',
        credits: 3,
        category: 'SOC',
        units: 5,
        topics: t([
          'UNIT I: Robotics Fundamentals',
          'UNIT II: Robot Kinematics and Dynamics',
          'UNIT III: Robot Perception',
          'UNIT IV: Motion Planning and Navigation',
          'UNIT V: AI in Autonomous Systems',
        ]),
      },
      {
        name: 'OOSE Lab',
        code: 'CSM416',
        credits: 1.5,
        category: 'PC',
        units: 2,
        topics: t([
          'Lab: UML Diagrams',
          'Lab: Testing and Documentation',
        ]),
      },
      {
        name: 'AI in Robotics Lab',
        code: 'CSM417',
        credits: 1.5,
        category: 'SOC',
        units: 2,
        topics: t([
          'Lab: Robot Simulation',
          'Lab: Vision and Navigation',
        ]),
      },
      {
        name: 'Project Phase 1',
        code: 'CSM418',
        credits: 2,
        category: 'PR',
        units: 1,
        topics: t([
          'Phase 1: Problem Identification and Literature Survey',
          'Phase 1: System Design and Partial Implementation',
        ]),
      },
    ],
  },

  // ============================================
  // YEAR 4 SEMESTER 2
  // ============================================
  'Y4S2': {
    year: '4',
    semester: '2',
    subjects: [
      {
        name: 'Open Elective - IV',
        code: 'CSM421',
        credits: 3,
        category: 'OE',
        units: 4,
        topics: t([
          'UNIT I: Open Elective IV - Fundamentals',
          'UNIT II: Open Elective IV - Core Concepts',
          'UNIT III: Open Elective IV - Applications',
          'UNIT IV: Open Elective IV - Advanced Topics',
        ]),
      },
      {
        name: 'Project Phase 2 / Internship',
        code: 'CSM423',
        credits: 8,
        category: 'PR',
        units: 1,
        topics: t([
          'Project: Implementation and Testing',
          'Project: Documentation and Report',
          'Industry Internship',
          'Project: Presentation and Viva',
        ]),
      },
    ],
  },
};

// ================================================================
// SEEDING CONFIGURATION
// ================================================================
const sections = ['A', 'B', 'C', 'D'];

// All active batches — matches student registration year format
const batchYears = ['2022', '2023', '2024', '2025'];

// Map batch → which semesters they have completed or are currently in
const batchToYearSemesters: Record<string, string[]> = {
  '2022': ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'],
  '2023': ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2'],
  '2024': ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2'],
  '2025': ['Y1S1', 'Y1S2'],
};

async function seedR20Syllabus() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String,
    }));

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating system user...');
      adminUser = await User.create({ email: 'system@anits.edu.in', role: 'admin' });
    }

    // Remove old records with wrong batch format (e.g., "2022 - 2023")
    const deleteResult = await Syllabus.deleteMany({ batch: { $regex: / - / } });
    if (deleteResult.deletedCount > 0) {
      console.log(`Deleted ${deleteResult.deletedCount} old records with wrong batch format`);
    }

    let created = 0;
    let updated = 0;

    for (const batch of batchYears) {
      const semesterKeys = batchToYearSemesters[batch] || [];

      for (const semKey of semesterKeys) {
        const semesterData = r20Curriculum[semKey as keyof typeof r20Curriculum];
        if (!semesterData) continue;

        for (const section of sections) {
          const syllabusData = {
            year: semesterData.year,
            semester: semesterData.semester,
            batch,
            section,
            program: 'CSE(AI&ML)',
            regulation: 'R20',
            subjects: semesterData.subjects.map(subject => ({
              ...subject,
              totalTopics: subject.topics.length,
              completedTopics: 0,
              inProgressTopics: 0,
            })),
            updatedBy: adminUser._id,
            lastUpdated: new Date(),
          };

          const existing = await Syllabus.findOne({
            year: syllabusData.year,
            semester: syllabusData.semester,
            batch: syllabusData.batch,
            section: syllabusData.section,
          });

          if (existing) {
            await Syllabus.updateOne({ _id: existing._id }, { $set: syllabusData });
            updated++;
          } else {
            await Syllabus.create(syllabusData);
            created++;
          }

          console.log(`${existing ? 'Updated' : 'Created'}: Y${syllabusData.year}S${syllabusData.semester} Batch:${batch} Sec:${section}`);
        }
      }
    }

    console.log(`\nSyllabus seeding completed!`);
    console.log(`  Created: ${created} records`);
    console.log(`  Updated: ${updated} records`);
    console.log(`  Total: ${created + updated} records`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding syllabus:', error);
    process.exit(1);
  }
}

seedR20Syllabus();
