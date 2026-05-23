

import { useRef, useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import WaveSurfer from "wavesurfer.js";

export default function VoiceMessage({ src, duration }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true; 

    const wave = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#ccc",
      progressColor: "#4caf50",
      height: 40,
      barWidth: 2,
      responsive: true,
    });

    waveRef.current = wave;

    const safeLoad = async () => {
      try {
        await wave.load(src);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    safeLoad();

    wave.on("audioprocess", () => {
      if (isMounted) setCurrentTime(wave.getCurrentTime());
    });

    wave.on("ready", () => {
      if (isMounted) setAudioDuration(wave.getDuration());
    });

    wave.on("finish", () => {
      if (isMounted) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    return () => {
      isMounted = false; 
      if (waveRef.current) waveRef.current.destroy();
    };
  }, [src]);

  const togglePlay = () => {
    if (!waveRef.current) return;
    try {
      waveRef.current.playPause();
      setIsPlaying((prev) => !prev);
    } catch (err) {
      if (err.name !== "AbortError") console.error(err);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      <IconButton
        onClick={togglePlay}
        sx={{ bgcolor: "#eee", "&:hover": { bgcolor: "#ddd" }, width: 36, height: 36 }}
      >
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      <Box sx={{ flex: 1 }}>
        {/* 🌊 Waveform */}
        <div ref={containerRef} />
        <Typography sx={{ fontSize: 12, color: "#555" }}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </Typography>
      </Box>
    </Box>
  );
}