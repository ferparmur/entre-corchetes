export type Puzzle = {
  puzzleCode: string;
  puzzleDate: Date;
  solutionDate: Date;
  solutionUrl: string;
};

export type SolutionKey = {
  clue: string;
  solution: string;
  solved: boolean;
  active: boolean;
  peeked: boolean;
  revealed: boolean;
};

export type GameState = {
  gameComplete: boolean;
  displayedPuzzle: string;
  solutionKeys: SolutionKey[];
  lastSolution?: string;
  input: string;
  displayedSolutions: {
    clue: string;
    solution: string;
  }[];
};
