import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Mesh, HavokPlugin, PhysicsAggregate, PhysicsShapeType, FollowCamera, StandardMaterial, Color3, Space, Axis, Angle, DirectionalLight, ActionManager, HDRCubeTexture, Sound, Color4, NodeMaterial, ShadowGenerator, Quaternion, Texture } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { Inspector } from '@babylonjs/inspector';
import { line2D } from "../../utils/line2d";
import { Game } from "../Game";
import { Player } from "./Player";
import { Door } from "./Door";
import { Chronometer } from "../../utils/Chronometer";
import { Controls } from "../../core/Controls";
import snowTexture from "../../textures/snow.jpg"
import snowTextureN from "../../textures/NormalMap.png"
export const DEBUG_MODE = false;
export class SkiSlalomGame implements Game {

  gameReady = false

  player: Player | null = null
  nextDoor: Door | null = null
  doors: Door[] = []

  SLOPE_LENGTH = 10000;
  SLOPE_ANGLE_RAD = Angle.FromDegrees(30).radians()
  SLOPE_WIDTH = 80;
  GROUND_WIDTH = 1000;
  MAX_DISTANCE_BETWEEN_DOORS = 200;
  MIN_DISTANCE_BETWEEN_DOORS = 100;
  chrono: Chronometer;
  controls: Controls;
  constructor() {
    this.chrono = new Chronometer()
    this.controls = new Controls();
  }

  onStart = async (scene: Scene) => {

    // Create default camera to avoid warning
    let camera: FreeCamera | FollowCamera = new FreeCamera("default", new Vector3(0, 0, 0), scene);

    // PHYSICS
    const physicsPlugin = new HavokPlugin(true, await HavokPhysics());
    const gravityVector = new Vector3(0, -400, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    if (DEBUG_MODE) Inspector.Show(scene, { embedMode: true, });

    // SCENE ENVIRONMENT
    const sunLight = new DirectionalLight("sun", new Vector3(1, -1, 1), scene);
    sunLight.diffuse = Color3.FromHexString("#FFF3C0")
    sunLight.position = new Vector3(0, 1000, 0)
    sunLight.intensity = 3;
    const ambiantLight = new HemisphericLight("ambiant", new Vector3(0, 1, 0), scene);
    ambiantLight.diffuse = Color3.FromHexString("#C5C5FF")
    ambiantLight.intensity = 3;
    scene.environmentTexture = new HDRCubeTexture("https://assets.babylonjs.com/environments/Snow_Man_Scene/winter_lake_01_1k.hdr", scene, 128, false, true, false, true);
    scene.clearColor = new Color4(0.72, 0.85, 0.98, 1.0)
    // const sound = new Sound("WinterSounds", "https://assets.babylonjs.com/sound/Snow_Man_Scene/winterWoods.mp3", scene, function () {
    //   sound.play(52);
    // }, { loop: true, autoplay: true });

    this.player = new Player(scene);

    // CAMERA
    camera.dispose()
    if (DEBUG_MODE) {
      // creates and positions a free camera (non-mesh)
      camera = new FreeCamera("camera1", new Vector3(0, 50, -10), scene);
      camera.setTarget(Vector3.Zero());
      // attaches the camera to the canvas
      camera.attachControl(true);
    }
    else {
      camera = new FollowCamera("FollowCam", new Vector3(0, 10, -20), scene);
      camera.radius = 1;
      camera.heightOffset = 0;
      camera.rotationOffset = 0;
      camera.cameraAcceleration = 0.02;
      camera.maxCameraSpeed = 1000;
      camera.lockedTarget = this.player.mesh;
    }

    // Ground
    const ground = MeshBuilder.CreateGround("ground", { width: this.GROUND_WIDTH, height: this.SLOPE_LENGTH }, scene);
    ground.rotate(Axis.X, this.SLOPE_ANGLE_RAD, Space.LOCAL);
    const GROUND_SHIFT_POS = new Vector3(0, -1, -5)
    ground.position = new Vector3(0 + GROUND_SHIFT_POS.x, -Math.sin(this.SLOPE_ANGLE_RAD) * (this.SLOPE_LENGTH / 2) + GROUND_SHIFT_POS.y, Math.cos(this.SLOPE_ANGLE_RAD) * (this.SLOPE_LENGTH / 2) + GROUND_SHIFT_POS.z)
    // const groundMat = new StandardMaterial("groundMat");
    // groundMat.diffuseColor = Color3.White();
    // ground.material = groundMat;
    const groundmat = new StandardMaterial("groundMat");
    const texture = new Texture(snowTexture, scene);
    const tilling = 6
    texture.uScale = tilling * 1.0;
    texture.vScale = tilling * 6.0;
    groundmat.diffuseTexture = texture;
    const detailMapTexture = new Texture(snowTextureN, scene);
    detailMapTexture.uScale = tilling * 1.0;
    detailMapTexture.vScale = tilling * 6.0;
    groundmat.detailMap.texture = detailMapTexture
    groundmat.detailMap.isEnabled = true;
    ground.material = groundmat;

    // NodeMaterial.ParseFromSnippetAsync("S2X75W#2", scene).then(nodeMaterial => {
    //   ground.material = nodeMaterial;
    // });

    // RENDERING
    var shadowGenerator = new ShadowGenerator(1024, sunLight);
    shadowGenerator.addShadowCaster(this.player.mesh);
    shadowGenerator.removeShadowCaster(this.player.leftSki);
    shadowGenerator.removeShadowCaster(this.player.rightSki);
    shadowGenerator.useBlurExponentialShadowMap = true;
    ground.receiveShadows = true;

    // Create a static box shape.
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, friction: 0, restitution: 1 }, scene);

