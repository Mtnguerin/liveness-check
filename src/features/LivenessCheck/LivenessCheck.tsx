import { useFaceDetection, FaceEvents } from "@hooks/useFaceDetection";

const canvasId = "liveness-check-canvas";

export default function LivenessCheck() {
  const { resize } = useFaceDetection(canvasId);

  return (
    <div className="h-full w-full flex overflow-hidden justify-center">
      <canvas
        id={canvasId}
        width="600"
        height="600"
        className="mx-auto my-auto w-auto h-full max-h-full"
      ></canvas>
    </div>
  );
}
