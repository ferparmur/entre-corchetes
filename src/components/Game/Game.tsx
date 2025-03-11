import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import "./Game.css";
import {
  extractSolutionKeys,
  highlightClues,
  isValidGameState,
  removeSolutionMarks,
  stdDate,
  stdString,
  stripSolutions,
  updateSolutionKeys,
} from "./gameUtils.ts";
import type { GameState, Puzzle } from "./types";

type GameProps = {
  puzzle: Puzzle;
};

const Game = ({ puzzle }: GameProps) => {
  const STORAGE_KEY = stdDate(puzzle.puzzleDate);

  const inputRef = useRef<HTMLInputElement>(null);
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);

  // Hydrate state from localStorage only on the client
  useEffect(() => {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState && isValidGameState(JSON.parse(storedState))) {
      setGameState(JSON.parse(storedState));
    } else {
      setGameState({
        displayedPuzzle: stripSolutions(puzzle.puzzleCode),
        gameComplete: false,
        input: "",
        solutionKeys: extractSolutionKeys(puzzle.puzzleCode),
      });
    }
  }, []);

  // Autofocus on input
  useEffect(() => {
    if (typeof gameState !== "undefined" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Persist state to localStorage
  useEffect(() => {
    if (typeof gameState !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  const handleInput = (input: string) => {
    if (!isValidGameState(gameState)) return;

    const solvedSolution = gameState.solutionKeys.find((solutionKey) => {
      return (
        solutionKey.active &&
        stdString(solutionKey.solution) === stdString(input)
      );
    });
    if (solvedSolution) {
      const newPuzzle = removeSolutionMarks(gameState.displayedPuzzle).replace(
        `[${solvedSolution.clue}]`,
        `<mark>${solvedSolution.solution}</mark>`,
      );
      setGameState({
        ...gameState,
        displayedPuzzle: newPuzzle,
        solutionKeys: updateSolutionKeys(
          removeSolutionMarks(newPuzzle),
          gameState.solutionKeys.map((solutionKey) => {
            if (stdString(solutionKey.solution) === stdString(input)) {
              solutionKey.active = false;
              solutionKey.solved = true;
            }
            return solutionKey;
          }),
        ),
        input: "",
      });
    } else {
      setGameState({ ...gameState, input });
    }
  };

  return (
    <>
      <div
        class="prompt-area"
        dangerouslySetInnerHTML={{
          __html: highlightClues(
            isValidGameState(gameState)
              ? gameState.displayedPuzzle
              : stripSolutions(puzzle.puzzleCode),
          ),
        }}
      />
      <div class="input-area">
        <input
          ref={inputRef}
          class="input"
          type="text"
          onInput={(e) =>
            handleInput((e.target as HTMLInputElement).value ?? "")
          }
          placeholder="escribe tu respuesta..."
          value={gameState ? gameState.input : ""}
          disabled={typeof gameState === "undefined"}
        />
      </div>
    </>
  );
};

export default Game;
