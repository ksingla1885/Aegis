export const MOCK_TESTS = [
  {
    id: "aegis-nso-2026",
    token: "NSO-PROCTOR-2026",
    title: "National Science Olympiad (NSO) — Advanced Security Level 3",
    code: "NSO-PROCTOR-2026",
    organization: "National Science Foundation",
    category: "OLYMPIAD",
    durationMinutes: 45,
    passingScore: 70,
    totalQuestions: 5,
    maxViolationsAllowed: 3,
    securityLevel: "HIGH_SECURITY",
    allowedEmailDomain: "", // Open to any domain
    startTime: null, // Always active
    endTime: null,
    securityPolicy: {
      enableWebcamAI: true,
      enableAudioAnalyzer: true,
      enforceFullscreen: true,
      blockShortcuts: true,
      allowCalculator: true,
      watermarkType: "TILED_HASH",
    },
    instructions: [
      "Strict web proctoring is enabled for this assessment.",
      "Camera & microphone access are required continuously during the exam.",
      "Fullscreen mode will be locked upon test initiation.",
      "Exceeding 3 security violations will trigger auto-submission."
    ],
    questions: [
      {
        id: "q1",
        type: "MCQ",
        text: "Which subatomic particle is responsible for the strong nuclear force binding quarks within nucleons?",
        options: [
          { id: "opt-a", text: "Photon" },
          { id: "opt-b", text: "Gluon" },
          { id: "opt-c", text: "W-Boson" },
          { id: "opt-d", text: "Higgs Boson" }
        ],
        correctOptionId: "opt-b",
        explanation: "Gluons are the gauge bosons mediating the strong interaction force between quarks.",
        subject: "Physics",
        points: 10
      },
      {
        id: "q2",
        type: "MSQ", // Multi-Select Question
        text: "Select ALL of the following statements that are TRUE regarding cellular respiration:",
        options: [
          { id: "opt-a", text: "Glycolysis occurs in the cytoplasm and requires no oxygen." },
          { id: "opt-b", text: "The Krebs Cycle produces 32 ATP directly per turn." },
          { id: "opt-c", text: "Electron Transport Chain occurs in the inner mitochondrial membrane." },
          { id: "opt-d", text: "Fermentation yields more ATP than aerobic respiration." }
        ],
        correctOptionIds: ["opt-a", "opt-c"],
        explanation: "Glycolysis is anaerobic (cytoplasm) and ETC occurs in the inner mitochondrial membrane.",
        subject: "Biology",
        points: 15
      },
      {
        id: "q3",
        type: "SUBJECTIVE",
        text: "Briefly explain why Potassium Dichromate (K₂Cr₂O₇) acts as a strong oxidizing agent in acidic medium. State the oxidation state change.",
        wordLimit: 150,
        sampleAnswer: "Chromium is reduced from +6 to +3 state in acidic medium, absorbing electrons.",
        subject: "Chemistry",
        points: 20
      },
      {
        id: "q4",
        type: "MCQ",
        text: "What is the oxidation state of Chromium in Potassium Dichromate (K₂Cr₂O₇)?",
        options: [
          { id: "opt-a", text: "+3" },
          { id: "opt-b", text: "+6" },
          { id: "opt-c", text: "+7" },
          { id: "opt-d", text: "+4" }
        ],
        correctOptionId: "opt-b",
        explanation: "In K₂Cr₂O₇: 2(+1) + 2(Cr) + 7(-2) = 0 => 2Cr = +12 => Cr = +6.",
        subject: "Chemistry",
        points: 10
      },
      {
        id: "q5",
        type: "MCQ",
        text: "An electron moves at a velocity of 2.0 × 10⁶ m/s perpendicular to a magnetic field of 0.5 T. Calculate the magnetic force exerted on the electron. (e = 1.6 × 10⁻¹⁹ C)",
        options: [
          { id: "opt-a", text: "1.6 × 10⁻¹³ N" },
          { id: "opt-b", text: "3.2 × 10⁻¹⁴ N" },
          { id: "opt-c", text: "8.0 × 10⁻¹⁴ N" },
          { id: "opt-d", text: "1.6 × 10⁻¹⁹ N" }
        ],
        correctOptionId: "opt-a",
        explanation: "F = q * v * B * sin(90°) = (1.6×10⁻¹⁹ C) × (2.0×10⁶ m/s) × 0.5 T = 1.6 × 10⁻¹³ N.",
        subject: "Physics",
        points: 10
      }
    ]
  },
  {
    id: "corp-tech-recruit-2026",
    token: "YtuvwTZn4CC3ENSrC",
    title: "Senior Software Engineer Technical Placement Assessment",
    code: "YtuvwTZn4CC3ENSrC",
    organization: "Apex Global Tech Recruiters",
    category: "CORPORATE",
    durationMinutes: 60,
    passingScore: 75,
    totalQuestions: 4,
    maxViolationsAllowed: 2,
    securityLevel: "CORPORATE_STRICT",
    allowedEmailDomain: "", // Open or company specific
    startTime: null,
    endTime: null,
    securityPolicy: {
      enableWebcamAI: true,
      enableAudioAnalyzer: true,
      enforceFullscreen: true,
      blockShortcuts: true,
      allowCalculator: false,
      watermarkType: "TILED_HASH",
    },
    instructions: [
      "Official Corporate Placement Assessment.",
      "Direct Invite Token: YtuvwTZn4CC3ENSrC.",
      "DevTools, copy-paste, and external window switching are strictly logged.",
      "Ensure quiet surroundings; audio mic level is continuously monitored."
    ],
    questions: [
      {
        id: "c1",
        type: "MCQ",
        text: "Which data structure provides average O(1) time complexity for insert, delete, and lookup operations?",
        options: [
          { id: "opt-a", text: "Binary Search Tree" },
          { id: "opt-b", text: "Hash Table / Map" },
          { id: "opt-c", text: "Doubly Linked List" },
          { id: "opt-d", text: "Min-Heap" }
        ],
        correctOptionId: "opt-b",
        explanation: "Hash tables provide average O(1) time complexity using a hash function.",
        subject: "Data Structures",
        points: 25
      },
      {
        id: "c2",
        type: "MSQ",
        text: "Select ALL valid HTTP status codes that represent client-side request errors:",
        options: [
          { id: "opt-a", text: "400 Bad Request" },
          { id: "opt-b", text: "502 Bad Gateway" },
          { id: "opt-c", text: "403 Forbidden" },
          { id: "opt-d", text: "404 Not Found" }
        ],
        correctOptionIds: ["opt-a", "opt-c", "opt-d"],
        explanation: "4xx status codes are client errors. 502 is a server error.",
        subject: "Web Architecture",
        points: 25
      },
      {
        id: "c3",
        type: "CODING",
        text: "Analyze the algorithm below and state its worst-case space complexity:\n```js\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n```",
        options: [
          { id: "opt-a", text: "O(1)" },
          { id: "opt-b", text: "O(N) due to call stack depth" },
          { id: "opt-c", text: "O(2^N)" },
          { id: "opt-d", text: "O(N log N)" }
        ],
        correctOptionId: "opt-b",
        explanation: "Recursion depth reaches at most N, occupying O(N) call stack memory.",
        subject: "Algorithm Analysis",
        points: 25
      },
      {
        id: "c4",
        type: "SUBJECTIVE",
        text: "Describe the CAP Theorem in distributed databases and discuss how Cassandra handles eventual consistency.",
        wordLimit: 200,
        sampleAnswer: "CAP theorem states a distributed system can provide at most 2 of Consistency, Availability, Partition tolerance.",
        subject: "System Design",
        points: 25
      }
    ]
  },
  {
    id: "univ-cs101-final",
    token: "CS101-2026-FINAL",
    title: "CS101 Data Structures & Algorithms Final Semester Exam",
    code: "CS101-2026-FINAL",
    organization: "Stanford University — Computer Science Department",
    category: "UNIVERSITY",
    durationMinutes: 90,
    passingScore: 60,
    totalQuestions: 3,
    maxViolationsAllowed: 3,
    securityLevel: "ACADEMIC_PROCTORED",
    allowedEmailDomain: "stanford.edu",
    startTime: null,
    endTime: null,
    securityPolicy: {
      enableWebcamAI: true,
      enableAudioAnalyzer: false,
      enforceFullscreen: true,
      blockShortcuts: true,
      allowCalculator: true,
      watermarkType: "TILED_HASH",
    },
    instructions: [
      "Official University Examination paper.",
      "Restricted to verified @stanford.edu email domains.",
      "On-screen scientific calculator is permitted for quantitative questions."
    ],
    questions: [
      {
        id: "u1",
        type: "MCQ",
        text: "In a binary search tree, what traversal sequence visits nodes in sorted ascending order?",
        options: [
          { id: "opt-a", text: "Pre-order" },
          { id: "opt-b", text: "In-order" },
          { id: "opt-c", text: "Post-order" },
          { id: "opt-d", text: "Level-order" }
        ],
        correctOptionId: "opt-b",
        explanation: "In-order traversal (Left, Root, Right) visits nodes in ascending key order.",
        subject: "Computer Science",
        points: 30
      },
      {
        id: "u2",
        type: "MSQ",
        text: "Select ALL graph algorithms that can be used to compute Single-Source Shortest Paths:",
        options: [
          { id: "opt-a", text: "Dijkstra's Algorithm" },
          { id: "opt-b", text: "Kruskal's Algorithm" },
          { id: "opt-c", text: "Bellman-Ford Algorithm" },
          { id: "opt-d", text: "Prim's Algorithm" }
        ],
        correctOptionIds: ["opt-a", "opt-c"],
        explanation: "Dijkstra & Bellman-Ford compute shortest paths. Kruskal & Prim compute Minimum Spanning Trees.",
        subject: "Algorithms",
        points: 35
      },
      {
        id: "u3",
        type: "SUBJECTIVE",
        text: "Explain how amortized analysis proves that dynamic array resizing (doubling capacity) achieves O(1) amortized insertion time.",
        wordLimit: 200,
        sampleAnswer: "Array doubling costs O(N) only every N steps. Total cost for N pushes is O(N), averaging O(1) per push.",
        subject: "Algorithm Analysis",
        points: 35
      }
    ]
  }
];

