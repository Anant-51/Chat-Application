import { useState } from 'react';
import CircularProgressWithLabel from './CircularProgressWithLabel';

export default function DocumentMessage({ sender, time, fileName, fileSize, fileUrl }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'downloading' | 'done'
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleDownload = async () => {
    setStatus('downloading');

    try {
      const response = await fetch(fileUrl);
      const reader = response.body.getReader();
      const contentLength = fileSize;
      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        receivedLength=receivedLength/1024/1024; // Convert to MB
        setProgress(Math.round((receivedLength / contentLength) * 100));
      }

      const blob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Trigger actual download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'file.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatus('done');
    } catch (err) {
      console.error('Download failed:', err);
      setStatus('idle');
    }
  };

  const openPdf = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="flex items-start gap-2.5">
      <img
        className="w-8 h-8 rounded-full"
        src="/docs/images/people/profile-picture-3.jpg"
        alt={`${sender} image`}
      />
      <div className="flex flex-col gap-1">
        {/* Sender & Time */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{sender}</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{time}</span>
        </div>

        {/* File container */}
        <div
          onClick={status === 'done' ? openPdf : undefined}
          className={`flex flex-col w-full max-w-[320px] p-4 bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl cursor-${
            status === 'done' ? 'pointer' : 'default'
          }`}
        >
          <div className="flex items-start bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
            {/* File Icon & Info */}
            <div className="me-2">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-1">
                📄 {fileName}
              </span>
              <span className="flex text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
                {fileSize} • PDF
              </span>
            </div>

            {/* Action: Download or Progress */}
            <div className="inline-flex self-center items-center">
              {status === 'idle' && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500"
                >
                  <svg
                    className="w-4 h-4 text-gray-900 dark:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                    <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                  </svg>
                </button>
              )}
              {status === 'downloading' && (
                <div className="w-8 h-8">
                  <CircularProgressWithLabel value={progress} />
                </div>
              )}
              {/* status === 'done' => no button shown, openPdf is triggered by container click */}
            </div>
          </div>
        </div>

        {/* Delivered Status */}
        {isOwnMessage&&(
        <div className="flex justify-end items-center gap-1 text-xs text-gray-500 dark:text-gray-300 mt-1">
    
           <MessageStatusIcon status={status} />
        </div>)
        }
       
      </div>
    </div>
  );
}
