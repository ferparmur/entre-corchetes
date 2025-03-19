import { useEffect, useRef, useState } from "preact/hooks";

import "./Game.css";
import {
  extractSolutionKeys,
  HIGHLIGHT_CLASSNAME,
  highlightClues,
  insertClueFirstLetterInPuzzle,
  isValidGameState,
  regexChallengesWithoutSolutions,
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
        displayedSolutions: [],
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
      const regex = new RegExp(
        `\\[${solvedSolution.clue}(?: \\([A-Z](?: _)*\\))?\\]`,
      );
      console.log(regex);
      const newPuzzle = removeSolutionMarks(gameState.displayedPuzzle).replace(
        regex,
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
        displayedSolutions: [
          {
            clue: solvedSolution.clue,
            solution: solvedSolution.solution,
          },
          ...gameState.displayedSolutions,
        ],
        input: "",
      });
    } else {
      setGameState({ ...gameState, input });
    }
  };

  return (
    <>
      <div
        class="puzzle-area"
        dangerouslySetInnerHTML={{
          __html: highlightClues(
            isValidGameState(gameState)
              ? gameState.displayedPuzzle
              : stripSolutions(puzzle.puzzleCode),
          ),
        }}
        onClick={(e) => {
          if (
            !(
              e.target instanceof HTMLElement &&
              e.target.className === HIGHLIGHT_CLASSNAME &&
              gameState?.solutionKeys
            )
          ) {
            return;
          }

          const clickedClue = (e.target as HTMLElement)?.innerText.replace(
            regexChallengesWithoutSolutions,
            "$1",
          );

          gameState?.solutionKeys.map((solutionKey) => {
            if (solutionKey.clue !== clickedClue || !solutionKey.active) {
              return solutionKey;
            }

            if (!solutionKey.peeked && confirm("¿Revelar la primera letra?")) {
              solutionKey.peeked = true;
              setGameState({
                ...gameState,
                displayedPuzzle: insertClueFirstLetterInPuzzle(
                  solutionKey.clue,
                  solutionKey.solution[0],
                  gameState.displayedPuzzle,
                ),
              });
              console.log(solutionKey);
            }

            if (!solutionKey) return solutionKey;
          });
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

      <div class="displayed-solutions-area">
        {gameState?.displayedSolutions &&
          gameState?.displayedSolutions.length > 0 && (
            <ul>
              {gameState?.displayedSolutions.map((displayedSolution) => (
                <li>
                  {displayedSolution.clue}:{" "}
                  <strong>{displayedSolution.solution}</strong>
                </li>
              ))}
            </ul>
          )}
      </div>
    </>
  );
};

export default Game;
