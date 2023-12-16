import { Scene } from "@babylonjs/core";

export interface Game {
  onStart: (scene: Scene) => void;
  onUpdate: (scene: Scene) => void;
}