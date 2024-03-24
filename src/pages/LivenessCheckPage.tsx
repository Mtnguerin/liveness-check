import { LivenessCheck } from "@features/LivenessCheck";
import { Fragment, useCallback, useState } from "react";
import { Transition } from "@headlessui/react";
import Step from "@components/Step";
import RoundedSquareCorner from "@assets/rounded-square-corners.svg?react";
import Smiley from "@assets/smiley.svg?react";

enum LivenessPageState {
  START,
  CHECKING,
  SUCCESS,
  FAIL,
}

export default function LivenessCheckPage() {
  const [state, setState] = useState(LivenessPageState.START);
  const onSuccess = useCallback(() => {
    setState(LivenessPageState.SUCCESS);
  }, []);
  return (
    <>
      <div className="h-full w-full justify-center overflow-hidden">
        <Transition

          as={Fragment}
          appear={true}
          show={state === LivenessPageState.START}
          enter="transition-opacity ease-in duration-1000"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="h-full">
            <Step>
              <Step.Header
                title="Set up Face ID"
                description="To set up Face ID, we need to scan your face to verify your identity."
              />
              <Step.Body>
                <div className="flex h-full relative">
                  <RoundedSquareCorner className="w-48 h-auto mx-auto my-auto" />
                  <Smiley className="text-yellow-500 absolute w-16 h-auto top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
                </div>
              </Step.Body>
              <Step.FooterButton
                onClick={() => setState(LivenessPageState.CHECKING)}
              >
                Scan My Face
              </Step.FooterButton>
            </Step>
          </div>
        </Transition>
        <Transition
          as={Fragment}
          show={state === LivenessPageState.CHECKING}
          enter="transition-opacity delay-1000 ease-in duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-out duration-1000"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="h-full relative">
            <Step>
              <Step.Header
                title="Face Scanning"
                onBack={() => setState(LivenessPageState.START)}
              />
            </Step>
            <LivenessCheck
              className="absolute top-0 left-0"
              onSuccess={onSuccess}
              onFailure={() => setState(LivenessPageState.FAIL)}
            />
          </div>
        </Transition>
        {state === LivenessPageState.SUCCESS && (
          <div>Liveness Check Success</div>
        )}
        {state === LivenessPageState.FAIL && <div>Liveness Check Fail</div>}
      </div>
    </>
  );
}
