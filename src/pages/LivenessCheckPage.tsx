import { LivenessCheck } from "@features/LivenessCheck";
import { Fragment, useCallback, useState } from "react";
import { Transition } from "@headlessui/react";
import Step from "@components/Step";
import RoundedSquareCorner from "@assets/rounded-square-corners.svg?react";
import Smiley from "@assets/smiley.svg?react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

enum LivenessPageState {
  START,
  CHECKING,
  SUCCESS,
  FAIL,
}

export default function LivenessCheckPage() {
  const [state, setState] = useState(LivenessPageState.START);
  const [pictures, setPictures] = useState<string[]>([]);
  const onSuccess = useCallback((pictures: string[]) => {
    setState(LivenessPageState.SUCCESS);
    setPictures(pictures);
  }, []);
  const onFailure = useCallback((pictures: string[]) => {
    setState(LivenessPageState.FAIL);
    setPictures(pictures);
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
          leave="transition-opacity ease-out duration-500"
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
              onFailure={onFailure}
            />
          </div>
        </Transition>
        {state === LivenessPageState.SUCCESS && (
          <Step>
            <Step.Header
              title="Success!"
              description="Your face ID has been successfully set up. Here are the pictures taken."
            />
            <Step.Body>
              <div className="flex items-center h-full flex-col gap-6">
                <div className="flex relative mt-6">
                  <RoundedSquareCorner className="w-32 h-auto mx-auto my-auto" />
                  <CheckIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-auto text-green-500" />
                </div>
                <div className="flex gap-10 relative flex-wrap justify-center">
                  {pictures.map((picture, index) => (
                    <img
                      key={index}
                      src={picture}
                      alt={`Face ID ${index}`}
                      className="w-32 h-auto"
                    />
                  ))}
                </div>
              </div>
            </Step.Body>
          </Step>
        )}
        {state === LivenessPageState.FAIL && (
          <Step>
            <Step.Header
              title="Failure!"
              description="We were not able to verify your identity. Please try again."
            />
            <Step.Body>
              <div className="flex items-center h-full flex-col gap-6">
                <div className="flex relative mt-6">
                  <RoundedSquareCorner className="w-32 h-auto mx-auto my-auto" />
                  <XMarkIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-auto text-red-500" />
                </div>
                <div className="flex gap-10 relative flex-wrap justify-center">
                  {pictures.map((picture, index) => (
                    <img
                      key={index}
                      src={picture}
                      alt={`Face ID ${index}`}
                      className="w-32 h-auto"
                    />
                  ))}
                </div>
              </div>
            </Step.Body>
          </Step>
        )}
      </div>
    </>
  );
}
