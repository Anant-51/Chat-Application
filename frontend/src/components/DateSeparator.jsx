// components/DateSeparator.js
import React from "react";
import { isToday, isYesterday, format } from "date-fns";

const DateSeparator = ({ label }) => {
  const isBox = label === "Today" || label === "Yesterday";

  return (
    <div className="flex items-center justify-center my-3 w-full px-4">
      {isBox ? (
        <div className="bg-gray-300 dark:bg-gray-600 text-xs text-gray-800 dark:text-gray-100 py-1 px-3 rounded-full shadow-sm">
          {label}
        </div>
      ) : (
        <div className="flex items-center w-full gap-2">
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {label}
          </span>
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600" />
        </div>
      )}
    </div>
  );
};

export default DateSeparator;
