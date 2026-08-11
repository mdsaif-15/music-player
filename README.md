# Pulse — React Music Player

A production-minded React 18+ music player built for the supplied final-assignment requirements.

## Stack

- React 18+
- Vite
- HTML5 Audio API
- React hooks: `useState`, `useRef`, `useEffect`
- CSS
- Git/GitHub ready

## Features

- Play / pause
- Previous / next
- Clickable and draggable progress bar
- Current time and duration in `MM:SS`
- Automatic next-track playback
- Volume control
- Scrollable playlist with direct track selection
- Keyboard shortcuts:
  - `Space` — play/pause
  - `ArrowLeft` — previous track
  - `ArrowRight` — next track
- Responsive layout for 375px+ screens
- No external state library

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Add the 7 songs

Put seven MP3 files in:

```text
public/audio/
```

with these exact names:

```text
track-01.mp3
track-02.mp3
track-03.mp3
track-04.mp3
track-05.mp3
track-06.mp3
track-07.mp3
```

The app already contains the seven-track data layer and will load those files from `/audio/...`.

## Build

```bash
npm run build
npm run preview
```

Before submission, verify all seven MP3s play successfully and the browser console is clean.

## Assignment alignment

The implementation uses:
- native `<audio>` through `useRef`
- `onTimeUpdate` rather than a timer for progress
- an `isSeeking` ref so dragging does not fight `timeupdate`
- explicit user actions for playback
- at least 3 reusable components
- React-only state management
