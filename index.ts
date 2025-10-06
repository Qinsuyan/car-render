import CarRender from "@/lib/core";
import "./index.less";
import { Vector3 } from "@babylonjs/core";
const main = async () => {
  console.log("This is car-render project");
  const wrap = document.getElementById("app")! as HTMLDivElement;
  const renderer = new CarRender(wrap);
  renderer.on("loadErr", (e) => {
    console.log(e);
  });
  renderer.loadSky("/sky.hdr")
  renderer.setCameraPosition(new Vector3(20,3,-10))
  await renderer.loadScene("/race.glb",new Vector3(2,0,10));//Object_6
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
  });
  setTimeout(() => {
    renderer.rePaint("#FF0000",1)
  },5000)
};
window.onload = main;
//下一步：添加地面和天空盒, 阴影
//更换喷漆颜色和材质