/**
 * Custom Paper Registry (stored in-memory on globalThis for serverless persistence)
 */
if (typeof globalThis !== 'undefined') {
  globalThis.AEGIS_CUSTOM_EXAMS = globalThis.AEGIS_CUSTOM_EXAMS || [];
}

export function registerCustomExam(paperData) {
  if (!paperData || !paperData.id) return;
  const registry = (typeof globalThis !== 'undefined' && globalThis.AEGIS_CUSTOM_EXAMS) ? globalThis.AEGIS_CUSTOM_EXAMS : [];
  const existingIdx = registry.findIndex(
    (t) => t.id.toLowerCase() === paperData.id.toLowerCase()
  );
  if (existingIdx >= 0) {
    registry[existingIdx] = paperData;
  } else {
    registry.push(paperData);
  }
}

export function findExamByTokenOrId(tokenOrId) {
  const query = (tokenOrId || '').trim().toLowerCase();
  if (!query) return null;

  const foundMock = MOCK_TESTS.find(
    (t) =>
      t.id.toLowerCase() === query ||
      (t.token && t.token.toLowerCase() === query) ||
      (t.code && t.code.toLowerCase() === query)
  );
  if (foundMock) return foundMock;

  const registry = (typeof globalThis !== 'undefined' && globalThis.AEGIS_CUSTOM_EXAMS) ? globalThis.AEGIS_CUSTOM_EXAMS : [];
  return (
    registry.find(
      (t) =>
        t.id.toLowerCase() === query ||
        (t.token && t.token.toLowerCase() === query) ||
        (t.code && t.code.toLowerCase() === query)
    ) || null
  );
}

/**
 * BOLA Security Filter: Strips answer keys and internal explanations
 * before delivering candidate test payload to student roles.
 */
export function getSanitizedTestPayload(tokenOrId) {
  const test = findExamByTokenOrId(tokenOrId);
  if (!test) return null;

  return {
    ...test,
    questions: test.questions.map(q => ({
      id: q.id,
      type: q.type || 'MCQ',
      text: q.text,
      options: q.options || [],
      wordLimit: q.wordLimit || null,
      subject: q.subject || 'General',
      points: q.points || 10
      // NOTE: correctOptionId, correctOptionIds, sampleAnswer, explanation are stripped for BOLA defense
    }))
  };
}
