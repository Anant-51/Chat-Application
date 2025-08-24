 import React, { useEffect, useRef, useState } from 'react';
 import Wave from '@wave-studios/wavejs';


 


const ChatAudioBubble = ({ username, timestamp, audioUrl }) => {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [isAudioReady, setIsAudioReady] = useState(false);

  const waveInstance = useRef(null);

  useEffect(() => {
    if (audioRef.current && waveformRef.current) {
      waveInstance.current = new Wave(audioRef.current, waveformRef.current, {
        type: 'bars',
        colors: ['#3B82F6'],
        barWidth: 2,
        barHeight: 1,
        barSpacing: 1,
      });
    }
     return () => {
    waveInstance.current?.clear(); // Prevent memory leaks
  };
  }, []);
  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);

  return () => {
    audio.removeEventListener('play', onPlay);
    audio.removeEventListener('pause', onPause);
  };
}, []);

   const handleDownload = async () => {
    setDownloadStatus('downloading');
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = audioUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up the URL
      setDownloadStatus('done');
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('idle');
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    
    } else {
      audio.pause();

    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.currentTime));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setDuration('0:00');
  };

  return (
    <div className="flex items-start gap-2.5 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-md">
      <img className="w-8 h-8 rounded-full" src="/path-to-avatar.jpg" alt={`${username} avatar`} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{username}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</span>
        </div>
        <div className="flex items-center gap-2">
        <button
         onClick={togglePlayback}
         disabled={!isAudioReady}
         className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 focus:outline-none flex items-center justify-center w-8 h-8"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
       >
     {isPlaying ? (
    // Pause icon - 2 vertical bars
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="white"
      className="w-4 h-4"
    >
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  ) : (
    // Play icon - right-pointing triangle
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="white"
      className="w-4 h-4"
    >
      <polygon points="8,5 19,12 8,19" />
    </svg>
  )}
</button>
          <div ref={waveformRef} className="w-[150px] h-[40px]" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{duration}</span>
            {downloadStatus !== 'done' && (
            <button
              onClick={handleDownload}
              disabled={downloadStatus === 'downloading'}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 focus:outline-none"
              title="Download"
            >
              {downloadStatus === 'downloading' ? (
                // spinner svg
                <svg
                  className="animate-spin h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l4-4-4-4v4a12 12 0 100 24v-4l-4 4 4 4v-4a8 8 0 01-8-8z"
                  />
                </svg>
              ) : (
                // download arrow svg
                <svg
                  className="h-5 w-5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 18"
                >
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
          )}

      
        </div>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onCanPlay={() => setIsAudioReady(true)}
          
        />
      </div>
    </div>
  );
};

export default ChatAudioBubble;

  
