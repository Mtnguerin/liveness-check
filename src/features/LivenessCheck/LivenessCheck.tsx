import { useFaceDetection, FaceEvents } from "@hooks/useFaceDetection";
import { drawFaceCircle } from "@utils/canvas";
import { useCallback, useEffect, useState } from "react";
import RoundedSquareCorner from "@assets/rounded-square-corners.svg?react";
import classNames from "classnames";
import { useTimer } from "@hooks/useTimer";

const canvasId = "liveness-check-canvas";

type LivenessCheckProps = {
  onSuccess: (pictures: string[]) => void;
  onFailure: (pictures: string[]) => void;
  className?: string;
};

enum LivenessCheckState {
  FACING_CAMERA,
  MOVE_RIGHT,
  MOUTH_OPEN,
  END,
}

const Configuration: {
  [key in LivenessCheckState]?: { message: string; successTime: number };
} = {
  0: {
    message: "Please face the camera",
    successTime: 5,
  },
  1: {
    message: "Please move your head to the right",
    successTime: 2,
  },
  2: {
    message: "Please open your mouth",
    successTime: 2,
  },
};

export default function LivenessCheck({
  onSuccess,
  onFailure,
  className,
}: LivenessCheckProps) {
  const [state, setState] = useState(LivenessCheckState.FACING_CAMERA);
  const { timer: failTimer, resetTimer: resetFailTimer, startTimer: startFailTimer } = useTimer(true);
  const [pictures, setPictures] = useState<string[]>([]);
  const { timer, resetTimer, pauseTimer, startTimer } = useTimer(false);
  const [conditionsMet, setConditionsMet] = useState(false);
  const { loading, subscribe, unsubscribe, canvas, takePicture } =
    useFaceDetection(canvasId);
  const changeState = useCallback(
    (newState: LivenessCheckState) => {
      setState(newState);
      resetFailTimer();
      setConditionsMet(false);
    },
    [resetFailTimer]
  );

  const savePicture = useCallback((): string | null => {
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !takePicture) return null;
    const picture = takePicture();
    return picture;
  }, [takePicture, canvas]);

  useEffect(() => {
    if (failTimer >= 30) {
      const picture = savePicture();
      onFailure(picture ? [picture] : []);
    }
  }, [failTimer, savePicture, onFailure]);

  useEffect(() => {
    if (conditionsMet && Configuration[state]) {
      startTimer();
      if (timer >= Configuration[state]!.successTime) {
        const picture = savePicture();
        if (picture) {
          pictures.push(picture);
          setPictures(pictures);
        }
        pauseTimer();
        resetTimer();

        switch (state) {
          case LivenessCheckState.FACING_CAMERA:
            changeState(LivenessCheckState.MOVE_RIGHT);
            break;
          case LivenessCheckState.MOVE_RIGHT:
            changeState(LivenessCheckState.MOUTH_OPEN);
            break;
          case LivenessCheckState.MOUTH_OPEN:
            changeState(LivenessCheckState.END);
            onSuccess(pictures);
            break;
        }
      }
    } else {
      pauseTimer();
    }
  }, [
    timer,
    conditionsMet,
    pauseTimer,
    state,
    onSuccess,
    startTimer,
    changeState,
    resetTimer,
    savePicture,
    pictures,
  ]);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    setConditionsMet(false);
    const onMouthOpen = () => {
      if (state === LivenessCheckState.MOUTH_OPEN) {
        setConditionsMet(true);
      }
    };
    const onMouthClose = () => {
      if (state === LivenessCheckState.MOUTH_OPEN) {
        setConditionsMet(false);
      }
    };

    const onFaceEnter = () => {};
    const onFaceLeave = () => {
      setConditionsMet(false);
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };
    const onFaceMove = (event: any) => {
      const { x, y, w, h, rx, ry, rz } = event.detail;
      let areConditionsMet = false;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      switch (state) {
        case LivenessCheckState.FACING_CAMERA:
          if (Math.abs(rz) < 0.1 && Math.abs(rx) < 0.1 && Math.abs(ry) < 0.1) {
            areConditionsMet = true;
          } else {
            areConditionsMet = false;
          }
          setConditionsMet(areConditionsMet);
          drawFaceCircle(
            ctx!,
            x + w / 2,
            y + h / 2,
            rz,
            w / 1.7,
            areConditionsMet ? "yellow" : "white"
          );
          break;
        case LivenessCheckState.MOVE_RIGHT:
          if (ry > 0.5) {
            setConditionsMet(true);
          } else {
            setConditionsMet(false);
          }
          break;
      }
    };
    if (!loading) {
      startFailTimer();
      subscribe(FaceEvents.MouthOpen, onMouthOpen);
      subscribe(FaceEvents.MouthClose, onMouthClose);
      subscribe(FaceEvents.Enter, onFaceEnter);
      subscribe(FaceEvents.Leave, onFaceLeave);
      subscribe(FaceEvents.Move, onFaceMove);
    }
    return () => {
      unsubscribe(FaceEvents.MouthOpen, onMouthOpen);
      unsubscribe(FaceEvents.MouthClose, onMouthClose);
      unsubscribe(FaceEvents.Enter, onFaceEnter);
      unsubscribe(FaceEvents.Leave, onFaceLeave);
      unsubscribe(FaceEvents.Move, onFaceMove);
    };
  }, [subscribe, unsubscribe, loading, canvas, startFailTimer, state]);
  return (
    <div
      className={classNames(
        "h-full w-full flex overflow-hidden justify-center -z-10",
        className,
        loading ? "bg-gray-400" : ""
      )}
    >
      <canvas
        id={canvasId}
        width="600"
        height="600"
        className={"mx-auto my-auto w-auto h-full max-h-full"}
      ></canvas>
      <RoundedSquareCorner
        className={classNames(
          "absolute top-1/2 -translate-y-1/2 w-48 h-auto mx-auto my-auto",
          conditionsMet ? "text-yellow-500" : "text-white"
        )}
      />
      {!loading && Configuration[state] && (
        <div className="absolute bottom-10 w-full flex flex-col gap-4">
          <p className="text-white font-semibold text-center">
            {Configuration[state]!.message}
          </p>
          <div className="mx-auto w-48 h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-6 bg-yellow-500 rounded-full transition-width duration-1000 ease-linear"
              style={{
                width: `${
                  (timer / Math.max(Configuration[state]!.successTime - 1, 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
