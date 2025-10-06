import type { CarMeshParts, DirectionByAxis } from "@/types/renderer";
import { Axis, Space, type EventState, type Scene } from "@babylonjs/core";

export default class Driving {
  private _headDirection: DirectionByAxis;
  private _wheelSizeInMeter: number;
  private _animations: any[];
  private _scene: Scene;
  private _meshes: CarMeshParts;
  private _speed: number;
  constructor(
    scene: Scene,
    dir: DirectionByAxis,
    wheelSize: number,
    meshs: CarMeshParts
  ) {
    this._scene = scene;
    this._headDirection = dir;
    this._wheelSizeInMeter = wheelSize * 0.0254;
    this._animations = [];
    this._meshes = meshs;
    this._speed = 0;
  }
  private get wheelAxis() {
    switch (this._headDirection) {
      case "X":
        return Axis.Z;
      case "-X":
        return Axis.Z.negate();
      case "Y":
        return Axis.Z;
      case "-Y":
        return Axis.Z.negate();
      case "Z":
        return Axis.X.negate();
      case "-Z":
        return Axis.X;
    }
  }
  public AtSpeed(speedInKM: number) {
    this._speed = (5 * speedInKM) / 9 / this._wheelSizeInMeter;

    // console.log(radSpeed)
    // console.log(deltaTime)
    // console.log(deltaAngle)
    // this._speedStep = deltaAngle;
    if (this._speed === 0) {
      this._animations?.forEach((l) => {
        this._scene.onBeforeRenderObservable.remove(l);
      });
      this._animations = [];
    } else {
      if (!this._animations.length) {
        const rotateWheels = (eventData: Scene, eventState: EventState) => {
          this._meshes.wheels.forEach((w) => {
            const deltaTime = this._scene.getEngine().getDeltaTime() / 1000; // 秒
            const deltaAngle = this._speed * deltaTime;
            w.rotate(this.wheelAxis, deltaAngle,Space.WORLD);
          });
        };
        this._scene.onBeforeRenderObservable.add(rotateWheels);
        this._animations = [rotateWheels];
      }
    }
    return this;
  }
}
