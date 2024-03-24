import { useFaceDetection, FaceEvents } from "@hooks/useFaceDetection";
import { drawFaceCircle } from "@utils/canvas";
import { useEffect, useState } from "react";
import RoundedSquareCorner from "@assets/rounded-square-corners.svg?react";
import classNames from "classnames";

const canvasId = "liveness-check-canvas";

type LivenessCheckProps = {
  onSuccess: () => void;
  onFailure: () => void;
  className?: string;
};

enum LivenessCheckState {
  IN_CENTER,
  MOVE_RIGHT,
  MOUTH_OPEN,
}

export default function LivenessCheck({
  onSuccess,
  onFailure,
  className,
}: LivenessCheckProps) {
  const [state, setState] = useState(LivenessCheckState.IN_CENTER);
  const { loading, subscribe, unsubscribe, canvas } =
    useFaceDetection(canvasId);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const onMouthOpen = () => {
      console.log("Mouth Open");
    };
    const onMouthClose = () => {
      console.log("Mouth Close");
    };

    const onFaceEnter = () => {
      console.log("Face Enter");
    };
    const onFaceLeave = () => {
      console.log("Face Leave");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };
    const onFaceMove = (event: any) => {
      console.log(event.detail);
      const { x, y, w, h, rz } = event.detail;
      console.log("Face Move");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      const circleRadius = w / 1.7;
      drawFaceCircle(ctx!, x + w / 2, y + h / 2, rz, circleRadius, "white");
    };
    if (!loading) {
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
  }, [subscribe, unsubscribe, loading, canvas]);
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
      {state === LivenessCheckState.IN_CENTER && (
        <RoundedSquareCorner className="absolute text-white top-1/2 -translate-y-1/2 w-48 h-auto mx-auto my-auto" />
      )}
    </div>
  );
}
