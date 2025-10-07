import type { CarRenderOptions, SceneRenderOptions } from "@/types/renderer";
import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  Vector3,
  Color4,
  AbstractMesh,
  TransformNode,
  HDRCubeTexture,
  DirectionalLight,
  ShadowGenerator,
  Material,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { Emitter } from "mitt";
import mitt from "mitt";
import type { ErrorTypes } from "src/types/errors";
import { renderGLB } from "./renderer";
import Driving from "./driving";
export default class CarRender {
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  protected _scene: Scene;
  private _camera: ArcRotateCamera;
  private _sun: HemisphericLight;
  protected eventBus: Emitter<ErrorTypes>;
  protected wheels: (AbstractMesh | TransformNode)[];
  protected paints: AbstractMesh[];
  private _shadowRender: ShadowGenerator | null;
  public driving: Driving | null;
  constructor(el: HTMLDivElement) {
    //empty attrs
    this.eventBus = mitt();
    this.wheels = [];
    this.paints = [];
    this.driving = null;
    this._shadowRender = null;
    //engine
    if (el.querySelector("canvas")) {
      this._canvas = el.querySelector("canvas") as HTMLCanvasElement;
    }
    const canvas = document.createElement("canvas");
    el.appendChild(canvas);
    this._canvas = canvas;
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this._canvas.style.touchAction = "none";
    this._canvas.style.outline = "none";
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);
    this._scene.clearColor = new Color4(0, 0, 0, 0);
    this._sun = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this._scene
    );
    this._sun.intensity = 0.5;
    this._camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.2,
      6,
      new Vector3(0, 0, 0),
      this._scene,
      true
    );
    this._camera.setPosition(new Vector3(0, 10, 15));
    this._camera.maxZ = 9999999;
    this._camera.minZ = 0.1;
    this._camera.wheelPrecision = 15;
    this._camera.panningSensibility = 0;
    this._camera.allowUpsideDown = false;
    // this._camera.useAutoRotationBehavior = true;
    this._camera.inertia = 0.6;
    this._camera.attachControl(this._canvas, true);
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
    new ResizeObserver(() => {
      this._engine.resize();
    }).observe(this._canvas);
  }
  public destroy() {
    this._engine.dispose();
  }
  public on(name: keyof ErrorTypes, handler: (e: any) => void) {
    this.eventBus.on(name, handler);
  }
  public async loadCar(options: CarRenderOptions) {
    const model = await renderGLB.call(this, options);
    if (options.scale) {
      const scale = options.scale > 0 ? options.scale : 1;
      model.meshes[0]!.scaling = new Vector3(scale, scale, scale);
    }
    model.meshes.forEach((m) => {
      if (options.wheelNames?.includes(m.name)) {
        this.wheels.push(m);
      }
      if (options.paintNames?.includes(m.name)) {
        this.paints.push(m);
      }
      this._shadowRender?.addShadowCaster(m);
    });
    model.transformNodes.forEach((n) => {
      if (options.wheelNames?.includes(n.name)) {
        this.wheels.push(n);
      }
    });
    this.driving = new Driving(
      this._scene,
      options.head,
      options.wheelSizeInInch || 15,
      {
        wheels: this.wheels,
      }
    );
  }
  public async loadScene(options:SceneRenderOptions) {
    const model = await renderGLB.call(this, options);
    if (options.offset) {
      model.meshes[0]!.setAbsolutePosition(
        model.meshes[0]!.position.add(options.offset)
      );
    }
    model.meshes.forEach((m) => {
      m.receiveShadows = true;
    });
    const light = new DirectionalLight(
      "dirLight",
      new Vector3(-1, -2, -1),
      this._scene
    );
    light.position = new Vector3(100, 100, 100);
    light.intensity = 3;
    this._shadowRender = new ShadowGenerator(2048, light);
    this._shadowRender = new ShadowGenerator(1024, light);
    this._shadowRender.useBlurExponentialShadowMap = true;
    this._shadowRender.blurKernel = 16;
    this._shadowRender.usePoissonSampling = false;
    this._shadowRender.bias = 0.001;
    this._shadowRender.normalBias = 0.05;
    this._shadowRender.setDarkness(0);
  }
  public setCameraPosition(position: Vector3) {
    if (this._camera) {
      this._camera.setPosition(position);
    }
  }
  public loadSky(path: string, size?: number) {
    const texture = new HDRCubeTexture(path, this._scene, size || 512);
    texture.level = 0.5;
    this._scene.createDefaultSkybox(texture, true, 2000);
  }
  public rePaint(color: string, roughness: number) {
    let r = roughness;
    if (r < 0) {
      r = 0.1;
    }
    if (r > 1) {
      r = 1;
    }
    const material = new StandardMaterial("p", this._scene);
    material.diffuseColor = Color3.FromHexString(color);

    // material.specularColor = new Color3(100, 100, 100);

    material.roughness = r;
    this.paints.forEach((p) => {
      p.material = material;
    });
  }
}
