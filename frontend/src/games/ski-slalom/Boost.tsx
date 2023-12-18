import { Angle, Axis, Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Quaternion, Scene, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import '@babylonjs/loaders/OBJ/objFileLoader';

export class Boost {
  index: number;
  localPosition: Vector3;
  mesh: Mesh | null = null;
  height: number;
  width: number;


  constructor(scene: Scene, index: number, position: Vector3) {
    this.localPosition = position;
    this.index = index;
    this.height = 8;
    this.width = 12;
  }

  async init(scene: Scene) {
    // Créer un matériau pour la rampe
    const material = new StandardMaterial("rampMaterial", scene);
    material.diffuseColor = Color3.Red(); // Couleur rouge pour l'exemple

    this.mesh = MeshBuilder.CreateGround("ground", { width:this.width, height: this.height }, scene);
    this.mesh.material = material;
    const GROUND_SHIFT_POS = new Vector3(0, -1, -5)
    const SLOPE_LENGTH = 1000;
    this.mesh.position = this.localPosition;
}

getHeight() {
  return this.height;
}
getWidth() {
  return this.width;
}
}
