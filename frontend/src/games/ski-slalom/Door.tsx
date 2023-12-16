import { Color3, Mesh, MeshBuilder, Quaternion, Scene, SceneLoader, StandardMaterial, Vector3 } from "@babylonjs/core"
import '@babylonjs/loaders/OBJ/objFileLoader';
import { BoostSFX } from "../../core/Sounds";

export class Door {
  index: number
  localPosition: Vector3
  mesh: Mesh | null = null
  shouldGoLeft: boolean

  activatedDoorMat: StandardMaterial;
  failedDoorMat: StandardMaterial;
  flagMesh: Mesh | null = null;

  activated = false

  constructor(scene: Scene, index: number, position: Vector3, shouldGoLeft: boolean) {
    this.shouldGoLeft = shouldGoLeft
    this.localPosition = position;
    this.index = index;
    // this.mesh = MeshBuilder.CreateBox("door", { size: 4 }, scene);

    this.activatedDoorMat = new StandardMaterial("activatedDoorMat");
    this.activatedDoorMat.diffuseColor = Color3.Green();

    this.failedDoorMat = new StandardMaterial("failedDoorMat");
    this.failedDoorMat.diffuseColor = Color3.Black();
  }

  async init(scene: Scene) {
    // const doorMesh = MeshBuilder.CreateBox("door", { size: 4 }, scene);
    const meshes = (await SceneLoader.ImportMeshAsync("", "./models/", "flag.glb", scene)).meshes;
    this.mesh = meshes[0] as Mesh;
    this.flagMesh = meshes[1] as Mesh;
    this.mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(90, 0, 0);
    this.mesh.position = this.localPosition;

    const doorMat = new StandardMaterial("doorMat");
    doorMat.diffuseColor = this.shouldGoLeft ? Color3.Red() : Color3.Blue();
    // meshes[1].material = doorMat
  }

  setFailed() {
    this.activated = false;
    this.flagMesh!.material = this.failedDoorMat;
  }
  setActivated() {
    if (!this.activated) {
      this.activated = true;
      this.flagMesh!.material = this.activatedDoorMat;
      // BoostSFX()
    }
  }
}