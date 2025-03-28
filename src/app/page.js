"use client";
import { useState, useEffect, useRef } from "react";
import { Image, Video, Music, Type, Layers, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function Home() {
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const resizingRef = useRef(null);
  const draggingRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);  

  const timerRef = useRef(null);

  // Handle Play and Pause
  const handlePlayPause = () => {
    if (!selectedMedia) return;
  
    if (selectedMedia.type === "video") {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = selectedMedia.startTime || 0;
        videoRef.current.play();
      }
    } else if (selectedMedia.type === "image") {
      setCurrentTime(selectedMedia.startTime || 0); // Start time for image
      setIsPlaying(true);
    }
  
    setIsPlaying(!isPlaying);
  };
  

  // Time update mechanism
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  // Remove media when end time is reached
  useEffect(() => {
    setMedia((prevMedia) => prevMedia.filter((item) => currentTime < item.endTime));

    if (selectedMedia && currentTime >= selectedMedia.endTime) {
      setIsPlaying(false);
    }
  }, [currentTime]);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("audio/")
      ? "audio"
      : "unknown";

    if (type === "unknown") {
      alert("Unsupported file type!");
      return;
    }

    const newMedia = {
      id: Date.now(),
      type,
      url,
      size: { width: 320, height: 240 },
      position: { left: 100, top: 100 },
    };

    setMedia((prev) => [...prev, newMedia]);
    setSelectedMedia(newMedia);
    setFilter("all");
  };

  // Update selected media properties
  const updateSelectedMedia = (property, value) => {
    if (!selectedMedia) return;
    setMedia((prev) =>
      prev.map((m) => (m.id === selectedMedia.id ? { ...m, [property]: value } : m))
    );
    setSelectedMedia((prev) => ({ ...prev, [property]: value }));
  };

  // Resize handlers
  const handleMouseDownResize = (e, item) => {
    e.stopPropagation();
    resizingRef.current = {
      item,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: item.size.width,
      startHeight: item.size.height,
    };
    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveResize = (e) => {
    if (!resizingRef.current) return;
    const { startX, startY, startWidth, startHeight } = resizingRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    updateSelectedMedia("size", { width: startWidth + dx, height: startHeight + dy });
  };

  // Drag handlers
  const handleMouseDownDrag = (e, item) => {
    e.stopPropagation();
    draggingRef.current = {
      item,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: item.position.left,
      startTop: item.position.top,
    };
    document.addEventListener("mousemove", handleMouseMoveDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveDrag = (e) => {
    if (!draggingRef.current) return;
    const { startX, startY, startLeft, startTop } = draggingRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    updateSelectedMedia("position", { left: startLeft + dx, top: startTop + dy });
  };

  const handleMouseUp = () => {
    resizingRef.current = null;
    draggingRef.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mousemove", handleMouseMoveDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  

  return (
    <div className="flex h-screen bg-background">
      <div className="w-[72px] border-r flex flex-col items-center py-4 gap-4">
        <Separator className="w-8" />
        {[{ Icon: Image, type: "image" }, { Icon: Video, type: "video" }, { Icon: Music, type: "audio" }, { Icon: Type, type: "text" }, { Icon: Layers, type: "all" }].map(({ Icon, type }, idx) => (
          <Button key={idx} variant="ghost" size="icon" className="rounded-lg" onClick={() => setFilter(type)}>
         <Icon className={`w-5 h-5 ${filter === type ? "text-blue-500" : ""}`} />


          </Button>
        ))}
      </div>

      <div className="w-64 border-r p-4 flex flex-col gap-4">
        <input type="file" accept="image/,video/,audio/*" onChange={handleFileUpload} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="border-2 border-dashed border-gray-300 rounded-lg w-full h-32 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100">
          Drag & Drop files here or <span className="text-blue-500 underline">Browse</span>
        </label>
        {selectedMedia && (
          <div className="flex flex-col gap-2">
            <p>Resize Image:</p>
            <div className="flex gap-2">
              <Button onClick={() => updateSelectedMedia("size", { ...selectedMedia.size, width: selectedMedia.size.width + 10 })}>+ Width</Button>
              <Button onClick={() => updateSelectedMedia("size", { ...selectedMedia.size, width: selectedMedia.size.width - 10 })}>- Width</Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => updateSelectedMedia("size", { ...selectedMedia.size, height: selectedMedia.size.height + 10 })}>+ Height</Button>
              <Button onClick={() => updateSelectedMedia("size", { ...selectedMedia.size, height: selectedMedia.size.height - 10 })}>- Height</Button>
            </div>
          </div>
        )}
{selectedMedia && (
  <div className="mt-4">
    {/* ✅ Show Time for Video/Audio Only */}
    {["image","audio", "video"].includes(selectedMedia.type)  && (
      <p>Time: {currentTime.toFixed(1)}s / {selectedMedia.endTime ?? "N/A"}s</p>
    )}

    {/* ✅ UI Section - No Video Display */}
    {selectedMedia.type === "image" ? (
      <p className="text-gray-500"></p>
    ) : (
      <p className="text-gray-500"></p>
    )}

    {/* ✅ Play/Pause Button (Controls Video in Canvas) */}
    {["image", "audio", "video"].includes(selectedMedia.type) && (
  <div className="fixed bottom-0 w-full bg-gray-900 p-4 flex flex-col items-center">
    <p className="text-white text-sm">
      Time: {currentTime.toFixed(1)}s / {selectedMedia.endTime}s
    </p>

    <button onClick={handlePlayPause} className="mt-2 p-2 bg-blue-500 text-white rounded">
      {isPlaying ? "Pause" : "Play"}
    </button>

    {isPlaying && (
      <div className="w-full bg-gray-700 h-1 mt-2 relative">
        <div
          className="absolute left-0 top-0 h-1 bg-blue-500"
          style={{ width: `${(currentTime / selectedMedia.endTime) * 100}%` }}
        />
      </div>
    )}
  </div>
)}


    {/* ✅ Start & End Time Inputs for Video/Audio Only */}
    {["image","audio", "video"].includes(selectedMedia.type) && (
  <div className="flex items-center gap-2 mt-2">
    <div>
      <label className="text-sm">Start:</label>
      <input
        type="number"
        className="border rounded px-2 py-1 w-20"
        value={selectedMedia.startTime ?? 0}
        min="0"
        max={selectedMedia.endTime ? selectedMedia.endTime - 1 : "100"}
        onChange={(e) => {
          const newStartTime = Math.max(
            0,
            Math.min(selectedMedia.endTime ? selectedMedia.endTime - 1 : 100, Number(e.target.value))
          );
          updateSelectedMedia("startTime", newStartTime);
        }}
      />
    </div>

    <div>
      <label className="text-sm">End:</label>
      <input
        type="number"
        className="border rounded px-2 py-1 w-20"
        value={selectedMedia.endTime ?? 10}
        min={selectedMedia.startTime ? selectedMedia.startTime + 1 : 1}
        max="1000"
        onChange={(e) => {
          const newEndTime = Math.max(
            selectedMedia.startTime ? selectedMedia.startTime + 1 : 1,
            Number(e.target.value)
          );
          updateSelectedMedia("endTime", newEndTime);
        }}
      />
    </div>
  </div>
)}

  </div>
)}
 </div>
 <div className="flex flex-col w-full h-[85.55%]  bg-red-400">
 <div className="bg-green-900 text-white p-4">
  <nav className="flex justify-between items-center">
    {/* Project Name (Left Side) */}
    <h1 className="text-2xl font-bold">My Project</h1>

    {/* Center Right - Sign In & Sign Up */}
    <div className="flex space-x-4">
      <button className="px-4 py-2 bg-transparent border border-white rounded-lg hover:bg-white hover:text-green-900 transition">
        Sign In
      </button>
      <button className="px-4 py-2 bg-white text-green-900 rounded-lg hover:bg-gray-300 transition">
        Sign Up
      </button>
    </div>

    {/* Rightmost - Done Button */}
    <button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
      Done
    </button>
  </nav>
</div>


      <div className="flex-1 bg-black relative ">
       
  {media.map((item) => (
    <div
      key={item.id}
      className="absolute border border-white cursor-move"
      style={{
        width: item.size.width,
        height: item.size.height,
        left: item.position.left,
        top: item.position.top,
      }}
      onMouseDown={(e) => handleMouseDownDrag(e, item)}
    >
      {/* Display Images */}
      {item.type === "image" && <img src={item.url} alt="Media" className="w-full h-full" />}
      {item.type === "video" && <video ref={videoRef} className="w-full h-full" src={item.url} />}
      {/* Display Videos */}
      {/* {item.type === "video" && (
        <video controls className="w-full h-full">
          <source src={item.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )} */}

      {/* Display Audio */}
      {item.type === "audio" && (
        <audio controls className="w-full">
          <source src={item.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      {selectedMedia?.type === "video" && (
          <div className="fixed bottom-0 w-full bg-gray-900 p-4 flex flex-col items-center">
            <button onClick={handlePlayPause} className="mt-2 p-2 bg-blue-500 text-white rounded">
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        )}

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-gray-500 cursor-se-resize"
        onMouseDown={(e) => handleMouseDownResize(e, item)}
      ></div>
    </div>
  ))}
</div>
</div>
    </div>
  );
}