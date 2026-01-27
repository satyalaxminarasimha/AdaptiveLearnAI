

import type { ChartConfig } from '@/components/ui/chart';

export const studentUser = {
  id: 's10',
  name: 'Sophia Davis',
  email: 'sophia.davis.22.csm@anits.edu.in',
  rollNo: 'A2212651234',
  avatarUrl: 'https://picsum.photos/seed/10/40/40',
  batch: '2022',
  section: 'A',
};

export const professorUser = {
  name: 'Dr. Alan Turing',
  email: 'alan.turing.csm@anits.edu.in',
  avatarUrl: 'https://picsum.photos/seed/11/40/40',
};

export const adminUser = {
    name: 'Admin',
    email: 'learnAI.admin@gmail.com'
};

export const studentStats = [
  { title: 'Total Quizzes', value: '35', icon: 'BookCopy' },
  { title: 'Quizzes Attempted', value: '28', icon: 'FileCheck' },
  { title: 'Quizzes Pending', value: '7', icon: 'Clock' },
];

export const stats = [
  {
    title: 'Courses Enrolled',
    value: '4',
    icon: 'BookCopy',
  },
  {
    title: 'Quizzes Completed',
    value: '28',
    icon: 'FileCheck',
  },
  {
    title: 'Average Score',
    value: '82%',
    icon: 'BarChart2',
  },
];

export const upcomingQuizzes = [
  {
    id: 'q1',
    title: 'Calculus I - Chapter 3',
    subject: 'Mathematics',
    dueDate: '2024-08-15',
    status: 'Pending'
  },
  {
    id: 'q2',
    title: 'Classical Mechanics - Kinematics',
    subject: 'Physics',
    dueDate: '2024-08-18',
    status: 'Pending'
  },
  {
    id: 'q3',
    title: 'Data Structures - Trees',
    subject: 'Computer Science',
    dueDate: '2024-08-22',
    status: 'Pending'
  },
   {
    id: 'q4',
    title: 'Digital Logic - Combinational Circuits',
    subject: 'Computer Science',
    dueDate: '2024-08-25',
    status: 'Pending'
  },
  {
    id: 'q5',
    title: 'OOP - Inheritance',
    subject: 'Computer Science',
    dueDate: '2024-08-28',
    status: 'Pending'
  }
];

export const progressData = [
  { month: 'Apr', score: 75 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 85 },
  { month: 'Jul', score: 82 },
];

export const weeklyProgressData = [
    { subject: 'Data Structures', progress: 75 },
    { subject: 'Algorithms', progress: 60 },
    { subject: 'System Design', progress: 45 },
    { subject: 'Database Management', progress: 85 },
];

export const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export const recommendations = [
  {
    id: 'r1',
    title: 'Review: Integration by Parts',
    description: 'Your recent quiz scores in Calculus suggest a review of this topic could be beneficial.',
    subject: 'Mathematics',
  },
  {
    id: 'r2',
    title: 'Practice: Newton\'s Second Law',
    description: 'Strengthen your understanding of forces and motion with these targeted problems.',
    subject: 'Physics',
  },
  {
    id: 'r3',
    title: 'New Quiz Available: Big O Notation',
    description: 'A new quiz is available to test your knowledge of algorithm complexity.',
    subject: 'Computer Science',
  },
];

export const initialChatMessages = [
    {
        sender: 'AI',
        message: 'Hello! I am your AI Tutor. How can I help you master your subjects today?',
    },
    {
        sender: 'user',
        message: 'I\'m having trouble understanding recursion in computer science. Can you explain it in a simple way?',
    },
    {
        sender: 'AI',
        message: 'Of course! Think of recursion like a set of Russian nesting dolls. To open the smallest doll, you first have to open all the larger dolls outside of it. Each time you open a doll, you are performing the same action on a slightly smaller problem. \n\nIn programming, a recursive function is one that calls itself with a "smaller" or simpler version of the original problem, until it reaches a "base case" that it can solve directly. Then it works its way back up, solving each larger problem along the way. \n\nWould you like to try a simple code example?',
    },
];