    function randomNumberBetween(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }

    let lastDoorPosition: Vector3 | null = null
    let path: Vector3[] = [];
    let index = 0;
    const SIN_BASED_GENERATION = true;
    let lastTurnWasLeft = false;
    if (SIN_BASED_GENERATION) {
      let turnLeft = false
      const MIN_SPEED = 0.01;
      const MAX_SPEED = 0.02;
      const SPEED_DELTA = MAX_SPEED - MIN_SPEED
      const INITIAL_SINE_SPEED = MIN_SPEED // 0.01 really slow, 0.02 really quick
      let SINE_AMPLITUDE = (this.SLOPE_WIDTH / 2)
      let currentSpeed = INITIAL_SINE_SPEED
      let currentAmplitude = SINE_AMPLITUDE
      let drap = 0
      let progress = 0;
      const CURVE_RESOLUTION = 1;
      for (let t = 400; t <= this.SLOPE_LENGTH; t += CURVE_RESOLUTION) {
        progress = (t / this.SLOPE_LENGTH)
        // currentSpeed = INITIAL_SINE_SPEED + progress * SPEED_DELTA; // speed of the curve increase
        let shiftF = (x: number) => { return 10 * Math.cos(x * (currentSpeed + 0.04)) }
        let curveF = (x: number) => { return shiftF(x) + Math.sin(x * currentSpeed) * currentAmplitude };
        const pos = new Vector3(curveF(t), 0.1, t - (this.SLOPE_LENGTH / 2))
        const posB = new Vector3(curveF(t + 1), 0.1, (t + 1) - (this.SLOPE_LENGTH / 2))
        let tangente = (posB.x - pos.x) / (posB.z - pos.z)
        path.push(pos)
        const shouldSpawn = Math.abs(tangente) < 0.1 // lastDoorPosition == null || pos.z >= lastDoorPosition.z + SINE_PERIOD
        turnLeft = tangente > 0
        if (shouldSpawn && turnLeft !== lastTurnWasLeft) {
          const doorPosition = new Vector3(pos.x + ((turnLeft ? 1 : -1) * 5), pos.y, pos.z);
          const door = new Door(scene, index, doorPosition, turnLeft)
          await door.init(scene);
          door.mesh!.parent = ground;
          this.doors.push(door)
          lastDoorPosition = doorPosition
          lastTurnWasLeft = turnLeft;
          drap++;
        }
      }
      console.log("doors = " + this.doors.length)
    }
    else {
      let needsGeneration = true;
      while (needsGeneration) {
        const shouldTurnLeft = index % 2 === 0
        let doorPosition = null;
        if (lastDoorPosition === null) {
          // doorPosition = new Vector3(randomNumberBetween(-this.SLOPE_WIDTH / 2, this.SLOPE_WIDTH / 2), 0, -(this.SLOPE_LENGTH / 2) + 250);
          doorPosition = new Vector3(Math.sin(index), 0, -(this.SLOPE_LENGTH / 2) + 250);
        } else {
          const minX: number = shouldTurnLeft ? -this.SLOPE_WIDTH / 2 : lastDoorPosition.x
          const maxX: number = shouldTurnLeft ? lastDoorPosition.x : this.SLOPE_WIDTH / 2
          const posX: number = randomNumberBetween(minX, maxX)
          const posZ: number = Math.max(this.MIN_DISTANCE_BETWEEN_DOORS, Math.min(Math.abs(lastDoorPosition.x - posX) * 5.5, this.MAX_DISTANCE_BETWEEN_DOORS)) + lastDoorPosition.z
          doorPosition = new Vector3(posX, 0, posZ);
        }

        lastDoorPosition = doorPosition;
        if (lastDoorPosition.z > this.SLOPE_LENGTH / 2) needsGeneration = false;
        else {
          const door = new Door(scene, index, doorPosition, shouldTurnLeft)
          await door.init(scene);
          door.mesh!.parent = ground;
          path.push(new Vector3(door.mesh!.position.x + ((shouldTurnLeft ? -1 : 1) * 5), 0.1, door.mesh!.position.z))
          this.doors.push(door)
        }
        index += 1
      }
    }


