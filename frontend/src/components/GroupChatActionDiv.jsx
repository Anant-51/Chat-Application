import React from "react";

const GroupChatActionDiv = ({ message }) => {
  console.log("enterd GroupChatActionDiv");
  console.log("message from GroupChatActionDiv", message);
  return (
    <div className="mx-auto my-2 inline-block rounded-xl bg-gray-200 px-3 py-1 text-sm text-gray-600">
      {message}
    </div>
  );
};

export default GroupChatActionDiv;
