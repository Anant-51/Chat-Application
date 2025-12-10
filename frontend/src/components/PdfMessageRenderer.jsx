import React from "react";
import ClosePic from "../assets/close-pic.png";

const PdfMessageRenderer = ({ pdfUrl, onClick }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <button
        onClick={onClick}
        className="absolute top-10 right-25 z-50 bg-white hover:bg-gray-500 rounded-full p-2 shadow-lg transition"
      >
        <img src={ClosePic} className="w-6 h-6" alt="Close" />
      </button>

      <div className="w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        <iframe src={pdfUrl} className="w-full h-full" title="PDF Viewer" />
      </div>
    </div>
  );
};

export default PdfMessageRenderer;
