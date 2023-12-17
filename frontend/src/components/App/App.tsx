import SceneComponent from 'babylonjs-hook';
import "./App.css";
import { SkiSlalomGame } from '../../games/ski-slalom/SkiSlalomGame';
import { Game } from '../../games/Game';

function App() {
  const game: Game = new SkiSlalomGame();
  return (
    <SceneComponent adaptToDeviceRatio autoFocus antialias onSceneReady={game.onStart} onRender={game.onUpdate} id="game-canvas" width={window.innerWidth} height={window.innerHeight} />
  );
} export default App;  