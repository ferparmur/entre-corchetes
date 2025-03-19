import removeAccents from "remove-accents";
import type { GameState, SolutionKey } from "./types";

const regexChallengesWithSolutions = /\[([^\[]*?){(.*?)}]/gm;
export const regexChallengesWithoutSolutions =
  /\[([^\[]*?)(?: \(([A-Z])(?: _)+\))?]/gm;
const regexSolutionMark = /<mark>(.*?)<\/mark>/m;
const regexSolutions = /{(.*?)}/gm;

export const HIGHLIGHT_CLASSNAME = "highlight-active-challenge";

export function extractSolutionKeys(puzzle: string): SolutionKey[] {
  const solutions: SolutionKey[] = [];

  let parsedPrompt = puzzle;
  let solutionLevel = 0;
  while (parsedPrompt.match(regexChallengesWithSolutions)) {
    for (const match of parsedPrompt.matchAll(regexChallengesWithSolutions)) {
      solutions.push({
        clue: match[1],
        solution: match[2],
        solved: false,
        active: solutionLevel === 0,
        peeked: false,
        revealed: false,
      });
    }

    //Insert solutions back into the prompt
    parsedPrompt = parsedPrompt.replace(regexChallengesWithSolutions, "$2");

    solutionLevel++;
  }

  return solutions.sort((a, b) =>
    stdString(a.clue).localeCompare(stdString(b.clue)),
  );
}

export function updateSolutionKeys(
  puzzle: string,
  solutionKeys: SolutionKey[],
): SolutionKey[] {
  const activeClues: string[] = [];
  for (const match of puzzle.matchAll(regexChallengesWithoutSolutions)) {
    activeClues.push(match[1]);
  }

  return solutionKeys.map((solutionKey) => {
    solutionKey.active = activeClues.includes(solutionKey.clue);
    return solutionKey;
  });
}

export function stripSolutions(puzzle: string): string {
  return puzzle.replace(regexSolutions, "");
}

export function highlightClues(puzzle: string): string {
  return puzzle.replace(
    regexChallengesWithoutSolutions,
    `<span class='${HIGHLIGHT_CLASSNAME}'>$&</span>`,
  );
}

export function insertClueFirstLetterInPuzzle(
  clue: string,
  firstLetter: string,
  puzzle: string,
): string {
  return puzzle.replace(clue, `${clue} (${firstLetter.toUpperCase()})`);
}

export function removeSolutionMarks(puzzle: string): string {
  return puzzle.replace(regexSolutionMark, "$1");
}

export function stdString(string: string): string {
  return removeAccents(string.toLowerCase());
}

export function stdDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isValidGameState(obj: any): obj is GameState {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.gameComplete === "boolean" &&
    typeof obj.displayedPuzzle === "string" &&
    Array.isArray(obj.solutionKeys) &&
    obj.solutionKeys.every((sol: unknown) => isValidSolutionKey(sol)) &&
    typeof obj.input === "string"
  );
}

export function isValidSolutionKey(obj: any): obj is SolutionKey {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.clue === "string" &&
    typeof obj.solution === "string" &&
    typeof obj.solved === "boolean" &&
    typeof obj.active === "boolean"
  );
}
