import { JeelizCanvas2DHelper } from "@dist/JeelizCanvas2DHelper";
import {
  IJeelizFaceFilterDetectState,
  IJeelizFaceFilterInitParams,
  IJeelizFaceFilterInitResult,
} from "@dist/JeelizFaceFilterInterfaces";
import JeelizFaceFilter from "@dist/jeelizFaceFilter.moduleES6.js";
import JeelizResizer from "@dist/JeelizResizer.js";
import { useEffect } from "react";

export enum FaceEvents {
  Enter = "onFaceEnter",
  Leave = "onFaceLeave",
  Move = "onFaceMove",
}

const subscribe = (event: FaceEvents, callback: EventListener) => {
  window.addEventListener(event, callback);
};

const unsubscribe = (event: FaceEvents, callback: EventListener) => {
  window.removeEventListener(event, callback);
};

const dispatch = (eventName: FaceEvents) => {
  const event = new CustomEvent(eventName);
  window.dispatchEvent(event);
};

export function useFaceDetection(canvasId: string) {
  useEffect(() => {
    const JeelizFaceFilterInstance = JeelizFaceFilter.create_new();
    let isActive = true;
    let CVD: JeelizCanvas2DHelper | null = null;
    const initConfig: IJeelizFaceFilterInitParams = {
      canvasId: canvasId,
      NNCPath: "/neuralNets/",
      videoSettings: {
        flipX: true,
      },
      callbackReady: (
        errCode: string | false,
        spec: IJeelizFaceFilterInitResult
      ) => {
        console.log(spec);
        if (JeelizFaceFilterInstance && !isActive) {
          console.log("DESTROY")
          JeelizFaceFilterInstance.destroy();
        }
        if (errCode) {
          console.log("AN ERROR HAPPENS. ERROR CODE =", errCode);
          return;
        }
        console.log("INFO: JEELIZFACEFILTER IS READY");
        console.log(JeelizFaceFilterInstance);
        CVD = new JeelizCanvas2DHelper(spec);
        CVD.CTX.strokeStyle = "yellow";
      },
      callbackTrack: (detectState: IJeelizFaceFilterDetectState) => {
        // console.log(detectState);
        // console.log(CVD);
        // Render your scene here
        // [... do something with detectState]
        console.log(detectState.expressions[0] > 0.2);
        if (CVD) {
          CVD.update_canvasTexture();
          CVD.draw(detectState);
        }
      },
    };
    JeelizResizer.size_canvas({
      canvasId: canvasId,
      callback: (isError: boolean, bestVideoSettings: any) => {
        console.log("RESIZE CALLBACK");
        console.log(isError);
        console.log(bestVideoSettings);
        JeelizFaceFilterInstance.init(initConfig);
      },
    });


    return () => {
      console.log("DESTROYING JEELIZFACEFILTER");
      isActive = false;
      JeelizFaceFilterInstance.destroy();
    };
  }, []);

  const resize = () => {
    JeelizResizer.resize_canvas();
  }

  return {
    subscribe,
    unsubscribe,
    dispatch,
    resize,
  };
}
