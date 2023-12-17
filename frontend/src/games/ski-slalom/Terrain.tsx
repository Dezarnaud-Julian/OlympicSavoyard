import { Color3, Scene, StandardMaterial } from "@babylonjs/core";
import { DynamicTerrain } from "../../externals/DynamicTerrain/babylon.dynamicTerrain_modular";
export class Terrain {
  mapSubX = 500;
  mapSubZ = 300;
  terrainSub = 100;
  mapData: Float32Array;
  terrain: DynamicTerrain;


  constructor(scene: Scene) {
    const terrainMaterial = new StandardMaterial("materialGround", scene);
    terrainMaterial.diffuseColor = new Color3(1, 0, 0);

    // map creation
    this.mapData = new Float32Array(this.mapSubX * this.mapSubZ * 3);
    for (let l = 0; l < this.mapSubZ; l++) {
      for (let w = 0; w < this.mapSubX; w++) {
        this.mapData[3 * (l * this.mapSubX + w)] = (w - this.mapSubX * 0.5) * 2.0;
        const wave = () => {
          return Math.sin(l / 2) * Math.cos(w / 2) * 2.0
        }
        this.mapData[3 * (l * this.mapSubX + w) + 1] = (w / (l + 1) * wave()) + 10;
        this.mapData[3 * (l * this.mapSubX + w) + 2] = (l - this.mapSubZ * 0.5) * 2.0;
      }
    }

    // terrain creation
    let params = {
      mapData: this.mapData,
      mapSubX: this.mapSubX,
      mapSubZ: this.mapSubZ,
      terrainSub: this.terrainSub
    };
    this.terrain = new DynamicTerrain("terrain", params, scene);
    this.terrain.mesh.material = terrainMaterial;
    this.terrain.subToleranceX = 8;
    this.terrain.subToleranceZ = 8;
    this.terrain.LODLimits = [4, 3, 2, 1, 1];
  }

}