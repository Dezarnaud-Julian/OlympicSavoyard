import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Mesh, HavokPlugin, PhysicsAggregate, PhysicsShapeType, KeyboardEventTypes, PointerEventTypes, FollowCamera, Vector2, StandardMaterial, Color3, Space, Axis, Angle, DirectionalLight, ExecuteCodeAction, ActionManager, Tags, HDRCubeTexture, Sound, Color4, NodeMaterial, ShadowGenerator, ParticleHelper, TrailMesh, Quaternion, SceneLoader, CSG, Path3D } from "@babylonjs/core";
import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.
import HavokPhysics from "@babylonjs/havok";
import { Inspector } from '@babylonjs/inspector';
// import "babylonjs-loaders"
import '@babylonjs/loaders/OBJ/objFileLoader';
import "./App.css";
import { line2D } from "./line2d";

function App() {
  let player: Mesh
  let leftSki: Mesh
  let rightSki: Mesh
  const DEBUG = false;
  const keys = {
    left: {
      name: "ArrowLeft",
      pressed: false
    },
    right: {
      name: "ArrowRight",
      pressed: false
    }
  }
  let playerAggregate: PhysicsAggregate
  let nextDoor: { index: number, position: Vector3, mesh: Mesh; shouldGoLeft: boolean }
  let doors: { index: number, position: Vector3, mesh: Mesh; shouldGoLeft: boolean }[]

  const SLOPE_LENGTH = 10000;
  const SLOPE_WIDTH = 80;
  const GROUND_WIDTH = 1000;
  const SLOPE_ANGLE_RAD = Angle.FromDegrees(30).radians()
  let activatedDoorMat: StandardMaterial
  let failedDoorMat: StandardMaterial
  const onSceneReady = async (scene: Scene) => {

    activatedDoorMat = new StandardMaterial("activatedDoorMat");
    activatedDoorMat.diffuseColor = Color3.Green();

    failedDoorMat = new StandardMaterial("failedDoorMat");
    failedDoorMat.diffuseColor = Color3.Black();

    scene.environmentTexture = new HDRCubeTexture("https://assets.babylonjs.com/environments/Snow_Man_Scene/winter_lake_01_1k.hdr", scene, 128, false, true, false, true);
    scene.clearColor = new Color4(0.72, 0.82, 0.95, 1.0)
    const sound = new Sound("WinterSounds", "https://assets.babylonjs.com/sound/Snow_Man_Scene/winterWoods.mp3", scene, function () {
      sound.play(52);
    }, { loop: true, autoplay: true });

    if (DEBUG) Inspector.Show(scene, { embedMode: true, });

    // Physics init
    var gravityVector = new Vector3(0, -400, 0);
    var physicsPlugin = new HavokPlugin(true, await HavokPhysics());
    scene.enablePhysics(gravityVector, physicsPlugin);

    let camera: FreeCamera | FollowCamera;
    if (DEBUG) {
      // This creates and positions a free camera (non-mesh)
      camera = new FreeCamera("camera1", new Vector3(0, 50, -10), scene);
      camera.setTarget(Vector3.Zero());
    }
    else {
      camera = new FollowCamera("FollowCam", new Vector3(0, 10, -20), scene);
      camera.radius = 10;
      camera.heightOffset = 0;
      camera.rotationOffset = 0;
      camera.cameraAcceleration = 0.02;
      camera.maxCameraSpeed = 1000;
    }

    // This attaches the camera to the canvas
    if (DEBUG) camera.attachControl(true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const sunLight = new DirectionalLight("sun", new Vector3(1, -1, 1), scene);
    sunLight.diffuse = Color3.FromHexString("#FFF3C0")
    sunLight.position = new Vector3(0, 1000, 0)
    sunLight.intensity = 1;
    const ambiantLight = new HemisphericLight("ambiant", new Vector3(0, 1, 0), scene);
    ambiantLight.diffuse = Color3.FromHexString("#C5C5FF")
    ambiantLight.intensity = 0.6;

    // Our built-in 'box' shape.
    player = MeshBuilder.CreateBox("player", { size: 2 }, scene);
    player.isVisible = false
    const playerMat = new StandardMaterial("playerMat");
    playerMat.diffuseColor = Color3.Black();
    player.material = playerMat;
    if (!DEBUG) camera.lockedTarget = player;

    const playerMesh = MeshBuilder.CreateCapsule("player", { height: 3, radius: 0.8 }, scene);
    playerMesh.parent = player
    playerMesh.material = playerMat;

    leftSki = MeshBuilder.CreateBox("leftSki", { width: 0.5, height: 0.1, depth: 6 }, scene);
    leftSki.material = playerMat;
    leftSki.parent = player
    leftSki.position.x = -0.5
    leftSki.position.y = -1
    const leftSkiTrail = new TrailMesh("leftSkiTrail", leftSki, scene, 0.2, 60, true);

    rightSki = MeshBuilder.CreateBox("rightSki", { width: 0.5, height: 0.1, depth: 6 }, scene);
    rightSki.material = playerMat;
    rightSki.parent = player
    rightSki.position.x = 0.5
    rightSki.position.y = -1
    const rightSkiTrail = new TrailMesh("rightSkiTrail", rightSki, scene, 0.2, 60, true);

    const sourceMat = new StandardMaterial("sourceMat", scene);
    sourceMat.diffuseColor = Color3.Black();
    sourceMat.specularColor = Color3.Black();
    sourceMat.alpha = 0.1
    leftSkiTrail.material = sourceMat
    rightSkiTrail.material = sourceMat
    // Our built-in 'ground' shape.
    const ground = MeshBuilder.CreateGround("ground", { width: GROUND_WIDTH, height: SLOPE_LENGTH }, scene);
    ground.rotate(Axis.X, SLOPE_ANGLE_RAD, Space.LOCAL);
    const GROUND_SHIFT_POS = new Vector3(0, -1, -5)
    ground.position = new Vector3(0 + GROUND_SHIFT_POS.x, -Math.sin(SLOPE_ANGLE_RAD) * (SLOPE_LENGTH / 2) + GROUND_SHIFT_POS.y, Math.cos(SLOPE_ANGLE_RAD) * (SLOPE_LENGTH / 2) + GROUND_SHIFT_POS.z)
    // const groundMat = new StandardMaterial("groundMat");
    // groundMat.diffuseColor = Color3.White();
    // ground.material = groundMat;
    NodeMaterial.ParseFromSnippetAsync("S2X75W#2", scene).then(nodeMaterial => {
      ground.material = nodeMaterial;
    });

    var shadowGenerator = new ShadowGenerator(1024, sunLight);
    shadowGenerator.addShadowCaster(player);
    shadowGenerator.removeShadowCaster(leftSki);
    shadowGenerator.removeShadowCaster(rightSki);
    shadowGenerator.useBlurExponentialShadowMap = true;
    ground.receiveShadows = true;

    // Create a sphere shape and the associated body. Size will be determined automatically.
    playerAggregate = new PhysicsAggregate(player, PhysicsShapeType.BOX, { mass: 10, friction: 0, restitution: 1 }, scene);
    playerAggregate.body.setAngularDamping(100)
    playerAggregate.body.setLinearDamping(2)
    // ParticleHelper.CreateAsync("VK7R6H#2", scene, false);

    // Create a static box shape.
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, friction: 0, restitution: 1 }, scene);

    function randomNumberBetween(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }
    const MAX_DISTANCE_BETWEEN_DOORS = 1000
    const MIN_DISTANCE_BETWEEN_DOORS = 100;
    doors = []

    player.actionManager = new ActionManager(scene);
    let lastDoorPosition: Vector3 | null = null
    let i = 0;
    let needsGeneration = true;
    let path: Vector3[] = [];
    while (needsGeneration) {
      const shouldTurnLeft = i % 2 === 0
      let doorPosition = null;
      if (lastDoorPosition === null) {
        doorPosition = new Vector3(randomNumberBetween(-SLOPE_WIDTH / 2, SLOPE_WIDTH / 2), 0, -(SLOPE_LENGTH / 2) + 250);
      } else {
        const minX: number = shouldTurnLeft ? -SLOPE_WIDTH / 2 : lastDoorPosition.x
        const maxX: number = shouldTurnLeft ? lastDoorPosition.x : SLOPE_WIDTH / 2
        const posX: number = randomNumberBetween(minX, maxX)
        const posZ: number = Math.max(MIN_DISTANCE_BETWEEN_DOORS, Math.min(Math.abs(lastDoorPosition.x - posX) * 5.5, MAX_DISTANCE_BETWEEN_DOORS)) + lastDoorPosition.z
        doorPosition = new Vector3(posX, 0, posZ);
      }

      lastDoorPosition = doorPosition;
      if (lastDoorPosition.z > SLOPE_LENGTH / 2) needsGeneration = false;
      else {
        // const doorMesh = MeshBuilder.CreateBox("door", { size: 4 }, scene);
        const meshes = (await SceneLoader.ImportMeshAsync("", "./models/", "flag.glb", scene)).meshes;
        const doorMesh = meshes[0] as Mesh;
        doorMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(90, 0, 0);
        doorMesh.position = doorPosition;

        const doorMat = new StandardMaterial("doorMat");
        doorMat.diffuseColor = shouldTurnLeft ? Color3.Red() : Color3.Blue();
        // meshes[1].material = doorMat
        doorMesh.parent = ground;
        path.push(new Vector3(doorMesh.position.x + ((shouldTurnLeft ? -1 : 1) * 5), doorMesh.position.y + 0.1, doorMesh.position.z))
        doors.push({ index: i, position: doorPosition, mesh: doorMesh, shouldGoLeft: shouldTurnLeft })
      }

      // player.actionManager!.registerAction(
      //   new ExecuteCodeAction(
      //     {
      //       trigger: ActionManager.OnIntersectionEnterTrigger,
      //       parameter: doorMesh,
      //     },
      //     () => {
      //       // console.log(BOOST_FORCE)
      //       // BOOST_FORCE += 200
      //       // player.physicsBody?.applyImpulse(new Vector3(player.forward.x * BOOST_FORCE, player.forward.y * BOOST_FORCE, player.forward.z * BOOST_FORCE), // direction and magnitude of the applied force
      //       //   player.position // point in WORLD space where the force will be applied    
      //       // );
      //       // acumulatedSpeed += SPEED_BONUS;
      //       // const activatedDoorMat = new StandardMaterial("activatedDoorMat");
      //       // activatedDoorMat.diffuseColor = Color3.Green();
      //       // doorMesh.material = activatedDoorMat;
      //     }
      //   ),
      // );
      i += 1
    }
    nextDoor = doors[0];
    // draw line
    const line = line2D("line", { path: path, width: .5, closed: false, standardUV: true }, scene);
    const lineMaterial = new StandardMaterial("lineMat", scene);
    lineMaterial.diffuseColor = Color3.FromHexString("#0099FF");
    lineMaterial.alpha = 0.25
    line.material = lineMaterial;
    line.parent = ground;

    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.event.type) {
        case "keydown":
          if (kbInfo.event.key === keys.left.name) {
            keys.left.pressed = true
          }
          else if (kbInfo.event.key === keys.right.name) {
            keys.right.pressed = true
          }
          break;
        case "keyup":
          if (kbInfo.event.key === keys.left.name) {
            keys.left.pressed = false
          }
          else if (kbInfo.event.key === keys.right.name) {
            keys.right.pressed = false
          }
          break;
      }
    });

    startChronometer()

    // scene.onPointerObservable.add((pointerInfo) => {
    //   switch (pointerInfo.type) {
    //     case PointerEventTypes.POINTERDOWN:
    //       console.log("POINTER DOWN");
    //       break;
    //     case PointerEventTypes.POINTERUP:
    //       console.log("POINTER UP");
    //       break;
    //     case PointerEventTypes.POINTERMOVE:
    //       console.log("POINTER MOVE");
    //       break;
    //     case PointerEventTypes.POINTERWHEEL:
    //       console.log("POINTER WHEEL");
    //       break;
    //     case PointerEventTypes.POINTERPICK:
    //       console.log("POINTER PICK");
    //       break;
    //     case PointerEventTypes.POINTERTAP:
    //       console.log("POINTER TAP");
    //       break;
    //     case PointerEventTypes.POINTERDOUBLETAP:
    //       console.log("POINTER DOUBLE-TAP");
    //       break;
    //   }
    // })
  };

  let startDate: Date | null = null;
  const startChronometer = () => {
    startDate = new Date();
    console.log("START !")
  }
  const stopChronometer = () => {
    if (startDate != null) {
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      console.log("STOP ", diffTime / 1000)
      startDate = null;
    }

  }

  const SPEED_BONUS = 200;
  let BOOST_FORCE = 600;
  let acumulatedSpeed = 0;
  let STEER_FORCE = 3000;

  const onRender = (scene: Scene) => {
    // react to inputs
    if (keys.left.pressed) {
      playerAggregate.body.applyForce(
        new Vector3(-(STEER_FORCE * (1 + acumulatedSpeed / 20000) + playerAggregate.body.getLinearVelocity().length()), 0, 0), // direction and magnitude of the applied force
        player.position // point in WORLD space where the force will be applied    
      );
      // leftSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(-30).radians()).toEulerAngles();
      // rightSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(-30).radians()).toEulerAngles();
    }
    else if (keys.right.pressed) {
      playerAggregate.body.applyForce(
        new Vector3((STEER_FORCE * (1 + acumulatedSpeed / 20000) + playerAggregate.body.getLinearVelocity().length()), 0, 0), // direction and magnitude of the applied force
        player.position // point in WORLD space where the force will be applied    
      );
      // leftSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(30).radians()).toEulerAngles();
      // rightSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(30).radians()).toEulerAngles();
    }
    // else {
    //   leftSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(0).radians()).toEulerAngles();
    //   rightSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(0).radians()).toEulerAngles();
    // }
    leftSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(playerAggregate.body.getLinearVelocity()._x).radians()).toEulerAngles();
    rightSki.rotation = Quaternion.RotationAxis(player.up, Angle.FromDegrees(playerAggregate.body.getLinearVelocity()._x).radians()).toEulerAngles();

    player.physicsBody?.applyForce(new Vector3(player.forward.x * acumulatedSpeed / 5, player.forward.y * acumulatedSpeed / 5, player.forward.z * acumulatedSpeed / 5), // direction and magnitude of the applied force
      player.position // point in WORLD space where the force will be applied    
    );

    if (nextDoor != null) {
      if (player.getAbsolutePosition().z > nextDoor.mesh!.getAbsolutePosition().z) {
        if (!nextDoor.shouldGoLeft && player.getAbsolutePosition().x > nextDoor.mesh!.getAbsolutePosition().x || nextDoor.shouldGoLeft && player.getAbsolutePosition().x < nextDoor.mesh!.getAbsolutePosition().x) {
          player.physicsBody?.applyImpulse(new Vector3(player.forward.x * BOOST_FORCE, player.forward.y * BOOST_FORCE, player.forward.z * BOOST_FORCE), // direction and magnitude of the applied force
            player.position // point in WORLD space where the force will be applied    
          );
          acumulatedSpeed += SPEED_BONUS;
          nextDoor.mesh!.material = activatedDoorMat;
        } else nextDoor.mesh!.material = failedDoorMat;

        const newIndex = doors.indexOf(nextDoor) + 1
        if (newIndex < doors.length) {
          const newDoor = doors[doors.indexOf(nextDoor) + 1];
          nextDoor = newDoor;
        } else {
          stopChronometer();
        }
      }
    }

  };

  return (
    <SceneComponent adaptToDeviceRatio autoFocus antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" width={window.innerWidth - 300} height={window.innerHeight} />
  );
} export default App;  