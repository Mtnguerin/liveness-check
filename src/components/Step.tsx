import classNames from "classnames";
import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

type StepProps = {
  children?: React.ReactNode;
};

export function Step({ children }: StepProps) {
  return (
    <div
      className={classNames(
        "flex flex-col h-full items-center text-center py-12"
      )}
    >
      {children}
    </div>
  );
}

type StepHeaderProps = {
  title: string;
  description?: string;
  onBack?: () => void;
};

function StepHeader({ title, description, onBack}: StepHeaderProps) {
  return (
    <div className="px-4 relative w-full">
      {onBack && <button className="absolute rounded-xl bg-white/20 shadow-xl px-1 py-1 left-10" onClick={onBack}><ArrowLeftIcon className="w-8 h-auto" /></button>}<h1 className="font-semibold text-xl py-1">{title}</h1>
      {description && (
        <p className="mt-10 font-light text-gray-600">{description}</p>
      )}
    </div>
  );
}
Step.Header = StepHeader;

type StepBodyProps = {
  children: React.ReactNode;
};
function StepBody({ children }: StepBodyProps) {
  return <div className="flex-1">{children}</div>;
}
Step.Body = StepBody;

type StepFooterButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};
function StepFooterButton({ children, onClick }: StepFooterButtonProps) {
  return (
    <div className="flex justify-center items-center">
      <button
        type="button"
        className={classNames(
          "px-12 py-2 rounded-full bg-yellow-400 shadow-xl font-semibold transition-transform scale-100 focus:scale-90 hover:scale-90"
        )}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
Step.FooterButton = StepFooterButton;
export default Step;
