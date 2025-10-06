import { ImportMeshAsync } from "@babylonjs/core";
import type { RendererOption } from "@/types/renderer";
import type CarRender from "./core";

export async function renderGLB(this: CarRender, options: RendererOption) {
  return ImportMeshAsync(options.path, this._scene, {
    onProgress: (e) => {
      const progress = e.loaded / e.total;
      options.onProgress?.(progress);
    },
    pluginOptions: {
      gltf: {
        skipMaterials: false,
        extensionOptions: {
          MSFT_lod: {
            enabled: false,
          },
        },
      },
    },
  })
}
