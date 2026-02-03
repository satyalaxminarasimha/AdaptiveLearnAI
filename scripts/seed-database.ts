/**
 * Comprehensive Database Seed Script
 * 
 * This script populates the database with:
 * - Sample professors with their class assignments
 * - Sample students with their batch/section info
 * - Complete B.Tech CS/IT syllabus for multiple semesters
 * 
 * Usage: npx tsx scripts/seed-database.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Syllabus from '../src/models/Syllabus';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// ============================================
// SYLLABUS DATA - B.Tech Computer Science
// ============================================

const syllabusData = {
  // 1st Year - 1st Semester
  '1-1': {
    year: '1',
    semester: '1',
    subjects: [
      {
        name: 'Mathematics - I',
        units: 5,
        topics: [
          // Unit 1: Differential Calculus
          'Rolle\'s Theorem and Mean Value Theorems',
          'Taylor\'s and Maclaurin\'s Series',
          'Partial Differentiation',
          'Euler\'s Theorem on Homogeneous Functions',
          'Total Derivatives and Chain Rule',
          // Unit 2: Integral Calculus
          'Reduction Formulae',
          'Beta and Gamma Functions',
          'Multiple Integrals - Double Integration',
          'Triple Integration',
          'Change of Order of Integration',
          // Unit 3: Vector Calculus
          'Scalar and Vector Point Functions',
          'Gradient, Divergence and Curl',
          'Line Integrals',
          'Surface Integrals',
          'Green\'s Theorem, Stokes\' Theorem, Gauss Divergence Theorem',
          // Unit 4: Differential Equations
          'First Order Differential Equations',
          'Higher Order Linear Differential Equations',
          'Method of Variation of Parameters',
          'Cauchy\'s and Legendre\'s Linear Equations',
          'Simultaneous Differential Equations',
          // Unit 5: Laplace Transforms
          'Laplace Transform - Definition and Properties',
          'Laplace Transform of Standard Functions',
          'Inverse Laplace Transforms',
          'Convolution Theorem',
          'Applications to Differential Equations'
        ]
      },
      {
        name: 'Physics',
        units: 5,
        topics: [
          // Unit 1: Wave Optics
          'Interference - Young\'s Double Slit Experiment',
          'Newton\'s Rings',
          'Michelson Interferometer',
          'Diffraction - Fresnel and Fraunhofer',
          'Single Slit and Double Slit Diffraction',
          // Unit 2: Lasers and Fiber Optics
          'Laser Principles - Spontaneous and Stimulated Emission',
          'Population Inversion',
          'Types of Lasers - He-Ne, Ruby, Semiconductor',
          'Optical Fiber - Principle and Types',
          'Numerical Aperture and Applications',
          // Unit 3: Quantum Mechanics
          'Wave-Particle Duality',
          'de Broglie Hypothesis',
          'Heisenberg Uncertainty Principle',
          'Schrödinger Wave Equation',
          'Particle in a Box',
          // Unit 4: Semiconductor Physics
          'Band Theory of Solids',
          'Intrinsic and Extrinsic Semiconductors',
          'P-N Junction Diode',
          'Hall Effect',
          'Superconductivity - BCS Theory',
          // Unit 5: Electromagnetism
          'Maxwell\'s Equations',
          'Electromagnetic Wave Propagation',
          'Poynting Vector',
          'Electromagnetic Spectrum',
          'Applications of EM Waves'
        ]
      },
      {
        name: 'Programming in C',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'History and Features of C',
          'Structure of C Program',
          'Data Types and Variables',
          'Operators and Expressions',
          'Input/Output Functions',
          // Unit 2: Control Structures
          'Decision Making - if, if-else, nested if',
          'Switch Statement',
          'Loops - while, do-while, for',
          'Break and Continue Statements',
          'Nested Loops',
          // Unit 3: Functions
          'Function Declaration and Definition',
          'Parameter Passing - Call by Value and Reference',
          'Recursion',
          'Storage Classes',
          'Scope and Lifetime of Variables',
          // Unit 4: Arrays and Strings
          'One-dimensional Arrays',
          'Two-dimensional Arrays',
          'String Handling Functions',
          'Array of Strings',
          'Pointers and Arrays',
          // Unit 5: Pointers and Structures
          'Pointer Basics',
          'Pointer Arithmetic',
          'Dynamic Memory Allocation',
          'Structures and Unions',
          'File Handling in C'
        ]
      },
      {
        name: 'English Communication',
        units: 4,
        topics: [
          // Unit 1: Grammar
          'Parts of Speech',
          'Tenses',
          'Active and Passive Voice',
          'Direct and Indirect Speech',
          'Subject-Verb Agreement',
          // Unit 2: Vocabulary
          'Word Formation',
          'Synonyms and Antonyms',
          'One Word Substitutions',
          'Idioms and Phrases',
          'Common Errors in English',
          // Unit 3: Writing Skills
          'Paragraph Writing',
          'Essay Writing',
          'Letter Writing - Formal and Informal',
          'Report Writing',
          'Email Writing',
          // Unit 4: Communication Skills
          'Presentation Skills',
          'Group Discussion',
          'Interview Skills',
          'Non-verbal Communication',
          'Listening Skills'
        ]
      },
      {
        name: 'Engineering Drawing',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Drawing Instruments and Their Uses',
          'Lettering and Numbering',
          'Dimensioning Techniques',
          'Scales - Plain, Diagonal, Vernier',
          'Geometric Constructions',
          // Unit 2: Projections
          'Orthographic Projections',
          'Projection of Points',
          'Projection of Lines',
          'True Length and Inclinations',
          'Traces of Lines',
          // Unit 3: Projection of Planes
          'Projection of Planes - Regular Polygons',
          'Planes Inclined to One Plane',
          'Planes Inclined to Both Planes',
          'Auxiliary Planes',
          'Applications',
          // Unit 4: Projection of Solids
          'Projection of Prisms and Pyramids',
          'Projection of Cylinders and Cones',
          'Axis Inclined to HP',
          'Axis Inclined to VP',
          'Axis Inclined to Both Planes',
          // Unit 5: Isometric Projections
          'Isometric Scale',
          'Isometric Projections of Planes',
          'Isometric Projections of Solids',
          'Combination of Solids',
          'Conversion of Pictorial to Orthographic'
        ]
      }
    ]
  },

  // 1st Year - 2nd Semester
  '1-2': {
    year: '1',
    semester: '2',
    subjects: [
      {
        name: 'Mathematics - II',
        units: 5,
        topics: [
          // Unit 1: Matrices
          'Rank of Matrix and Echelon Form',
          'System of Linear Equations',
          'Gauss Elimination Method',
          'Eigen Values and Eigen Vectors',
          'Cayley-Hamilton Theorem',
          // Unit 2: Fourier Series
          'Fourier Series - Even and Odd Functions',
          'Half Range Fourier Series',
          'Parseval\'s Theorem',
          'Fourier Integral',
          'Fourier Transforms',
          // Unit 3: Partial Differential Equations
          'Formation of PDEs',
          'Solution of First Order PDEs',
          'Method of Separation of Variables',
          'One-Dimensional Wave Equation',
          'One-Dimensional Heat Equation',
          // Unit 4: Complex Variables
          'Analytic Functions',
          'Cauchy-Riemann Equations',
          'Harmonic Functions',
          'Conformal Mapping',
          'Bilinear Transformations',
          // Unit 5: Complex Integration
          'Line Integral in Complex Plane',
          'Cauchy\'s Integral Theorem',
          'Cauchy\'s Integral Formula',
          'Taylor and Laurent Series',
          'Residue Theorem and Applications'
        ]
      },
      {
        name: 'Chemistry',
        units: 5,
        topics: [
          // Unit 1: Electrochemistry
          'Electrochemical Cells',
          'EMF and Nernst Equation',
          'Batteries - Lead Acid, Li-ion',
          'Fuel Cells',
          'Corrosion and Prevention',
          // Unit 2: Polymers
          'Classification of Polymers',
          'Polymerization Reactions',
          'Plastics - Properties and Types',
          'Elastomers and Rubber',
          'Conducting Polymers',
          // Unit 3: Water Technology
          'Hardness of Water',
          'Softening Methods',
          'Desalination',
          'Boiler Feed Water Treatment',
          'Drinking Water Standards',
          // Unit 4: Engineering Materials
          'Cement - Types and Properties',
          'Refractories',
          'Lubricants',
          'Composite Materials',
          'Nanomaterials',
          // Unit 5: Spectroscopy
          'UV-Visible Spectroscopy',
          'IR Spectroscopy',
          'NMR Spectroscopy',
          'Mass Spectrometry',
          'Applications in Analysis'
        ]
      },
      {
        name: 'Data Structures',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Introduction to Data Structures',
          'Algorithm Analysis - Time and Space Complexity',
          'Big O, Omega, Theta Notations',
          'Arrays - 1D and 2D',
          'Sparse Matrices',
          // Unit 2: Stacks and Queues
          'Stack ADT and Operations',
          'Stack Applications - Expression Evaluation',
          'Infix to Postfix Conversion',
          'Queue ADT and Operations',
          'Circular Queue and Priority Queue',
          // Unit 3: Linked Lists
          'Singly Linked List',
          'Doubly Linked List',
          'Circular Linked List',
          'Applications of Linked Lists',
          'Polynomial Representation',
          // Unit 4: Trees
          'Binary Trees - Traversals',
          'Binary Search Trees',
          'AVL Trees',
          'B-Trees and B+ Trees',
          'Heap Data Structure',
          // Unit 5: Graphs
          'Graph Representations',
          'BFS and DFS Traversals',
          'Shortest Path Algorithms - Dijkstra',
          'Minimum Spanning Tree - Prim\'s and Kruskal\'s',
          'Topological Sorting'
        ]
      },
      {
        name: 'Digital Electronics',
        units: 5,
        topics: [
          // Unit 1: Number Systems
          'Binary, Octal, Hexadecimal Systems',
          'Conversions Between Number Systems',
          'Binary Arithmetic',
          'Signed and Unsigned Numbers',
          'BCD and Gray Codes',
          // Unit 2: Boolean Algebra
          'Boolean Laws and Theorems',
          'De Morgan\'s Theorems',
          'SOP and POS Forms',
          'K-Map Simplification',
          'Quine-McCluskey Method',
          // Unit 3: Combinational Circuits
          'Half Adder and Full Adder',
          'Multiplexers and Demultiplexers',
          'Encoders and Decoders',
          'Comparators',
          'Code Converters',
          // Unit 4: Sequential Circuits
          'Flip-Flops - SR, JK, D, T',
          'Registers - Shift Registers',
          'Counters - Synchronous and Asynchronous',
          'Ring Counter and Johnson Counter',
          'Sequence Generators',
          // Unit 5: Memory and Logic Families
          'ROM, RAM, EPROM, EEPROM',
          'TTL Logic Family',
          'CMOS Logic Family',
          'Programmable Logic Devices',
          'Introduction to FPGA'
        ]
      },
      {
        name: 'Environmental Science',
        units: 5,
        topics: [
          // Unit 1: Ecosystems
          'Structure and Function of Ecosystems',
          'Food Chains and Food Webs',
          'Energy Flow in Ecosystems',
          'Biogeochemical Cycles',
          'Types of Ecosystems',
          // Unit 2: Natural Resources
          'Forest Resources',
          'Water Resources',
          'Mineral Resources',
          'Energy Resources - Renewable and Non-renewable',
          'Land Resources',
          // Unit 3: Biodiversity
          'Levels of Biodiversity',
          'Hotspots of Biodiversity',
          'Threats to Biodiversity',
          'Conservation Strategies',
          'Wildlife Protection Act',
          // Unit 4: Environmental Pollution
          'Air Pollution - Causes and Effects',
          'Water Pollution',
          'Soil Pollution',
          'Noise Pollution',
          'Solid Waste Management',
          // Unit 5: Social Issues
          'Climate Change and Global Warming',
          'Ozone Layer Depletion',
          'Sustainable Development',
          'Environmental Laws and Policies',
          'Role of IT in Environment Management'
        ]
      }
    ]
  },

  // 2nd Year - 1st Semester
  '2-1': {
    year: '2',
    semester: '1',
    subjects: [
      {
        name: 'Object Oriented Programming',
        units: 5,
        topics: [
          // Unit 1: Introduction to OOP
          'Procedural vs Object Oriented Programming',
          'Features of OOP - Abstraction, Encapsulation',
          'Classes and Objects',
          'Constructors and Destructors',
          'Static Members',
          // Unit 2: Inheritance
          'Types of Inheritance',
          'Single and Multiple Inheritance',
          'Multilevel and Hierarchical Inheritance',
          'Virtual Base Classes',
          'Order of Constructor Calls',
          // Unit 3: Polymorphism
          'Function Overloading',
          'Operator Overloading',
          'Virtual Functions',
          'Pure Virtual Functions',
          'Abstract Classes',
          // Unit 4: Exception Handling
          'Exception Handling Mechanism',
          'Try, Catch, Throw',
          'Multiple Catch Blocks',
          'Exception Specifications',
          'Standard Exceptions',
          // Unit 5: Templates and STL
          'Function Templates',
          'Class Templates',
          'Standard Template Library',
          'Containers - Vector, List, Map',
          'Iterators and Algorithms'
        ]
      },
      {
        name: 'Computer Organization',
        units: 5,
        topics: [
          // Unit 1: Basic Computer Organization
          'Computer System Architecture',
          'Instruction Formats',
          'Addressing Modes',
          'Instruction Cycle',
          'Micro-operations',
          // Unit 2: CPU Organization
          'General Register Organization',
          'Stack Organization',
          'Instruction Pipeline',
          'RISC vs CISC Architecture',
          'Parallel Processing',
          // Unit 3: Memory Organization
          'Memory Hierarchy',
          'Cache Memory - Mapping Techniques',
          'Cache Replacement Policies',
          'Virtual Memory',
          'Page Replacement Algorithms',
          // Unit 4: Input/Output Organization
          'I/O Interface',
          'Programmed I/O',
          'Interrupt Driven I/O',
          'DMA Controller',
          'I/O Processors',
          // Unit 5: Advanced Topics
          'Multiprocessor Organization',
          'Interconnection Structures',
          'Pipeline Hazards',
          'Branch Prediction',
          'Introduction to GPU Architecture'
        ]
      },
      {
        name: 'Discrete Mathematics',
        units: 5,
        topics: [
          // Unit 1: Mathematical Logic
          'Propositional Logic',
          'Logical Connectives',
          'Truth Tables',
          'Tautology and Contradiction',
          'Predicate Logic and Quantifiers',
          // Unit 2: Set Theory
          'Sets and Operations',
          'Relations and Properties',
          'Equivalence Relations',
          'Partial Ordering',
          'Functions - Types and Properties',
          // Unit 3: Counting Principles
          'Permutations and Combinations',
          'Pigeonhole Principle',
          'Inclusion-Exclusion Principle',
          'Recurrence Relations',
          'Generating Functions',
          // Unit 4: Graph Theory
          'Graph Terminology',
          'Types of Graphs',
          'Graph Isomorphism',
          'Planar Graphs and Euler\'s Formula',
          'Graph Coloring',
          // Unit 5: Algebraic Structures
          'Groups and Subgroups',
          'Cyclic Groups',
          'Permutation Groups',
          'Rings and Fields',
          'Boolean Algebra'
        ]
      },
      {
        name: 'Database Management Systems',
        units: 5,
        topics: [
          // Unit 1: Introduction to DBMS
          'Database System Concepts',
          'Database Architecture',
          'Data Models',
          'ER Model',
          'Enhanced ER Model',
          // Unit 2: Relational Model
          'Relational Data Model',
          'Relational Algebra',
          'Relational Calculus',
          'SQL - DDL, DML, DCL',
          'Advanced SQL Queries',
          // Unit 3: Normalization
          'Functional Dependencies',
          'Normal Forms - 1NF, 2NF, 3NF',
          'BCNF',
          '4NF and 5NF',
          'Denormalization',
          // Unit 4: Transaction Management
          'Transaction Concepts',
          'ACID Properties',
          'Concurrency Control',
          'Lock-Based Protocols',
          'Deadlock Handling',
          // Unit 5: Advanced Topics
          'Recovery Techniques',
          'Indexing and Hashing',
          'Query Processing',
          'Query Optimization',
          'NoSQL Databases'
        ]
      },
      {
        name: 'Probability and Statistics',
        units: 5,
        topics: [
          // Unit 1: Probability Theory
          'Sample Space and Events',
          'Probability Axioms',
          'Conditional Probability',
          'Bayes Theorem',
          'Independence of Events',
          // Unit 2: Random Variables
          'Discrete Random Variables',
          'Probability Mass Function',
          'Continuous Random Variables',
          'Probability Density Function',
          'Cumulative Distribution Function',
          // Unit 3: Distributions
          'Binomial Distribution',
          'Poisson Distribution',
          'Normal Distribution',
          'Exponential Distribution',
          'Uniform Distribution',
          // Unit 4: Statistical Inference
          'Point Estimation',
          'Interval Estimation',
          'Hypothesis Testing',
          'Chi-Square Test',
          't-Test and F-Test',
          // Unit 5: Correlation and Regression
          'Correlation Coefficient',
          'Rank Correlation',
          'Linear Regression',
          'Multiple Regression',
          'Curve Fitting'
        ]
      }
    ]
  },

  // 2nd Year - 2nd Semester
  '2-2': {
    year: '2',
    semester: '2',
    subjects: [
      {
        name: 'Operating Systems',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Operating System Concepts',
          'Types of Operating Systems',
          'System Calls',
          'OS Structure',
          'Virtual Machines',
          // Unit 2: Process Management
          'Process Concept and States',
          'Process Scheduling Algorithms',
          'Inter-Process Communication',
          'Threads and Multithreading',
          'CPU Scheduling',
          // Unit 3: Process Synchronization
          'Critical Section Problem',
          'Peterson\'s Solution',
          'Semaphores',
          'Monitors',
          'Classical Synchronization Problems',
          // Unit 4: Memory Management
          'Memory Management Strategies',
          'Paging',
          'Segmentation',
          'Virtual Memory',
          'Page Replacement Algorithms',
          // Unit 5: File Systems
          'File Concepts and Operations',
          'Directory Structure',
          'File System Implementation',
          'Disk Scheduling',
          'RAID Levels'
        ]
      },
      {
        name: 'Design and Analysis of Algorithms',
        units: 5,
        topics: [
          // Unit 1: Algorithm Analysis
          'Asymptotic Notations',
          'Time and Space Complexity',
          'Recurrence Relations',
          'Master Theorem',
          'Amortized Analysis',
          // Unit 2: Divide and Conquer
          'Merge Sort',
          'Quick Sort',
          'Binary Search',
          'Strassen\'s Matrix Multiplication',
          'Maximum Subarray Problem',
          // Unit 3: Greedy Algorithms
          'Greedy Strategy',
          'Activity Selection Problem',
          'Huffman Coding',
          'Fractional Knapsack',
          'Job Sequencing',
          // Unit 4: Dynamic Programming
          'Principle of Optimality',
          '0/1 Knapsack Problem',
          'Longest Common Subsequence',
          'Matrix Chain Multiplication',
          'Floyd-Warshall Algorithm',
          // Unit 5: Advanced Topics
          'Backtracking - N-Queens, Graph Coloring',
          'Branch and Bound',
          'String Matching Algorithms',
          'NP-Completeness',
          'Approximation Algorithms'
        ]
      },
      {
        name: 'Computer Networks',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Network Models - OSI and TCP/IP',
          'Network Topologies',
          'Transmission Media',
          'Network Devices',
          'Network Standards',
          // Unit 2: Data Link Layer
          'Framing and Error Detection',
          'Error Correction - Hamming Code',
          'Flow Control Protocols',
          'Sliding Window Protocol',
          'Medium Access Control',
          // Unit 3: Network Layer
          'IP Addressing - IPv4 and IPv6',
          'Subnetting and CIDR',
          'Routing Algorithms',
          'Distance Vector and Link State Routing',
          'OSPF and BGP',
          // Unit 4: Transport Layer
          'TCP and UDP',
          'TCP Connection Management',
          'Flow Control and Congestion Control',
          'Socket Programming',
          'Quality of Service',
          // Unit 5: Application Layer
          'DNS',
          'HTTP and HTTPS',
          'FTP and SMTP',
          'Network Security Basics',
          'Cryptography Fundamentals'
        ]
      },
      {
        name: 'Software Engineering',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Software Engineering Principles',
          'Software Development Life Cycle',
          'Software Process Models',
          'Agile Methodologies',
          'DevOps Practices',
          // Unit 2: Requirements Engineering
          'Requirements Elicitation',
          'Requirements Analysis',
          'Requirements Specification - SRS',
          'Requirements Validation',
          'Requirements Management',
          // Unit 3: Software Design
          'Design Principles',
          'Architectural Design',
          'Detailed Design',
          'UML Diagrams',
          'Design Patterns',
          // Unit 4: Testing
          'Testing Fundamentals',
          'White Box Testing',
          'Black Box Testing',
          'Integration Testing',
          'System and Acceptance Testing',
          // Unit 5: Project Management
          'Project Planning',
          'Effort Estimation - COCOMO',
          'Risk Management',
          'Configuration Management',
          'Software Maintenance'
        ]
      },
      {
        name: 'Formal Languages and Automata Theory',
        units: 5,
        topics: [
          // Unit 1: Finite Automata
          'Introduction to Automata Theory',
          'DFA and NFA',
          'NFA to DFA Conversion',
          'Minimization of DFA',
          'Regular Expressions',
          // Unit 2: Regular Languages
          'Regular Grammars',
          'Pumping Lemma for Regular Languages',
          'Closure Properties',
          'Decision Properties',
          'Myhill-Nerode Theorem',
          // Unit 3: Context-Free Grammars
          'Context-Free Grammars',
          'Derivations and Parse Trees',
          'Ambiguity in CFG',
          'Chomsky Normal Form',
          'Greibach Normal Form',
          // Unit 4: Pushdown Automata
          'Pushdown Automata',
          'PDA and CFG Equivalence',
          'Pumping Lemma for CFLs',
          'Closure Properties of CFLs',
          'Decision Properties of CFLs',
          // Unit 5: Turing Machines
          'Turing Machine Model',
          'TM Variants',
          'Recursive and Recursively Enumerable Languages',
          'Undecidability',
          'Halting Problem'
        ]
      }
    ]
  },

  // 3rd Year - 1st Semester
  '3-1': {
    year: '3',
    semester: '1',
    subjects: [
      {
        name: 'Compiler Design',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Phases of Compiler',
          'Lexical Analysis',
          'Regular Expressions and Finite Automata',
          'LEX Tool',
          'Symbol Table Management',
          // Unit 2: Syntax Analysis
          'Context-Free Grammars',
          'Top-Down Parsing',
          'LL(1) Parsing',
          'Bottom-Up Parsing',
          'LR Parsing - SLR, CLR, LALR',
          // Unit 3: Semantic Analysis
          'Syntax Directed Definitions',
          'S-Attributed and L-Attributed Grammars',
          'Type Checking',
          'Type Conversions',
          'Intermediate Code Generation',
          // Unit 4: Code Optimization
          'Basic Blocks and Flow Graphs',
          'Local Optimization',
          'Loop Optimization',
          'Global Data Flow Analysis',
          'Register Allocation',
          // Unit 5: Code Generation
          'Target Code Generation',
          'Instruction Selection',
          'Peephole Optimization',
          'Code Generator Tools',
          'Just-In-Time Compilation'
        ]
      },
      {
        name: 'Artificial Intelligence',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Introduction to AI',
          'Intelligent Agents',
          'Problem Solving Agents',
          'Search Strategies',
          'Uninformed Search - BFS, DFS, UCS',
          // Unit 2: Informed Search
          'Heuristic Search',
          'A* Algorithm',
          'Hill Climbing',
          'Simulated Annealing',
          'Genetic Algorithms',
          // Unit 3: Knowledge Representation
          'Propositional Logic',
          'First-Order Logic',
          'Inference in FOL',
          'Unification and Resolution',
          'Knowledge-Based Agents',
          // Unit 4: Uncertainty
          'Probabilistic Reasoning',
          'Bayesian Networks',
          'Hidden Markov Models',
          'Fuzzy Logic',
          'Fuzzy Inference Systems',
          // Unit 5: Machine Learning Basics
          'Introduction to Machine Learning',
          'Supervised Learning',
          'Unsupervised Learning',
          'Decision Trees',
          'Neural Networks Basics'
        ]
      },
      {
        name: 'Web Technologies',
        units: 5,
        topics: [
          // Unit 1: Web Fundamentals
          'HTML5 - Structure and Semantics',
          'CSS3 - Styling and Layouts',
          'Flexbox and Grid',
          'Responsive Web Design',
          'CSS Preprocessors',
          // Unit 2: JavaScript
          'JavaScript Fundamentals',
          'DOM Manipulation',
          'Events and Event Handling',
          'ES6+ Features',
          'Asynchronous JavaScript - Promises, Async/Await',
          // Unit 3: Frontend Frameworks
          'Introduction to React.js',
          'Components and Props',
          'State Management',
          'React Hooks',
          'Next.js Fundamentals',
          // Unit 4: Backend Development
          'Node.js and Express.js',
          'RESTful API Design',
          'Authentication and Authorization',
          'Database Integration',
          'API Security',
          // Unit 5: Modern Web Development
          'TypeScript',
          'GraphQL',
          'WebSockets',
          'Progressive Web Apps',
          'Deployment and DevOps'
        ]
      },
      {
        name: 'Information Security',
        units: 5,
        topics: [
          // Unit 1: Fundamentals
          'Security Concepts',
          'Security Attacks and Services',
          'Security Mechanisms',
          'Classical Encryption Techniques',
          'Modern Encryption - Block and Stream Ciphers',
          // Unit 2: Symmetric Cryptography
          'DES and Triple DES',
          'AES',
          'Block Cipher Modes',
          'Key Distribution',
          'Random Number Generation',
          // Unit 3: Asymmetric Cryptography
          'RSA Algorithm',
          'Diffie-Hellman Key Exchange',
          'Elliptic Curve Cryptography',
          'Digital Signatures',
          'Certificate Authorities',
          // Unit 4: Network Security
          'Authentication Protocols',
          'SSL/TLS',
          'IPSec',
          'Firewalls',
          'Intrusion Detection Systems',
          // Unit 5: Application Security
          'Email Security',
          'Web Security',
          'OWASP Top 10',
          'Secure Coding Practices',
          'Malware Analysis'
        ]
      },
      {
        name: 'Machine Learning',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Introduction to Machine Learning',
          'Types of Learning',
          'Model Evaluation',
          'Bias-Variance Tradeoff',
          'Cross-Validation',
          // Unit 2: Supervised Learning
          'Linear Regression',
          'Logistic Regression',
          'Support Vector Machines',
          'Decision Trees and Random Forests',
          'Ensemble Methods',
          // Unit 3: Unsupervised Learning
          'K-Means Clustering',
          'Hierarchical Clustering',
          'DBSCAN',
          'Principal Component Analysis',
          'Association Rules',
          // Unit 4: Neural Networks
          'Perceptron and MLP',
          'Backpropagation',
          'Activation Functions',
          'Regularization Techniques',
          'Optimization Algorithms',
          // Unit 5: Deep Learning
          'Convolutional Neural Networks',
          'Recurrent Neural Networks',
          'LSTM and GRU',
          'Transformers',
          'Transfer Learning'
        ]
      }
    ]
  },

  // 3rd Year - 2nd Semester
  '3-2': {
    year: '3',
    semester: '2',
    subjects: [
      {
        name: 'Cloud Computing',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Cloud Computing Concepts',
          'Cloud Service Models - IaaS, PaaS, SaaS',
          'Cloud Deployment Models',
          'Virtualization Technologies',
          'Hypervisors',
          // Unit 2: Cloud Architecture
          'Cloud Reference Architecture',
          'Cloud Design Patterns',
          'Microservices Architecture',
          'Containers and Docker',
          'Kubernetes',
          // Unit 3: Cloud Platforms
          'AWS Services Overview',
          'Azure Services Overview',
          'Google Cloud Platform',
          'Serverless Computing',
          'Cloud Functions',
          // Unit 4: Cloud Security
          'Cloud Security Challenges',
          'Identity and Access Management',
          'Data Encryption',
          'Security Best Practices',
          'Compliance and Governance',
          // Unit 5: Cloud Applications
          'Cloud-Native Applications',
          'DevOps in Cloud',
          'CI/CD Pipelines',
          'Monitoring and Logging',
          'Cost Optimization'
        ]
      },
      {
        name: 'Data Science',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Data Science Lifecycle',
          'Data Collection and Preprocessing',
          'Exploratory Data Analysis',
          'Data Visualization',
          'Statistical Analysis',
          // Unit 2: Data Wrangling
          'Data Cleaning Techniques',
          'Handling Missing Data',
          'Feature Engineering',
          'Feature Selection',
          'Data Transformation',
          // Unit 3: Machine Learning for Data Science
          'Predictive Modeling',
          'Classification Algorithms',
          'Regression Algorithms',
          'Model Selection',
          'Hyperparameter Tuning',
          // Unit 4: Big Data Technologies
          'Hadoop Ecosystem',
          'MapReduce Programming',
          'Apache Spark',
          'Spark SQL and DataFrames',
          'Real-time Processing with Kafka',
          // Unit 5: Applications
          'Recommendation Systems',
          'Sentiment Analysis',
          'Time Series Analysis',
          'Natural Language Processing',
          'Computer Vision Basics'
        ]
      },
      {
        name: 'Internet of Things',
        units: 5,
        topics: [
          // Unit 1: IoT Fundamentals
          'Introduction to IoT',
          'IoT Architecture',
          'IoT Protocols',
          'Sensors and Actuators',
          'Embedded Systems Basics',
          // Unit 2: IoT Communication
          'Wireless Communication',
          'WiFi and Bluetooth',
          'ZigBee and LoRa',
          'MQTT Protocol',
          'CoAP Protocol',
          // Unit 3: IoT Platforms
          'Arduino Programming',
          'Raspberry Pi',
          'ESP8266/ESP32',
          'IoT Cloud Platforms',
          'ThingSpeak and AWS IoT',
          // Unit 4: IoT Security
          'IoT Security Challenges',
          'Device Security',
          'Communication Security',
          'Data Privacy',
          'Security Frameworks',
          // Unit 5: IoT Applications
          'Smart Home',
          'Smart City',
          'Industrial IoT',
          'Healthcare IoT',
          'Agricultural IoT'
        ]
      },
      {
        name: 'Mobile Application Development',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Mobile App Development Overview',
          'Native vs Cross-Platform',
          'Mobile UI/UX Principles',
          'Mobile App Architecture',
          'Development Environment Setup',
          // Unit 2: Android Development
          'Android Architecture',
          'Activities and Intents',
          'Layouts and Views',
          'RecyclerView and Adapters',
          'Data Storage in Android',
          // Unit 3: React Native
          'React Native Fundamentals',
          'Components and Styling',
          'Navigation',
          'State Management with Redux',
          'Native Modules',
          // Unit 4: Flutter
          'Flutter Architecture',
          'Widgets and Layouts',
          'State Management',
          'Networking and APIs',
          'Platform-Specific Code',
          // Unit 5: Advanced Topics
          'Push Notifications',
          'Location Services',
          'Camera and Media',
          'App Publishing',
          'App Performance Optimization'
        ]
      },
      {
        name: 'Distributed Systems',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'Distributed System Characteristics',
          'System Models',
          'Communication Paradigms',
          'Remote Procedure Call',
          'Remote Method Invocation',
          // Unit 2: Synchronization
          'Physical and Logical Clocks',
          'Lamport Timestamps',
          'Vector Clocks',
          'Global State',
          'Mutual Exclusion',
          // Unit 3: Consistency and Replication
          'Data-Centric Consistency',
          'Client-Centric Consistency',
          'Replica Management',
          'Consistency Protocols',
          'CAP Theorem',
          // Unit 4: Fault Tolerance
          'Fault Models',
          'Failure Detection',
          'Reliable Communication',
          'Distributed Commit',
          'Recovery Techniques',
          // Unit 5: Case Studies
          'Google File System',
          'MapReduce',
          'Apache Kafka',
          'Blockchain Basics',
          'Microservices Architecture'
        ]
      }
    ]
  },

  // 4th Year - 1st Semester
  '4-1': {
    year: '4',
    semester: '1',
    subjects: [
      {
        name: 'Deep Learning',
        units: 5,
        topics: [
          // Unit 1: Foundations
          'Deep Learning Overview',
          'Neural Network Architectures',
          'Activation Functions',
          'Loss Functions',
          'Optimization Algorithms',
          // Unit 2: CNNs
          'Convolutional Layers',
          'Pooling and Stride',
          'CNN Architectures - VGG, ResNet',
          'Object Detection - YOLO, R-CNN',
          'Image Segmentation',
          // Unit 3: RNNs and Sequence Models
          'Recurrent Neural Networks',
          'LSTM and GRU',
          'Sequence-to-Sequence Models',
          'Attention Mechanisms',
          'Transformers Architecture',
          // Unit 4: Generative Models
          'Autoencoders',
          'Variational Autoencoders',
          'Generative Adversarial Networks',
          'StyleGAN',
          'Diffusion Models',
          // Unit 5: Advanced Topics
          'Natural Language Processing with DL',
          'BERT and GPT Models',
          'Reinforcement Learning',
          'Self-Supervised Learning',
          'Model Deployment and Optimization'
        ]
      },
      {
        name: 'Blockchain Technology',
        units: 5,
        topics: [
          // Unit 1: Fundamentals
          'Blockchain Basics',
          'Cryptographic Hash Functions',
          'Digital Signatures',
          'Merkle Trees',
          'Consensus Mechanisms',
          // Unit 2: Bitcoin
          'Bitcoin Protocol',
          'Mining and Proof of Work',
          'Bitcoin Transactions',
          'Wallets and Addresses',
          'Bitcoin Network',
          // Unit 3: Ethereum
          'Ethereum Platform',
          'Smart Contracts',
          'Solidity Programming',
          'ERC Standards',
          'DApps Development',
          // Unit 4: Enterprise Blockchain
          'Hyperledger Fabric',
          'Permissioned Blockchains',
          'Consensus in Enterprise',
          'Chaincode Development',
          'Use Cases',
          // Unit 5: Advanced Topics
          'Layer 2 Solutions',
          'Cross-Chain Communication',
          'DeFi Fundamentals',
          'NFTs',
          'Blockchain Security'
        ]
      },
      {
        name: 'Natural Language Processing',
        units: 5,
        topics: [
          // Unit 1: Text Processing
          'Text Preprocessing',
          'Tokenization',
          'Stemming and Lemmatization',
          'Stop Words Removal',
          'Text Normalization',
          // Unit 2: Text Representation
          'Bag of Words',
          'TF-IDF',
          'Word Embeddings',
          'Word2Vec and GloVe',
          'FastText',
          // Unit 3: NLP Tasks
          'Part-of-Speech Tagging',
          'Named Entity Recognition',
          'Sentiment Analysis',
          'Text Classification',
          'Information Extraction',
          // Unit 4: Sequence Models
          'Language Modeling',
          'RNNs for NLP',
          'Seq2Seq Models',
          'Machine Translation',
          'Text Summarization',
          // Unit 5: Modern NLP
          'Transformers',
          'BERT and Variants',
          'GPT Models',
          'Question Answering',
          'Conversational AI'
        ]
      },
      {
        name: 'DevOps',
        units: 5,
        topics: [
          // Unit 1: Introduction
          'DevOps Culture and Principles',
          'Agile and DevOps',
          'DevOps Lifecycle',
          'Tools Overview',
          'Infrastructure as Code',
          // Unit 2: Version Control and CI
          'Git Advanced',
          'Branching Strategies',
          'Jenkins',
          'GitHub Actions',
          'Continuous Integration',
          // Unit 3: Configuration Management
          'Ansible',
          'Terraform',
          'Puppet and Chef',
          'Configuration Best Practices',
          'Environment Management',
          // Unit 4: Containerization
          'Docker Deep Dive',
          'Docker Compose',
          'Kubernetes Architecture',
          'Kubernetes Deployments',
          'Helm Charts',
          // Unit 5: Monitoring and Security
          'Monitoring with Prometheus',
          'Logging with ELK Stack',
          'Grafana Dashboards',
          'Security in DevOps',
          'Site Reliability Engineering'
        ]
      },
      {
        name: 'Project Work - I',
        units: 3,
        topics: [
          'Project Selection and Planning',
          'Literature Survey',
          'Requirement Analysis',
          'System Design',
          'Implementation Phase 1',
          'Documentation',
          'Progress Presentation',
          'Peer Review',
          'Version Control',
          'Agile Practices'
        ]
      }
    ]
  },

  // 4th Year - 2nd Semester
  '4-2': {
    year: '4',
    semester: '2',
    subjects: [
      {
        name: 'Computer Vision',
        units: 5,
        topics: [
          // Unit 1: Fundamentals
          'Image Formation',
          'Image Representation',
          'Color Models',
          'Image Filtering',
          'Edge Detection',
          // Unit 2: Feature Extraction
          'Corner Detection',
          'SIFT and SURF',
          'ORB Features',
          'HOG Features',
          'Feature Matching',
          // Unit 3: Image Segmentation
          'Thresholding Techniques',
          'Region-Based Segmentation',
          'Clustering-Based Segmentation',
          'Deep Learning for Segmentation',
          'Instance Segmentation',
          // Unit 4: Object Detection
          'Classical Object Detection',
          'R-CNN Family',
          'YOLO Variants',
          'SSD',
          'Object Tracking',
          // Unit 5: Advanced Topics
          'Face Recognition',
          '3D Vision',
          'Video Analysis',
          'Generative Models for Vision',
          'Vision Transformers'
        ]
      },
      {
        name: 'Quantum Computing',
        units: 5,
        topics: [
          // Unit 1: Fundamentals
          'Quantum Mechanics Basics',
          'Qubits and Superposition',
          'Quantum Entanglement',
          'Quantum Gates',
          'Quantum Circuits',
          // Unit 2: Quantum Algorithms
          'Deutsch-Jozsa Algorithm',
          'Grover\'s Search Algorithm',
          'Shor\'s Algorithm',
          'Quantum Fourier Transform',
          'Quantum Phase Estimation',
          // Unit 3: Quantum Computing Models
          'Gate-Based Computing',
          'Adiabatic Quantum Computing',
          'Quantum Annealing',
          'Topological Quantum Computing',
          'Measurement-Based Computing',
          // Unit 4: Quantum Programming
          'Qiskit Basics',
          'Cirq',
          'Quantum Error Correction',
          'Noise and Decoherence',
          'Quantum Simulation',
          // Unit 5: Applications
          'Quantum Machine Learning',
          'Quantum Cryptography',
          'Quantum Optimization',
          'Quantum Chemistry',
          'Future of Quantum Computing'
        ]
      },
      {
        name: 'Advanced Database Systems',
        units: 5,
        topics: [
          // Unit 1: NoSQL Databases
          'NoSQL Overview',
          'Document Databases - MongoDB',
          'Key-Value Stores - Redis',
          'Column-Family Stores - Cassandra',
          'Graph Databases - Neo4j',
          // Unit 2: Distributed Databases
          'Distributed Database Architecture',
          'Data Partitioning',
          'Replication Strategies',
          'Consistency Models',
          'Distributed Transactions',
          // Unit 3: Big Data Storage
          'HDFS',
          'Data Lakes',
          'Data Warehousing',
          'Star and Snowflake Schema',
          'OLAP Operations',
          // Unit 4: Query Processing
          'Query Optimization',
          'Indexing Techniques',
          'Materialized Views',
          'Parallel Query Processing',
          'In-Memory Databases',
          // Unit 5: Modern Databases
          'NewSQL Databases',
          'Time Series Databases',
          'Streaming Databases',
          'Database Security',
          'Database Administration'
        ]
      },
      {
        name: 'Professional Ethics',
        units: 4,
        topics: [
          // Unit 1: Engineering Ethics
          'Introduction to Ethics',
          'Engineering as Profession',
          'Professional Responsibilities',
          'Ethical Theories',
          'Moral Development',
          // Unit 2: IT Ethics
          'Privacy and Security',
          'Intellectual Property',
          'Software Piracy',
          'Cybercrime',
          'Digital Rights',
          // Unit 3: Social Responsibility
          'Engineers and Society',
          'Environmental Ethics',
          'Sustainable Development',
          'Technology and Society',
          'Global Issues',
          // Unit 4: Professional Practice
          'Code of Conduct',
          'Professional Bodies',
          'Career Development',
          'Workplace Ethics',
          'Whistle-blowing'
        ]
      },
      {
        name: 'Project Work - II',
        units: 3,
        topics: [
          'Implementation Phase 2',
          'Testing and Validation',
          'Performance Analysis',
          'Documentation Completion',
          'Final Report Preparation',
          'Project Demonstration',
          'Viva-Voce Preparation',
          'Research Paper Writing',
          'Presentation Skills',
          'Future Scope Analysis'
        ]
      }
    ]
  }
};

// ============================================
// SAMPLE USERS DATA
// ============================================

const sampleProfessors = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    password: 'Professor@123',
    role: 'professor',
    department: 'Computer Science',
    expertise: 'Machine Learning, Data Science',
    phoneNumber: '9876543210',
    isApproved: true,
    classesTeaching: [
      { subject: 'Machine Learning', batch: '2022', section: 'A' },
      { subject: 'Data Science', batch: '2022', section: 'B' },
      { subject: 'Artificial Intelligence', batch: '2023', section: 'A' }
    ]
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@college.edu',
    password: 'Professor@123',
    role: 'professor',
    department: 'Computer Science',
    expertise: 'Web Technologies, Cloud Computing',
    phoneNumber: '9876543211',
    isApproved: true,
    classesTeaching: [
      { subject: 'Web Technologies', batch: '2023', section: 'A' },
      { subject: 'Cloud Computing', batch: '2022', section: 'A' },
      { subject: 'Web Technologies', batch: '2023', section: 'B' }
    ]
  },
  {
    name: 'Dr. Amit Verma',
    email: 'amit.verma@college.edu',
    password: 'Professor@123',
    role: 'professor',
    department: 'Computer Science',
    expertise: 'Operating Systems, Computer Networks',
    phoneNumber: '9876543212',
    isApproved: true,
    classesTeaching: [
      { subject: 'Operating Systems', batch: '2023', section: 'A' },
      { subject: 'Computer Networks', batch: '2023', section: 'B' },
      { subject: 'Database Management Systems', batch: '2024', section: 'A' }
    ]
  },
  {
    name: 'Dr. Sunita Patel',
    email: 'sunita.patel@college.edu',
    password: 'Professor@123',
    role: 'professor',
    department: 'Computer Science',
    expertise: 'Algorithms, Data Structures',
    phoneNumber: '9876543213',
    isApproved: true,
    classesTeaching: [
      { subject: 'Design and Analysis of Algorithms', batch: '2023', section: 'A' },
      { subject: 'Data Structures', batch: '2024', section: 'B' },
      { subject: 'Programming in C', batch: '2025', section: 'A' }
    ]
  },
  {
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@college.edu',
    password: 'Professor@123',
    role: 'professor',
    department: 'Computer Science',
    expertise: 'Deep Learning, NLP',
    phoneNumber: '9876543214',
    isApproved: true,
    classesTeaching: [
      { subject: 'Deep Learning', batch: '2022', section: 'A' },
      { subject: 'Natural Language Processing', batch: '2022', section: 'B' },
      { subject: 'Machine Learning', batch: '2023', section: 'B' }
    ]
  }
];

const sampleStudents = [
  // Batch 2022 - 4th Year
  { name: 'Arun Kumar', email: 'arun.kumar@student.edu', rollNo: '22CS001', batch: '2022', section: 'A', semester: 7 },
  { name: 'Bhavya Reddy', email: 'bhavya.reddy@student.edu', rollNo: '22CS002', batch: '2022', section: 'A', semester: 7 },
  { name: 'Chetan Patel', email: 'chetan.patel@student.edu', rollNo: '22CS003', batch: '2022', section: 'A', semester: 7 },
  { name: 'Divya Sharma', email: 'divya.sharma@student.edu', rollNo: '22CS004', batch: '2022', section: 'B', semester: 7 },
  { name: 'Esha Gupta', email: 'esha.gupta@student.edu', rollNo: '22CS005', batch: '2022', section: 'B', semester: 7 },
  
  // Batch 2023 - 3rd Year
  { name: 'Farhan Khan', email: 'farhan.khan@student.edu', rollNo: '23CS001', batch: '2023', section: 'A', semester: 5 },
  { name: 'Geeta Rao', email: 'geeta.rao@student.edu', rollNo: '23CS002', batch: '2023', section: 'A', semester: 5 },
  { name: 'Harsh Vardhan', email: 'harsh.vardhan@student.edu', rollNo: '23CS003', batch: '2023', section: 'A', semester: 5 },
  { name: 'Ishita Jain', email: 'ishita.jain@student.edu', rollNo: '23CS004', batch: '2023', section: 'B', semester: 5 },
  { name: 'Jay Prakash', email: 'jay.prakash@student.edu', rollNo: '23CS005', batch: '2023', section: 'B', semester: 5 },
  
  // Batch 2024 - 2nd Year
  { name: 'Kavita Nair', email: 'kavita.nair@student.edu', rollNo: '24CS001', batch: '2024', section: 'A', semester: 3 },
  { name: 'Lokesh Yadav', email: 'lokesh.yadav@student.edu', rollNo: '24CS002', batch: '2024', section: 'A', semester: 3 },
  { name: 'Meera Iyer', email: 'meera.iyer@student.edu', rollNo: '24CS003', batch: '2024', section: 'A', semester: 3 },
  { name: 'Nikhil Saxena', email: 'nikhil.saxena@student.edu', rollNo: '24CS004', batch: '2024', section: 'B', semester: 3 },
  { name: 'Priyanka Das', email: 'priyanka.das@student.edu', rollNo: '24CS005', batch: '2024', section: 'B', semester: 3 },
  
  // Batch 2025 - 1st Year
  { name: 'Rahul Mehta', email: 'rahul.mehta@student.edu', rollNo: '25CS001', batch: '2025', section: 'A', semester: 1 },
  { name: 'Sneha Agarwal', email: 'sneha.agarwal@student.edu', rollNo: '25CS002', batch: '2025', section: 'A', semester: 1 },
  { name: 'Tarun Bhatia', email: 'tarun.bhatia@student.edu', rollNo: '25CS003', batch: '2025', section: 'A', semester: 1 },
  { name: 'Uma Shankar', email: 'uma.shankar@student.edu', rollNo: '25CS004', batch: '2025', section: 'B', semester: 1 },
  { name: 'Vijay Kumar', email: 'vijay.kumar@student.edu', rollNo: '25CS005', batch: '2025', section: 'B', semester: 1 }
];

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');

  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB\n');

    // Get or create admin user for syllabus references
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('Admin@LearnAI2024!', 12);
      adminUser = new User({
        name: 'System Administrator',
        email: 'admin@adaptivelearn.ai',
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    }

    // ============================================
    // SEED PROFESSORS
    // ============================================
    console.log('\n📚 Seeding Professors...');
    for (const prof of sampleProfessors) {
      const exists = await User.findOne({ email: prof.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(prof.password, 12);
        const professor = new User({
          ...prof,
          password: hashedPassword,
        });
        await professor.save();
        console.log(`  ✓ Created professor: ${prof.name}`);
      } else {
        console.log(`  ⚠ Professor already exists: ${prof.name}`);
      }
    }

    // ============================================
    // SEED STUDENTS
    // ============================================
    console.log('\n👨‍🎓 Seeding Students...');
    for (const student of sampleStudents) {
      const exists = await User.findOne({ email: student.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash('Student@123', 12);
        const newStudent = new User({
          ...student,
          password: hashedPassword,
          role: 'student',
          branch: 'Computer Science',
          isApproved: true,
        });
        await newStudent.save();
        console.log(`  ✓ Created student: ${student.name} (${student.rollNo})`);
      } else {
        console.log(`  ⚠ Student already exists: ${student.name}`);
      }
    }

    // ============================================
    // SEED SYLLABUS FOR ALL BATCHES AND SECTIONS
    // ============================================
    console.log('\n📖 Seeding Syllabus...');
    
    const batches = ['2022', '2023', '2024', '2025'];
    const sections = ['A', 'B'];
    
    // Map batch to year-semester
    const batchToSemester: Record<string, string[]> = {
      '2022': ['4-1', '4-2'], // 4th year
      '2023': ['3-1', '3-2'], // 3rd year
      '2024': ['2-1', '2-2'], // 2nd year
      '2025': ['1-1', '1-2']  // 1st year
    };

    for (const batch of batches) {
      for (const section of sections) {
        const semesters = batchToSemester[batch];
        
        for (const semKey of semesters) {
          const semData = syllabusData[semKey as keyof typeof syllabusData];
          if (!semData) continue;

          // Check if syllabus already exists
          const existingSyllabus = await Syllabus.findOne({
            year: semData.year,
            semester: semData.semester,
            batch,
            section
          });

          if (existingSyllabus) {
            console.log(`  ⚠ Syllabus exists: Year ${semData.year}, Sem ${semData.semester}, Batch ${batch}, Section ${section}`);
            continue;
          }

          // Prepare subjects with topic completion tracking
          const subjects = semData.subjects.map(subj => ({
            name: subj.name,
            units: subj.units,
            topics: subj.topics.map(topic => ({
              topic,
              isCompleted: false,
              completedDate: undefined,
              completedBy: undefined
            })),
            totalTopics: subj.topics.length,
            completedTopics: 0
          }));

          const syllabus = new Syllabus({
            year: semData.year,
            semester: semData.semester,
            batch,
            section,
            subjects,
            updatedBy: adminUser._id,
            lastUpdated: new Date()
          });

          await syllabus.save();
          console.log(`  ✓ Created syllabus: Year ${semData.year}, Sem ${semData.semester}, Batch ${batch}, Section ${section} (${subjects.length} subjects)`);
        }
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n════════════════════════════════════════════');
    console.log('            DATABASE SEEDING COMPLETE         ');
    console.log('════════════════════════════════════════════');
    
    const totalProfessors = await User.countDocuments({ role: 'professor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSyllabi = await Syllabus.countDocuments();
    
    console.log(`\n📊 Summary:`);
    console.log(`   • Professors: ${totalProfessors}`);
    console.log(`   • Students: ${totalStudents}`);
    console.log(`   • Syllabi: ${totalSyllabi}`);
    
    console.log('\n🔐 Default Credentials:');
    console.log('   Professors: [email]@college.edu / Professor@123');
    console.log('   Students: [email]@student.edu / Student@123');
    console.log('   Admin: admin@adaptivelearn.ai / Admin@LearnAI2024!');

    console.log('\n✅ All done! Your database is now populated.\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
