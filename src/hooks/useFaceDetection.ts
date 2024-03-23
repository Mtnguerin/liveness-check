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
  MouthOpen = "onMouthOpen",
  MouthClose = "onMouthClose",
}

const subscribe = (event: FaceEvents, callback: EventListener) => {
  window.addEventListener(event, callback);
};

const unsubscribe = (event: FaceEvents, callback: EventListener) => {
  window.removeEventListener(event, callback);
};

const dispatch = (eventName: FaceEvents) => {
  const event = new CustomEvent(eventName);
  console.log("DISPATCHING EVENT", event);
  window.dispatchEvent(event);
};

const mouthOpenThreshold = 0.2;

export function useFaceDetection(canvasId: string) {
  useEffect(() => {
    const JeelizFaceFilterInstance = JeelizFaceFilter.create_new();
    let isActive = true;
    let mouthOpen = false;
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
          console.log("DESTROY");
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
        if (detectState.detected > 0.8) {
          if (detectState.expressions[0] > mouthOpenThreshold && !mouthOpen) {
            console.log(detectState);
            dispatch(FaceEvents.MouthOpen);
            mouthOpen = true;
          } else if (
            mouthOpen &&
            detectState.expressions[0] < mouthOpenThreshold
          ) {
            dispatch(FaceEvents.MouthClose);
            mouthOpen = false;
          }

          // draw a border around the face:
          if (CVD) {
            const faceCoo = CVD.getCoordinates(detectState);
            CVD.CTX.clearRect(0, 0, CVD.CANVAS2D?.width, CVD.CANVAS2D?.height);
            CVD.CTX.strokeRect(faceCoo.x, faceCoo.y, faceCoo.w, faceCoo.h);
            CVD.update_canvasTexture();
          }
        }

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
        if (isActive) {
          JeelizFaceFilterInstance.init(initConfig);
        }
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
  };

  return {
    subscribe,
    unsubscribe,
    dispatch,
    resize,
  };
}
