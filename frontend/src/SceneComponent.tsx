import { useEffect, useRef } from "react";
import { Engine, Scene } from "@babylonjs/core";
type SceneComponentProps = {antialias: boolean, engineOptions?:any, adaptToDeviceRatio?:boolean, sceneOptions?:any, onRender:(scene: Scene) => void, onSceneReady: (scene: Scene) => void, id: string};

export default function SceneComponent ({ antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, id}:SceneComponentProps) {
  const reactCanvas = useRef(null);

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
    const scene = new Scene(engine, sceneOptions);
    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

  return <canvas ref={reactCanvas} id={id} />;
};