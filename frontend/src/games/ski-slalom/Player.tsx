import { Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, StandardMaterial, TrailMesh, Vector3 } from "@babylonjs/core";

export class Player {

  rg: PhysicsAggregate;
  mesh: Mesh
  leftSki: Mesh
  rightSki: Mesh
  constructor(scene: Scene) {
    this.mesh = MeshBuilder.CreateBox("player", { size: 2 }, scene);
    this.mesh.isVisible = false
    const playerMat = new StandardMaterial("playerMat");
    playerMat.diffuseColor = Color3.Black();
    this.mesh.material = playerMat;

    const playerMesh = MeshBuilder.CreateCapsule("player", { height: 3, radius: 0.8 }, scene);
    playerMesh.parent = this.mesh
    playerMesh.material = playerMat;

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

    const sourceMat = new StandardMaterial("sourceMat", scene);
    sourceMat.diffuseColor = Color3.Black();
    sourceMat.specularColor = Color3.Black();
    sourceMat.alpha = 0.1
    leftSkiTrail.material = sourceMat
    rightSkiTrail.material = sourceMat

    // Create a sphere shape and the associated body. Size will be determined automatically.
    this.rg = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: 10, friction: 1000, restitution: 0 }, scene);
    this.rg.body.setAngularDamping(100)
    this.rg.body.setLinearDamping(2)
  }
}