import type { AbstractMesh, Scene, TransformNode } from "@babylonjs/core";

export interface RendererOption {
  path: string;
  onProgress?: (p: number) => void;
}
export type DirectionByAxis = "X" | "-X" | "Y" | "-Y" | "Z" | "-Z";
export interface CarRenderOptions extends RendererOption {
  wheelNames?: string[];
  paintNames?: string[];
  wheelSizeInInch?: number;
  head: DirectionByAxis;
  scale?: number;
}
export interface CarMeshParts {
  wheels: (AbstractMesh | TransformNode)[];
}
