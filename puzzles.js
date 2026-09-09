/**
 * CURLING PUZZLES — CONNECTIONS DATA CONTRACT
 * Curriculum levels:
 * 1: Accessible Foundations (Stone, Sheet, Rink Markings, Basic Rules)
 * 2: Developing Knowledge (Delivery, Sweeping Calls, Tactics)
 * 3: Strategy & Canadian Curling Heritage (Tournaments, Icons, Rink Jargon)
 * 4: Expert Curling Knowledge, Puns & Wordplay
 */

const CURLING_CONNECTIONS_PUZZLES = [
  {
    id: "curling-conn-000",
    sequence: 0,
    releaseDate: "2026-09-08",
    title: "Curling Connections #1",
    difficulty: "Beginner",
    curriculumCategory: "Curling Basics & Equipment",
    groups: [
      {
        category: "PARTS OF A CURLING STONE",
        level: 1,
        items: ["HANDLE", "GRANITE", "STRIKING BAND", "RUNNING SURFACE"]
      },
      {
        category: "RINK & SHEET MARKINGS",
        level: 2,
        items: ["BUTTON", "HOG LINE", "TEE LINE", "BACK LINE"]
      },
      {
        category: "FOUR-PLAYER TEAM ROLES",
        level: 3,
        items: ["LEAD", "SECOND", "THIRD", "SKIP"]
      },
      {
        category: "WORDS THAT CAN FOLLOW 'CURLING'",
        level: 4,
        items: ["CLUB", "BROOM", "SHEET", "IRON"]
      }
    ]
  },
  {
    id: "curling-conn-001",
    sequence: 1,
    releaseDate: "2026-09-09",
    title: "Curling Connections #2",
    difficulty: "Easy",
    curriculumCategory: "Delivery & Sweeping",
    groups: [
      {
        category: "TYPES OF CURLING SHOTS",
        level: 1,
        items: ["DRAW", "TAKEOUT", "GUARD", "FREEZE"]
      },
      {
        category: "SWEEPING COMMANDS",
        level: 2,
        items: ["HURRY", "HARD", "WHOA", "CLEAN"]
      },
      {
        category: "NOTABLE CANADIAN CURLERS",
        level: 3,
        items: ["GUSHUE", "HOWARD", "MARTIN", "JONES"]
      },
      {
        category: "THINGS WITH HANDLES",
        level: 4,
        items: ["STONE", "BROOM", "MUG", "BRIEFCASE"]
      }
    ]
  },
  {
    id: "curling-conn-002",
    sequence: 2,
    releaseDate: "2026-09-10",
    title: "Curling Connections #3",
    difficulty: "Medium",
    curriculumCategory: "Ice Conditions & Tactics",
    groups: [
      {
        category: "ICE SURFACE CHARACTERISTICS",
        level: 1,
        items: ["PEBBLE", "FROST", "RUN", "FALL"]
      },
      {
        category: "TACTICAL GAME SITUATIONS",
        level: 2,
        items: ["HAMMER", "BLANK END", "STEAL", "SKINS"]
      },
      {
        category: "CANADIAN CURLING CHAMPIONSHIPS",
        level: 3,
        items: ["BRIER", "SCOTTIES", "POINTS", "MASTERS"]
      },
      {
        category: "WORDS WITH DOUBLE LETTERS IN CURLING",
        level: 4,
        items: ["SWEEP", "SHEET", "FREEZE", "BROOM"]
      }
    ]
  },
  {
    id: "curling-conn-003",
    sequence: 3,
    releaseDate: "2026-09-11",
    title: "Curling Connections #4",
    difficulty: "Medium",
    curriculumCategory: "Delivery Gear & Metrics",
    groups: [
      {
        category: "STONE ROTATION TERMS",
        level: 1,
        items: ["IN-TURN", "OUT-TURN", "CURL", "SPIN"]
      },
      {
        category: "DELIVERY & FOOTWEAR ACCESSORIES",
        level: 2,
        items: ["SLIDER", "GRIPPER", "HACK", "CRUTCH"]
      },
      {
        category: "COLOURS IN A CURLING HOUSE",
        level: 3,
        items: ["BLUE", "RED", "WHITE", "YELLOW"]
      },
      {
        category: "THINGS MEASURED IN SECONDS IN CURLING",
        level: 4,
        items: ["INTERVAL", "HOG-TO-HOG", "SPLIT", "THINKING"]
      }
    ]
  },
  {
    id: "curling-conn-004",
    sequence: 4,
    releaseDate: "2026-09-12",
    title: "Curling Connections #5",
    difficulty: "Hard",
    curriculumCategory: "Rink Slang & Precision Shots",
    groups: [
      {
        category: "WEIGHT / SPEED DESCRIPTORS",
        level: 1,
        items: ["BUMPER", "CONTROL", "HACK WEIGHT", "BOARD WEIGHT"]
      },
      {
        category: "DEFENSIVE / ANGLED SHOTS",
        level: 2,
        items: ["PEEL", "TICK", "CHIP", "WICK"]
      },
      {
        category: "FAMOUS CANADIAN CURLING CITIES",
        level: 3,
        items: ["CALGARY", "WINNIPEG", "HALIFAX", "REGINA"]
      },
      {
        category: "RHYMING CURLING ACTIONS",
        level: 4,
        items: ["TAP", "WRAP", "SCRAP", "TRAP"]
      }
    ]
  },
  {
    id: "curling-conn-005",
    sequence: 5,
    releaseDate: "2026-09-13",
    title: "Curling Connections #6",
    difficulty: "Expert",
    curriculumCategory: "Advanced Strategy & Lore",
    groups: [
      {
        category: "END GAME SCENARIOS",
        level: 1,
        items: ["CONCESSION", "EXTRA END", "COUNT", "MEASURE"]
      },
      {
        category: "BRUSH & BROOM HEAD MATERIALS",
        level: 2,
        items: ["HORSEHAIR", "SYNTHETIC", "CORN", "FOAM"]
      },
      {
        category: "FREE GUARD ZONE CONCEPTS",
        level: 3,
        items: ["FIVE-ROCK", "CENTRE-LINE", "CORNER", "PROTECTED"]
      },
      {
        category: "THINGS THAT CAN 'CURL'",
        level: 4,
        items: ["ROCK", "RIBBON", "WAVE", "LIP"]
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.CURLING_CONNECTIONS_PUZZLES = CURLING_CONNECTIONS_PUZZLES;
}