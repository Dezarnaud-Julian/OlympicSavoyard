import { Angle, Axis, Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Quaternion, Scene, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import '@babylonjs/loaders/OBJ/objFileLoader';
import { Player } from "./Player";

export class Ramp {
  index: number;
  localPosition: Vector3;
  mesh: Mesh | null = null;


  constructor(scene: Scene, index: number, position: Vector3) {
    this.localPosition = position;
    this.index = index;

  }

  async init(scene: Scene) {
    // Créer un matériau pour la rampe
    const material = new StandardMaterial("rampMaterial", scene);
    material.diffuseColor = Color3.Purple(); // Couleur rouge pour l'exemple

    this.mesh = MeshBuilder.CreateBox("box", { width:10, height: 10 }, scene);
    this.mesh.material = material;
    this.mesh.rotate(Axis.X, Angle.FromDegrees(100).radians(), Space.LOCAL);
    const GROUND_SHIFT_POS = new Vector3(0, -1, -5)
    const SLOPE_LENGTH = 1000;
    this.mesh.position = new Vector3(0 + GROUND_SHIFT_POS.x, -Math.sin(Angle.FromDegrees(30).radians()) * (SLOPE_LENGTH / 2) + GROUND_SHIFT_POS.y, Math.cos(Angle.FromDegrees(30).radians()) * (SLOPE_LENGTH / 2) + GROUND_SHIFT_POS.z)
    const rampAggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: 0, friction: 0, restitution: 1 }, scene);
}

}
