import { h } from "preact";
import { useState } from "preact/hooks";
import removeAccents from "remove-accents";

import "./Game.css";

const regexChallengesWithSolutions = /\[([^\[]*?){(.*?)}]/gm;
const regexChallengesWithoutSolutions = /\[([^\[]*?)]/gm;
const regexSolutions = /{(.*?)}/gm;

type GameProps = {
  initialPrompt: string;
};

type Challenge = {
  clue: string;
  solution: string;
  solved: boolean;
  active: boolean;
};

function parseChallenges(prompt: string): Challenge[] {
  const solutions: Challenge[] = [];

  let parsedPrompt = prompt;
  while (parsedPrompt.match(regexChallengesWithSolutions)) {
    for (const match of parsedPrompt.matchAll(regexChallengesWithSolutions)) {
      solutions.push({
        clue: match[1],
        solution: match[2],
        solved: false,
        active: false,
      });
    }

    //Insert solutions back into the prompt
    parsedPrompt = parsedPrompt.replace(regexChallengesWithSolutions, "$2");
  }

  return solutions;
}

function stripSolutions(prompt: string): string {
  return prompt.replace(regexSolutions, "");
}

function refreshActiveChallenges(
  challenges: Challenge[],
  prompt: string,
): Challenge[] {
  const activeChallenges: string[] = [];
  for (const match of prompt.matchAll(regexChallengesWithoutSolutions)) {
    activeChallenges.push(match[1]);
  }

  return challenges.map((challenge) => {
    challenge.active = activeChallenges.includes(challenge.clue);
    return challenge;
  });
}

function highlightChallenges(prompt: string): string {
  return prompt.replace(
    regexChallengesWithoutSolutions,
    "<span class='highlight-active-challenge'>$&</span>",
  );
}

function stdString(string: string): string {
  return removeAccents(string.toLowerCase());
}

const Game = ({ initialPrompt }: GameProps) => {
  const initialPromptWithoutSolutions = stripSolutions(initialPrompt);
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    initialPromptWithoutSolutions,
  );
  const [currentHighlightedPrompt, setCurrentHighlightedPrompt] =
    useState<string>(highlightChallenges(initialPromptWithoutSolutions));
  const [challenges, setChallenges] = useState<Challenge[]>(
    refreshActiveChallenges(
      parseChallenges(initialPrompt),
      initialPromptWithoutSolutions,
    ),
  );
  const [input, setInput] = useState<string>("");

  const handleInput = (input: string) => {
    setInput(input);

    const activeSolutions = challenges
      .filter((challenge) => challenge.active)
      .map((challenge) => stdString(challenge.solution));
    if (activeSolutions.includes(stdString(input))) {
      const solvedChallenge = challenges.filter(
        (challenge) => stdString(challenge.solution) === stdString(input),
      )[0];
      const challengesWithSolved = challenges.map((challenge) => {
        if (stdString(challenge.solution) === stdString(input)) {
          challenge.solved = true;
          challenge.active = false;
        }
        return challenge;
      });

      const newPrompt = currentPrompt.replace(
        `[${solvedChallenge.clue}]`,
        solvedChallenge.solution,
      );
      const newHighlightedPrompt = highlightChallenges(
        currentPrompt
          .replace(/<mark>(.*?)<\/mark>/gm, "$1")
          .replace(
            `[${solvedChallenge.clue}]`,
            `<mark>${solvedChallenge.solution}</mark>`,
          ),
      );
      setCurrentPrompt(newPrompt);
      setCurrentHighlightedPrompt(newHighlightedPrompt);
      setChallenges(refreshActiveChallenges(challengesWithSolved, newPrompt));

      setInput("");
    }
  };

  return (
    <>
      <div
        class="prompt-area"
        dangerouslySetInnerHTML={{ __html: currentHighlightedPrompt }}
      />
      <div class="input-area">
        <input
          class="input"
          type="text"
          onInput={(e) => handleInput((e.target as HTMLInputElement).value ?? "")}
          placeholder="escribe tu respuesta..."
          value={input}
        />
      </div>
    </>
  );
};

export default Game;
