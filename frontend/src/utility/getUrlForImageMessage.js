import React from "react";

const getUrlForImageMessage = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== "upload") {
    return {
      thumbnailUrl: null,
      thumbnailUrlOnDownloaded: null,
    };
  }

  const thumbnailUrl = cloudinaryUrl.replace(
    "upload/w_120,h_120,c_fill,q_10,e_blur_:50",
    "upload"
  );

  const thumbnailUrlOnDownloaded = cloudinaryUrl.replace(
    "upload/w_120,h_120,c_fill",
    "react"
  );

  return {
    thumbnailUrl,
    thumbnailUrlOnDownloaded,
  };
};

export default getUrlForImageMessage;