export const syllabusByYear = {
  '1st Year': [
    { subject: 'Introduction to Programming', units: 5 },
    { subject: 'Calculus I', units: 5 },
    { subject: 'Linear Algebra', units: 5 },
    { subject: 'Introduction to Physics', units: 5 },
    { subject: 'Communication Skills', units: 5 },
  ],
  '2nd Year': [
    { subject: 'Data Structures', units: 5 },
    { subject: 'Calculus II', units: 5 },
    { subject: 'Digital Logic Design', units: 5 },
    { subject: 'Classical Mechanics', units: 5 },
    { subject: 'Object Oriented Programming', units: 5 },
  ],
};

export const detailedSyllabus = {
  '1st Year': {
    '1st Semester': [
      { name: 'Engineering Physics', topics: ['Wave Optics', 'Quantum Mechanics', 'Semiconductors'] },
      { name: 'Mathematics-I', topics: ['Matrices', 'Differential Calculus', 'Multivariable Calculus'] },
      { name: 'Communicative English', topics: ['Grammar', 'Vocabulary', 'Phonetics'] },
      { name: 'Calculus I', topics: ['Limits', 'Derivatives', 'Integrals'] },
    ],
    '2nd Semester': [
      { name: 'Problem Solving and Programming with Python', topics: ['Introduction', 'Control Flow', 'Functions', 'Data Structures'] },
      { name: 'Mathematics-II', topics: ['Ordinary Differential Equations', 'Vector Calculus', 'Laplace Transforms'] },
      { name: 'Engineering Chemistry', topics: ['Water Technology', 'Electrochemistry', 'Corrosion'] },
    ],
  },
  '2nd Year': {
    '3rd Semester': [
      { name: 'Data Structures', topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs'] },
      { name: 'Digital Logic Design', topics: ['Boolean Algebra', 'Combinational Logic', 'Sequential Logic'] },
      { name: 'Discrete Mathematical Structures', topics: ['Set Theory', 'Logic', 'Graph Theory', 'Combinatorics'] },
    ],
    '4th Semester': [
        { name: 'Object Oriented Programming through Java', topics: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Exception Handling'] },
        { name: 'Database Management Systems', topics: ['SQL', 'ER Models', 'Normalization', 'Transactions'] },
        { name: 'Operating Systems', topics: ['Processes', 'Memory Management', 'File Systems', 'Deadlocks'] },
    ],
  },
  '3rd Year': {
    '5th Semester': [],
    '6th Semester': [],
  },
  '4th Year': {
    '7th Semester': [],
    '8th Semester': [],
  },
};


export const performanceStats = {
  quizzesConducted: 50,
  quizzesAttempted: 1250,
  averageAttempts: 25
};

export const studentGrowthData = [
  { year: '2021', users: 800 },
  { year: '2022', users: 950 },
  { year: '2023', users: 1100 },
  { year: '2024', users: 1250 },
];
export const professorGrowthData = [
  { year: '2021', users: 50 },
  { year: '2022', users: 60 },
  { year: '2023', users: 70 },
  { year: '2024', users: 75 },
];


export const userGrowthChartConfig = {
  users: {
    label: 'Users',
  },
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-1))',
  },
  professors: {
    label: 'Professors',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


export const syllabusCompletionBySemester = {
  '1st Semester': [
    { subject: 'Eng. Physics', completed: 85, fill: 'var(--color-physics)' },
    { subject: 'Maths-I', completed: 92, fill: 'var(--color-maths1)' },
    { subject: 'Comm. English', completed: 78, fill: 'var(--color-english)' },
  ],
  '2nd Semester': [
    { subject: 'Python', completed: 95, fill: 'var(--color-python)' },
    { subject: 'Maths-II', completed: 88, fill: 'var(--color-maths2)' },
    { subject: 'Eng. Chemistry', completed: 81, fill: 'var(--color-chemistry)' },
  ],
   '3rd Semester': [
    { subject: 'Data Structures', completed: 90, fill: 'var(--color-ds)' },
    { subject: 'Digital Logic', completed: 85, fill: 'var(--color-dld)' },
    { subject: 'Discrete Maths', completed: 82, fill: 'var(--color-dm)' },
  ],
  '4th Semester': [
    { subject: 'Java', completed: 94, fill: 'var(--color-java)' },
    { subject: 'DBMS', completed: 88, fill: 'var(--color-dbms)' },
    { subject: 'OS', completed: 85, fill: 'var(--color-os)' },
  ],
  '5th Semester': [
    { subject: 'Computer Networks', completed: 80, fill: 'var(--color-cn)' },
    { subject: 'Automata Theory', completed: 75, fill: 'var(--color-at)' },
    { subject: 'Web Technologies', completed: 90, fill: 'var(--color-wt)' },
  ],
  '6th Semester': [
    { subject: 'Compiler Design', completed: 70, fill: 'var(--color-cd)' },
    { subject: 'AI', completed: 85, fill: 'var(--color-ai)' },
    { subject: 'Machine Learning', completed: 88, fill: 'var(--color-ml)' },
  ],
  '7th Semester': [
    { subject: 'Cryptography', completed: 78, fill: 'var(--color-crypto)' },
    { subject: 'Cloud Computing', completed: 82, fill: 'var(--color-cc)' },
    { subject: 'Project Work', completed: 95, fill: 'var(--color-pw)' },
  ],
  '8th Semester': [
    { subject: 'Internship', completed: 100, fill: 'var(--color-intern)' },
    { subject: 'Final Project', completed: 90, fill: 'var(--color-fp)' },
  ],
};

export const syllabusCompletionChartConfig = {
  completed: {
    label: 'Completed',
  },
  'Eng. Physics': { label: 'Eng. Physics', color: 'hsl(var(--chart-1))' },
  'Maths-I': { label: 'Maths-I', color: 'hsl(var(--chart-2))' },
  'Comm. English': { label: 'Comm. English', color: 'hsl(var(--chart-3))' },
  'Python': { label: 'Python', color: 'hsl(var(--chart-4))' },
  'Maths-II': { label: 'Maths-II', color: 'hsl(var(--chart-5))' },
  'Eng. Chemistry': { label: 'Eng. Chemistry', color: 'hsl(var(--chart-1))' },
  'Data Structures': { label: 'Data Structures', color: 'hsl(var(--chart-2))' },
  'Digital Logic': { label: 'Digital Logic', color: 'hsl(var(--chart-3))' },
  'Discrete Maths': { label: 'Discrete Maths', color: 'hsl(var(--chart-4))' },
  'Java': { label: 'Java', color: 'hsl(var(--chart-5))' },
  'DBMS': { label: 'DBMS', color: 'hsl(var(--chart-1))' },
  'OS': { label: 'OS', color: 'hsl(var(--chart-2))' },
  'Computer Networks': { label: 'Computer Networks', color: 'hsl(var(--chart-3))' },
  'Automata Theory': { label: 'Automata Theory', color: 'hsl(var(--chart-4))' },
  'Web Technologies': { label: 'Web Technologies', color: 'hsl(var(--chart-5))' },
  'Compiler Design': { label: 'Compiler Design', color: 'hsl(var(--chart-1))' },
  'AI': { label: 'AI', color: 'hsl(var(--chart-2))' },
  'Machine Learning': { label: 'Machine Learning', color: 'hsl(var(--chart-3))' },
  'Cryptography': { label: 'Cryptography', color: 'hsl(var(--chart-4))' },
  'Cloud Computing': { label: 'Cloud Computing', color: 'hsl(var(--chart-5))' },
  'Project Work': { label: 'Project Work', color: 'hsl(var(--chart-1))' },
  'Internship': { label: 'Internship', color: 'hsl(var(--chart-2))' },
  'Final Project': { label: 'Final Project', color: 'hsl(var(--chart-3))' },
   subject: {
    label: 'Subject',
  },
  physics: { color: 'hsl(var(--chart-1))' },
  maths1: { color: 'hsl(var(--chart-2))' },
  english: { color: 'hsl(var(--chart-3))' },
  python: { color: 'hsl(var(--chart-4))' },
  maths2: { color: 'hsl(var(--chart-5))' },
  chemistry: { color: 'hsl(var(--chart-1))' },
  ds: { color: 'hsl(var(--chart-2))' },
  dld: { color: 'hsl(var(--chart-3))' },
  dm: { color: 'hsl(var(--chart-4))' },
  java: { color: 'hsl(var(--chart-5))' },
  dbms: { color: 'hsl(var(--chart-1))' },
  os: { color: 'hsl(var(--chart-2))' },
  cn: { color: 'hsl(var(--chart-3))' },
  at: { color: 'hsl(var(--chart-4))' },
  wt: { color: 'hsl(var(--chart-5))' },
  cd: { color: 'hsl(var(--chart-1))' },
  ai: { color: 'hsl(var(--chart-2))' },
  ml: { color: 'hsl(var(--chart-3))' },
  crypto: { color: 'hsl(var(--chart-4))' },
  cc: { color: 'hsl(var(--chart-5))' },
  pw: { color: 'hsl(var(--chart-1))' },
  intern: { color: 'hsl(var(--chart-2))' },
  fp: { color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

export const requestAnalyticsChartConfig = {
  requests: {
    label: 'Requests',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-3))',
  },
  approved: {
    label: 'Approved',
    color: 'hsl(var(--chart-2))',
  },
  rejected: {
    label: 'Rejected',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export const adminStats = [
    { title: 'Total Users', value: 1325, icon: 'Users' },
    { title: 'Total Professors', value: 75, icon: 'UserSquare' },
    { title: 'Total Students', value: 1250, icon: 'GraduationCap' },
    { title: 'Admission Requests', value: 5, icon: 'UserPlus' },
];

export const recentActivity = [
    { id: '1', description: 'Professor John Doe (john.doe@example.com) has requested an account.', time: '2 minutes ago', status: 'pending' },
    { id: '2', description: 'Student Jane Smith (jane.smith@example.com) has requested an account.', time: '5 minutes ago', status: 'pending' },
    { id: '3', description: 'Student Alex Johnson (alex.j@example.com) has requested an account.', time: '10 minutes ago', status: 'pending' },
    { id: '4', description: 'Professor Emily White (emily.w@example.com) has requested an account.', time: '15 minutes ago', status: 'pending' },
    { id: '5', description: 'Student Michael Brown (michael.b@example.com) has requested an account.', time: '20 minutes ago', status: 'pending' },
];

export const admitRequests = [
    { id: 'req1', type: 'Professor Registration', description: 'Professor John Doe (john.doe@example.com) has requested an account. Expertise: Computer Science', status: 'pending' },
    { id: 'req2', type: 'Professor Registration', description: 'Professor Emily White (emily.w@example.com) has requested an account. Expertise: Physics', status: 'pending' },
    { id: 'req3', type: 'Student Registration', description: 'Student Jane Smith (jane.smith@example.com) has requested an account.', status: 'pending' },
    { id: 'req4', type: 'Student Registration', description: 'Student Alex Johnson (alex.j@example.com) has requested an account.', status: 'pending' },
    { id: 'req5', type: 'Student Registration', description: 'Student Michael Brown (michael.b@example.com) has requested an account.', status: 'pending' },
];

export const requestAnalyticsData = [
    { name: 'Professors', pending: 2, approved: 10, rejected: 1 },
    { name: 'Students', pending: 3, approved: 50, rejected: 5 },
];

export const professorStats = [
    { title: 'Active Students', value: 120, icon: 'Users' },
    { title: 'Total Topics', value: 25, icon: 'Book' },
    { title: 'Topics Covered', value: 15, icon: 'CheckCircle' },
    { title: 'Topics Pending', value: 10, icon: 'ListTodo' },
    { title: 'Quizzes Created', value: 15, icon: 'FileText' },
];

export const professorRecentActivity = [
    { id: '1', topic: 'Created a new quiz for Calculus I', date: '2024-08-10 10:00 AM' },
    { id: '2', topic: 'Updated syllabus for Introduction to Physics', date: '2024-08-09 03:45 PM' },
    { id: '3', topic: 'Graded assignments for Data Structures', date: '2024-08-09 11:20 AM' },
    { id: '4', topic: 'Posted an announcement for Linear Algebra', date: '2024-08-08 09:00 AM' },
];

export const quizzesConductedData = [
  { month: 'Jan', quizzes: 2 },
  { month: 'Feb', quizzes: 3 },
  { month: 'Mar', quizzes: 5 },
  { month: 'Apr', quizzes: 4 },
  { month: 'May', quizzes: 6 },
];

export const quizzesConductedChartConfig = {
  quizzes: {
    label: 'Quizzes',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


export const studentPassFailData = [
  { status: 'Pass', students: 85, fill: 'hsl(var(--chart-2))' },
  { status: 'Fail', students: 15, fill: 'hsl(var(--chart-4))' },
];

export const studentPassFailChartConfig = {
  students: {
    label: 'Students',
  },
  Pass: {
    label: 'Pass',
  },
  Fail: {
    label: 'Fail',
  },
} satisfies ChartConfig;


// New mock data for detailed student analysis
export const allStudents = [
  { id: 's1', name: 'Student One', rollNo: 'A2212651001', batch: '2022', section: 'A' },
  { id: 's2', name: 'Student Two', rollNo: 'A2212651002', batch: '2022', section: 'A' },
  { id: 's3', name: 'Student Three', rollNo: 'A2212651003', batch: '2022', section: 'A' },
  { id: 's4', name: 'Student Four', rollNo: 'A2212651004', batch: '2022', section: 'A' },
  { id: 's5', name: 'Student Five', rollNo: 'A2212651005', batch: '2022', section: 'A' },
  { id: 's6', name: 'Student Six', rollNo: 'A2212652001', batch: '2022', section: 'B' },
  { id: 's7', name: 'Student Seven', rollNo: 'A2212652002', batch: '2022', section: 'B' },
  { id: 's8', name: 'Student Eight', rollNo: 'A2112651001', batch: '2021', section: 'A' },
  { id: 's9', name: 'Student Nine', rollNo: 'A2112651002', batch: '2021', section: 'A' },
  { id: 's10', name: 'Sophia Davis', rollNo: 'A2212651234', batch: '2022', section: 'A' },
];

export const professorClasses = [
  { batch: '2022', section: 'A', subject: 'Data Structures', semester: '3rd Semester' },
  { batch: '2022', section: 'B', subject: 'Data Structures', semester: '3rd Semester' },
  { batch: '2021', section: 'A', subject: 'Calculus I', semester: '1st Semester' },
  { batch: '2021', section: 'A', subject: 'Digital Logic Design', semester: '3rd Semester' },
];

export const quizzesBySubject: Record<string, string[]> = {
  'Data Structures': ['Data Structures - Trees', 'Data Structures - Graphs'],
  'Classical Mechanics': ['Classical Mechanics - Kinematics'],
  'Calculus I': ['Calculus I - Chapter 3'],
  'Digital Logic Design': ['DLD - Combinational Logic'],
  'Algorithms': ['Algorithms - Sorting', 'Algorithms - Searching', 'Algorithms - Dynamic Programming'],
};

export const allQuizPerformances = [
  // Data Structures - Trees (Batch 2022, Section A)
  { studentId: 's1', quiz: 'Data Structures - Trees', score: 89, status: 'Pass' },
  { studentId: 's2', quiz: 'Data Structures - Trees', score: 91, status: 'Pass' },
  { studentId: 's3', quiz: 'Data Structures - Trees', score: 80, status: 'Pass' },
  // s4 did not attempt
  { studentId: 's5', quiz: 'Data Structures - Trees', score: 58, status: 'Fail' },
  { studentId: 's10', quiz: 'Data Structures - Trees', score: 95, status: 'Pass' },
  
  // Data Structures - Trees (Batch 2022, Section B)
  { studentId: 's6', quiz: 'Data Structures - Trees', score: 75, status: 'Pass' },

  // Data Structures - Graphs (Batch 2022, Section A)
  { studentId: 's1', quiz: 'Data Structures - Graphs', score: 92, status: 'Pass' },
  { studentId: 's2', quiz: 'Data Structures - Graphs', score: 65, status: 'Pass' },
  { studentId: 's3', quiz: 'Data Structures - Graphs', score: 75, status: 'Pass' },
  { studentId: 's5', quiz: 'Data Structures - Graphs', score: 88, status: 'Pass' },
  { studentId: 's10', quiz: 'Data Structures - Graphs', score: 78, status: 'Pass' },
  { studentId: 's4', quiz: 'Data Structures - Graphs', score: 81, status: 'Pass' },

  // Calculus I - Chapter 3 (Batch 2021, Section A)
  { studentId: 's8', quiz: 'Calculus I - Chapter 3', score: 88, status: 'Pass' },
  { studentId: 's9', quiz: 'Calculus I - Chapter 3', score: 55, status: 'Fail' },

  // DLD - Combinational Logic (Batch 2021, Section A)
  { studentId: 's8', quiz: 'DLD - Combinational Logic', score: 95, status: 'Pass' },

   // Algorithms - Searching (Batch 2022, Section A)
  { studentId: 's1', quiz: 'Algorithms - Searching', score: 95, status: 'Pass' },
  { studentId: 's2', quiz: 'Algorithms - Searching', score: 88, status: 'Pass' },
  { studentId: 's3', quiz: 'Algorithms - Searching', score: 76, status: 'Pass' },
  { studentId: 's5', quiz: 'Algorithms - Searching', score: 92, status: 'Pass' },
  { studentId: 's10', quiz: 'Algorithms - Searching', score: 85, status: 'Pass' },

];

// Data for Student Analysis Page
export const studentQuizAnalysisStats = [
  { name: 'Attempted', value: 28, fill: 'hsl(var(--chart-1))' },
  { name: 'Pending', value: 7, fill: 'hsl(var(--chart-2))' },
];

export const studentQuizAnalysisChartConfig = {
  value: {
    label: 'Quizzes',
  },
  Attempted: {
    label: 'Attempted',
  },
  Pending: {
    label: 'Pending',
  },
} satisfies ChartConfig;

export const subjectPerformanceData = [
  { subject: 'Data Structures', score: 85 },
  { subject: 'Algorithms', score: 72 },
  { subject: 'DBMS', score: 91 },
  { subject: 'Operating Systems', score: 78 },
  { subject: 'Calculus I', score: 65 },
];

export const subjectPerformanceChartConfig = {
  score: {
    label: 'Average Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


// Data for Student Review Page (AI Analysis)
export const studentFullQuizHistory = [
  { subject: 'Data Structures', topic: 'Arrays', score: 9, totalQuestions: 10 },
  { subject: 'Data Structures', topic: 'Linked Lists', score: 7, totalQuestions: 10 },
  { subject: 'Data Structures', topic: 'Stacks', score: 5, totalQuestions: 10 },
  { subject: 'Data Structures', topic: 'Queues', score: 6, totalQuestions: 10 },
  { subject: 'Data Structures', topic: 'Trees', score: 4, totalQuestions: 10 },
  { subject: 'Data Structures', topic: 'Graphs', score: 3, totalQuestions: 10 },
  { subject: 'Algorithms', topic: 'Sorting', score: 8, totalQuestions: 10 },
  { subject: 'Algorithms', topic: 'Searching', score: 6, totalQuestions: 10 },
  { subject: 'Algorithms', topic: 'Dynamic Programming', score: 2, totalQuestions: 10 },
];

export const studentAnswerAnalysisBySubject: Record<string, {name: string; answers: number; fill: string}[]> = {
  'Data Structures': [
    { name: 'Correct', answers: 34, fill: 'hsl(var(--chart-2))' },
    { name: 'Incorrect', answers: 26, fill: 'hsl(var(--chart-4))' },
  ],
  'Algorithms': [
    { name: 'Correct', answers: 16, fill: 'hsl(var(--chart-2))' },
    { name: 'Incorrect', answers: 14, fill: 'hsl(var(--chart-4))' },
  ]
};

export const studentAnswerAnalysisChartConfig = {
   answers: {
     label: 'Answers',
   },
   Correct: {
     label: 'Correct',
   },
   Incorrect: {
     label: 'Incorrect',
   },
   comparison: {
     label: "Comparison",
   }
} satisfies ChartConfig;
