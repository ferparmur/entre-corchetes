import { h } from "preact";
import { useState } from "preact/hooks";

type GameProps = {
  initialPrompt: string;
};

const Game = ({ initialPrompt }: GameProps) => {
  return <div>{initialPrompt}</div>;
};

export default Game;
