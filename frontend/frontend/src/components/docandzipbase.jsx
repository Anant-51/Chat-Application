import { useState } from 'react';
import CircularProgressWithLabel from './CircularProgressWithLabel';

function FileMessageBase({ sender, time, fileName, fileSize, fileUrl, icon }) {
  const [status, setStatus] = useState('idle'); // idle | downloading | done
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleDownload = async () => {
    setStatus('downloading');
    try {
      const res = await fetch(fileUrl);
      const reader = res.body.getReader();
      const total = fileSize;
      let received = 0, chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setProgress(Math.round((received / total) * 100));
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Trigger save to disk
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatus('done');
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const handleOpen = () => {
    if (downloadUrl) window.open(downloadUrl, '_blank');
  };

  return (
    <div className="flex items-start gap-2.5">
      <img className="w-8 h-8 rounded-full" src={icon} alt={`${fileName} icon`} />
      <div className="flex flex-col gap-1 w-full max-w-[320px]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-900 dark:text-white">{sender}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
        </div>

        <div
          onClick={status === 'done' ? handleOpen : undefined}
          className={`flex items-center justify-between p-3 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-${status === 'done' ? 'pointer' : 'auto'}`}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{fileSize}</div>
          </div>
          <div>
            {status === 'idle' && (
              <button onClick={handleDownload} className="p-2 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500">
                ⬇️
              </button>
            )}
            {status === 'downloading' && <CircularProgressWithLabel value={progress} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileMessageBase;
