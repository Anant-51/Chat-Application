const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const getVideoThumbnail = (publicId, frame = 1, width = 200, height = 200) => {
  if (!publicId) return "";

  const cleanPublicId = publicId.replace(
    /\.(jpg|jpeg|png|webp|mp4|mov|avi)$/i,
    ""
  );

  return `https://res.cloudinary.com/${cloudName}/video/upload/so_${frame},w_${width},h_${height},c_fill,q_auto,f_jpg/${cleanPublicId}.jpg`;
};

export default getVideoThumbnail;
