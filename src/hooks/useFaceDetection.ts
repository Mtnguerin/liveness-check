import { JeelizCanvas2DHelper } from "@dist/JeelizCanvas2DHelper";
import {
  IJeelizFaceFilterDetectState,
  IJeelizFaceFilterInitParams,
  IJeelizFaceFilterInitResult,
} from "@dist/JeelizFaceFilterInterfaces";
import JeelizFaceFilter from "@dist/jeelizFaceFilter.moduleES6.js";
import JeelizResizer from "@dist/JeelizResizer.js";
import { useCallback, useEffect, useState } from "react";

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

const dispatch = (eventName: FaceEvents, details?: any) => {
  const event = new CustomEvent(eventName, details);
  window.dispatchEvent(event);
};

const mouthOpenThreshold = 0.2;

export function useFaceDetection(canvasId: string) {
  const [loading, setLoading] = useState(true);
  const [cvd, setCvd] = useState<JeelizCanvas2DHelper>();

  const takePicture = useCallback(() => {
    if ( cvd && cvd.CV && cvd.CANVAS2D) {
      const ctx = cvd.CANVAS2D.getContext("2d");
      ctx?.clearRect(0, 0, cvd.CANVAS2D.width, cvd.CANVAS2D.height);
      cvd.draw({} as IJeelizFaceFilterDetectState);
      if (ctx) {
        const data = cvd.CV.toDataURL("image/jpeg");
        return data;
      }
    }
    return null;
  }, [cvd]);

  useEffect(() => {
    const JeelizFaceFilterInstance = JeelizFaceFilter.create_new();
    let isActive = true;
    let mouthOpen = false;
    let faceDetected = false;
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
        if (JeelizFaceFilterInstance && !isActive) {
          JeelizFaceFilterInstance.destroy();
          return;
        }
        if (errCode) {
          console.log("AN ERROR HAPPENS. ERROR CODE =", errCode);
          return;
        }
        console.log("INFO: JEELIZFACEFILTER IS READY");
        CVD = new JeelizCanvas2DHelper(spec);
        setCvd(CVD);
        setLoading(false);
      },
      callbackTrack: (detectState: IJeelizFaceFilterDetectState) => {
        if (detectState.detected > 0.8) {
          if (!faceDetected) {
            faceDetected = true;
            dispatch(FaceEvents.Enter);
          }
          if (detectState.expressions[0] > mouthOpenThreshold && !mouthOpen) {
            dispatch(FaceEvents.MouthOpen);
            mouthOpen = true;
          } else if (
            mouthOpen &&
            detectState.expressions[0] < mouthOpenThreshold
          ) {
            dispatch(FaceEvents.MouthClose);
            mouthOpen = false;
          }
          const { rx, ry, rz } = detectState;
          dispatch(FaceEvents.Move, {
            detail: { ...CVD?.getCoordinates(detectState), rx, ry, rz },
          });
        } else if (faceDetected) {
          faceDetected = false;
          dispatch(FaceEvents.Leave);
        }
        if (CVD) {
          CVD.update_canvasTexture();
          CVD.draw(detectState);
        }
      },
    };
    JeelizResizer.size_canvas({
      canvasId: canvasId,
      callback: () => {
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
  }, [canvasId]);

  const resize = () => {
    JeelizResizer.resize_canvas();
  };

  return {
    subscribe,
    unsubscribe,
    dispatch,
    resize,
    loading,
    canvas: cvd?.CANVAS2D,
    takePicture,
  };
}
