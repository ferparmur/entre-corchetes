import removeAccents from "remove-accents";
import type { GameState, SolutionKey } from "./types";
import exp from "node:constants";

const regexChallengesWithSolutions = /\[([^\[]*?){(.*?)}]/gm;
const regexChallengesWithoutSolutions = /\[([^\[]*?)]/gm;
const regexSolutionMark = /<mark>(.*?)<\/mark>/m;
const regexSolutions = /{(.*?)}/gm;

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

export function stripSolutions(prompt: string): string {
  return prompt.replace(regexSolutions, "");
}

export function highlightClues(prompt: string): string {
  return prompt.replace(
    regexChallengesWithoutSolutions,
    "<span class='highlight-active-challenge'>$&</span>",
  );
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
