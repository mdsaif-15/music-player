import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from "lucide-react";
import "./styles.css";

const TRACKS = [
  { id: 1, title: "Midnight Drive", artist: "Pulse Sessions", src: "/audio/track-01.mp3", accent: "01" },
  { id: 2, title: "Neon Skies", artist: "Pulse Sessions", src: "/audio/track-02.mp3", accent: "02" },
  { id: 3, title: "Ocean Lights", artist: "Pulse Sessions", src: "/audio/track-03.mp3", accent: "03" },
  { id: 4, title: "Afterglow", artist: "Pulse Sessions", src: "/audio/track-04.mp3", accent: "04" },
  { id: 5, title: "City Echoes", artist: "Pulse Sessions", src: "/audio/track-05.mp3", accent: "05" },
  { id: 6, title: "Slow Motion", artist: "Pulse Sessions", src: "/audio/track-06.mp3", accent: "06" },
  { id: 7, title: "Golden Hour", artist: "Pulse Sessions", src: "/audio/track-07.mp3", accent: "07" }
];

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function TrackArtwork({ track, large = false }) {
  return (
    <div className={`artwork ${large ? "artwork-large" : ""}`} aria-hidden="true">
      <span>{track.accent}</span>
      <div className="artwork-orb" />
    </div>
  );
}

function ProgressBar({ currentTime, duration, isSeeking, setIsSeeking, onSeek }) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const seekValue = currentTime;

  const handleChange = (event) => {
    setIsSeeking(true);
    onSeek(Number(event.target.value), false);
  };

  const handleRelease = (event) => {
    onSeek(Number(event.currentTarget.value), true);
    setIsSeeking(false);
  };

  return (
    <div className="progress-wrap">
      <input
        className="progress"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={seekValue}
        onChange={handleChange}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        onKeyUp={(event) => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            onSeek(Number(event.currentTarget.value), true);
            setIsSeeking(false);
          }
        }}
        aria-label="Seek through current track"
        style={{ "--progress": `${progress}%` }}
      />
    </div>
  );
}

function Controls({ isPlaying, onToggle, onPrevious, onNext }) {
  return (
    <div className="controls" aria-label="Playback controls">
      <button className="icon-button secondary" onClick={onPrevious} aria-label="Previous track">
        <SkipBack size={20} fill="currentColor" />
      </button>
      <button className="play-button" onClick={onToggle} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
      </button>
      <button className="icon-button secondary" onClick={onNext} aria-label="Next track">
        <SkipForward size={20} fill="currentColor" />
      </button>
    </div>
  );
}

function Playlist({ tracks, currentTrackId, onSelect }) {
  return (
    <aside className="playlist-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Your queue</span>
          <h2>Playlist</h2>
        </div>
        <span className="track-count">{tracks.length} tracks</span>
      </div>

      <div className="playlist" role="list">
        {tracks.map((track, index) => {
          const active = track.id === currentTrackId;
          return (
            <button
              className={`track-row ${active ? "active" : ""}`}
              key={track.id}
              onClick={() => onSelect(index)}
              role="listitem"
              aria-current={active ? "true" : undefined}
            >
              <TrackArtwork track={track} />
              <span className="track-copy">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              <span className="track-number">{String(index + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function Player({ tracks }) {
  const audioRef = useRef(null);
  const isSeekingRef = useRef(false);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loadError, setLoadError] = useState("");

  const currentTrack = tracks[trackIndex];

  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setIsPlaying(true);
      setLoadError("");
    } catch {
      setIsPlaying(false);
      setLoadError("Add the seven MP3 files to public/audio to start playback.");
    }
  }, []);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) pauseAudio();
    else playAudio();
  }, [isPlaying, pauseAudio, playAudio]);

  const changeTrack = useCallback(
    async (nextIndex, shouldPlay = true) => {
      const normalizedIndex = (nextIndex + tracks.length) % tracks.length;
      const audio = audioRef.current;

      setTrackIndex(normalizedIndex);
      setCurrentTime(0);
      setDuration(0);
      setLoadError("");

      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;

      if (shouldPlay) {
        try {
          audio.load();
          await audio.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
          setLoadError("Add the seven MP3 files to public/audio to start playback.");
        }
      } else {
        setIsPlaying(false);
      }
    },
    [tracks.length]
  );

  const handleSeek = (value, commit) => {
    if (!audioRef.current) return;

    setCurrentTime(value);

    if (commit) {
      audioRef.current.currentTime = value;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      if (!isSeekingRef.current) setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      changeTrack(trackIndex + 1, true);
    };
    const onError = () => {
      setLoadError("This track could not be loaded. Check public/audio and the filename.");
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [changeTrack, trackIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select", "button"].includes(tag)) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      } else if (event.key === "ArrowRight") {
        changeTrack(trackIndex + 1, true);
      } else if (event.key === "ArrowLeft") {
        changeTrack(trackIndex - 1, true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeTrack, togglePlayback, trackIndex]);

  useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  const handleVolume = (event) => {
    const value = Number(event.target.value);
    setVolume(value);
  };

  return (
    <main className="app-shell">
      <audio ref={audioRef} src={currentTrack.src} preload="metadata" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><span /></div>
          <div>
            <strong>Pulse</strong>
            <small>Music Player</small>
          </div>
        </div>
        <div className="keyboard-hint">
          <span>SPACE</span> Play / Pause
          <span>←</span><span>→</span> Navigate
        </div>
      </header>

      <section className="hero-grid">
        <section className="player-card">
          <div className="now-playing-label">
            <span className="live-dot" /> NOW PLAYING
          </div>

          <TrackArtwork track={currentTrack} large />

          <div className="track-details">
            <span className="track-index">TRACK {String(trackIndex + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}</span>
            <h1>{currentTrack.title}</h1>
            <p>{currentTrack.artist}</p>
          </div>

          <div className="timeline">
            <div className="time-row">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              isSeeking={isSeeking}
              setIsSeeking={setIsSeeking}
              onSeek={handleSeek}
            />
          </div>

          <Controls
            isPlaying={isPlaying}
            onToggle={togglePlayback}
            onPrevious={() => changeTrack(trackIndex - 1, true)}
            onNext={() => changeTrack(trackIndex + 1, true)}
          />

          <div className="volume-control">
            <button
              className="volume-icon"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              aria-label={volume > 0 ? "Mute" : "Unmute"}
            >
              {volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <input
              className="volume-range"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              aria-label="Volume"
            />
          </div>

          {loadError && <p className="error-message" role="alert">{loadError}</p>}
        </section>

        <Playlist
          tracks={tracks}
          currentTrackId={currentTrack.id}
          onSelect={(index) => changeTrack(index, true)}
        />
      </section>

      <footer className="footer">
        <span><ListMusic size={15} /> React + HTML5 Audio API</span>
        <span>7-track curated playlist</span>
      </footer>
    </main>
  );
}

function App() {
  return <Player tracks={TRACKS} />;
}

createRoot(document.getElementById("root")).render(<App />);
