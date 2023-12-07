import React, { useEffect } from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Mesh, KeyboardEventTypes, SceneLoader } from "@babylonjs/core";
import SceneComponent from 'babylonjs-hook';
import "./App.css";

function App() {
  let sphere: Mesh;
  let camera: FreeCamera;

  const onSceneReady = (scene: Scene) => {
    camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    const canvas = scene.getEngine().getRenderingCanvas();
    
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.5 }, scene);
    sphere.position.y = 1;
    //camera.attachControl(canvas, true);

    SceneLoader.ImportMesh("", "scenes/Alien/", "Alien.gltf", scene, function (meshes) {          
      scene.createDefaultCameraOrLight(true, true, true);
      scene.createDefaultEnvironment();
      
    });

    MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    // Activer la prise en charge des événements clavier
    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          handleKeyDown(kbInfo.event.key);
          break;
      }
    });
  };

  const handleKeyDown = (key: string) => {
    const speed = 0.1;
    switch (key) {
      case "ArrowLeft":
        sphere.position.x -= speed;
        break;
      case "ArrowRight":
        sphere.position.x += speed;
        break;
      default:
        break;
    }
  };

  const onRender = (scene: Scene) => {
    if (sphere !== undefined) {
      const deltaTimeInMillis = scene.getEngine().getDeltaTime();
      const rpm = 10;
      sphere.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
    }
  };

  useEffect(() => {
    // Nettoyer les observateurs lors du démontage du composant
    return () => {
      if (sphere && camera) {
        sphere.dispose();
        camera.dispose();
      }
    };
  }, []);

  return (
    <SceneComponent
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
      id="my-canvas"
      width={window.innerWidth*0.8}
      height={window.innerHeight*0.91}
    />
  );
}

export default App;
