import { Angle, AssetsManager, Axis, Collider, Color3, Mesh, MeshBuilder, ParticleHelper, ParticleSystem, PhysicsAggregate, PhysicsShapeType, Quaternion, Scene, SolidParticleSystem, Space, StandardMaterial, TrailMesh, Vector3 } from "@babylonjs/core";
import particles from "../../particles/particleSystem.json"
import texture from "../../particles/snowball.png"
import { DEBUG_MODE } from "./SkiSlalomGame";
export class Player {
 

  rg: PhysicsAggregate;
  mesh: Mesh
  playerMesh: Mesh
  beanie: Mesh
  //scarf: Mesh
  leftSki: Mesh
  rightSki: Mesh
  private isLeaning: boolean = false;

  constructor(scene: Scene) {
    this.mesh = MeshBuilder.CreateBox("player", { size: 2 }, scene);
    this.mesh.isVisible = false
    const playerMat = new StandardMaterial("playerMat");
    playerMat.diffuseColor = Color3.Black();
    this.mesh.material = playerMat;

    this.playerMesh = MeshBuilder.CreateCapsule("player", { height: 3, radius: 0.8 }, scene);
    this.playerMesh.parent = this.mesh
    this.playerMesh.material = playerMat;

    const beanieMat = new StandardMaterial("beanieMat");
    beanieMat.diffuseColor = Color3.Red();
    this.beanie = MeshBuilder.CreateSphere("beanie", { diameter: 1.6 }, scene);
    this.beanie.parent = this.playerMesh
    this.beanie.position.y = 0.8

    this.beanie.material = beanieMat;


    /*
    const scarfMat = new StandardMaterial("scarfMat");
    scarfMat.diffuseColor = Color3.Red();
    this.scarf = MeshBuilder.CreateRibbon("scarf", { : 1.6 }, scene);
    this.scarf.parent = this.playerMesh
    this.scarf.position.y = 0.8
    this.scarf.material = beanieMat;
    */

    this.leftSki = MeshBuilder.CreateBox("leftSki", { width: 0.5, height: 0.1, depth: 6 }, scene);
    this.leftSki.material = playerMat;
    this.leftSki.parent = this.mesh
    this.leftSki.position.x = -0.5
    this.leftSki.position.y = -1
    const leftSkiTrail = new TrailMesh("leftSkiTrail", this.leftSki, scene, 0.2, 60, true);

    this.rightSki = MeshBuilder.CreateBox("rightSki", { width: 0.5, height: 0.1, depth: 6 }, scene);
    this.rightSki.material = playerMat;
    this.rightSki.parent = this.mesh
    this.rightSki.position.x = 0.5
    this.rightSki.position.y = -1
    const rightSkiTrail = new TrailMesh("rightSkiTrail", this.rightSki, scene, 0.2, 60, true);

    const skiTrailMat = new StandardMaterial("skiTrailMat", scene);
    skiTrailMat.diffuseColor = Color3.Black();
    skiTrailMat.specularColor = Color3.Black();
    skiTrailMat.alpha = 0.1
    leftSkiTrail.material = skiTrailMat
    rightSkiTrail.material = skiTrailMat

    // const particleSystem = ParticleHelper.CreateDefault(this.mesh);
    // const boxEmitter = particleSystem.createBoxEmitter(new Vector3(0, 0, 0), new Vector3(0, 0, -1), new Vector3(-1, -1, 0), new Vector3(1, 1, 0));
    // particleSystem.start();
    // particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
    // particleSystem.minSize = 0.1;
    // particleSystem.maxSize = 3;

    // particleSystem.minLifeTime = 0.1;
    // particleSystem.maxLifeTime = 2;
    // particleSystem.isBillboardBased = false;

    // particleSystem.minEmitPower = 10;
    // particleSystem.maxEmitPower = 10;
    // particleSystem.emitRate = 100;
    // particleSystem.maxScaleX = 1
    // particleSystem.maxScaleY = 1
    // particleSystem.maxInitialRotation = Math.PI;
    // particleSystem.minInitialRotation = Math.PI;

    if (DEBUG_MODE) {
      var sphereSmoke = MeshBuilder.CreateSphere("sphereSmoke", { diameter: 1.9, segments: 32 }, scene);
      sphereSmoke.position = new Vector3(0, 50, 0)
      const myParticleSystem = ParticleSystem.Parse(particles, scene, "", false, 1000);
      myParticleSystem.emitter = sphereSmoke;
    }
    else {
      const myParticleSystem = ParticleSystem.Parse(particles, scene, "", false, 1000);
      // set particle texture
      // myParticleSystem.particleTexture = texture;
      // set emitter
      myParticleSystem.emitter = this.mesh;
    }

    // const speedTrail = new TrailMesh("speedTrail", this.mesh, scene, 0.05, 10, true);
    // const speedTrailMat = new StandardMaterial("speedTrailMat", scene);
    // speedTrailMat.emissiveColor = Color3.White();
    // speedTrailMat.diffuseColor = Color3.White();
    // speedTrailMat.specularColor = Color3.White();
    // speedTrailMat.alpha = 0.5
    // speedTrail.material = speedTrailMat
    // speedTrail.position = new Vector3(1)


    // Create a sphere shape and the associated body. Size will be determined automatically.
    this.rg = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: 10, friction: 1000, restitution: 0 }, scene);
    this.rg.body.setAngularDamping(100)
    this.rg.body.setLinearDamping(2)
  }
  public startLeanAnimation(scene: Scene): void {
    if (!this.isLeaning) {
      this.isLeaning = true;
      this.playerMesh.rotate(Axis.X, Angle.FromDegrees(50).radians(), Space.WORLD)
    }
  }

  public stopLeanAnimation(scene: Scene): void {
    if (this.isLeaning) {
      this.isLeaning = false;
      this.playerMesh.rotate(Axis.X, -Angle.FromDegrees(50).radians(), Space.WORLD)
    }
  }
}