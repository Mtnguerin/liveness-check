import { useFaceDetection, FaceEvents } from "@hooks/useFaceDetection";
import { useWindowSize } from "@hooks/useWindowSize";
import { useEffect, useState } from "react";

const canvasId = "liveness-check-canvas";

export default function LivenessCheck() {
  const [width, height] = useWindowSize();
  const { resize } = useFaceDetection(canvasId);
  const [ resizeTimeout, setResizeTimeout ] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    const timeout = setTimeout(() => {
      resize();
    }, 1000);
    setResizeTimeout(timeout);
    return () => {
      clearTimeout(timeout);
    }
  }, [width, height]);

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
