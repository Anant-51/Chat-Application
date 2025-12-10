import { useEffect } from "react";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function ErrorToast({
  message = "Something went wrong. Please try again.",
  onClose,
  duration = 3000,
  position = "center",
}) {
  useEffect(() => {
    if (duration !== null) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const positionClasses =
    position === "center"
      ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      : "fixed bottom-4 right-4";

  return (
    <div
      role="alert"
      className={`z-50 ${positionClasses} w-full max-w-sm p-4 border border-red-300 dark:border-red-700 rounded-lg shadow bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 flex items-center`}
    >
      <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
      <div className="ms-3 text-sm font-medium flex-1">{message}</div>
      <button
        onClick={onClose}
        className="ml-auto inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg focus:outline-none"
        aria-label="Close"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
