"use client"; 

import { useState, useRef, useEffect } from "react";

export const VideoPlayer = ({ selectedMedia, updateSelectedMedia }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  
  const handlePlayPause = () => {
    if (!selectedMedia || !videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.currentTime = selectedMedia.startTime ?? 0; 
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

 
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      if (selectedMedia?.endTime && video.currentTime >= selectedMedia.endTime) {
        video.pause();
        setIsPlaying(false);
      }
    };

    video.addEventListener("timeupdate", updateTime);
    return () => video.removeEventListener("timeupdate", updateTime);
  }, [selectedMedia]);

  return (
    <div className="w-full flex flex-col items-center">
       <div>
    
    </div>
      {selectedMedia && selectedMedia.type === "video" ? (
        <>
          <video
            ref={videoRef}
            src={selectedMedia.url}
            className="w-[80%] max-w-3xl rounded-lg shadow-lg"
            controls
          />
          <button
            onClick={handlePlayPause}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </>
      ) : (
        <p className="text-gray-500">No video selected</p>
      )}
    </div>
  );
};