    if (this.doors.length > 0) this.nextDoor = this.doors[0];

    // draw line
    const line = line2D("line", { path: path, width: .5, closed: false, standardUV: true }, scene);
    const lineMaterial = new StandardMaterial("lineMat", scene);
    lineMaterial.diffuseColor = Color3.FromHexString("#0011FF");
    lineMaterial.alpha = 0.3
    line.material = lineMaterial;
    line.parent = ground;

    this.chrono.start();

    this.gameReady = true;
  };

  SPEED_BONUS = 500;
  BOOST_FORCE = 600;
  STEER_FORCE = 3000;
  acumulatedSpeed = 100;
  onUpdate = (scene: Scene) => {
    if (!this.gameReady || !this.player) return;

    // react to inputs
    if (this.controls.isLeft) {
      this.player.rg.body.applyForce(
        new Vector3(-(this.STEER_FORCE * (1 + this.acumulatedSpeed / 20000) + this.player.rg.body.getLinearVelocity().length()), 0, 0), // direction and magnitude of the applied force
        this.player.mesh.position // point in WORLD space where the force will be applied
      );
    }
    else if (this.controls.isRight) {
      this.player.rg.body.applyForce(
        new Vector3((this.STEER_FORCE * (1 + this.acumulatedSpeed / 20000) + this.player.rg.body.getLinearVelocity().length()), 0, 0), // direction and magnitude of the applied force
        this.player.mesh.position // point in WORLD space where the force will be applied
      );
    }

    this.player.leftSki.rotation = Quaternion.RotationAxis(this.player.mesh.up, Angle.FromDegrees(this.player.rg.body.getLinearVelocity()._x).radians()).toEulerAngles();
    this.player.rightSki.rotation = Quaternion.RotationAxis(this.player.mesh.up, Angle.FromDegrees(this.player.rg.body.getLinearVelocity()._x).radians()).toEulerAngles();

    this.player.rg.body.applyForce(new Vector3(0, -this.acumulatedSpeed, 0), // direction and magnitude of the applied force
      this.player.mesh.position // point in WORLD space where the force will be applied
    );

    // this.acumulatedSpeed += scene.deltaTime * 0.1;

    if (this.nextDoor != null && this.nextDoor.mesh != null) {

      // If player goes further than next door
      if (this.player.mesh.getAbsolutePosition().z >= this.nextDoor.mesh.getAbsolutePosition().z) {
        if (!this.nextDoor.shouldGoLeft && this.player.mesh.getAbsolutePosition().x > this.nextDoor.mesh.getAbsolutePosition().x || this.nextDoor.shouldGoLeft && this.player.mesh.getAbsolutePosition().x < this.nextDoor.mesh.getAbsolutePosition().x) {
          // this.player.rg.body?.applyImpulse(new Vector3(this.player.mesh.forward.x * this.BOOST_FORCE, this.player.mesh.forward.y * this.BOOST_FORCE, this.player.mesh.forward.z * this.BOOST_FORCE), // direction and magnitude of the applied force
          //   this.player.mesh.position // point in WORLD space where the force will be applied
          // );
          this.nextDoor.setActivated();
        } else this.nextDoor.setFailed();

        const newIndex = this.doors.indexOf(this.nextDoor) + 1
        if (newIndex < this.doors.length) {
          const newDoor = this.doors[this.doors.indexOf(this.nextDoor) + 1];
          this.nextDoor = newDoor;
        } else {
          this.nextDoor = null;
          this.chrono.stop();
        }
      }
    }

  };
}