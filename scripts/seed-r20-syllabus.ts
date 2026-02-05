/**
 * R20 Syllabus Seed Script for CSE (AI&ML) - 2022 Batch
 * ANITS (Anil Neerukonda Institute of Technology and Sciences)
 * 
 * DETAILED UNIT-WISE TOPICS AND SUBTOPICS
 * Run this script to populate the database with the R20 curriculum
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

// R20 CSE (AI&ML) Curriculum Data with DETAILED TOPICS
const r20Curriculum = {
  // ============================================
  // YEAR 1 SEMESTER 1
  // ============================================
  'Y1S1': {
    year: '1',
    semester: '1',
    subjects: [
      {
        name: 'Engineering Mathematics – I',
        code: 'MA101',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: [
          // UNIT I - Matrices
          { topic: 'UNIT I: Matrices - Introduction and Types of Matrices', status: 'not-started' },
          { topic: 'UNIT I: Rank of a Matrix - Echelon Form', status: 'not-started' },
          { topic: 'UNIT I: Normal Form and Rank Computation', status: 'not-started' },
          { topic: 'UNIT I: System of Linear Equations - Consistency', status: 'not-started' },
          { topic: 'UNIT I: Gauss Elimination Method', status: 'not-started' },
          { topic: 'UNIT I: Gauss-Jordan Method', status: 'not-started' },
          { topic: 'UNIT I: Eigenvalues and Eigenvectors', status: 'not-started' },
          { topic: 'UNIT I: Properties of Eigenvalues', status: 'not-started' },
          { topic: 'UNIT I: Cayley-Hamilton Theorem', status: 'not-started' },
          { topic: 'UNIT I: Diagonalization of Matrices', status: 'not-started' },
          // UNIT II - Differential Calculus
          { topic: 'UNIT II: Mean Value Theorems - Rolle\'s Theorem', status: 'not-started' },
          { topic: 'UNIT II: Lagrange\'s Mean Value Theorem', status: 'not-started' },
          { topic: 'UNIT II: Cauchy\'s Mean Value Theorem', status: 'not-started' },
          { topic: 'UNIT II: Taylor\'s and Maclaurin\'s Series', status: 'not-started' },
          { topic: 'UNIT II: Indeterminate Forms - L\'Hospital\'s Rule', status: 'not-started' },
          { topic: 'UNIT II: Curvature and Radius of Curvature', status: 'not-started' },
          // UNIT III - Partial Differentiation
          { topic: 'UNIT III: Partial Derivatives - Basic Concepts', status: 'not-started' },
          { topic: 'UNIT III: Total Derivatives', status: 'not-started' },
          { topic: 'UNIT III: Euler\'s Theorem for Homogeneous Functions', status: 'not-started' },
          { topic: 'UNIT III: Jacobians and Properties', status: 'not-started' },
          { topic: 'UNIT III: Maxima and Minima of Two Variables', status: 'not-started' },
          { topic: 'UNIT III: Lagrange\'s Method of Multipliers', status: 'not-started' },
          // UNIT IV - Multiple Integrals
          { topic: 'UNIT IV: Double Integrals - Definition and Evaluation', status: 'not-started' },
          { topic: 'UNIT IV: Change of Order of Integration', status: 'not-started' },
          { topic: 'UNIT IV: Double Integrals in Polar Coordinates', status: 'not-started' },
          { topic: 'UNIT IV: Triple Integrals - Cartesian Coordinates', status: 'not-started' },
          { topic: 'UNIT IV: Triple Integrals in Cylindrical and Spherical Coordinates', status: 'not-started' },
          { topic: 'UNIT IV: Applications - Area, Volume, Mass', status: 'not-started' },
          // UNIT V - Special Functions
          { topic: 'UNIT V: Beta Function - Definition and Properties', status: 'not-started' },
          { topic: 'UNIT V: Gamma Function - Definition and Properties', status: 'not-started' },
          { topic: 'UNIT V: Relation between Beta and Gamma Functions', status: 'not-started' },
          { topic: 'UNIT V: Applications of Beta and Gamma Functions', status: 'not-started' },
        ],
        textbooks: ['B.S. Grewal, Higher Engineering Mathematics, Khanna Publishers'],
      },
      {
        name: 'Communicative English',
        code: 'EN101',
        credits: 3,
        category: 'HS',
        units: 5,
        topics: [
          // UNIT I - Vocabulary
          { topic: 'UNIT I: Vocabulary Building - Word Formation', status: 'not-started' },
          { topic: 'UNIT I: Synonyms and Antonyms', status: 'not-started' },
          { topic: 'UNIT I: One Word Substitutes', status: 'not-started' },
          { topic: 'UNIT I: Idioms and Phrases', status: 'not-started' },
          // UNIT II - Grammar
          { topic: 'UNIT II: Parts of Speech', status: 'not-started' },
          { topic: 'UNIT II: Tenses - Present, Past, Future', status: 'not-started' },
          { topic: 'UNIT II: Subject-Verb Agreement', status: 'not-started' },
          { topic: 'UNIT II: Active and Passive Voice', status: 'not-started' },
          { topic: 'UNIT II: Direct and Indirect Speech', status: 'not-started' },
          // UNIT III - Reading Skills
          { topic: 'UNIT III: Reading Comprehension Techniques', status: 'not-started' },
          { topic: 'UNIT III: Skimming and Scanning', status: 'not-started' },
          { topic: 'UNIT III: Inferential Reading', status: 'not-started' },
          { topic: 'UNIT III: Critical Reading', status: 'not-started' },
          // UNIT IV - Writing Skills
          { topic: 'UNIT IV: Paragraph Writing', status: 'not-started' },
          { topic: 'UNIT IV: Essay Writing', status: 'not-started' },
          { topic: 'UNIT IV: Letter Writing - Formal and Informal', status: 'not-started' },
          { topic: 'UNIT IV: Report Writing', status: 'not-started' },
          { topic: 'UNIT IV: Email Etiquette', status: 'not-started' },
          // UNIT V - Communication Skills
          { topic: 'UNIT V: Verbal Communication', status: 'not-started' },
          { topic: 'UNIT V: Non-verbal Communication', status: 'not-started' },
          { topic: 'UNIT V: Presentation Skills', status: 'not-started' },
          { topic: 'UNIT V: Group Discussion', status: 'not-started' },
          { topic: 'UNIT V: Interview Skills', status: 'not-started' },
        ],
      },
      {
        name: 'Problem Solving with C',
        code: 'CS101',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: [
          // UNIT I - Introduction to Programming
          { topic: 'UNIT I: Introduction to Computers and Programming', status: 'not-started' },
          { topic: 'UNIT I: Problem Solving Techniques - Algorithms', status: 'not-started' },
          { topic: 'UNIT I: Flowcharts and Pseudocode', status: 'not-started' },
          { topic: 'UNIT I: Introduction to C - History and Features', status: 'not-started' },
          { topic: 'UNIT I: Structure of a C Program', status: 'not-started' },
          { topic: 'UNIT I: Compilation and Execution', status: 'not-started' },
          { topic: 'UNIT I: Data Types - int, float, char, double', status: 'not-started' },
          { topic: 'UNIT I: Variables and Constants', status: 'not-started' },
          { topic: 'UNIT I: Operators - Arithmetic, Relational, Logical', status: 'not-started' },
          { topic: 'UNIT I: Assignment and Increment/Decrement Operators', status: 'not-started' },
          { topic: 'UNIT I: Bitwise and Ternary Operators', status: 'not-started' },
          { topic: 'UNIT I: Input/Output - printf() and scanf()', status: 'not-started' },
          // UNIT II - Control Structures
          { topic: 'UNIT II: Decision Making - if Statement', status: 'not-started' },
          { topic: 'UNIT II: if-else Statement', status: 'not-started' },
          { topic: 'UNIT II: Nested if-else', status: 'not-started' },
          { topic: 'UNIT II: else-if Ladder', status: 'not-started' },
          { topic: 'UNIT II: switch Statement', status: 'not-started' },
          { topic: 'UNIT II: Looping - while Loop', status: 'not-started' },
          { topic: 'UNIT II: do-while Loop', status: 'not-started' },
          { topic: 'UNIT II: for Loop', status: 'not-started' },
          { topic: 'UNIT II: Nested Loops', status: 'not-started' },
          { topic: 'UNIT II: break and continue Statements', status: 'not-started' },
          { topic: 'UNIT II: goto Statement', status: 'not-started' },
          // UNIT III - Functions and Arrays
          { topic: 'UNIT III: Functions - Definition and Declaration', status: 'not-started' },
          { topic: 'UNIT III: Function Call - Call by Value', status: 'not-started' },
          { topic: 'UNIT III: Call by Reference', status: 'not-started' },
          { topic: 'UNIT III: Recursion - Concept and Examples', status: 'not-started' },
          { topic: 'UNIT III: Storage Classes - auto, static, extern, register', status: 'not-started' },
          { topic: 'UNIT III: Arrays - One Dimensional Arrays', status: 'not-started' },
          { topic: 'UNIT III: Two Dimensional Arrays', status: 'not-started' },
          { topic: 'UNIT III: Multi-dimensional Arrays', status: 'not-started' },
          { topic: 'UNIT III: Passing Arrays to Functions', status: 'not-started' },
          // UNIT IV - Pointers and Strings
          { topic: 'UNIT IV: Pointers - Introduction and Declaration', status: 'not-started' },
          { topic: 'UNIT IV: Pointer Arithmetic', status: 'not-started' },
          { topic: 'UNIT IV: Pointers and Arrays', status: 'not-started' },
          { topic: 'UNIT IV: Pointers and Functions', status: 'not-started' },
          { topic: 'UNIT IV: Pointer to Pointer', status: 'not-started' },
          { topic: 'UNIT IV: Dynamic Memory Allocation - malloc(), calloc()', status: 'not-started' },
          { topic: 'UNIT IV: realloc() and free()', status: 'not-started' },
          { topic: 'UNIT IV: Strings - Declaration and Initialization', status: 'not-started' },
          { topic: 'UNIT IV: String Functions - strlen, strcpy, strcat, strcmp', status: 'not-started' },
          { topic: 'UNIT IV: Array of Strings', status: 'not-started' },
          // UNIT V - Structures and Files
          { topic: 'UNIT V: Structures - Definition and Declaration', status: 'not-started' },
          { topic: 'UNIT V: Accessing Structure Members', status: 'not-started' },
          { topic: 'UNIT V: Array of Structures', status: 'not-started' },
          { topic: 'UNIT V: Nested Structures', status: 'not-started' },
          { topic: 'UNIT V: Structures and Functions', status: 'not-started' },
          { topic: 'UNIT V: Pointers to Structures', status: 'not-started' },
          { topic: 'UNIT V: Unions - Definition and Usage', status: 'not-started' },
          { topic: 'UNIT V: Difference between Structures and Unions', status: 'not-started' },
          { topic: 'UNIT V: File Handling - Introduction', status: 'not-started' },
          { topic: 'UNIT V: File Operations - fopen, fclose', status: 'not-started' },
          { topic: 'UNIT V: Reading and Writing Files - fscanf, fprintf', status: 'not-started' },
          { topic: 'UNIT V: fgets, fputs, fread, fwrite', status: 'not-started' },
          { topic: 'UNIT V: Random Access - fseek, ftell, rewind', status: 'not-started' },
        ],
      },
      {
        name: 'Basic Electronics',
        code: 'EC101',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: [
          // UNIT I - Semiconductor Diodes
          { topic: 'UNIT I: Introduction to Semiconductors', status: 'not-started' },
          { topic: 'UNIT I: P-type and N-type Semiconductors', status: 'not-started' },
          { topic: 'UNIT I: PN Junction Diode - Formation and Characteristics', status: 'not-started' },
          { topic: 'UNIT I: Diode as a Rectifier - Half Wave Rectifier', status: 'not-started' },
          { topic: 'UNIT I: Full Wave Rectifier', status: 'not-started' },
          { topic: 'UNIT I: Bridge Rectifier', status: 'not-started' },
          { topic: 'UNIT I: Zener Diode and Voltage Regulation', status: 'not-started' },
          // UNIT II - Transistors
          { topic: 'UNIT II: Bipolar Junction Transistor (BJT) - Construction', status: 'not-started' },
          { topic: 'UNIT II: BJT Operating Regions', status: 'not-started' },
          { topic: 'UNIT II: BJT Configurations - CB, CE, CC', status: 'not-started' },
          { topic: 'UNIT II: BJT Biasing Techniques', status: 'not-started' },
          { topic: 'UNIT II: Field Effect Transistor (FET) - Introduction', status: 'not-started' },
          { topic: 'UNIT II: JFET Characteristics', status: 'not-started' },
          { topic: 'UNIT II: MOSFET - Enhancement and Depletion', status: 'not-started' },
          // UNIT III - Amplifiers
          { topic: 'UNIT III: Amplifier Basics - Gain, Bandwidth', status: 'not-started' },
          { topic: 'UNIT III: Single Stage CE Amplifier', status: 'not-started' },
          { topic: 'UNIT III: Frequency Response of Amplifiers', status: 'not-started' },
          { topic: 'UNIT III: Multistage Amplifiers', status: 'not-started' },
          { topic: 'UNIT III: Power Amplifiers - Class A, B, AB, C', status: 'not-started' },
          // UNIT IV - Operational Amplifiers
          { topic: 'UNIT IV: Op-Amp - Introduction and Characteristics', status: 'not-started' },
          { topic: 'UNIT IV: Inverting Amplifier', status: 'not-started' },
          { topic: 'UNIT IV: Non-Inverting Amplifier', status: 'not-started' },
          { topic: 'UNIT IV: Summing Amplifier', status: 'not-started' },
          { topic: 'UNIT IV: Differentiator and Integrator', status: 'not-started' },
          { topic: 'UNIT IV: Comparators', status: 'not-started' },
          // UNIT V - Digital Electronics
          { topic: 'UNIT V: Number Systems - Binary, Octal, Hexadecimal', status: 'not-started' },
          { topic: 'UNIT V: Logic Gates - AND, OR, NOT, NAND, NOR, XOR', status: 'not-started' },
          { topic: 'UNIT V: Boolean Algebra', status: 'not-started' },
          { topic: 'UNIT V: Karnaugh Maps', status: 'not-started' },
          { topic: 'UNIT V: Flip-Flops - SR, JK, D, T', status: 'not-started' },
          { topic: 'UNIT V: Counters and Registers', status: 'not-started' },
        ],
      },
      {
        name: 'Digital Logic Design',
        code: 'CS102',
        credits: 3,
        category: 'ES',
        units: 5,
        topics: [
          // UNIT I - Number Systems
          { topic: 'UNIT I: Number Systems - Decimal, Binary, Octal, Hexadecimal', status: 'not-started' },
          { topic: 'UNIT I: Number Base Conversions', status: 'not-started' },
          { topic: 'UNIT I: Binary Arithmetic - Addition, Subtraction', status: 'not-started' },
          { topic: 'UNIT I: 1\'s and 2\'s Complement', status: 'not-started' },
          { topic: 'UNIT I: Binary Codes - BCD, Gray Code, Excess-3', status: 'not-started' },
          { topic: 'UNIT I: Error Detection and Correction Codes', status: 'not-started' },
          // UNIT II - Boolean Algebra and Logic Gates
          { topic: 'UNIT II: Boolean Algebra - Postulates and Theorems', status: 'not-started' },
          { topic: 'UNIT II: De Morgan\'s Theorems', status: 'not-started' },
          { topic: 'UNIT II: Logic Gates - AND, OR, NOT, NAND, NOR', status: 'not-started' },
          { topic: 'UNIT II: XOR and XNOR Gates', status: 'not-started' },
          { topic: 'UNIT II: Universal Gates', status: 'not-started' },
          { topic: 'UNIT II: SOP and POS Forms', status: 'not-started' },
          { topic: 'UNIT II: Karnaugh Maps - 2, 3, 4 Variables', status: 'not-started' },
          { topic: 'UNIT II: Don\'t Care Conditions', status: 'not-started' },
          // UNIT III - Combinational Logic Circuits
          { topic: 'UNIT III: Half Adder and Full Adder', status: 'not-started' },
          { topic: 'UNIT III: Half Subtractor and Full Subtractor', status: 'not-started' },
          { topic: 'UNIT III: Ripple Carry Adder', status: 'not-started' },
          { topic: 'UNIT III: Carry Look Ahead Adder', status: 'not-started' },
          { topic: 'UNIT III: Multiplexer (MUX) - 2:1, 4:1, 8:1', status: 'not-started' },
          { topic: 'UNIT III: Demultiplexer (DEMUX)', status: 'not-started' },
          { topic: 'UNIT III: Encoder', status: 'not-started' },
          { topic: 'UNIT III: Decoder', status: 'not-started' },
          { topic: 'UNIT III: Magnitude Comparator', status: 'not-started' },
          // UNIT IV - Sequential Logic Circuits
          { topic: 'UNIT IV: Flip-Flops - SR Flip-Flop', status: 'not-started' },
          { topic: 'UNIT IV: JK Flip-Flop', status: 'not-started' },
          { topic: 'UNIT IV: D Flip-Flop', status: 'not-started' },
          { topic: 'UNIT IV: T Flip-Flop', status: 'not-started' },
          { topic: 'UNIT IV: Flip-Flop Conversions', status: 'not-started' },
          { topic: 'UNIT IV: Registers - Shift Registers', status: 'not-started' },
          { topic: 'UNIT IV: Types of Shift Registers - SISO, SIPO, PISO, PIPO', status: 'not-started' },
          { topic: 'UNIT IV: Counters - Asynchronous (Ripple) Counters', status: 'not-started' },
          { topic: 'UNIT IV: Synchronous Counters', status: 'not-started' },
          { topic: 'UNIT IV: Up/Down Counters', status: 'not-started' },
          // UNIT V - Memory and Programmable Logic
          { topic: 'UNIT V: Memory Classification - RAM, ROM', status: 'not-started' },
          { topic: 'UNIT V: Static RAM (SRAM)', status: 'not-started' },
          { topic: 'UNIT V: Dynamic RAM (DRAM)', status: 'not-started' },
          { topic: 'UNIT V: ROM Types - PROM, EPROM, EEPROM', status: 'not-started' },
          { topic: 'UNIT V: Programmable Logic Array (PLA)', status: 'not-started' },
          { topic: 'UNIT V: Programmable Array Logic (PAL)', status: 'not-started' },
        ],
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
        name: 'Engineering Mathematics – II',
        code: 'MA102',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: [
          // UNIT I - Differential Equations
          { topic: 'UNIT I: Ordinary Differential Equations - Introduction', status: 'not-started' },
          { topic: 'UNIT I: First Order ODE - Variable Separable', status: 'not-started' },
          { topic: 'UNIT I: Homogeneous Equations', status: 'not-started' },
          { topic: 'UNIT I: Linear Equations', status: 'not-started' },
          { topic: 'UNIT I: Bernoulli\'s Equation', status: 'not-started' },
          { topic: 'UNIT I: Exact Differential Equations', status: 'not-started' },
          // UNIT II - Higher Order ODEs
          { topic: 'UNIT II: Second Order Linear ODE with Constant Coefficients', status: 'not-started' },
          { topic: 'UNIT II: Complementary Function', status: 'not-started' },
          { topic: 'UNIT II: Particular Integral - Method of Undetermined Coefficients', status: 'not-started' },
          { topic: 'UNIT II: Variation of Parameters', status: 'not-started' },
          { topic: 'UNIT II: Cauchy-Euler Equations', status: 'not-started' },
          // UNIT III - Laplace Transforms
          { topic: 'UNIT III: Laplace Transform - Definition and Properties', status: 'not-started' },
          { topic: 'UNIT III: Laplace Transform of Standard Functions', status: 'not-started' },
          { topic: 'UNIT III: First and Second Shifting Theorems', status: 'not-started' },
          { topic: 'UNIT III: Inverse Laplace Transform', status: 'not-started' },
          { topic: 'UNIT III: Convolution Theorem', status: 'not-started' },
          { topic: 'UNIT III: Application to Solve ODEs', status: 'not-started' },
          // UNIT IV - Vector Calculus
          { topic: 'UNIT IV: Vector Differentiation - Gradient', status: 'not-started' },
          { topic: 'UNIT IV: Divergence', status: 'not-started' },
          { topic: 'UNIT IV: Curl', status: 'not-started' },
          { topic: 'UNIT IV: Solenoidal and Irrotational Fields', status: 'not-started' },
          { topic: 'UNIT IV: Line Integrals', status: 'not-started' },
          { topic: 'UNIT IV: Surface Integrals', status: 'not-started' },
          { topic: 'UNIT IV: Volume Integrals', status: 'not-started' },
          { topic: 'UNIT IV: Green\'s Theorem', status: 'not-started' },
          { topic: 'UNIT IV: Stokes\' Theorem', status: 'not-started' },
          { topic: 'UNIT IV: Gauss Divergence Theorem', status: 'not-started' },
          // UNIT V - Complex Analysis
          { topic: 'UNIT V: Complex Numbers and Functions', status: 'not-started' },
          { topic: 'UNIT V: Analytic Functions - Cauchy-Riemann Equations', status: 'not-started' },
          { topic: 'UNIT V: Harmonic Functions', status: 'not-started' },
          { topic: 'UNIT V: Complex Integration - Cauchy\'s Integral Theorem', status: 'not-started' },
          { topic: 'UNIT V: Cauchy\'s Integral Formula', status: 'not-started' },
        ],
      },
      {
        name: 'Engineering Physics',
        code: 'PH101',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: [
          // UNIT I - Wave Optics
          { topic: 'UNIT I: Interference of Light - Introduction', status: 'not-started' },
          { topic: 'UNIT I: Young\'s Double Slit Experiment', status: 'not-started' },
          { topic: 'UNIT I: Thin Film Interference', status: 'not-started' },
          { topic: 'UNIT I: Newton\'s Rings', status: 'not-started' },
          { topic: 'UNIT I: Diffraction - Fresnel and Fraunhofer', status: 'not-started' },
          { topic: 'UNIT I: Single Slit Diffraction', status: 'not-started' },
          { topic: 'UNIT I: Diffraction Grating', status: 'not-started' },
          // UNIT II - Lasers and Fiber Optics
          { topic: 'UNIT II: Laser - Principles of Laser Action', status: 'not-started' },
          { topic: 'UNIT II: Spontaneous and Stimulated Emission', status: 'not-started' },
          { topic: 'UNIT II: Population Inversion', status: 'not-started' },
          { topic: 'UNIT II: Types of Lasers - Ruby, He-Ne, CO2', status: 'not-started' },
          { topic: 'UNIT II: Semiconductor Lasers', status: 'not-started' },
          { topic: 'UNIT II: Fiber Optics - Total Internal Reflection', status: 'not-started' },
          { topic: 'UNIT II: Optical Fiber Types - Step Index, Graded Index', status: 'not-started' },
          { topic: 'UNIT II: Numerical Aperture and Acceptance Angle', status: 'not-started' },
          { topic: 'UNIT II: Applications of Fiber Optics', status: 'not-started' },
          // UNIT III - Quantum Mechanics
          { topic: 'UNIT III: Black Body Radiation', status: 'not-started' },
          { topic: 'UNIT III: Planck\'s Quantum Theory', status: 'not-started' },
          { topic: 'UNIT III: Photoelectric Effect', status: 'not-started' },
          { topic: 'UNIT III: Compton Effect', status: 'not-started' },
          { topic: 'UNIT III: de Broglie Hypothesis', status: 'not-started' },
          { topic: 'UNIT III: Heisenberg Uncertainty Principle', status: 'not-started' },
          { topic: 'UNIT III: Schrödinger Wave Equation', status: 'not-started' },
          { topic: 'UNIT III: Particle in a Box', status: 'not-started' },
          // UNIT IV - Semiconductor Physics
          { topic: 'UNIT IV: Band Theory of Solids', status: 'not-started' },
          { topic: 'UNIT IV: Classification of Materials', status: 'not-started' },
          { topic: 'UNIT IV: Intrinsic and Extrinsic Semiconductors', status: 'not-started' },
          { topic: 'UNIT IV: Fermi Level in Semiconductors', status: 'not-started' },
          { topic: 'UNIT IV: Hall Effect and Applications', status: 'not-started' },
          // UNIT V - Nanotechnology
          { topic: 'UNIT V: Introduction to Nanomaterials', status: 'not-started' },
          { topic: 'UNIT V: Properties of Nanomaterials', status: 'not-started' },
          { topic: 'UNIT V: Synthesis Methods - Top-Down and Bottom-Up', status: 'not-started' },
          { topic: 'UNIT V: Carbon Nanotubes', status: 'not-started' },
          { topic: 'UNIT V: Applications of Nanotechnology', status: 'not-started' },
        ],
      },
      {
        name: 'Engineering Chemistry',
        code: 'CH101',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: [
          // UNIT I - Electrochemistry
          { topic: 'UNIT I: Electrochemical Cells - Galvanic Cells', status: 'not-started' },
          { topic: 'UNIT I: Electrode Potentials', status: 'not-started' },
          { topic: 'UNIT I: Nernst Equation', status: 'not-started' },
          { topic: 'UNIT I: Reference Electrodes', status: 'not-started' },
          { topic: 'UNIT I: Batteries - Primary and Secondary', status: 'not-started' },
          { topic: 'UNIT I: Lead Acid Battery', status: 'not-started' },
          { topic: 'UNIT I: Lithium-ion Battery', status: 'not-started' },
          { topic: 'UNIT I: Fuel Cells', status: 'not-started' },
          // UNIT II - Corrosion
          { topic: 'UNIT II: Corrosion - Introduction and Types', status: 'not-started' },
          { topic: 'UNIT II: Electrochemical Theory of Corrosion', status: 'not-started' },
          { topic: 'UNIT II: Galvanic Corrosion', status: 'not-started' },
          { topic: 'UNIT II: Differential Aeration Corrosion', status: 'not-started' },
          { topic: 'UNIT II: Factors Affecting Corrosion', status: 'not-started' },
          { topic: 'UNIT II: Corrosion Prevention Methods', status: 'not-started' },
          { topic: 'UNIT II: Cathodic and Anodic Protection', status: 'not-started' },
          { topic: 'UNIT II: Protective Coatings', status: 'not-started' },
          // UNIT III - Engineering Materials
          { topic: 'UNIT III: Polymers - Classification', status: 'not-started' },
          { topic: 'UNIT III: Polymerization Mechanisms', status: 'not-started' },
          { topic: 'UNIT III: Thermoplastics and Thermosetting Plastics', status: 'not-started' },
          { topic: 'UNIT III: Rubber - Natural and Synthetic', status: 'not-started' },
          { topic: 'UNIT III: Conducting Polymers', status: 'not-started' },
          { topic: 'UNIT III: Composites - Introduction', status: 'not-started' },
          // UNIT IV - Water Technology
          { topic: 'UNIT IV: Water Quality Parameters', status: 'not-started' },
          { topic: 'UNIT IV: Hardness of Water', status: 'not-started' },
          { topic: 'UNIT IV: Determination of Hardness', status: 'not-started' },
          { topic: 'UNIT IV: Water Softening Methods', status: 'not-started' },
          { topic: 'UNIT IV: Ion Exchange Method', status: 'not-started' },
          { topic: 'UNIT IV: Reverse Osmosis', status: 'not-started' },
          { topic: 'UNIT IV: Boiler Problems - Scale, Sludge, Priming', status: 'not-started' },
          // UNIT V - Green Chemistry
          { topic: 'UNIT V: Green Chemistry Principles', status: 'not-started' },
          { topic: 'UNIT V: Atom Economy', status: 'not-started' },
          { topic: 'UNIT V: Green Solvents', status: 'not-started' },
          { topic: 'UNIT V: Environmental Pollution', status: 'not-started' },
          { topic: 'UNIT V: Waste Management', status: 'not-started' },
        ],
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
        name: 'Data Structures',
        code: 'CS201',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction and Arrays
          { topic: 'UNIT I: Introduction to Data Structures - Classification', status: 'not-started' },
          { topic: 'UNIT I: Abstract Data Types (ADT)', status: 'not-started' },
          { topic: 'UNIT I: Time and Space Complexity Analysis', status: 'not-started' },
          { topic: 'UNIT I: Asymptotic Notations - Big O, Omega, Theta', status: 'not-started' },
          { topic: 'UNIT I: Arrays - One Dimensional Arrays', status: 'not-started' },
          { topic: 'UNIT I: Two Dimensional Arrays - Row Major, Column Major', status: 'not-started' },
          { topic: 'UNIT I: Sparse Matrices - Representation', status: 'not-started' },
          { topic: 'UNIT I: Operations on Sparse Matrices', status: 'not-started' },
          { topic: 'UNIT I: Searching - Linear Search', status: 'not-started' },
          { topic: 'UNIT I: Binary Search', status: 'not-started' },
          { topic: 'UNIT I: Interpolation Search', status: 'not-started' },
          { topic: 'UNIT I: Sorting - Bubble Sort', status: 'not-started' },
          { topic: 'UNIT I: Selection Sort', status: 'not-started' },
          { topic: 'UNIT I: Insertion Sort', status: 'not-started' },
          // UNIT II - Stacks and Queues
          { topic: 'UNIT II: Stack ADT - Definition and Operations', status: 'not-started' },
          { topic: 'UNIT II: Stack Implementation using Arrays', status: 'not-started' },
          { topic: 'UNIT II: Stack Implementation using Linked List', status: 'not-started' },
          { topic: 'UNIT II: Applications - Infix to Postfix Conversion', status: 'not-started' },
          { topic: 'UNIT II: Postfix Expression Evaluation', status: 'not-started' },
          { topic: 'UNIT II: Infix to Prefix Conversion', status: 'not-started' },
          { topic: 'UNIT II: Recursion using Stack', status: 'not-started' },
          { topic: 'UNIT II: Tower of Hanoi Problem', status: 'not-started' },
          { topic: 'UNIT II: Queue ADT - Definition and Operations', status: 'not-started' },
          { topic: 'UNIT II: Queue Implementation using Arrays', status: 'not-started' },
          { topic: 'UNIT II: Circular Queue', status: 'not-started' },
          { topic: 'UNIT II: Double Ended Queue (Deque)', status: 'not-started' },
          { topic: 'UNIT II: Priority Queue', status: 'not-started' },
          { topic: 'UNIT II: Queue Implementation using Linked List', status: 'not-started' },
          // UNIT III - Linked Lists
          { topic: 'UNIT III: Linked List - Introduction and Representation', status: 'not-started' },
          { topic: 'UNIT III: Singly Linked List - Insertion Operations', status: 'not-started' },
          { topic: 'UNIT III: Singly Linked List - Deletion Operations', status: 'not-started' },
          { topic: 'UNIT III: Singly Linked List - Traversal and Search', status: 'not-started' },
          { topic: 'UNIT III: Singly Linked List - Reversal', status: 'not-started' },
          { topic: 'UNIT III: Doubly Linked List - Operations', status: 'not-started' },
          { topic: 'UNIT III: Circular Linked List', status: 'not-started' },
          { topic: 'UNIT III: Circular Doubly Linked List', status: 'not-started' },
          { topic: 'UNIT III: Polynomial Representation using Linked List', status: 'not-started' },
          { topic: 'UNIT III: Polynomial Addition', status: 'not-started' },
          { topic: 'UNIT III: Polynomial Multiplication', status: 'not-started' },
          // UNIT IV - Trees
          { topic: 'UNIT IV: Tree Terminology - Root, Node, Leaf, Height, Depth', status: 'not-started' },
          { topic: 'UNIT IV: Binary Tree - Definition and Properties', status: 'not-started' },
          { topic: 'UNIT IV: Binary Tree Representation - Array', status: 'not-started' },
          { topic: 'UNIT IV: Binary Tree Representation - Linked List', status: 'not-started' },
          { topic: 'UNIT IV: Tree Traversals - Inorder', status: 'not-started' },
          { topic: 'UNIT IV: Tree Traversals - Preorder', status: 'not-started' },
          { topic: 'UNIT IV: Tree Traversals - Postorder', status: 'not-started' },
          { topic: 'UNIT IV: Tree Traversals - Level Order', status: 'not-started' },
          { topic: 'UNIT IV: Binary Search Tree (BST) - Definition', status: 'not-started' },
          { topic: 'UNIT IV: BST - Insertion Operation', status: 'not-started' },
          { topic: 'UNIT IV: BST - Deletion Operation', status: 'not-started' },
          { topic: 'UNIT IV: BST - Search Operation', status: 'not-started' },
          { topic: 'UNIT IV: AVL Trees - Introduction and Rotations', status: 'not-started' },
          { topic: 'UNIT IV: AVL Trees - LL, RR, LR, RL Rotations', status: 'not-started' },
          { topic: 'UNIT IV: AVL Trees - Insertion', status: 'not-started' },
          { topic: 'UNIT IV: Threaded Binary Trees', status: 'not-started' },
          { topic: 'UNIT IV: Heap - Min Heap and Max Heap', status: 'not-started' },
          { topic: 'UNIT IV: Heap Operations - Insert and Delete', status: 'not-started' },
          { topic: 'UNIT IV: Heap Sort Algorithm', status: 'not-started' },
          // UNIT V - Graphs
          { topic: 'UNIT V: Graph Terminology - Vertex, Edge, Degree', status: 'not-started' },
          { topic: 'UNIT V: Types of Graphs - Directed, Undirected, Weighted', status: 'not-started' },
          { topic: 'UNIT V: Graph Representation - Adjacency Matrix', status: 'not-started' },
          { topic: 'UNIT V: Graph Representation - Adjacency List', status: 'not-started' },
          { topic: 'UNIT V: Graph Traversal - Breadth First Search (BFS)', status: 'not-started' },
          { topic: 'UNIT V: Graph Traversal - Depth First Search (DFS)', status: 'not-started' },
          { topic: 'UNIT V: Minimum Spanning Tree - Concept', status: 'not-started' },
          { topic: 'UNIT V: Prim\'s Algorithm', status: 'not-started' },
          { topic: 'UNIT V: Kruskal\'s Algorithm', status: 'not-started' },
          { topic: 'UNIT V: Shortest Path - Dijkstra\'s Algorithm', status: 'not-started' },
          { topic: 'UNIT V: Bellman-Ford Algorithm', status: 'not-started' },
          { topic: 'UNIT V: Floyd-Warshall Algorithm', status: 'not-started' },
          { topic: 'UNIT V: Topological Sorting', status: 'not-started' },
          { topic: 'UNIT V: Hashing - Hash Functions', status: 'not-started' },
          { topic: 'UNIT V: Collision Resolution - Chaining', status: 'not-started' },
          { topic: 'UNIT V: Collision Resolution - Open Addressing', status: 'not-started' },
        ],
        textbooks: ['Mark Allen Weiss, "Data Structures and Algorithm Analysis in C"'],
      },
      {
        name: 'Computer Organization',
        code: 'CS202',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Basic Organization
          { topic: 'UNIT I: Basic Computer Organization - Von Neumann Architecture', status: 'not-started' },
          { topic: 'UNIT I: Register Transfer Language', status: 'not-started' },
          { topic: 'UNIT I: Register Transfer Operations', status: 'not-started' },
          { topic: 'UNIT I: Bus and Memory Transfer', status: 'not-started' },
          { topic: 'UNIT I: Arithmetic Microoperations', status: 'not-started' },
          { topic: 'UNIT I: Logic Microoperations', status: 'not-started' },
          { topic: 'UNIT I: Shift Microoperations', status: 'not-started' },
          { topic: 'UNIT I: Instruction Codes and Formats', status: 'not-started' },
          // UNIT II - Computer Instructions
          { topic: 'UNIT II: Computer Instructions - Memory Reference', status: 'not-started' },
          { topic: 'UNIT II: Register Reference Instructions', status: 'not-started' },
          { topic: 'UNIT II: Input-Output Instructions', status: 'not-started' },
          { topic: 'UNIT II: Timing and Control Unit', status: 'not-started' },
          { topic: 'UNIT II: Instruction Cycle - Fetch, Decode, Execute', status: 'not-started' },
          { topic: 'UNIT II: Addressing Modes', status: 'not-started' },
          // UNIT III - ALU Design
          { topic: 'UNIT III: Arithmetic Logic Unit - Design', status: 'not-started' },
          { topic: 'UNIT III: Binary Addition and Subtraction', status: 'not-started' },
          { topic: 'UNIT III: Booth\'s Multiplication Algorithm', status: 'not-started' },
          { topic: 'UNIT III: Restoring and Non-Restoring Division', status: 'not-started' },
          { topic: 'UNIT III: Floating Point Representation', status: 'not-started' },
          { topic: 'UNIT III: Floating Point Arithmetic', status: 'not-started' },
          // UNIT IV - Control Unit and Memory
          { topic: 'UNIT IV: Hardwired Control Unit', status: 'not-started' },
          { topic: 'UNIT IV: Microprogrammed Control Unit', status: 'not-started' },
          { topic: 'UNIT IV: Control Memory Organization', status: 'not-started' },
          { topic: 'UNIT IV: Memory Hierarchy', status: 'not-started' },
          { topic: 'UNIT IV: Cache Memory - Mapping Techniques', status: 'not-started' },
          { topic: 'UNIT IV: Cache Write Policies', status: 'not-started' },
          { topic: 'UNIT IV: Virtual Memory', status: 'not-started' },
          // UNIT V - I/O Organization
          { topic: 'UNIT V: Input/Output Interface', status: 'not-started' },
          { topic: 'UNIT V: Asynchronous Data Transfer', status: 'not-started' },
          { topic: 'UNIT V: Modes of Transfer - Programmed I/O', status: 'not-started' },
          { topic: 'UNIT V: Interrupt Driven I/O', status: 'not-started' },
          { topic: 'UNIT V: Direct Memory Access (DMA)', status: 'not-started' },
          { topic: 'UNIT V: I/O Processor', status: 'not-started' },
        ],
      },
      {
        name: 'Java Programming',
        code: 'CS203',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - OOP and Java Basics
          { topic: 'UNIT I: Object Oriented Paradigm - Concepts', status: 'not-started' },
          { topic: 'UNIT I: Abstraction, Encapsulation, Inheritance, Polymorphism', status: 'not-started' },
          { topic: 'UNIT I: Introduction to Java - Features', status: 'not-started' },
          { topic: 'UNIT I: JDK, JRE, JVM', status: 'not-started' },
          { topic: 'UNIT I: Data Types in Java', status: 'not-started' },
          { topic: 'UNIT I: Variables and Operators', status: 'not-started' },
          { topic: 'UNIT I: Control Statements', status: 'not-started' },
          { topic: 'UNIT I: Arrays in Java', status: 'not-started' },
          // UNIT II - Classes and Objects
          { topic: 'UNIT II: Class and Object - Definition', status: 'not-started' },
          { topic: 'UNIT II: Constructors - Default and Parameterized', status: 'not-started' },
          { topic: 'UNIT II: this Keyword', status: 'not-started' },
          { topic: 'UNIT II: Method Overloading', status: 'not-started' },
          { topic: 'UNIT II: Static Members', status: 'not-started' },
          { topic: 'UNIT II: final Keyword', status: 'not-started' },
          { topic: 'UNIT II: String Class and Methods', status: 'not-started' },
          { topic: 'UNIT II: StringBuffer and StringBuilder', status: 'not-started' },
          // UNIT III - Inheritance and Polymorphism
          { topic: 'UNIT III: Inheritance - Types', status: 'not-started' },
          { topic: 'UNIT III: super Keyword', status: 'not-started' },
          { topic: 'UNIT III: Method Overriding', status: 'not-started' },
          { topic: 'UNIT III: Dynamic Method Dispatch', status: 'not-started' },
          { topic: 'UNIT III: Abstract Classes', status: 'not-started' },
          { topic: 'UNIT III: Interfaces - Definition and Implementation', status: 'not-started' },
          { topic: 'UNIT III: Multiple Inheritance using Interfaces', status: 'not-started' },
          { topic: 'UNIT III: Packages - Creating and Using', status: 'not-started' },
          { topic: 'UNIT III: Access Modifiers', status: 'not-started' },
          // UNIT IV - Exception Handling and I/O
          { topic: 'UNIT IV: Exception Handling - try, catch, finally', status: 'not-started' },
          { topic: 'UNIT IV: throw and throws', status: 'not-started' },
          { topic: 'UNIT IV: Custom Exceptions', status: 'not-started' },
          { topic: 'UNIT IV: I/O Streams - Byte Streams', status: 'not-started' },
          { topic: 'UNIT IV: Character Streams', status: 'not-started' },
          { topic: 'UNIT IV: File Handling - FileReader, FileWriter', status: 'not-started' },
          { topic: 'UNIT IV: Buffered Streams', status: 'not-started' },
          { topic: 'UNIT IV: Serialization', status: 'not-started' },
          // UNIT V - Multithreading and GUI
          { topic: 'UNIT V: Multithreading - Thread Class', status: 'not-started' },
          { topic: 'UNIT V: Runnable Interface', status: 'not-started' },
          { topic: 'UNIT V: Thread Life Cycle', status: 'not-started' },
          { topic: 'UNIT V: Synchronization', status: 'not-started' },
          { topic: 'UNIT V: Inter-thread Communication', status: 'not-started' },
          { topic: 'UNIT V: AWT Components', status: 'not-started' },
          { topic: 'UNIT V: Event Handling', status: 'not-started' },
          { topic: 'UNIT V: Swing - JFrame, JPanel, JButton', status: 'not-started' },
          { topic: 'UNIT V: Layout Managers', status: 'not-started' },
        ],
      },
      {
        name: 'Discrete Mathematics',
        code: 'MA201',
        credits: 3,
        category: 'BS',
        units: 5,
        topics: [
          // UNIT I - Mathematical Logic
          { topic: 'UNIT I: Propositions and Logical Operators', status: 'not-started' },
          { topic: 'UNIT I: Truth Tables', status: 'not-started' },
          { topic: 'UNIT I: Logical Equivalence', status: 'not-started' },
          { topic: 'UNIT I: Tautology, Contradiction, Contingency', status: 'not-started' },
          { topic: 'UNIT I: Logical Inference - Rules of Inference', status: 'not-started' },
          { topic: 'UNIT I: Predicate Logic - Quantifiers', status: 'not-started' },
          { topic: 'UNIT I: Mathematical Induction', status: 'not-started' },
          // UNIT II - Relations
          { topic: 'UNIT II: Sets and Operations', status: 'not-started' },
          { topic: 'UNIT II: Cartesian Product', status: 'not-started' },
          { topic: 'UNIT II: Relations - Properties', status: 'not-started' },
          { topic: 'UNIT II: Reflexive, Symmetric, Transitive Relations', status: 'not-started' },
          { topic: 'UNIT II: Equivalence Relations and Partitions', status: 'not-started' },
          { topic: 'UNIT II: Partial Ordering - Hasse Diagram', status: 'not-started' },
          { topic: 'UNIT II: Lattices', status: 'not-started' },
          // UNIT III - Functions and Algebraic Structures
          { topic: 'UNIT III: Functions - Types', status: 'not-started' },
          { topic: 'UNIT III: Composition of Functions', status: 'not-started' },
          { topic: 'UNIT III: Inverse Functions', status: 'not-started' },
          { topic: 'UNIT III: Groups - Definition and Properties', status: 'not-started' },
          { topic: 'UNIT III: Subgroups and Cyclic Groups', status: 'not-started' },
          { topic: 'UNIT III: Rings and Fields', status: 'not-started' },
          // UNIT IV - Combinatorics
          { topic: 'UNIT IV: Counting Principles', status: 'not-started' },
          { topic: 'UNIT IV: Permutations', status: 'not-started' },
          { topic: 'UNIT IV: Combinations', status: 'not-started' },
          { topic: 'UNIT IV: Binomial Theorem', status: 'not-started' },
          { topic: 'UNIT IV: Pigeonhole Principle', status: 'not-started' },
          { topic: 'UNIT IV: Inclusion-Exclusion Principle', status: 'not-started' },
          { topic: 'UNIT IV: Recurrence Relations', status: 'not-started' },
          { topic: 'UNIT IV: Generating Functions', status: 'not-started' },
          // UNIT V - Graph Theory
          { topic: 'UNIT V: Graph Terminology', status: 'not-started' },
          { topic: 'UNIT V: Types of Graphs', status: 'not-started' },
          { topic: 'UNIT V: Euler Paths and Circuits', status: 'not-started' },
          { topic: 'UNIT V: Hamilton Paths and Circuits', status: 'not-started' },
          { topic: 'UNIT V: Planar Graphs - Euler\'s Formula', status: 'not-started' },
          { topic: 'UNIT V: Graph Coloring', status: 'not-started' },
          { topic: 'UNIT V: Trees - Properties', status: 'not-started' },
          { topic: 'UNIT V: Spanning Trees', status: 'not-started' },
        ],
      },
      {
        name: 'Computer Networks',
        code: 'CS204',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Data Communication Basics', status: 'not-started' },
          { topic: 'UNIT I: Network Types - LAN, MAN, WAN', status: 'not-started' },
          { topic: 'UNIT I: Network Topologies', status: 'not-started' },
          { topic: 'UNIT I: OSI Reference Model', status: 'not-started' },
          { topic: 'UNIT I: TCP/IP Model', status: 'not-started' },
          { topic: 'UNIT I: Comparison of OSI and TCP/IP', status: 'not-started' },
          // UNIT II - Physical Layer
          { topic: 'UNIT II: Transmission Media - Guided', status: 'not-started' },
          { topic: 'UNIT II: Twisted Pair, Coaxial, Fiber Optic', status: 'not-started' },
          { topic: 'UNIT II: Unguided Media - Wireless', status: 'not-started' },
          { topic: 'UNIT II: Multiplexing - FDM, TDM, WDM', status: 'not-started' },
          { topic: 'UNIT II: Switching - Circuit, Packet, Message', status: 'not-started' },
          // UNIT III - Data Link Layer
          { topic: 'UNIT III: Error Detection - Parity, CRC', status: 'not-started' },
          { topic: 'UNIT III: Error Correction - Hamming Code', status: 'not-started' },
          { topic: 'UNIT III: Flow Control - Stop and Wait', status: 'not-started' },
          { topic: 'UNIT III: Sliding Window Protocol', status: 'not-started' },
          { topic: 'UNIT III: Go-Back-N ARQ', status: 'not-started' },
          { topic: 'UNIT III: Selective Repeat ARQ', status: 'not-started' },
          { topic: 'UNIT III: Multiple Access - ALOHA', status: 'not-started' },
          { topic: 'UNIT III: CSMA/CD', status: 'not-started' },
          { topic: 'UNIT III: Ethernet', status: 'not-started' },
          // UNIT IV - Network Layer
          { topic: 'UNIT IV: IPv4 Addressing', status: 'not-started' },
          { topic: 'UNIT IV: Subnetting and CIDR', status: 'not-started' },
          { topic: 'UNIT IV: ARP and RARP', status: 'not-started' },
          { topic: 'UNIT IV: ICMP', status: 'not-started' },
          { topic: 'UNIT IV: Routing Algorithms - Distance Vector', status: 'not-started' },
          { topic: 'UNIT IV: Link State Routing', status: 'not-started' },
          { topic: 'UNIT IV: IPv6 - Features and Addressing', status: 'not-started' },
          // UNIT V - Transport and Application Layer
          { topic: 'UNIT V: UDP - Features and Format', status: 'not-started' },
          { topic: 'UNIT V: TCP - Features and Format', status: 'not-started' },
          { topic: 'UNIT V: TCP Connection Management', status: 'not-started' },
          { topic: 'UNIT V: TCP Congestion Control', status: 'not-started' },
          { topic: 'UNIT V: DNS - Domain Name System', status: 'not-started' },
          { topic: 'UNIT V: HTTP and HTTPS', status: 'not-started' },
          { topic: 'UNIT V: FTP and Email Protocols', status: 'not-started' },
        ],
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
        name: 'Operating Systems',
        code: 'CS205',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Operating System - Definition and Functions', status: 'not-started' },
          { topic: 'UNIT I: Types of OS - Batch, Time-sharing, Real-time', status: 'not-started' },
          { topic: 'UNIT I: OS Structure - Monolithic, Layered, Microkernel', status: 'not-started' },
          { topic: 'UNIT I: System Calls', status: 'not-started' },
          { topic: 'UNIT I: System Programs', status: 'not-started' },
          // UNIT II - Process Management
          { topic: 'UNIT II: Process Concept - States and PCB', status: 'not-started' },
          { topic: 'UNIT II: Process Scheduling - Queues', status: 'not-started' },
          { topic: 'UNIT II: CPU Scheduling - FCFS', status: 'not-started' },
          { topic: 'UNIT II: SJF Scheduling', status: 'not-started' },
          { topic: 'UNIT II: Priority Scheduling', status: 'not-started' },
          { topic: 'UNIT II: Round Robin Scheduling', status: 'not-started' },
          { topic: 'UNIT II: Multilevel Queue Scheduling', status: 'not-started' },
          { topic: 'UNIT II: Threads - Concept and Types', status: 'not-started' },
          { topic: 'UNIT II: Multithreading Models', status: 'not-started' },
          // UNIT III - Synchronization and Deadlock
          { topic: 'UNIT III: Process Synchronization - Critical Section', status: 'not-started' },
          { topic: 'UNIT III: Peterson\'s Solution', status: 'not-started' },
          { topic: 'UNIT III: Semaphores - Binary and Counting', status: 'not-started' },
          { topic: 'UNIT III: Classical Problems - Producer-Consumer', status: 'not-started' },
          { topic: 'UNIT III: Readers-Writers Problem', status: 'not-started' },
          { topic: 'UNIT III: Dining Philosophers Problem', status: 'not-started' },
          { topic: 'UNIT III: Monitors', status: 'not-started' },
          { topic: 'UNIT III: Deadlock - Characterization', status: 'not-started' },
          { topic: 'UNIT III: Deadlock Prevention', status: 'not-started' },
          { topic: 'UNIT III: Deadlock Avoidance - Banker\'s Algorithm', status: 'not-started' },
          { topic: 'UNIT III: Deadlock Detection and Recovery', status: 'not-started' },
          // UNIT IV - Memory Management
          { topic: 'UNIT IV: Memory Management - Concepts', status: 'not-started' },
          { topic: 'UNIT IV: Contiguous Allocation', status: 'not-started' },
          { topic: 'UNIT IV: Paging - Basic Method', status: 'not-started' },
          { topic: 'UNIT IV: Page Table Structure', status: 'not-started' },
          { topic: 'UNIT IV: Segmentation', status: 'not-started' },
          { topic: 'UNIT IV: Virtual Memory - Demand Paging', status: 'not-started' },
          { topic: 'UNIT IV: Page Replacement - FIFO, LRU, Optimal', status: 'not-started' },
          { topic: 'UNIT IV: Thrashing', status: 'not-started' },
          // UNIT V - File and I/O Management
          { topic: 'UNIT V: File Concept and Attributes', status: 'not-started' },
          { topic: 'UNIT V: File Operations', status: 'not-started' },
          { topic: 'UNIT V: Directory Structure', status: 'not-started' },
          { topic: 'UNIT V: File Allocation Methods', status: 'not-started' },
          { topic: 'UNIT V: Free Space Management', status: 'not-started' },
          { topic: 'UNIT V: Disk Scheduling - FCFS, SSTF, SCAN, C-SCAN', status: 'not-started' },
          { topic: 'UNIT V: RAID Levels', status: 'not-started' },
        ],
      },
      {
        name: 'Database Management Systems',
        code: 'CS206',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: DBMS - Introduction and Advantages', status: 'not-started' },
          { topic: 'UNIT I: Database System Architecture', status: 'not-started' },
          { topic: 'UNIT I: Data Models - Hierarchical, Network, Relational', status: 'not-started' },
          { topic: 'UNIT I: Entity-Relationship Model', status: 'not-started' },
          { topic: 'UNIT I: ER Diagram - Entities, Attributes, Relationships', status: 'not-started' },
          { topic: 'UNIT I: Extended ER Features', status: 'not-started' },
          // UNIT II - Relational Model
          { topic: 'UNIT II: Relational Model - Concepts', status: 'not-started' },
          { topic: 'UNIT II: Keys - Super, Candidate, Primary, Foreign', status: 'not-started' },
          { topic: 'UNIT II: Relational Algebra - Select, Project', status: 'not-started' },
          { topic: 'UNIT II: Set Operations - Union, Intersection, Difference', status: 'not-started' },
          { topic: 'UNIT II: Join Operations', status: 'not-started' },
          { topic: 'UNIT II: Relational Calculus', status: 'not-started' },
          // UNIT III - SQL
          { topic: 'UNIT III: SQL - DDL Commands', status: 'not-started' },
          { topic: 'UNIT III: DML Commands - INSERT, UPDATE, DELETE', status: 'not-started' },
          { topic: 'UNIT III: SELECT Query - Basic and Advanced', status: 'not-started' },
          { topic: 'UNIT III: WHERE Clause and Operators', status: 'not-started' },
          { topic: 'UNIT III: Aggregate Functions', status: 'not-started' },
          { topic: 'UNIT III: GROUP BY and HAVING', status: 'not-started' },
          { topic: 'UNIT III: Joins - Inner, Outer, Cross', status: 'not-started' },
          { topic: 'UNIT III: Subqueries', status: 'not-started' },
          { topic: 'UNIT III: Views', status: 'not-started' },
          // UNIT IV - Normalization
          { topic: 'UNIT IV: Functional Dependencies', status: 'not-started' },
          { topic: 'UNIT IV: Armstrong\'s Axioms', status: 'not-started' },
          { topic: 'UNIT IV: Canonical Cover', status: 'not-started' },
          { topic: 'UNIT IV: First Normal Form (1NF)', status: 'not-started' },
          { topic: 'UNIT IV: Second Normal Form (2NF)', status: 'not-started' },
          { topic: 'UNIT IV: Third Normal Form (3NF)', status: 'not-started' },
          { topic: 'UNIT IV: Boyce-Codd Normal Form (BCNF)', status: 'not-started' },
          { topic: 'UNIT IV: Multivalued Dependencies and 4NF', status: 'not-started' },
          // UNIT V - Transaction and Concurrency
          { topic: 'UNIT V: Transaction Concept', status: 'not-started' },
          { topic: 'UNIT V: ACID Properties', status: 'not-started' },
          { topic: 'UNIT V: Transaction States', status: 'not-started' },
          { topic: 'UNIT V: Concurrency Control - Problems', status: 'not-started' },
          { topic: 'UNIT V: Lock-based Protocols', status: 'not-started' },
          { topic: 'UNIT V: Two-Phase Locking', status: 'not-started' },
          { topic: 'UNIT V: Timestamp-based Protocols', status: 'not-started' },
          { topic: 'UNIT V: Recovery Techniques', status: 'not-started' },
          { topic: 'UNIT V: Indexing - B-Trees and B+ Trees', status: 'not-started' },
        ],
      },
      {
        name: 'Artificial Intelligence',
        code: 'CS207',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: AI - Introduction and History', status: 'not-started' },
          { topic: 'UNIT I: Intelligent Agents', status: 'not-started' },
          { topic: 'UNIT I: Types of AI - Weak, Strong', status: 'not-started' },
          { topic: 'UNIT I: AI Applications', status: 'not-started' },
          // UNIT II - Search Strategies
          { topic: 'UNIT II: Problem Solving - State Space', status: 'not-started' },
          { topic: 'UNIT II: Uninformed Search - BFS', status: 'not-started' },
          { topic: 'UNIT II: Uninformed Search - DFS', status: 'not-started' },
          { topic: 'UNIT II: Depth-Limited and Iterative Deepening', status: 'not-started' },
          { topic: 'UNIT II: Informed Search - Heuristics', status: 'not-started' },
          { topic: 'UNIT II: Best-First Search', status: 'not-started' },
          { topic: 'UNIT II: A* Algorithm', status: 'not-started' },
          { topic: 'UNIT II: Hill Climbing', status: 'not-started' },
          { topic: 'UNIT II: Simulated Annealing', status: 'not-started' },
          // UNIT III - Knowledge Representation
          { topic: 'UNIT III: Knowledge Representation - Issues', status: 'not-started' },
          { topic: 'UNIT III: Propositional Logic', status: 'not-started' },
          { topic: 'UNIT III: First-Order Logic', status: 'not-started' },
          { topic: 'UNIT III: Inference in FOL', status: 'not-started' },
          { topic: 'UNIT III: Semantic Networks', status: 'not-started' },
          { topic: 'UNIT III: Frames', status: 'not-started' },
          // UNIT IV - Reasoning Under Uncertainty
          { topic: 'UNIT IV: Probability Basics', status: 'not-started' },
          { topic: 'UNIT IV: Bayes\' Theorem', status: 'not-started' },
          { topic: 'UNIT IV: Bayesian Networks', status: 'not-started' },
          { topic: 'UNIT IV: Fuzzy Logic', status: 'not-started' },
          { topic: 'UNIT IV: Fuzzy Inference Systems', status: 'not-started' },
          // UNIT V - Learning and NLP
          { topic: 'UNIT V: Machine Learning - Types', status: 'not-started' },
          { topic: 'UNIT V: Decision Trees', status: 'not-started' },
          { topic: 'UNIT V: Neural Networks Basics', status: 'not-started' },
          { topic: 'UNIT V: Natural Language Processing', status: 'not-started' },
          { topic: 'UNIT V: Expert Systems', status: 'not-started' },
        ],
      },
      {
        name: 'Design and Analysis of Algorithms',
        code: 'CS208',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Algorithm Analysis
          { topic: 'UNIT I: Algorithm - Definition and Properties', status: 'not-started' },
          { topic: 'UNIT I: Algorithm Analysis Framework', status: 'not-started' },
          { topic: 'UNIT I: Asymptotic Notations - O, Ω, Θ', status: 'not-started' },
          { topic: 'UNIT I: Recurrence Relations', status: 'not-started' },
          { topic: 'UNIT I: Master Theorem', status: 'not-started' },
          // UNIT II - Divide and Conquer
          { topic: 'UNIT II: Divide and Conquer - Concept', status: 'not-started' },
          { topic: 'UNIT II: Binary Search', status: 'not-started' },
          { topic: 'UNIT II: Merge Sort', status: 'not-started' },
          { topic: 'UNIT II: Quick Sort', status: 'not-started' },
          { topic: 'UNIT II: Strassen\'s Matrix Multiplication', status: 'not-started' },
          { topic: 'UNIT II: Closest Pair Problem', status: 'not-started' },
          // UNIT III - Greedy Method
          { topic: 'UNIT III: Greedy Method - Concept', status: 'not-started' },
          { topic: 'UNIT III: Fractional Knapsack', status: 'not-started' },
          { topic: 'UNIT III: Job Sequencing with Deadlines', status: 'not-started' },
          { topic: 'UNIT III: Huffman Coding', status: 'not-started' },
          { topic: 'UNIT III: Prim\'s Algorithm', status: 'not-started' },
          { topic: 'UNIT III: Kruskal\'s Algorithm', status: 'not-started' },
          { topic: 'UNIT III: Dijkstra\'s Algorithm', status: 'not-started' },
          // UNIT IV - Dynamic Programming
          { topic: 'UNIT IV: Dynamic Programming - Concept', status: 'not-started' },
          { topic: 'UNIT IV: Principle of Optimality', status: 'not-started' },
          { topic: 'UNIT IV: Matrix Chain Multiplication', status: 'not-started' },
          { topic: 'UNIT IV: Longest Common Subsequence', status: 'not-started' },
          { topic: 'UNIT IV: 0/1 Knapsack Problem', status: 'not-started' },
          { topic: 'UNIT IV: Floyd-Warshall Algorithm', status: 'not-started' },
          { topic: 'UNIT IV: Bellman-Ford Algorithm', status: 'not-started' },
          // UNIT V - Backtracking and NP
          { topic: 'UNIT V: Backtracking - Concept', status: 'not-started' },
          { topic: 'UNIT V: N-Queens Problem', status: 'not-started' },
          { topic: 'UNIT V: Graph Coloring', status: 'not-started' },
          { topic: 'UNIT V: Hamiltonian Circuit', status: 'not-started' },
          { topic: 'UNIT V: Branch and Bound', status: 'not-started' },
          { topic: 'UNIT V: P and NP Classes', status: 'not-started' },
          { topic: 'UNIT V: NP-Complete Problems', status: 'not-started' },
          { topic: 'UNIT V: Approximation Algorithms', status: 'not-started' },
        ],
      },
      {
        name: 'Python Programming',
        code: 'CS209',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Python - Introduction and Features', status: 'not-started' },
          { topic: 'UNIT I: Python Installation and IDE', status: 'not-started' },
          { topic: 'UNIT I: Data Types - Numbers, Strings', status: 'not-started' },
          { topic: 'UNIT I: Variables and Operators', status: 'not-started' },
          { topic: 'UNIT I: Input and Output', status: 'not-started' },
          // UNIT II - Control Flow and Functions
          { topic: 'UNIT II: Conditional Statements - if, elif, else', status: 'not-started' },
          { topic: 'UNIT II: Loops - for, while', status: 'not-started' },
          { topic: 'UNIT II: Loop Control - break, continue, pass', status: 'not-started' },
          { topic: 'UNIT II: Functions - Definition and Calling', status: 'not-started' },
          { topic: 'UNIT II: Function Arguments - Default, Keyword, Variable-length', status: 'not-started' },
          { topic: 'UNIT II: Lambda Functions', status: 'not-started' },
          { topic: 'UNIT II: Recursion', status: 'not-started' },
          // UNIT III - Data Structures
          { topic: 'UNIT III: Lists - Operations and Methods', status: 'not-started' },
          { topic: 'UNIT III: List Comprehensions', status: 'not-started' },
          { topic: 'UNIT III: Tuples', status: 'not-started' },
          { topic: 'UNIT III: Sets', status: 'not-started' },
          { topic: 'UNIT III: Dictionaries', status: 'not-started' },
          { topic: 'UNIT III: Strings - Methods and Formatting', status: 'not-started' },
          // UNIT IV - OOP and File Handling
          { topic: 'UNIT IV: Classes and Objects', status: 'not-started' },
          { topic: 'UNIT IV: Constructors - __init__', status: 'not-started' },
          { topic: 'UNIT IV: Inheritance', status: 'not-started' },
          { topic: 'UNIT IV: Polymorphism', status: 'not-started' },
          { topic: 'UNIT IV: Encapsulation', status: 'not-started' },
          { topic: 'UNIT IV: File Handling - open, read, write', status: 'not-started' },
          { topic: 'UNIT IV: Exception Handling - try, except, finally', status: 'not-started' },
          // UNIT V - Libraries
          { topic: 'UNIT V: Modules and Packages', status: 'not-started' },
          { topic: 'UNIT V: NumPy - Arrays and Operations', status: 'not-started' },
          { topic: 'UNIT V: Pandas - Series and DataFrame', status: 'not-started' },
          { topic: 'UNIT V: Matplotlib - Basic Plotting', status: 'not-started' },
          { topic: 'UNIT V: Regular Expressions', status: 'not-started' },
        ],
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
        name: 'Machine Learning',
        code: 'CS301',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Machine Learning - Introduction', status: 'not-started' },
          { topic: 'UNIT I: Types - Supervised, Unsupervised, Reinforcement', status: 'not-started' },
          { topic: 'UNIT I: Applications of ML', status: 'not-started' },
          { topic: 'UNIT I: ML Pipeline', status: 'not-started' },
          { topic: 'UNIT I: Data Preprocessing', status: 'not-started' },
          // UNIT II - Regression
          { topic: 'UNIT II: Linear Regression - Simple', status: 'not-started' },
          { topic: 'UNIT II: Multiple Linear Regression', status: 'not-started' },
          { topic: 'UNIT II: Polynomial Regression', status: 'not-started' },
          { topic: 'UNIT II: Gradient Descent', status: 'not-started' },
          { topic: 'UNIT II: Regularization - Ridge, Lasso', status: 'not-started' },
          { topic: 'UNIT II: Logistic Regression', status: 'not-started' },
          // UNIT III - Classification
          { topic: 'UNIT III: K-Nearest Neighbors (KNN)', status: 'not-started' },
          { topic: 'UNIT III: Decision Trees - ID3, C4.5', status: 'not-started' },
          { topic: 'UNIT III: Naive Bayes Classifier', status: 'not-started' },
          { topic: 'UNIT III: Support Vector Machines (SVM)', status: 'not-started' },
          { topic: 'UNIT III: SVM Kernels', status: 'not-started' },
          { topic: 'UNIT III: Model Evaluation - Confusion Matrix', status: 'not-started' },
          { topic: 'UNIT III: Precision, Recall, F1-Score', status: 'not-started' },
          { topic: 'UNIT III: Cross-Validation', status: 'not-started' },
          // UNIT IV - Clustering
          { topic: 'UNIT IV: Clustering - Introduction', status: 'not-started' },
          { topic: 'UNIT IV: K-Means Clustering', status: 'not-started' },
          { topic: 'UNIT IV: Hierarchical Clustering', status: 'not-started' },
          { topic: 'UNIT IV: DBSCAN', status: 'not-started' },
          { topic: 'UNIT IV: Cluster Evaluation', status: 'not-started' },
          // UNIT V - Ensemble and Dimensionality
          { topic: 'UNIT V: Ensemble Methods - Bagging', status: 'not-started' },
          { topic: 'UNIT V: Random Forest', status: 'not-started' },
          { topic: 'UNIT V: Boosting - AdaBoost, Gradient Boosting', status: 'not-started' },
          { topic: 'UNIT V: XGBoost', status: 'not-started' },
          { topic: 'UNIT V: Dimensionality Reduction - PCA', status: 'not-started' },
          { topic: 'UNIT V: LDA', status: 'not-started' },
          { topic: 'UNIT V: Feature Selection', status: 'not-started' },
        ],
      },
      {
        name: 'Web Technologies',
        code: 'CS302',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - HTML and CSS
          { topic: 'UNIT I: HTML - Structure and Elements', status: 'not-started' },
          { topic: 'UNIT I: HTML5 - Semantic Elements', status: 'not-started' },
          { topic: 'UNIT I: Forms and Input Types', status: 'not-started' },
          { topic: 'UNIT I: CSS - Selectors and Properties', status: 'not-started' },
          { topic: 'UNIT I: CSS Box Model', status: 'not-started' },
          { topic: 'UNIT I: CSS Flexbox', status: 'not-started' },
          { topic: 'UNIT I: CSS Grid', status: 'not-started' },
          { topic: 'UNIT I: Responsive Design - Media Queries', status: 'not-started' },
          // UNIT II - JavaScript
          { topic: 'UNIT II: JavaScript - Variables and Data Types', status: 'not-started' },
          { topic: 'UNIT II: Operators and Expressions', status: 'not-started' },
          { topic: 'UNIT II: Control Structures', status: 'not-started' },
          { topic: 'UNIT II: Functions and Scope', status: 'not-started' },
          { topic: 'UNIT II: Arrays and Objects', status: 'not-started' },
          { topic: 'UNIT II: DOM Manipulation', status: 'not-started' },
          { topic: 'UNIT II: Event Handling', status: 'not-started' },
          { topic: 'UNIT II: ES6 Features - Arrow Functions, Classes', status: 'not-started' },
          // UNIT III - React
          { topic: 'UNIT III: React - Introduction and Setup', status: 'not-started' },
          { topic: 'UNIT III: JSX Syntax', status: 'not-started' },
          { topic: 'UNIT III: Components - Functional and Class', status: 'not-started' },
          { topic: 'UNIT III: Props and State', status: 'not-started' },
          { topic: 'UNIT III: Hooks - useState, useEffect', status: 'not-started' },
          { topic: 'UNIT III: Event Handling in React', status: 'not-started' },
          { topic: 'UNIT III: React Router', status: 'not-started' },
          // UNIT IV - Backend
          { topic: 'UNIT IV: Node.js - Introduction', status: 'not-started' },
          { topic: 'UNIT IV: NPM and Modules', status: 'not-started' },
          { topic: 'UNIT IV: Express.js - Routing', status: 'not-started' },
          { topic: 'UNIT IV: Middleware', status: 'not-started' },
          { topic: 'UNIT IV: REST API Development', status: 'not-started' },
          { topic: 'UNIT IV: MongoDB - CRUD Operations', status: 'not-started' },
          { topic: 'UNIT IV: Mongoose ODM', status: 'not-started' },
          // UNIT V - Advanced
          { topic: 'UNIT V: Authentication - JWT', status: 'not-started' },
          { topic: 'UNIT V: Session Management', status: 'not-started' },
          { topic: 'UNIT V: API Security', status: 'not-started' },
          { topic: 'UNIT V: Deployment Basics', status: 'not-started' },
          { topic: 'UNIT V: Web Security - XSS, CSRF', status: 'not-started' },
        ],
      },
      {
        name: 'Software Engineering',
        code: 'CS303',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Software Engineering - Introduction', status: 'not-started' },
          { topic: 'UNIT I: Software Crisis', status: 'not-started' },
          { topic: 'UNIT I: Software Development Life Cycle', status: 'not-started' },
          { topic: 'UNIT I: Waterfall Model', status: 'not-started' },
          { topic: 'UNIT I: Iterative and Incremental Models', status: 'not-started' },
          { topic: 'UNIT I: Spiral Model', status: 'not-started' },
          { topic: 'UNIT I: Agile Methodology', status: 'not-started' },
          // UNIT II - Requirements
          { topic: 'UNIT II: Requirements Engineering', status: 'not-started' },
          { topic: 'UNIT II: Functional Requirements', status: 'not-started' },
          { topic: 'UNIT II: Non-Functional Requirements', status: 'not-started' },
          { topic: 'UNIT II: Requirements Elicitation', status: 'not-started' },
          { topic: 'UNIT II: SRS Document', status: 'not-started' },
          { topic: 'UNIT II: Use Case Diagrams', status: 'not-started' },
          // UNIT III - Design
          { topic: 'UNIT III: Software Design - Principles', status: 'not-started' },
          { topic: 'UNIT III: Coupling and Cohesion', status: 'not-started' },
          { topic: 'UNIT III: UML - Class Diagrams', status: 'not-started' },
          { topic: 'UNIT III: Sequence Diagrams', status: 'not-started' },
          { topic: 'UNIT III: Activity Diagrams', status: 'not-started' },
          { topic: 'UNIT III: Design Patterns - Creational', status: 'not-started' },
          { topic: 'UNIT III: Design Patterns - Structural', status: 'not-started' },
          { topic: 'UNIT III: Design Patterns - Behavioral', status: 'not-started' },
          // UNIT IV - Testing
          { topic: 'UNIT IV: Software Testing - Fundamentals', status: 'not-started' },
          { topic: 'UNIT IV: Testing Levels - Unit, Integration, System', status: 'not-started' },
          { topic: 'UNIT IV: White Box Testing', status: 'not-started' },
          { topic: 'UNIT IV: Black Box Testing', status: 'not-started' },
          { topic: 'UNIT IV: Test Case Design', status: 'not-started' },
          { topic: 'UNIT IV: Regression Testing', status: 'not-started' },
          // UNIT V - Project Management
          { topic: 'UNIT V: Project Planning and Estimation', status: 'not-started' },
          { topic: 'UNIT V: COCOMO Model', status: 'not-started' },
          { topic: 'UNIT V: Risk Management', status: 'not-started' },
          { topic: 'UNIT V: Configuration Management', status: 'not-started' },
          { topic: 'UNIT V: Software Quality Assurance', status: 'not-started' },
          { topic: 'UNIT V: Software Maintenance', status: 'not-started' },
        ],
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
        name: 'Deep Learning',
        code: 'CS304',
        credits: 3,
        category: 'PC',
        units: 5,
        topics: [
          // UNIT I - Neural Networks
          { topic: 'UNIT I: Neural Networks - Introduction', status: 'not-started' },
          { topic: 'UNIT I: Perceptron and Multi-layer Perceptron', status: 'not-started' },
          { topic: 'UNIT I: Activation Functions - Sigmoid, ReLU, Tanh', status: 'not-started' },
          { topic: 'UNIT I: Feedforward Networks', status: 'not-started' },
          { topic: 'UNIT I: Backpropagation Algorithm', status: 'not-started' },
          // UNIT II - Training Deep Networks
          { topic: 'UNIT II: Loss Functions', status: 'not-started' },
          { topic: 'UNIT II: Optimization - SGD, Adam, RMSprop', status: 'not-started' },
          { topic: 'UNIT II: Batch Normalization', status: 'not-started' },
          { topic: 'UNIT II: Dropout', status: 'not-started' },
          { topic: 'UNIT II: Regularization Techniques', status: 'not-started' },
          { topic: 'UNIT II: Hyperparameter Tuning', status: 'not-started' },
          // UNIT III - CNN
          { topic: 'UNIT III: Convolutional Neural Networks - Introduction', status: 'not-started' },
          { topic: 'UNIT III: Convolution Operation', status: 'not-started' },
          { topic: 'UNIT III: Pooling Layers', status: 'not-started' },
          { topic: 'UNIT III: CNN Architectures - LeNet, AlexNet', status: 'not-started' },
          { topic: 'UNIT III: VGGNet, ResNet', status: 'not-started' },
          { topic: 'UNIT III: Image Classification', status: 'not-started' },
          { topic: 'UNIT III: Object Detection', status: 'not-started' },
          // UNIT IV - RNN and LSTM
          { topic: 'UNIT IV: Recurrent Neural Networks', status: 'not-started' },
          { topic: 'UNIT IV: Vanishing Gradient Problem', status: 'not-started' },
          { topic: 'UNIT IV: LSTM Architecture', status: 'not-started' },
          { topic: 'UNIT IV: GRU', status: 'not-started' },
          { topic: 'UNIT IV: Sequence to Sequence Models', status: 'not-started' },
          { topic: 'UNIT IV: Attention Mechanism', status: 'not-started' },
          // UNIT V - Advanced Topics
          { topic: 'UNIT V: Generative Adversarial Networks (GANs)', status: 'not-started' },
          { topic: 'UNIT V: Autoencoders', status: 'not-started' },
          { topic: 'UNIT V: Transfer Learning', status: 'not-started' },
          { topic: 'UNIT V: Transformers', status: 'not-started' },
          { topic: 'UNIT V: BERT and GPT', status: 'not-started' },
          { topic: 'UNIT V: TensorFlow and PyTorch', status: 'not-started' },
        ],
      },
      {
        name: 'Cloud Computing',
        code: 'CS305',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Cloud Computing - Introduction', status: 'not-started' },
          { topic: 'UNIT I: Characteristics of Cloud', status: 'not-started' },
          { topic: 'UNIT I: Cloud Service Models - IaaS, PaaS, SaaS', status: 'not-started' },
          { topic: 'UNIT I: Cloud Deployment Models', status: 'not-started' },
          { topic: 'UNIT I: Cloud Architecture', status: 'not-started' },
          // UNIT II - Virtualization
          { topic: 'UNIT II: Virtualization - Concepts', status: 'not-started' },
          { topic: 'UNIT II: Types of Virtualization', status: 'not-started' },
          { topic: 'UNIT II: Hypervisors - Type 1 and Type 2', status: 'not-started' },
          { topic: 'UNIT II: Virtual Machines', status: 'not-started' },
          { topic: 'UNIT II: Containers and Docker', status: 'not-started' },
          { topic: 'UNIT II: Kubernetes Basics', status: 'not-started' },
          // UNIT III - Cloud Platforms
          { topic: 'UNIT III: AWS - EC2, S3', status: 'not-started' },
          { topic: 'UNIT III: AWS - Lambda, RDS', status: 'not-started' },
          { topic: 'UNIT III: Azure Services', status: 'not-started' },
          { topic: 'UNIT III: Google Cloud Platform', status: 'not-started' },
          // UNIT IV - Storage and Security
          { topic: 'UNIT IV: Cloud Storage Types', status: 'not-started' },
          { topic: 'UNIT IV: Distributed File Systems', status: 'not-started' },
          { topic: 'UNIT IV: Cloud Security Challenges', status: 'not-started' },
          { topic: 'UNIT IV: Identity and Access Management', status: 'not-started' },
          { topic: 'UNIT IV: Data Encryption', status: 'not-started' },
          // UNIT V - Advanced Topics
          { topic: 'UNIT V: Serverless Computing', status: 'not-started' },
          { topic: 'UNIT V: Microservices Architecture', status: 'not-started' },
          { topic: 'UNIT V: DevOps and CI/CD', status: 'not-started' },
          { topic: 'UNIT V: Cloud Cost Management', status: 'not-started' },
          { topic: 'UNIT V: Edge Computing', status: 'not-started' },
        ],
      },
      {
        name: 'Natural Language Processing',
        code: 'CS306',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: NLP - Introduction and Applications', status: 'not-started' },
          { topic: 'UNIT I: Challenges in NLP', status: 'not-started' },
          { topic: 'UNIT I: Text Preprocessing', status: 'not-started' },
          { topic: 'UNIT I: Tokenization', status: 'not-started' },
          { topic: 'UNIT I: Stemming and Lemmatization', status: 'not-started' },
          { topic: 'UNIT I: Stop Words Removal', status: 'not-started' },
          // UNIT II - Text Representation
          { topic: 'UNIT II: Bag of Words', status: 'not-started' },
          { topic: 'UNIT II: TF-IDF', status: 'not-started' },
          { topic: 'UNIT II: Word Embeddings - Word2Vec', status: 'not-started' },
          { topic: 'UNIT II: GloVe', status: 'not-started' },
          { topic: 'UNIT II: FastText', status: 'not-started' },
          // UNIT III - Language Models
          { topic: 'UNIT III: N-gram Models', status: 'not-started' },
          { topic: 'UNIT III: Part-of-Speech Tagging', status: 'not-started' },
          { topic: 'UNIT III: Named Entity Recognition', status: 'not-started' },
          { topic: 'UNIT III: Syntactic Parsing', status: 'not-started' },
          // UNIT IV - NLP Applications
          { topic: 'UNIT IV: Sentiment Analysis', status: 'not-started' },
          { topic: 'UNIT IV: Text Classification', status: 'not-started' },
          { topic: 'UNIT IV: Machine Translation', status: 'not-started' },
          { topic: 'UNIT IV: Question Answering', status: 'not-started' },
          { topic: 'UNIT IV: Text Summarization', status: 'not-started' },
          // UNIT V - Advanced NLP
          { topic: 'UNIT V: RNN for NLP', status: 'not-started' },
          { topic: 'UNIT V: LSTM for Text', status: 'not-started' },
          { topic: 'UNIT V: Transformers Architecture', status: 'not-started' },
          { topic: 'UNIT V: BERT', status: 'not-started' },
          { topic: 'UNIT V: GPT Models', status: 'not-started' },
          { topic: 'UNIT V: Chatbots and Conversational AI', status: 'not-started' },
        ],
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
        name: 'Big Data Analytics',
        code: 'CS401',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Big Data - Introduction and Characteristics', status: 'not-started' },
          { topic: 'UNIT I: 5 V\'s of Big Data', status: 'not-started' },
          { topic: 'UNIT I: Big Data Challenges', status: 'not-started' },
          { topic: 'UNIT I: Big Data Analytics Life Cycle', status: 'not-started' },
          // UNIT II - Hadoop
          { topic: 'UNIT II: Hadoop - Introduction', status: 'not-started' },
          { topic: 'UNIT II: HDFS Architecture', status: 'not-started' },
          { topic: 'UNIT II: MapReduce Programming', status: 'not-started' },
          { topic: 'UNIT II: YARN', status: 'not-started' },
          { topic: 'UNIT II: Hadoop Ecosystem', status: 'not-started' },
          // UNIT III - NoSQL
          { topic: 'UNIT III: NoSQL Databases - Types', status: 'not-started' },
          { topic: 'UNIT III: MongoDB', status: 'not-started' },
          { topic: 'UNIT III: Cassandra', status: 'not-started' },
          { topic: 'UNIT III: HBase', status: 'not-started' },
          // UNIT IV - Spark
          { topic: 'UNIT IV: Apache Spark - Introduction', status: 'not-started' },
          { topic: 'UNIT IV: RDD Operations', status: 'not-started' },
          { topic: 'UNIT IV: Spark SQL', status: 'not-started' },
          { topic: 'UNIT IV: Spark Streaming', status: 'not-started' },
          { topic: 'UNIT IV: MLlib', status: 'not-started' },
          // UNIT V - Analytics
          { topic: 'UNIT V: Data Visualization', status: 'not-started' },
          { topic: 'UNIT V: Predictive Analytics', status: 'not-started' },
          { topic: 'UNIT V: Real-time Analytics', status: 'not-started' },
          { topic: 'UNIT V: Big Data Use Cases', status: 'not-started' },
        ],
      },
      {
        name: 'Information Security',
        code: 'CS402',
        credits: 3,
        category: 'PE',
        units: 5,
        topics: [
          // UNIT I - Introduction
          { topic: 'UNIT I: Information Security - Concepts', status: 'not-started' },
          { topic: 'UNIT I: CIA Triad', status: 'not-started' },
          { topic: 'UNIT I: Security Threats and Attacks', status: 'not-started' },
          { topic: 'UNIT I: Security Services', status: 'not-started' },
          // UNIT II - Cryptography
          { topic: 'UNIT II: Classical Cryptography', status: 'not-started' },
          { topic: 'UNIT II: Symmetric Key Cryptography - DES', status: 'not-started' },
          { topic: 'UNIT II: AES', status: 'not-started' },
          { topic: 'UNIT II: Asymmetric Key Cryptography - RSA', status: 'not-started' },
          { topic: 'UNIT II: Diffie-Hellman Key Exchange', status: 'not-started' },
          // UNIT III - Authentication
          { topic: 'UNIT III: Hash Functions - MD5, SHA', status: 'not-started' },
          { topic: 'UNIT III: Digital Signatures', status: 'not-started' },
          { topic: 'UNIT III: Digital Certificates', status: 'not-started' },
          { topic: 'UNIT III: PKI', status: 'not-started' },
          { topic: 'UNIT III: Authentication Protocols', status: 'not-started' },
          // UNIT IV - Network Security
          { topic: 'UNIT IV: Firewalls - Types', status: 'not-started' },
          { topic: 'UNIT IV: Intrusion Detection Systems', status: 'not-started' },
          { topic: 'UNIT IV: VPN', status: 'not-started' },
          { topic: 'UNIT IV: SSL/TLS', status: 'not-started' },
          { topic: 'UNIT IV: IPSec', status: 'not-started' },
          // UNIT V - Application Security
          { topic: 'UNIT V: Web Security - OWASP Top 10', status: 'not-started' },
          { topic: 'UNIT V: SQL Injection', status: 'not-started' },
          { topic: 'UNIT V: XSS and CSRF', status: 'not-started' },
          { topic: 'UNIT V: Email Security', status: 'not-started' },
          { topic: 'UNIT V: Malware and Countermeasures', status: 'not-started' },
        ],
      },
    ],
  },
};

// Sections to create syllabus for
const sections = ['A', 'B', 'C', 'D'];
const batch = '2022 - 2023';

async function seedR20Syllabus() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get admin user ID for updatedBy field
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String,
    }));

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating system user...');
      adminUser = await User.create({
        email: 'system@anits.edu.in',
        role: 'admin',
      });
    }

    let created = 0;
    let updated = 0;

    for (const [key, semesterData] of Object.entries(r20Curriculum)) {
      for (const section of sections) {
        const syllabusData = {
          year: semesterData.year,
          semester: semesterData.semester,
          batch: batch,
          section: section,
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

        // Check if syllabus already exists
        const existing = await Syllabus.findOne({
          year: syllabusData.year,
          semester: syllabusData.semester,
          batch: syllabusData.batch,
          section: syllabusData.section,
        });

        if (existing) {
          await Syllabus.updateOne(
            { _id: existing._id },
            { $set: syllabusData }
          );
          updated++;
          console.log(`Updated: Year ${syllabusData.year}, Semester ${syllabusData.semester}, Section ${section}`);
        } else {
          await Syllabus.create(syllabusData);
          created++;
          console.log(`Created: Year ${syllabusData.year}, Semester ${syllabusData.semester}, Section ${section}`);
        }
      }
    }

    console.log(`\n✅ Syllabus seeding completed!`);
    console.log(`   Created: ${created} records`);
    console.log(`   Updated: ${updated} records`);
    console.log(`   Total: ${created + updated} records`);
    console.log(`\n📚 Subjects with detailed UNIT-wise topics have been added.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding syllabus:', error);
    process.exit(1);
  }
}

seedR20Syllabus();
