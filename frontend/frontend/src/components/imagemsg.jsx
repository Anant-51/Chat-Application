// DownloadOverlayButton.jsx
import { useState } from 'react';
import CircularProgressWithLabel from './circular';
import { set } from 'mongoose';

const DownloadOverlayButton = ({ fileUrl, imageAlt = 'file preview',message }) => {
  const [status, setStatus] = useState('idle'); // idle | downloading | done
  const [progress, setProgress] = useState(0);

  const contentLength = message.mediaSize // Assuming mediaSize is passed in the message object

  

  const handleDownload = async () => {
    setStatus('downloading');

    try {
      const response = await fetch(fileUrl);
      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks = [];

     while (true) {
     const { done, value } = await reader.read();
     if (done) break;
     chunks.push(value);
    
    receivedLength += value.length;
     const percent = Math.round((receivedLength / contentLength) * 100);
     setProgress(percent);
   
}
     setStatus('done');
      const blob =await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
     
    } catch (err) {
      console.error('Download failed:', err);
      setStatus('idle');
    }
  };

  return (
    <div className="relative w-full max-w-xs rounded-lg overflow-hidden">
      <img src={fileUrl} alt={imageAlt} className="w-full object-cover" />

      {status !== 'done' && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <button
            onClick={handleDownload}
            disabled={status === 'downloading'}
            className="p-2 rounded-full bg-white/70 hover:bg-white/90 transition"
            title="Download"
          >
            {status === 'downloading' ? (
              <CircularProgressWithLabel value={progress} />
            ) : (
              <svg className="h-5 w-5 text-gray-800" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 18">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 01-2 2H3a2 2 0 01-2-2v-3"
                />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
};




const ChatBubble = ({ sender , time ,  fileUrl,message }) => {
  return (
    <div className="flex items-start gap-2.5">
      <img className="w-8 h-8 rounded-full" src={fileUrl||''} />
      <div className="flex flex-col gap-1">
        <div className="flex flex-col w-full max-w-[326px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{sender}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{time}</span>
          </div>
          <div className="my-2.5">
            <DownloadOverlayButton fileUrl={fileUrl} message={message} />
          </div>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
