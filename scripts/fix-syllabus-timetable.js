const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Detailed unit-wise topics for key subjects
const detailedTopics = {
  'Computer Organization and Microprocessors': [
    // UNIT I - Basic Computer Organization
    { topic: 'UNIT I: Introduction to Computer Organization', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Register Transfer Language (RTL)', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Register Transfer Operations', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Bus and Memory Transfers', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Instruction Codes and Formats', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Computer Registers', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Common Bus System', status: 'not-started', isCompleted: false },
    // UNIT II - Computer Instructions
    { topic: 'UNIT II: Computer Instructions Overview', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Memory-Reference Instructions', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Register-Reference Instructions', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Input-Output Instructions', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Timing and Control Unit', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Instruction Cycle - Fetch, Decode, Execute', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Addressing Modes', status: 'not-started', isCompleted: false },
    // UNIT III - ALU and Arithmetic
    { topic: 'UNIT III: Arithmetic Logic Unit Design', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Arithmetic Microoperations', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Logic Microoperations', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Shift Microoperations', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Binary Addition and Subtraction', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Booth Multiplication Algorithm', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Restoring and Non-Restoring Division', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Floating Point Arithmetic', status: 'not-started', isCompleted: false },
    // UNIT IV - Control Unit and Memory
    { topic: 'UNIT IV: Hardwired Control Unit Design', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Microprogrammed Control Unit', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Control Memory Organization', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Address Sequencing', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Memory Hierarchy', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Cache Memory - Mapping Techniques', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Virtual Memory Concepts', status: 'not-started', isCompleted: false },
    // UNIT V - I/O and Microprocessors
    { topic: 'UNIT V: Input/Output Interface', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Asynchronous Data Transfer', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Modes of Transfer - Programmed I/O, Interrupt, DMA', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: 8085 Microprocessor Architecture', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: 8085 Instruction Set and Addressing Modes', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: 8085 Assembly Language Programming', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: 8086 Microprocessor Architecture', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: 8086 Memory Segmentation', status: 'not-started', isCompleted: false },
  ],
  
  'Artificial Intelligence': [
    // UNIT I - Introduction
    { topic: 'UNIT I: Introduction to AI - History and Applications', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Intelligent Agents - Types and Environments', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: PEAS Description', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Agent Architectures', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Turing Test and Chinese Room', status: 'not-started', isCompleted: false },
    // UNIT II - Search Strategies
    { topic: 'UNIT II: Problem Solving - State Space Representation', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Uninformed Search - BFS', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Uninformed Search - DFS', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Depth-Limited and Iterative Deepening Search', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Uniform Cost Search', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Informed Search - Heuristics', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Best-First Search', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: A* Algorithm', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Hill Climbing', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Simulated Annealing', status: 'not-started', isCompleted: false },
    // UNIT III - Game Playing and CSP
    { topic: 'UNIT III: Game Playing - Minimax Algorithm', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Alpha-Beta Pruning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Constraint Satisfaction Problems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Backtracking and Forward Checking', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Arc Consistency', status: 'not-started', isCompleted: false },
    // UNIT IV - Knowledge Representation
    { topic: 'UNIT IV: Propositional Logic', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: First-Order Logic - Syntax and Semantics', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Inference in First-Order Logic', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Unification and Resolution', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Semantic Networks', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Frames and Scripts', status: 'not-started', isCompleted: false },
    // UNIT V - Uncertainty and Learning
    { topic: 'UNIT V: Probability and Bayes Theorem', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Bayesian Networks', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Fuzzy Logic and Fuzzy Sets', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Introduction to Machine Learning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Decision Trees', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Neural Networks Basics', status: 'not-started', isCompleted: false },
  ],
  
  'Machine Learning': [
    // UNIT I - Introduction
    { topic: 'UNIT I: Introduction to Machine Learning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Types - Supervised, Unsupervised, Reinforcement', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Applications of ML', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: ML Pipeline and Workflow', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Data Preprocessing - Handling Missing Values', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Feature Scaling - Normalization and Standardization', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Feature Engineering', status: 'not-started', isCompleted: false },
    // UNIT II - Regression
    { topic: 'UNIT II: Simple Linear Regression', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Multiple Linear Regression', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Polynomial Regression', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Gradient Descent Algorithm', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Cost Function and Optimization', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Regularization - Ridge Regression (L2)', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Regularization - Lasso Regression (L1)', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Logistic Regression', status: 'not-started', isCompleted: false },
    // UNIT III - Classification
    { topic: 'UNIT III: K-Nearest Neighbors (KNN)', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Decision Trees - ID3 Algorithm', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Decision Trees - C4.5 and CART', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Naive Bayes Classifier', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Support Vector Machines (SVM)', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: SVM Kernels - Linear, RBF, Polynomial', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Model Evaluation - Confusion Matrix', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Precision, Recall, F1-Score', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: ROC Curve and AUC', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Cross-Validation Techniques', status: 'not-started', isCompleted: false },
    // UNIT IV - Clustering
    { topic: 'UNIT IV: Clustering - Introduction', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: K-Means Clustering', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Hierarchical Clustering - Agglomerative', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: DBSCAN Algorithm', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Cluster Evaluation - Silhouette Score', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Dimensionality Reduction - PCA', status: 'not-started', isCompleted: false },
    // UNIT V - Ensemble Methods
    { topic: 'UNIT V: Ensemble Learning - Introduction', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Bagging and Bootstrap', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Random Forest', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Boosting - AdaBoost', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Gradient Boosting', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: XGBoost', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Model Selection and Hyperparameter Tuning', status: 'not-started', isCompleted: false },
  ],
  
  'Introduction to Intelligent Systems': [
    // UNIT I - Fundamentals
    { topic: 'UNIT I: Introduction to Intelligent Systems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Types of Intelligent Systems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Knowledge-Based Systems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Expert Systems Architecture', status: 'not-started', isCompleted: false },
    { topic: 'UNIT I: Rule-Based Systems', status: 'not-started', isCompleted: false },
    // UNIT II - Knowledge Representation
    { topic: 'UNIT II: Knowledge Representation Techniques', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Semantic Networks', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Frames and Slots', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Ontologies', status: 'not-started', isCompleted: false },
    { topic: 'UNIT II: Description Logic', status: 'not-started', isCompleted: false },
    // UNIT III - Reasoning Systems
    { topic: 'UNIT III: Reasoning Under Uncertainty', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Probabilistic Reasoning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Fuzzy Reasoning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Case-Based Reasoning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT III: Model-Based Reasoning', status: 'not-started', isCompleted: false },
    // UNIT IV - Learning Systems
    { topic: 'UNIT IV: Machine Learning in Intelligent Systems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Neural Networks', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Deep Learning Basics', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Reinforcement Learning', status: 'not-started', isCompleted: false },
    { topic: 'UNIT IV: Transfer Learning', status: 'not-started', isCompleted: false },
    // UNIT V - Applications
    { topic: 'UNIT V: Natural Language Processing', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Computer Vision', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Robotics and Autonomous Systems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Intelligent Tutoring Systems', status: 'not-started', isCompleted: false },
    { topic: 'UNIT V: Smart Assistants and Chatbots', status: 'not-started', isCompleted: false },
  ],
};

async function updateSyllabusAndTimetable() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  console.log('=== Updating Syllabus Topics ===');
  
  // Update syllabus topics for each subject
  for (const [subjectName, topics] of Object.entries(detailedTopics)) {
    const result = await db.collection('syllabuses').updateMany(
      { 'subjects.name': subjectName },
      { 
        $set: { 
          'subjects.$[elem].topics': topics,
          'subjects.$[elem].totalTopics': topics.length,
          'subjects.$[elem].completedTopics': 0
        } 
      },
      { arrayFilters: [{ 'elem.name': subjectName }] }
    );
    console.log(`Updated ${subjectName}: ${result.modifiedCount} records`);
  }
  
  console.log('\n=== Updating Professor Timetable ===');
  
  // Update professor's classes with time slots
  const result = await db.collection('users').updateOne(
    { email: 'satya.csm@anits.edu.in' },
    { 
      $set: { 
        classesTeaching: [
          { 
            subject: 'Computer Organization and Microprocessors', 
            batch: '2022', 
            section: 'C', 
            year: '2', 
            semester: '1', 
            status: 'active',
            timeSlots: [
              { day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'Room 301' },
              { day: 'Wednesday', startTime: '11:00', endTime: '12:00', room: 'Room 301' },
              { day: 'Friday', startTime: '09:00', endTime: '10:00', room: 'Room 301' }
            ]
          },
          { 
            subject: 'Introduction to Intelligent Systems', 
            batch: '2022', 
            section: 'C', 
            year: '3', 
            semester: '2', 
            status: 'active',
            timeSlots: [
              { day: 'Tuesday', startTime: '10:00', endTime: '11:00', room: 'Room 405' },
              { day: 'Thursday', startTime: '14:00', endTime: '15:00', room: 'Room 405' }
            ]
          },
          { 
            subject: 'Artificial Intelligence', 
            batch: '2022', 
            section: 'C', 
            year: '2', 
            semester: '2', 
            status: 'active',
            timeSlots: [
              { day: 'Monday', startTime: '11:00', endTime: '12:00', room: 'Room 302' },
              { day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'Room 302' },
              { day: 'Thursday', startTime: '10:00', endTime: '11:00', room: 'Room 302' }
            ]
          },
          { 
            subject: 'Machine Learning', 
            batch: '2022', 
            section: 'C', 
            year: '3', 
            semester: '1', 
            status: 'active',
            timeSlots: [
              { day: 'Tuesday', startTime: '09:00', endTime: '10:00', room: 'Lab 201' },
              { day: 'Friday', startTime: '11:00', endTime: '12:00', room: 'Lab 201' },
              { day: 'Saturday', startTime: '10:00', endTime: '12:00', room: 'Lab 201' }
            ]
          }
        ] 
      } 
    }
  );
  
  console.log('Professor timetable updated:', result.modifiedCount);
  
  // Verify the updates
  const user = await db.collection('users').findOne({ email: 'satya.csm@anits.edu.in' });
  console.log('\nUpdated classes with timeSlots:');
  user.classesTeaching?.forEach(c => {
    console.log(`- ${c.subject}: ${c.timeSlots?.length || 0} time slots`);
  });
  
  await mongoose.disconnect();
  console.log('\n✅ All updates completed!');
  process.exit(0);
}

updateSyllabusAndTimetable();
