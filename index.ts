import CarRender from "@/lib/core";
import "./index.less";
import { Vector3 } from "@babylonjs/core";
const main = async () => {
  console.log("This is car-render project");
  const process = document.getElementById("process")!
  const wrap = document.getElementById("app")! as HTMLDivElement;
  const renderer = new CarRender(wrap);
  renderer.on("loadErr", (e) => {
    console.log(e);
  });
  process.innerText = "加载中"
  renderer.loadSky("/sky.hdr")
  renderer.setCameraPosition(new Vector3(20,3,-10))
  await renderer.loadScene({
    offset:new Vector3(2,0,10),path:"/race.glb",
    onProgress:(p) => {
        process.innerText = `加载场景 ${(p*100).toFixed(2)}%`
    }
  });
  process.innerText = `加载车 0%`
  await renderer.loadCar({
    path: "/benz.glb",
    wheelNames: [
      "3DWheel Front R",
      "3DWheel Front L",
      "3DWheel Rear R",
      "3DWheel Rear L",
    ],
    paintNames:["M:M_CarPaint_Max_M_Carpaint_0"],
    wheelSizeInInch: 15,
    head: "Z",
    scale: 200,
     onProgress:(p) => {
        process.innerText = `加载车 ${(p*100).toFixed(2)}%`
    }
  });
  process.innerText = `5S后更改喷漆为红色`
  setTimeout(() => {
    renderer.rePaint("#FF0000",1)
    process.innerText = `加载完成`
  },5000)
};
window.onload = main;
