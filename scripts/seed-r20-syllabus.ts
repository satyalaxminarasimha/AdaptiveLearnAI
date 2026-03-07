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
          'UNIT I: Rank of matrix, normal form, PAQ form',
          'UNIT I: Gauss Jordan Method of finding inverse',
          'UNIT I: Consistency of linear system of equations',
          'UNIT II: Linear transformations, orthogonal transformations',
          'UNIT II: Eigen values, eigen vectors, Cayley-Hamilton theorem',
          'UNIT II: Reduction to diagonal form, Quadratic form to Canonical form',
          'UNIT III: Rolle theorem, Lagrange mean value theorem, Cauchy mean value theorem',
          'UNIT III: Partial derivatives, total derivatives, chain rule, Jacobians',
          'UNIT III: Taylor series expansion, maxima and minima, Lagrange multipliers',
          'UNIT IV: Double integrals, change of order of integration',
          'UNIT IV: Double integration in polar coordinates, areas enclosed by plane curves',
          'UNIT IV: Triple integrals, volumes of solids, center of gravity',
          'UNIT V: Beta and Gamma functions and their properties',
          'UNIT V: Relation between Beta and Gamma functions',
          'UNIT V: Evaluation of integrals using Beta and Gamma functions, error function',
        ]),
      },
      {
        name: 'Communicative English',
        code: 'CSM112',
        credits: 3,
        category: 'HS',
        units: 5,
        topics: t([
          'UNIT I: Skimming and Scanning, On Conduct of Life, If by Rudyard Kipling',
          'UNIT I: Paragraph writing, cohesive devices, word formation, prefixes and suffixes',
          'UNIT II: Reading for inferential comprehension, The Brook, Public Speaker',
          'UNIT II: Formal letter writing, punctuation, articles, word building using foreign roots',
          'UNIT III: The Death Trap, On Saving Time, Reports structure and content',
          'UNIT III: Noun-Pronoun Agreement, Subject-Verb agreement, Tenses, Idiomatic expressions',
          'UNIT IV: Identifying claims and evidences, Chindu Yellama, Muhammad Yunus',
          'UNIT IV: Persuasive and argumentative essays, Misplaced Modifiers, Synonyms Antonyms',
          'UNIT V: Politics and English Language, The Dancer with White Parasol',
          'UNIT V: Precis writing, Resume and CV with cover letter, Phrasal verbs',
        ]),
      },
      {
        name: 'Basic Electronics',
        code: 'CSM113',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Intrinsic and Extrinsic Semiconductors, Fermi energy level',
          'UNIT I: PN Junction diode, Forward and reverse biases, Diode current equation',
          'UNIT I: Avalanche and Zener Breakdown, Varactor diode and Photo diode',
          'UNIT II: Half wave rectifier, Full wave center tapped and Bridge rectifiers',
          'UNIT II: Filters - Inductor, Capacitor, LC, CLC filters, Ripple factor',
          'UNIT III: BJT - CB, CE, CC Configurations, Input/Output Characteristics',
          'UNIT III: Transistor current components, Active/Saturation/Cutoff region',
          'UNIT IV: Transistor biasing, DC load line, Operating point, Voltage divider bias',
          'UNIT IV: Diode and Thermistor compensation, Small signal CE amplifier',
          'UNIT V: JFET and MOSFET Construction and Characteristics',
          'UNIT V: Enhancement and depletion mode MOSFETs, Common source FET amplifier',
        ]),
      },
      {
        name: 'Digital Logic Design',
        code: 'CSM114',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Digital Systems, Binary Numbers, Number Base Conversions',
          'UNIT I: Complements, Signed Binary Numbers, Binary Codes, Boolean Algebra',
          'UNIT II: K-map Method, Four variable K-map, POS simplification, Dont Care',
          'UNIT II: NAND and NOR Implementation, Binary adder-subtractor, Decimal adder',
          'UNIT II: Binary Multiplier, Magnitude Comparator, Decoders, Encoders, MUX, DEMUX',
          'UNIT III: Programmable Logic Devices - PROM, PLA, PAL',
          'UNIT III: Realization of switching functions using PROM, PLA and PAL',
          'UNIT IV: Sequential Circuits, Latches, Flip-Flops, Clocked Sequential Circuits',
          'UNIT IV: Registers, Shift Registers, Ripple Counters, Synchronous Counters',
          'UNIT V: Synchronous Sequential Logic - State Reduction and Assignment',
          'UNIT V: Asynchronous Sequential Logic - Analysis and Design Procedure',
        ]),
      },
      {
        name: 'Problem Solving with C',
        code: 'CSM115',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Problem-solving Aspect, Top-Down Design, Algorithm Implementation',
          'UNIT I: Computer Software, Software Development Method, Flowcharting',
          'UNIT I: Introduction to C - Identifiers, Types, Variables, Constants, I/O',
          'UNIT II: Number systems, Operators, Expressions, Precedence and Associativity',
          'UNIT II: Selection - Logical operators, Two way and Multi way selection',
          'UNIT II: Repetition - Pretest and posttest loops, Counter and event controlled loops',
          'UNIT III: Arrays - Concepts, Linear search, Bubble sort, 2D and Multidimensional',
          'UNIT III: Strings - C Strings, String I/O, String manipulation functions',
          'UNIT IV: Functions - User defined, Library functions, Scope, Recursion',
          'UNIT IV: Storage classes, Pointers, Pointer arithmetic, Memory allocation',
          'UNIT V: Structures and Unions, typedef, Enumerated types',
          'UNIT V: Text Files, Binary files, File operations and examples',
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
          'UNIT I: First order linear differential equations, Bernoulli equations',
          'UNIT I: Exact differential equations, Orthogonal trajectories',
          'UNIT I: Simple electric circuits (L-R circuit), Newton law of cooling',
          'UNIT II: Higher order Linear Differential Equations with constant coefficients',
          'UNIT II: Method of variation of parameters, Cauchy and Legendre equations',
          'UNIT II: Applications - L-C-R circuit problems',
          'UNIT III: Bisection method, Newton-Raphson, Regula-Falsi methods',
          'UNIT III: Gauss elimination, Gauss Jordan, Gauss Seidel methods',
          'UNIT IV: Newton forward and backward interpolation, Lagrange formula',
          'UNIT IV: Numerical differentiation, Trapezoidal rule, Simpson rules',
          'UNIT V: Laplace Transforms - definitions, elementary functions, properties',
          'UNIT V: Inverse Laplace transforms, Convolution theorem, applications to ODEs',
        ]),
      },
      {
        name: 'Engineering Physics',
        code: 'CSM122',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Thermodynamics - First and second law, Carnot cycle, Entropy',
          'UNIT I: Reversible and irreversible processes, Third law of thermodynamics',
          'UNIT II: Electromagnetism - Faraday law, Lenz law, Maxwell equations',
          'UNIT II: Electromagnetic wave propagation, Ultrasonics production and applications',
          'UNIT III: Interference - Young double slit, thin films, Newton rings',
          'UNIT III: Diffraction - Fresnel and Fraunhofer, Polarisation types',
          'UNIT IV: Lasers - Ruby, He-Ne, Semiconductor lasers, Applications',
          'UNIT IV: Fiber optics - Principle, Numerical aperture, Types, Attenuation',
          'UNIT V: Quantum mechanics - de-Broglie waves, Heisenberg uncertainty',
          'UNIT V: Schrodinger wave equation, Particle in a box, Statistical mechanics',
        ]),
      },
      {
        name: 'Engineering Chemistry',
        code: 'CSM123',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Water Chemistry - Hardness, Boiler troubles, Scale and Sludge',
          'UNIT I: Water treatment - Ion exchange, Reverse Osmosis, Electrodialysis',
          'UNIT II: Electrochemical cells - Electrode potential, Nernst equation',
          'UNIT II: Primary and Secondary cells, Fuel cells, Photovoltaic cells',
          'UNIT III: Corrosion - Chemical and Electrochemical theory, Pilling Bedworth rule',
          'UNIT III: Corrosion prevention - Cathodic protection, Electroplating, Coatings',
          'UNIT IV: Semiconducting materials - Band theory, Organic semiconductors',
          'UNIT IV: Ceramic materials - Cement manufacture, Refractories',
          'UNIT V: Nanomaterials - Sol-gel method, SEM and TEM characterization',
          'UNIT V: Polymer Composites, Fiber Reinforced Plastics, Smart polymers',
        ]),
      },
      {
        name: 'Elements of Electrical Engineering',
        code: 'CSM124',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Electric Circuits - KVL, KCL, Mesh and Nodal analysis',
          'UNIT I: Thevenin and Norton theorems, Superposition principle',
          'UNIT II: Magnetic Circuits - Reluctance, MMF, Faraday laws of EMI',
          'UNIT III: DC Generators - Principle, Construction, EMF equation, Types',
          'UNIT IV: DC Motors - Working principle, Back EMF, Torque equation, Types',
          'UNIT IV: Special Motors - Stepper Motor and Servo Motor',
          'UNIT V: Transformers - Working principle, EMF equation, Voltage regulation',
          'UNIT V: Three-phase Induction Motor - Construction, Principle, Types',
        ]),
      },
      {
        name: 'Engineering Drawing',
        code: 'CSM125',
        credits: 3.5,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Engineering curves - Ellipse, Parabola, Hyperbola methods',
          'UNIT I: Cycloidal curves - cycloid, epicycloid, hypocycloid, Involute',
          'UNIT II: Orthographic projections of points',
          'UNIT II: Projections of straight lines - parallel and inclined to planes',
          'UNIT III: Projections of regular polygon planes',
          'UNIT III: Planes inclined to one plane and both planes',
          'UNIT IV: Projection of solids - Prisms, Cylinder, Pyramids, Cones',
          'UNIT IV: Axis inclined to one plane and both planes',
          'UNIT V: Isometric projections - Isometric scale and view',
          'UNIT V: Isometric projection of prisms, pyramids, cone, cylinder, sphere',
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
          'UNIT I: Basic Terminology, Data Structure operations, Asymptotic Notations',
          'UNIT I: Arrays - Single and Multidimensional, Sparse Matrices',
          'UNIT I: Searching - Sequential, Binary, Interpolation, Hash Table, Hash Functions',
          'UNIT I: Sorting - Insertion, Bubble, Selection, Quick Sort, Merge Sort',
          'UNIT II: Stacks - Array representation, Push/Pop, Infix to Postfix conversion',
          'UNIT II: Postfix evaluation, Recursion, Towers of Hanoi',
          'UNIT II: Queues - Circular queue, De-queue, Priority Queue, Applications',
          'UNIT III: Linked Lists - Singly, Doubly, Circular doubly linked list',
          'UNIT III: Polynomial representation and addition using linked list',
          'UNIT IV: Trees - Binary Trees, Traversals, Threaded Binary trees',
          'UNIT IV: BST - Insertion and Deletion, AVL Trees - Rotations, Insertion, Deletion',
          'UNIT V: Graphs - Adjacency Matrices, Warshall Algorithm, Dijkstra Algorithm',
          'UNIT V: Minimum Cost Spanning Trees - Prim and Kruskal, BFS and DFS',
        ]),
      },
      {
        name: 'Computer Organization and Microprocessors',
        code: 'CSM212',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Register Transfer Language, Instruction Codes, Computer Registers',
          'UNIT I: Timing and Control, Instruction Cycle, Memory-Reference Instructions',
          'UNIT I: ALU - Arithmetic, Logic and Shift Micro operations',
          'UNIT II: Computer Arithmetic - Addition, Subtraction, Booth Multiplication',
          'UNIT II: Division, Decimal Arithmetic Unit, Hardware Implementation',
          'UNIT III: Control Unit - Hardwired and Microprogrammed, Control Memory',
          'UNIT III: I/O Interface - Peripheral Devices, Asynchronous Data Transfer',
          'UNIT III: Modes of Transfer, Priority Interrupt, DMA, 8255 PPI',
          'UNIT IV: 8085 Microprocessor - Architecture, Instruction Set, Addressing modes',
          'UNIT IV: Timing Diagrams, Assembly Language Programming, Interrupts',
          'UNIT V: 8086 Microprocessor - Architecture, Segmented Memory',
          'UNIT V: Maximum and Minimum Mode, Addressing Modes, Instruction Set',
        ]),
      },
      {
        name: 'Java Programming',
        code: 'CSM213',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: OOP - Object and classes, Abstraction, Encapsulation, Inheritance, Polymorphism',
          'UNIT I: Java Buzzwords, Data types, Control structures, Arrays, String handling',
          'UNIT I: Classes, Objects, Constructors, Methods, Static fields, Inner class',
          'UNIT II: Inheritance - Basics, super keyword, multilevel hierarchy, Object class',
          'UNIT II: Polymorphism - Method overriding, Abstract class, Interfaces vs Abstract class',
          'UNIT II: Packages - Defining, Creating, Accessing and Importing packages',
          'UNIT III: I/O - Byte and character streams, File reading and writing',
          'UNIT III: Exception handling - try, catch, throw, throws, finally, User defined exceptions',
          'UNIT III: Multithreading - Priorities, Synchronization, Inter-thread communication',
          'UNIT IV: Applets - Life cycle, paint/update/repaint, Swing - JFrame, JApplet, JPanel',
          'UNIT IV: Swing Components - JList, JScrollPane, JTabbedPane, Dialog boxes',
          'UNIT IV: Layout Managers - BorderLayout, FlowLayout, GridLayout, CardLayout',
          'UNIT V: AWT - Components, Containers, Menu, Scroll bar',
          'UNIT V: Event Handling - Delegation model, Action, Item, Mouse, Keyboard events',
        ]),
      },
      {
        name: 'Data Communication and Computer Networks',
        code: 'CSM214',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Data Communications, Network Topologies, OSI and TCP/IP models',
          'UNIT I: Transmission Media, Modulation techniques, Switching - Circuit, Packet, Message',
          'UNIT II: Data Link Layer - Error Detection and Correction, Parity, LRC, CRC, Hamming',
          'UNIT II: Flow Control - Sliding Window, Go Back N, Selective Repeat, HDLC',
          'UNIT II: MAC protocols - ALOHA, CSMA/CD, CSMA/CA',
          'UNIT III: Network Layer - IPv4, IPv6, ARP, DHCP, ICMP',
          'UNIT III: Routing Algorithms - Distance vector, Link State, Hierarchical, Multicast',
          'UNIT III: Subnetting, NAT, Congestion Control techniques',
          'UNIT IV: Transport Layer - TCP and UDP, Segment Header, Connection Management',
          'UNIT IV: TCP Sliding Window, Congestion Control, RPC, RTP',
          'UNIT V: Application Layer - DNS, Electronic Mail architecture and protocols',
          'UNIT V: HTTP, HTTPS, FTP, Web architecture, Security and Cryptography basics',
        ]),
      },
      {
        name: 'Discrete Mathematical Structures',
        code: 'CSM215',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: t([
          'UNIT I: Mathematical Logic - Fundamentals, Logical inferences, Methods of proof',
          'UNIT I: First order logic, Rules of inference, Mathematical induction',
          'UNIT II: Relations - Cartesian products, Properties of binary relations',
          'UNIT II: Equivalence relations, Transitive closure, Partial ordering',
          'UNIT II: Algebraic Systems - Semigroups, Monoids, Groups, Rings and Fields',
          'UNIT III: Elementary Combinatorics - Permutations and Combinations',
          'UNIT III: Binomial and Multinomial theorems, Principle of inclusion-exclusion',
          'UNIT IV: Recurrence Relations - Generating functions, Method of characteristic roots',
          'UNIT IV: Non-homogeneous recurrence relations and their solutions',
          'UNIT V: Graphs - Types, Terminology, Representation, Isomorphism',
          'UNIT V: Euler and Hamilton paths, Planar graphs, Euler formula',
          'UNIT V: Trees - Spanning trees, Minimum spanning trees, Kruskal algorithm',
        ]),
      },
      {
        name: 'Design Thinking & Product Innovation',
        code: 'CSM216',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: t([
          'UNIT I: Introduction to Design Thinking - History, Need, 7 Characteristics',
          'UNIT I: Elements and principles of Design, Problem statement',
          'UNIT II: Design Thinking Process - Empathize, Analyze, Ideate, Prototype, Test',
          'UNIT II: Tools - Ask 5x why, 5W+H, Empathy map, Persona, Customer journey map',
          'UNIT III: Brainstorming, Storytelling, Critical Function Prototype',
          'UNIT III: Testing sheet, Feedback, Roadmap for implementation',
          'UNIT III: Product Design - Problem formation, Product strategies, Planning, Specifications',
          'UNIT IV: Innovation and Creativity in organizations',
          'UNIT IV: Lateral, Divergent and Convergent Thinking',
          'UNIT V: Design Thinking for Startups, Double Diamond method',
          'UNIT V: Case studies in IT, Finance, Education and Management',
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
          'UNIT I: Probability - Definition, Addition and Multiplication theorems',
          'UNIT I: Conditional probability, Bayes theorem, Random variable, Distribution function',
          'UNIT I: Mathematical expectation, Moments, MGF, Mean and Variance',
          'UNIT II: Discrete Distributions - Binomial, Poisson, Mean, Variance, MGF',
          'UNIT II: Continuous Distributions - Uniform, Exponential, Memory less property',
          'UNIT II: Normal distribution - Properties, Area properties, Applications',
          'UNIT III: Curve Fitting - Principle of least squares, Straight lines, Second degree',
          'UNIT III: Correlation - Karl Pearson coefficient, Rank correlation',
          'UNIT III: Regression - Simple linear regression, Regression lines and properties',
          'UNIT IV: Testing of Hypothesis - Null, Alternative, Type I/II errors, Significance',
          'UNIT IV: Small Sample Tests - t-distribution, F-distribution, Chi-square test',
          'UNIT IV: Large Sample Tests - Proportion and Mean significance tests',
          'UNIT V: Queuing Theory - Structure, Operating characteristics, Steady state',
          'UNIT V: M/M/1 model of infinite and finite queue',
        ]),
      },
      {
        name: 'Artificial Intelligence',
        code: 'CSM222',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Introduction to AI - History, Turing Test, AI problems and techniques',
          'UNIT I: State space search, Production systems, Problem characteristics',
          'UNIT I: Uninformed Search - BFS, DFS; Heuristic Search - Hill Climbing, Best First, A*',
          'UNIT I: Constraint satisfaction, Means-End Analysis',
          'UNIT II: Knowledge Representation - Approaches and Issues',
          'UNIT II: Predicate Logic - Representing facts, Resolution, Unification algorithm',
          'UNIT II: Rules - Procedural vs Declarative, Forward vs Backward reasoning',
          'UNIT III: Statistical Reasoning - Bayes Theorem, Certainty Factor',
          'UNIT III: Bayesian Networks, Dempster-Shafer Theory',
          'UNIT III: Slot Filler Structures - Semantic nets, Frames, Conceptual dependencies, Scripts',
          'UNIT IV: Planning - Overview, Goal Stack planning, Non-Linear Planning, Hierarchical',
          'UNIT IV: NLP - Syntactic Processing, Semantic Analysis, Pragmatic Processing',
          'UNIT V: Expert Systems - Rule Based, Model Based, Case Based, Hybrid Systems',
        ]),
      },
      {
        name: 'Operating Systems',
        code: 'CSM223',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: OS Definition, Functionalities, Types, Structures, System calls',
          'UNIT I: Shell Programming - Commands and Shell scripts',
          'UNIT I: Processes - Concept, Scheduling, Operations, IPC, Threads',
          'UNIT II: CPU Scheduling - Criteria, Algorithms, Evaluation',
          'UNIT II: Process Synchronization - Critical section, Peterson solution, Semaphores, Monitors',
          'UNIT II: Case Study - Linux Process Management',
          'UNIT III: Deadlock - Characterization, Prevention, Avoidance, Detection, Recovery',
          'UNIT III: Memory Management - Swapping, Contiguous allocation, Segmentation, Paging',
          'UNIT III: Virtual Memory - Demand paging, Page replacement, Thrashing',
          'UNIT IV: File System Interface - File concept, Access methods, Directory structure',
          'UNIT IV: File System Implementation - Allocation methods, Free-space management',
          'UNIT V: Secondary Storage Structure - Disk structure, Scheduling, Swap space',
          'UNIT V: Protection - Goals, Principles, Access matrix, Access control',
        ]),
      },
      {
        name: 'Python Programming',
        code: 'CSM224',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Introduction to Data Science, Why Python, Variables, Data types, Operators',
          'UNIT I: Lists, Sets, Dictionaries, Tuples, Strings - Creating, Slicing, Indexing',
          'UNIT II: Decision Control, Loop Control Statements',
          'UNIT II: Functions - Defining, Calling, Arguments, Recursion, Lambda',
          'UNIT II: Modules, Statistical functions - mean, median, mode, variance',
          'UNIT III: NumPy - ndarrays, Data types, Arithmetic, Indexing, Slicing, Transposing',
          'UNIT III: Pandas - DataFrame, Index objects, Reindexing, Filtering, Sorting',
          'UNIT III: Correlation, Covariance, Unique Values, Value Counts',
          'UNIT IV: Handling Missing Data, Data Transformation, Discretization and Binning',
          'UNIT IV: Matplotlib - Bar Charts, Line Charts, Scatter plots, Histograms',
          'UNIT IV: Seaborn package, Ticks, Labels, Legends, Visualizing iris Data',
          'UNIT V: Exception Handling - Syntax, Single and Multiple Exceptions',
          'UNIT V: Regular Expressions - findall, match, search, split, sub',
          'UNIT V: Date and Time - datetime package, Time Series, Time Zone Handling',
        ]),
      },
      {
        name: 'Theory of Computation and Compilers',
        code: 'CSM225',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Finite Automata - DFA, NFA, NFA with epsilon, Equivalence',
          'UNIT I: Minimization of FA, Moore and Mealy machines',
          'UNIT I: Regular Expressions - Definition, FA to RE, RE to FA, Pumping Lemma',
          'UNIT II: Context Free Grammar - Definition, Derivation trees, Ambiguity',
          'UNIT II: Simplification of CFGs, Normal forms - CNF and GNF, Closure properties',
          'UNIT III: Compilers Overview - Phases, Lexical Analysis, Input Buffering',
          'UNIT III: Syntax Analysis - Parse trees, Left recursion, Top-down and Bottom-up parsing',
          'UNIT IV: Syntax Directed Translation, Semantic analysis, Intermediate code generation',
          'UNIT IV: Symbol Tables, Storage Organization - Allocation strategies, Parameter Passing',
          'UNIT V: Code Optimization - Principal sources, Loop optimization, DAG, Peephole',
          'UNIT V: Code Generation - Object programs, Machine model, Register allocation',
        ]),
      },
      {
        name: 'Design & Analysis of Algorithms',
        code: 'CSM226',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Introduction - Algorithmic problem solving, Analysis framework',
          'UNIT I: Asymptotic Notations, Efficiency Classes, Empirical Analysis',
          'UNIT II: Brute Force - Selection/Bubble sort, String Matching, Closest-Pair',
          'UNIT II: Exhaustive Search - TSP, Knapsack, Assignment Problem',
          'UNIT II: Decrease and Conquer - Insertion Sort, Combinatorial problems',
          'UNIT II: Divide and Conquer - Merge sort, Quick sort, Binary search, Strassen',
          'UNIT III: Transform and Conquer - Presorting, Gauss Elimination, 2-3 Trees, Heap sort',
          'UNIT III: Dynamic Programming - Binomial Coefficient, Warshall, Floyd, 0/1 Knapsack',
          'UNIT IV: Greedy Technique - Prim, Kruskal, Dijkstra, Huffman Trees',
          'UNIT IV: Space Time Tradeoffs - Horspool, Boyer-Moore, Hashing, B-Trees',
          'UNIT V: Limitations - Lower Bounds, Decision Trees, P, NP, NP-Complete',
          'UNIT V: Coping with Limitations - Backtracking, Branch and Bound, Approximation',
        ]),
      },
      {
        name: 'Python Programming Lab',
        code: 'CSM227',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Variables, Data Types, Control Structures, Functions',
          'Lab: Lists, Tuples, Dictionaries, Sets operations',
          'Lab: NumPy arrays - Creation, Indexing, Slicing, Arithmetic',
          'Lab: Pandas DataFrame - Loading, Filtering, Grouping, Aggregation',
          'Lab: Matplotlib - Line plots, Bar charts, Histograms, Scatter plots',
          'Lab: File I/O, Exception Handling, Regular Expressions',
          'Lab: Mini Project - Data Analysis with Visualization',
        ]),
      },
      {
        name: 'Microprocessor Interfacing Lab',
        code: 'CSM228',
        credits: 1.5,
        category: 'PC',
        units: 2,
        topics: t([
          'Lab: 8086 Assembly - Data transfer, Arithmetic operations',
          'Lab: 8086 Assembly - String operations, Sorting arrays',
          'Lab: 8086 Assembly - Code conversion (BCD, ASCII, Binary)',
          'Lab: Interfacing 8255 PPI - LED, Seven Segment Display',
          'Lab: Interfacing 8259 PIC - Interrupt handling',
          'Lab: Interfacing ADC and DAC',
        ]),
      },
      {
        name: 'Operating System Lab',
        code: 'CSM229',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Shell Programming - Basic commands and scripts',
          'Lab: CPU Scheduling - FCFS, SJF, Priority, Round Robin',
          'Lab: Process Synchronization - Producer-Consumer, Reader-Writer',
          'Lab: Deadlock Detection and Avoidance algorithms',
          'Lab: Memory Management - Paging, Segmentation simulation',
          'Lab: Page Replacement - FIFO, LRU, Optimal algorithms',
          'Lab: Disk Scheduling - FCFS, SSTF, SCAN, C-SCAN',
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
          'UNIT I: Introduction to Blockchain - Distributed Ledger Technology, History',
          'UNIT I: Blockchain Architecture - Blocks, Chains, Nodes, Networks',
          'UNIT II: Cryptographic Foundations - Hash Functions, SHA-256, Merkle Trees',
          'UNIT II: Digital Signatures, Public Key Cryptography, Key Management',
          'UNIT III: Consensus Mechanisms - Proof of Work, Proof of Stake, PBFT',
          'UNIT III: Mining, Difficulty Adjustment, 51% Attack, Forks',
          'UNIT IV: Smart Contracts - Ethereum, Solidity Programming, Gas',
          'UNIT IV: Decentralized Applications (DApps), Token Standards (ERC-20, ERC-721)',
          'UNIT V: Blockchain Applications - Supply Chain, Healthcare, Finance, Voting',
          'UNIT V: Hyperledger Fabric, Enterprise Blockchain, Scalability Challenges',
        ]),
      },
      {
        name: 'Professional Elective - I (Data Science)',
        code: 'CSM312',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Introduction to Data Science - Process, Tools, Applications',
          'UNIT I: Data Collection, Data Cleaning, Data Wrangling, EDA',
          'UNIT II: Statistical Analysis - Descriptive, Inferential Statistics',
          'UNIT II: Probability Distributions, Hypothesis Testing, A/B Testing',
          'UNIT III: Data Visualization - Principles, Chart Types, Dashboards',
          'UNIT III: Tools - Tableau, Power BI, Matplotlib, Seaborn',
          'UNIT IV: Feature Engineering - Selection, Extraction, Transformation',
          'UNIT IV: Dimensionality Reduction - PCA, LDA, t-SNE',
          'UNIT V: Big Data Fundamentals - Hadoop, Spark, MapReduce',
          'UNIT V: Data Pipelines, ETL, Data Warehousing concepts',
        ]),
      },
      {
        name: 'Machine Learning',
        code: 'CSM313',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Introduction - Types of ML, Applications, Well-posed learning problems',
          'UNIT I: Concept Learning - Find-S, Candidate Elimination, Inductive Bias',
          'UNIT II: Decision Trees - ID3, C4.5, Overfitting, Pruning, CART',
          'UNIT II: Regression - Linear, Multiple, Polynomial, Regularization (L1, L2)',
          'UNIT III: Bayesian Learning - Bayes Theorem, MAP, ML, Naive Bayes Classifier',
          'UNIT III: Instance-Based Learning - KNN, Locally Weighted Regression',
          'UNIT IV: SVM - Linear, Non-linear, Kernel Trick, Multi-class SVM',
          'UNIT IV: Ensemble Methods - Bagging, Boosting, Random Forest, XGBoost',
          'UNIT V: Unsupervised Learning - K-Means, Hierarchical, DBSCAN Clustering',
          'UNIT V: Dimensionality Reduction - PCA, LDA, Model Evaluation Metrics',
        ]),
      },
      {
        name: 'Competitive Programming',
        code: 'CSM314',
        credits: 3,
        category: 'SOC',
        units: 5,
        topics: t([
          'UNIT I: Problem Solving Strategies - Time/Space Complexity, I/O Optimization',
          'UNIT I: Arrays, Strings, Two Pointers, Sliding Window techniques',
          'UNIT II: Sorting - Merge Sort, Quick Sort, Counting Sort, Custom Comparators',
          'UNIT II: Searching - Binary Search, Ternary Search, Search on Answer',
          'UNIT III: Graph Algorithms - BFS, DFS, Shortest Paths, MST, Topological Sort',
          'UNIT III: Dynamic Programming - Memoization, Tabulation, Classic DP Problems',
          'UNIT IV: Number Theory - GCD, LCM, Modular Arithmetic, Prime Sieve, Factorization',
          'UNIT IV: Combinatorics - Permutations, Combinations, Inclusion-Exclusion',
          'UNIT V: Advanced Data Structures - Segment Trees, Fenwick Trees, Tries',
          'UNIT V: String Algorithms - KMP, Z-Algorithm, Rabin-Karp, Suffix Arrays',
        ]),
      },
      {
        name: 'Database Management Systems',
        code: 'CSM315',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Introduction - DBMS vs File System, Architecture, Data Models',
          'UNIT I: ER Model - Entities, Attributes, Relationships, ER Diagrams',
          'UNIT II: Relational Model - Keys, Relational Algebra, Tuple Calculus',
          'UNIT II: SQL - DDL, DML, DCL, TCL, Joins, Subqueries, Views, Triggers',
          'UNIT III: Normalization - 1NF, 2NF, 3NF, BCNF, 4NF, 5NF, Decomposition',
          'UNIT III: Functional Dependencies, Closure, Canonical Cover',
          'UNIT IV: Transaction Management - ACID Properties, States, Schedules',
          'UNIT IV: Concurrency Control - Locks, 2PL, Timestamp, MVCC, Deadlock',
          'UNIT V: Indexing - B-Tree, B+ Tree, Hashing, Query Optimization',
          'UNIT V: NoSQL Databases - Document, Key-Value, Column, Graph stores',
        ]),
      },
      {
        name: 'Machine Learning Lab',
        code: 'CSM316',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: Data Preprocessing - Scaling, Encoding, Handling Missing Values',
          'Lab: EDA and Visualization with Matplotlib, Seaborn',
          'Lab: Linear Regression, Polynomial Regression implementation',
          'Lab: Logistic Regression, Decision Tree, Random Forest',
          'Lab: SVM, KNN Classification on real datasets',
          'Lab: K-Means, Hierarchical Clustering, PCA',
          'Lab: Model Evaluation - Cross-validation, Confusion Matrix, ROC-AUC',
          'Lab: End-to-end ML Project with Sklearn pipelines',
        ]),
      },
      {
        name: 'Database Management Systems Lab',
        code: 'CSM317',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: DDL Commands - CREATE, ALTER, DROP, TRUNCATE',
          'Lab: DML Commands - SELECT, INSERT, UPDATE, DELETE with conditions',
          'Lab: Joins - INNER, LEFT, RIGHT, FULL, Self Join, Cross Join',
          'Lab: Subqueries, Nested Queries, Correlated Subqueries',
          'Lab: PL/SQL - Variables, Control Structures, Cursors',
          'Lab: PL/SQL - Stored Procedures, Functions, Triggers',
          'Lab: Normalization - Converting relations to normal forms',
          'Lab: ER Modeling and Database Design project',
        ]),
      },
      {
        name: 'Competitive Programming Lab',
        code: 'CSM318',
        credits: 1.5,
        category: 'SOC',
        units: 3,
        topics: t([
          'Lab: Online Judge setup and problem solving workflow',
          'Lab: Array and String manipulation problems',
          'Lab: Sorting, Searching, Binary Search problems',
          'Lab: Graph traversal and shortest path problems',
          'Lab: Dynamic Programming classic problems',
          'Lab: Contest participation and upsolving',
        ]),
      },
      {
        name: 'QA-I & Soft Skills',
        code: 'CSM319',
        credits: 1.5,
        category: 'HS',
        units: 3,
        topics: t([
          'Quantitative Aptitude - Numbers, LCM/GCD, Percentages',
          'Quantitative Aptitude - Profit/Loss, SI/CI, Time & Work',
          'Quantitative Aptitude - Time & Distance, Averages, Ratios',
          'Logical Reasoning - Series, Coding-Decoding, Blood Relations',
          'Logical Reasoning - Syllogisms, Puzzles, Seating Arrangement',
          'Soft Skills - Communication, Teamwork, Time Management',
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
        name: 'Open Elective - II (IoT)',
        code: 'CSM321',
        credits: 3,
        category: 'OE',
        units: 5,
        topics: t([
          'UNIT I: IoT Introduction - Architecture, Protocols, Applications',
          'UNIT I: IoT Hardware - Sensors, Actuators, Microcontrollers (Arduino, Raspberry Pi)',
          'UNIT II: IoT Communication - WiFi, Bluetooth, Zigbee, LoRa, MQTT',
          'UNIT II: IoT Protocols - CoAP, HTTP, WebSocket, REST APIs',
          'UNIT III: IoT Cloud Platforms - AWS IoT, Azure IoT, Google Cloud IoT',
          'UNIT III: Data Storage and Analytics for IoT',
          'UNIT IV: IoT Security - Threats, Encryption, Authentication',
          'UNIT IV: Edge Computing, Fog Computing concepts',
          'UNIT V: IoT Applications - Smart Home, Healthcare, Agriculture, Industry 4.0',
          'UNIT V: IoT System Design and Implementation',
        ]),
      },
      {
        name: 'Professional Elective - II (Computer Vision)',
        code: 'CSM322',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Image Fundamentals - Acquisition, Sampling, Quantization',
          'UNIT I: Image Enhancement - Point operations, Histogram processing',
          'UNIT II: Spatial Filtering - Smoothing, Sharpening, Edge Detection',
          'UNIT II: Frequency Domain - Fourier Transform, Filtering',
          'UNIT III: Image Segmentation - Thresholding, Region-based, Edge-based',
          'UNIT III: Morphological Operations - Erosion, Dilation, Opening, Closing',
          'UNIT IV: Feature Extraction - SIFT, SURF, ORB, HOG',
          'UNIT IV: Object Detection - Haar Cascades, Template Matching',
          'UNIT V: Deep Learning for CV - CNN, Object Detection (YOLO, R-CNN)',
          'UNIT V: Image Classification, Semantic Segmentation, OpenCV',
        ]),
      },
      {
        name: 'Professional Elective - III (NLP)',
        code: 'CSM323',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: NLP Introduction - Applications, Challenges, Levels of Analysis',
          'UNIT I: Text Preprocessing - Tokenization, Stemming, Lemmatization, Stop words',
          'UNIT II: Language Models - N-grams, Smoothing, Perplexity',
          'UNIT II: Word Embeddings - Word2Vec, GloVe, FastText',
          'UNIT III: Text Classification - Naive Bayes, SVM, Neural Networks',
          'UNIT III: Sentiment Analysis, Spam Detection, Topic Modeling (LDA)',
          'UNIT IV: Sequence Models - RNN, LSTM, GRU for NLP',
          'UNIT IV: Named Entity Recognition, POS Tagging, Dependency Parsing',
          'UNIT V: Transformers - Attention Mechanism, BERT, GPT',
          'UNIT V: Question Answering, Machine Translation, Text Generation',
        ]),
      },
      {
        name: 'Object Oriented Software Engineering',
        code: 'CSM324',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Software Engineering - Process Models, Waterfall, Iterative, Agile',
          'UNIT I: Requirements Engineering - Elicitation, Analysis, SRS Document',
          'UNIT II: Object-Oriented Analysis - Use Cases, Use Case Diagrams',
          'UNIT II: Domain Modeling - Class Diagrams, CRC Cards, Object Diagrams',
          'UNIT III: OO Design - Design Patterns, SOLID Principles, Coupling/Cohesion',
          'UNIT III: UML Diagrams - Sequence, Activity, State, Component, Deployment',
          'UNIT IV: Software Testing - Unit, Integration, System, Acceptance Testing',
          'UNIT IV: Test-Driven Development, Code Coverage, Defect Tracking',
          'UNIT V: Project Management - Estimation, Scheduling, Risk Management',
          'UNIT V: Software Metrics, Quality Assurance, Maintenance',
        ]),
      },
      {
        name: 'Web Technologies',
        code: 'CSM325',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: HTML5 - Semantic Elements, Forms, Multimedia, Canvas',
          'UNIT I: CSS3 - Selectors, Box Model, Flexbox, Grid, Responsive Design',
          'UNIT II: JavaScript - DOM, Events, ES6+ Features, Async Programming',
          'UNIT II: Frontend Frameworks - React.js Components, State, Hooks, Routing',
          'UNIT III: Node.js - Event Loop, Modules, npm, Express.js Framework',
          'UNIT III: RESTful API Design - Routes, Controllers, Middleware, Authentication',
          'UNIT IV: Database Integration - MongoDB with Mongoose, CRUD Operations',
          'UNIT IV: Authentication - JWT, Sessions, OAuth, Password Hashing',
          'UNIT V: Full Stack Development - MERN Stack Project Architecture',
          'UNIT V: Deployment - Git, Docker basics, Cloud Hosting (Vercel, Heroku)',
        ]),
      },
      {
        name: 'Deep Learning',
        code: 'CSM326',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Neural Networks - Perceptron, MLP, Activation Functions',
          'UNIT I: Training - Backpropagation, Gradient Descent, Optimizers (SGD, Adam)',
          'UNIT II: CNN - Convolution, Pooling, Stride, Padding, Feature Maps',
          'UNIT II: CNN Architectures - LeNet, AlexNet, VGG, ResNet, Inception',
          'UNIT III: RNN - Vanishing Gradient, LSTM, GRU, Bidirectional RNN',
          'UNIT III: Sequence-to-Sequence, Attention Mechanism',
          'UNIT IV: Generative Models - Autoencoders, VAE, GANs (Generator/Discriminator)',
          'UNIT IV: GAN Variants - DCGAN, Conditional GAN, StyleGAN',
          'UNIT V: Transfer Learning - Pre-trained Models, Fine-tuning',
          'UNIT V: Transformers - Self-Attention, Vision Transformers, BERT, GPT',
        ]),
      },
      {
        name: 'Web Technologies Lab',
        code: 'CSM327',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: HTML5/CSS3 - Responsive web pages, Forms, Layouts',
          'Lab: JavaScript - DOM manipulation, Event handling, Validation',
          'Lab: React.js - Components, Props, State, Hooks, Routing',
          'Lab: Node.js/Express - REST API development',
          'Lab: MongoDB integration - CRUD operations',
          'Lab: Authentication with JWT',
          'Lab: Full Stack MERN Project',
        ]),
      },
      {
        name: 'Deep Learning Lab',
        code: 'CSM328',
        credits: 1.5,
        category: 'PC',
        units: 3,
        topics: t([
          'Lab: TensorFlow/Keras basics - Tensors, Models, Training',
          'Lab: MLP for Regression and Classification',
          'Lab: CNN for Image Classification (MNIST, CIFAR-10)',
          'Lab: Transfer Learning with Pre-trained Models',
          'Lab: RNN/LSTM for Sequence Prediction, Text Classification',
          'Lab: Autoencoder for Image Denoising',
          'Lab: GAN implementation for Image Generation',
        ]),
      },
      {
        name: 'QA-II & Verbal Ability',
        code: 'CSM329',
        credits: 1.5,
        category: 'HS',
        units: 3,
        topics: t([
          'Quantitative Aptitude - Permutations, Combinations, Probability',
          'Quantitative Aptitude - Geometry, Mensuration, Data Interpretation',
          'Verbal Ability - Reading Comprehension, Parajumbles',
          'Verbal Ability - Grammar, Vocabulary, Sentence Correction',
          'Verbal Ability - Critical Reasoning, Inference',
          'Placement Preparation - Mock Tests, Interview Skills',
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
        name: 'Cryptography & Network Security',
        code: 'CSM411',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: t([
          'UNIT I: Security Concepts - CIA Triad, Attacks, Services, Mechanisms',
          'UNIT I: Classical Encryption - Substitution, Transposition, Vigenere, Playfair',
          'UNIT II: Block Ciphers - DES, AES, Modes of Operation (ECB, CBC, CFB, CTR)',
          'UNIT II: Stream Ciphers - RC4, Linear Feedback Shift Registers',
          'UNIT III: Public Key Cryptography - RSA Algorithm, Diffie-Hellman Key Exchange',
          'UNIT III: Elliptic Curve Cryptography, Digital Signatures (DSA)',
          'UNIT IV: Hash Functions - MD5, SHA family, HMAC, Digital Certificates',
          'UNIT IV: PKI - Certificate Authority, X.509, SSL/TLS Protocol',
          'UNIT V: Network Security - Firewalls, IDS/IPS, VPN, IPSec',
          'UNIT V: Application Security - Email Security (PGP), Web Security, Attacks (SQL Injection, XSS)',
        ]),
      },
      {
        name: 'Professional Elective - III (Cloud Computing)',
        code: 'CSM412',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: Cloud Computing Introduction - Characteristics, Service Models (IaaS, PaaS, SaaS)',
          'UNIT I: Deployment Models - Public, Private, Hybrid, Community Cloud',
          'UNIT II: Virtualization - Types, Hypervisors, Virtual Machines, Containers',
          'UNIT II: Docker - Images, Containers, Dockerfile, Docker Compose',
          'UNIT III: Cloud Platforms - AWS EC2, S3, RDS, Lambda',
          'UNIT III: Azure and GCP services overview',
          'UNIT IV: Cloud Storage - Object Storage, Block Storage, CDN',
          'UNIT IV: Cloud Security - Identity Management, Encryption, Compliance',
          'UNIT V: Kubernetes - Pods, Services, Deployments, Scaling',
          'UNIT V: Serverless Computing, Microservices Architecture, DevOps',
        ]),
      },
      {
        name: 'Professional Elective - IV (Reinforcement Learning)',
        code: 'CSM413',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: t([
          'UNIT I: RL Introduction - Agent, Environment, State, Action, Reward',
          'UNIT I: Markov Decision Processes, Bellman Equations',
          'UNIT II: Dynamic Programming - Policy Evaluation, Iteration, Value Iteration',
          'UNIT II: Monte Carlo Methods - First-visit, Every-visit MC',
          'UNIT III: Temporal Difference Learning - TD(0), SARSA, Q-Learning',
          'UNIT III: Eligibility Traces, TD(λ), Function Approximation',
          'UNIT IV: Deep RL - DQN, Double DQN, Dueling DQN, Experience Replay',
          'UNIT IV: Policy Gradient Methods - REINFORCE, Actor-Critic, A2C, A3C',
          'UNIT V: Advanced RL - PPO, DDPG, SAC, Multi-Agent RL',
          'UNIT V: RL Applications - Games, Robotics, Recommendation Systems',
        ]),
      },
      {
        name: 'Introduction to Intelligent Systems',
        code: 'CSM414',
        credits: 3,
        category: 'HS',
        units: 5,
        topics: t([
          'UNIT I: Intelligent Systems Overview - Definition, Types, Applications',
          'UNIT I: Knowledge-Based Systems, Rule-Based Systems',
          'UNIT II: Expert Systems - Architecture, Development, CLIPS',
          'UNIT II: Case-Based Reasoning, Model-Based Reasoning',
          'UNIT III: Fuzzy Logic - Fuzzy Sets, Operations, Membership Functions',
          'UNIT III: Fuzzy Inference Systems - Mamdani, Sugeno, Defuzzification',
          'UNIT IV: Genetic Algorithms - Encoding, Selection, Crossover, Mutation',
          'UNIT IV: Evolutionary Strategies, Genetic Programming',
          'UNIT V: Hybrid Intelligent Systems - Neuro-Fuzzy, GA-Fuzzy',
          'UNIT V: Swarm Intelligence - PSO, Ant Colony Optimization, Applications',
        ]),
      },
      {
        name: 'Artificial Intelligence in Robotics',
        code: 'CSM415',
        credits: 3,
        category: 'SOC',
        units: 5,
        topics: t([
          'UNIT I: Robotics Fundamentals - History, Types, Components, Applications',
          'UNIT I: Robot Anatomy - Links, Joints, Degrees of Freedom, Workspace',
          'UNIT II: Robot Kinematics - Forward, Inverse Kinematics, DH Parameters',
          'UNIT II: Robot Dynamics - Velocity, Acceleration, Forces, Torques',
          'UNIT III: Robot Perception - Sensors (Ultrasonic, LIDAR, Camera, IMU)',
          'UNIT III: Computer Vision for Robotics - Object Detection, SLAM',
          'UNIT IV: Motion Planning - Configuration Space, Path Planning, RRT, A*',
          'UNIT IV: Control - PID Control, Trajectory Tracking, Obstacle Avoidance',
          'UNIT V: AI in Robotics - ML for Robot Learning, Imitation Learning',
          'UNIT V: Autonomous Vehicles, Drones, Manipulation, Human-Robot Interaction',
        ]),
      },
      {
        name: 'OOSE Lab',
        code: 'CSM416',
        credits: 1.5,
        category: 'PC',
        units: 2,
        topics: t([
          'Lab: Requirements Analysis - Use Case Diagrams, SRS Document',
          'Lab: Class Diagrams, Object Diagrams, CRC Cards',
          'Lab: Sequence Diagrams, Activity Diagrams, State Diagrams',
          'Lab: Component Diagrams, Deployment Diagrams',
          'Lab: Design Patterns Implementation (Singleton, Factory, Observer)',
          'Lab: Software Testing - Unit Testing, Integration Testing',
          'Lab: Mini Project with complete SDLC documentation',
        ]),
      },
      {
        name: 'AI in Robotics Lab',
        code: 'CSM417',
        credits: 1.5,
        category: 'SOC',
        units: 2,
        topics: t([
          'Lab: Robot Simulation - ROS basics, Gazebo',
          'Lab: Robot Kinematics - Forward/Inverse with Python',
          'Lab: Sensor Integration - LIDAR, Camera',
          'Lab: Path Planning - A* algorithm implementation',
          'Lab: SLAM - Mapping and Localization',
          'Lab: Object Detection with Robot Vision',
        ]),
      },
      {
        name: 'Project Phase 1',
        code: 'CSM418',
        credits: 2,
        category: 'PR',
        units: 1,
        topics: t([
          'Phase 1: Problem Identification and Domain Study',
          'Phase 1: Literature Survey and Gap Analysis',
          'Phase 1: Requirements Analysis and System Design',
          'Phase 1: Technology Stack Selection',
          'Phase 1: Partial Implementation and Prototype',
          'Phase 1: Progress Presentation and Documentation',
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
        name: 'Open Elective - III (Entrepreneurship)',
        code: 'CSM421',
        credits: 3,
        category: 'OE',
        units: 4,
        topics: t([
          'UNIT I: Entrepreneurship - Definition, Importance, Types of Entrepreneurs',
          'UNIT I: Entrepreneurial Mindset, Innovation, Opportunity Recognition',
          'UNIT II: Business Planning - Market Analysis, Competition, SWOT Analysis',
          'UNIT II: Business Model Canvas, Value Proposition, Revenue Streams',
          'UNIT III: Funding - Bootstrapping, Angel Investors, VC, Crowdfunding',
          'UNIT III: Legal Aspects - Company Registration, IPR, Compliance',
          'UNIT IV: Startup Ecosystem - Incubators, Accelerators, Mentorship',
          'UNIT IV: Scaling, Exit Strategies, Case Studies of Successful Startups',
        ]),
      },
      {
        name: 'Project Phase 2 / Internship',
        code: 'CSM423',
        credits: 8,
        category: 'PR',
        units: 1,
        topics: t([
          'Project: Complete Implementation of proposed system',
          'Project: Testing - Unit, Integration, System, UAT',
          'Project: Performance Optimization and Bug Fixing',
          'Project: Documentation - User Manual, Technical Documentation',
          'Project: Research Paper / Patent Filing (if applicable)',
          'Project: Final Presentation and Viva Voce',
          'Internship: Industry Experience (6-8 weeks)',
          'Internship: Project Work and Report Submission',
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
