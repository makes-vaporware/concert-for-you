import { useState, useEffect } from "react";
import * as Tone from "tone";
import "./App.css";

import baseNote from "./assets/base_note.wav";
import jokeNote from "./assets/track78.wav";
import organSprite from "./assets/organ.png";
import dotH from "./assets/key_higher_0.png";
import arrowH from "./assets/key_higher_1.png";
import arrowDiagonalH from "./assets/key_higher_2.png";
import shiftH from "./assets/key_higher_3.png";
import dotL from "./assets/key_lower_0.png";
import arrowL from "./assets/key_lower_1.png";
import arrowDiagonalL from "./assets/key_lower_2.png";
import shiftL from "./assets/key_lower_3.png";

const SYMBOLS = [
  {
    id: "none",
    symbol: "●",
    higherSprite: dotH,
    lowerSprite: dotL,
    rotate: 0,
  },
  {
    id: "right",
    symbol: "→",
    higherSprite: arrowH,
    lowerSprite: arrowL,
    rotate: 270,
  },
  {
    id: "down-right",
    symbol: "↘",
    higherSprite: arrowDiagonalH,
    lowerSprite: arrowDiagonalL,
    rotate: 0,
  },
  {
    id: "down",
    symbol: "↓",
    higherSprite: arrowH,
    lowerSprite: arrowL,
    rotate: 0,
  },
  {
    id: "down-left",
    symbol: "↙",
    higherSprite: arrowDiagonalH,
    lowerSprite: arrowDiagonalL,
    rotate: 90,
  },
  {
    id: "left",
    symbol: "←",
    higherSprite: arrowH,
    lowerSprite: arrowL,
    rotate: 90,
  },
  {
    id: "up-left",
    symbol: "↖",
    higherSprite: arrowDiagonalH,
    lowerSprite: arrowDiagonalL,
    rotate: 180,
  },
  {
    id: "up",
    symbol: "↑",
    higherSprite: arrowH,
    lowerSprite: arrowL,
    rotate: 180,
  },
  {
    id: "shift-octave",
    symbol: "ꕷ",
    higherSprite: shiftH,
    lowerSprite: shiftL,
    rotate: 0,
  },
];

const PITCH_INTERVALS = {
  none: 0,
  right: 2,
  "down-right": 4,
  down: 5,
  "down-left": 7,
  left: 9,
  "up-left": 11,
  up: 12,
};

const App = () => {
  const [pressedKeys, setPressedKeys] = useState({
    arrowRight: false,
    arrowDown: false,
    arrowLeft: false,
    arrowUp: false,
    c: false,
    z: false,
    k: false,
  });
  const [currentNote, setCurrentNote] = useState("none");
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [jokeAudioBuffer, setJokeAudioBuffer] = useState(null);
  const [isJokeLoaded, setIsJokeLoaded] = useState(false);

  useEffect(() => {
    let buffer = null;
    const loadBuffer = async () => {
      try {
        buffer = new Tone.ToneAudioBuffer(baseNote, () => {
          setAudioBuffer(buffer);
          setIsLoaded(true);
        });
      } catch (error) {
        console.error("Error loading buffer:", error);
      }
    };

    let jokeBuffer = null;
    const loadJokeBuffer = async () => {
      try {
        jokeBuffer = new Tone.ToneAudioBuffer(jokeNote, () => {
          setJokeAudioBuffer(jokeBuffer);
          setIsJokeLoaded(true);
        });
      } catch (error) {
        console.error("Error loading buffer:", error);
      }
    };

    loadBuffer();
    loadJokeBuffer();

    return () => {
      if (buffer) {
        buffer.dispose();
      }
      if (jokeBuffer) {
        jokeBuffer.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const { arrowRight, arrowDown, arrowLeft, arrowUp } = pressedKeys;

    const getCurrentNote = () => {
      if (arrowRight && arrowDown) return "down-right";
      else if (arrowLeft && arrowDown) return "down-left";
      else if (arrowLeft && arrowUp) return "up-left";
      else if (arrowRight) return "right";
      else if (arrowDown) return "down";
      else if (arrowLeft) return "left";
      else if (arrowUp) return "up";
      else return "none";
    };

    setCurrentNote(getCurrentNote());
  }, [pressedKeys]);

  useEffect(() => {
    const playNote = () => {
      if (!isLoaded || !audioBuffer) {
        console.log("Z buffer not loaded yet");
        return;
      }

      const pitchShift = pressedKeys.c
        ? PITCH_INTERVALS[currentNote] - 12
        : PITCH_INTERVALS[currentNote];

      const playbackRate = Math.pow(2, pitchShift / 12);

      const player = new Tone.Player({
        url: audioBuffer,
        playbackRate: playbackRate,
      }).toDestination();

      player.start();

      setTimeout(() => {
        player.dispose();
      }, 1500);
    };

    const playJokeNote = () => {
      if (!isJokeLoaded || !jokeAudioBuffer) {
        console.log("K buffer not loaded yet");
        return;
      }

      const player = new Tone.Player(jokeAudioBuffer).toDestination();

      player.start();

      setTimeout(() => {
        player.dispose();
      }, 3000);
    };

    const handleKeyDown = (e) => {
      if (e.key.includes("Arrow")) {
        e.preventDefault();
      }

      if (
        ![
          "arrowright",
          "arrowdown",
          "arrowleft",
          "arrowup",
          "z",
          "c",
          "k",
        ].includes(e.key.toLowerCase())
      )
        return;

      if (e.key === "ArrowRight" && !pressedKeys.arrowRight) {
        setPressedKeys((prev) => ({ ...prev, arrowRight: true }));
      } else if (e.key === "ArrowDown" && !pressedKeys.arrowDown) {
        setPressedKeys((prev) => ({ ...prev, arrowDown: true }));
      } else if (e.key === "ArrowLeft" && !pressedKeys.arrowLeft) {
        setPressedKeys((prev) => ({ ...prev, arrowLeft: true }));
      } else if (e.key === "ArrowUp" && !pressedKeys.arrowUp) {
        setPressedKeys((prev) => ({ ...prev, arrowUp: true }));
      } else if (e.key.toLowerCase() === "c" && !pressedKeys.c) {
        setPressedKeys((prev) => ({ ...prev, c: true }));
      } else if (e.key.toLowerCase() === "z" && !pressedKeys.z) {
        setPressedKeys((prev) => ({ ...prev, z: true }));
        playNote();
      } else if (e.key.toLowerCase() === "k" && !pressedKeys.k) {
        setPressedKeys((prev) => ({ ...prev, k: true }));
        playJokeNote();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key.includes("Arrow")) {
        e.preventDefault();
      }

      if (
        ![
          "arrowright",
          "arrowdown",
          "arrowleft",
          "arrowup",
          "z",
          "c",
          "k",
        ].includes(e.key.toLowerCase())
      )
        return;

      if (e.key === "ArrowRight") {
        setPressedKeys((prev) => ({ ...prev, arrowRight: false }));
      } else if (e.key === "ArrowDown") {
        setPressedKeys((prev) => ({ ...prev, arrowDown: false }));
      } else if (e.key === "ArrowLeft") {
        setPressedKeys((prev) => ({ ...prev, arrowLeft: false }));
      } else if (e.key === "ArrowUp") {
        setPressedKeys((prev) => ({ ...prev, arrowUp: false }));
      } else if (e.key.toLowerCase() === "c") {
        setPressedKeys((prev) => ({ ...prev, c: false }));
      } else if (e.key.toLowerCase() === "z") {
        setPressedKeys((prev) => ({ ...prev, z: false }));
      } else if (e.key.toLowerCase() === "k") {
        setPressedKeys((prev) => ({ ...prev, k: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    pressedKeys,
    currentNote,
    audioBuffer,
    isLoaded,
    jokeAudioBuffer,
    isJokeLoaded,
  ]);

  return (
    <>
      <div className="program-window-border">
        <div className="program-window-title-bar">
          <div className="program-window-info">
            <img
              src={organSprite}
              alt="program icon"
              className="program-window-icon"
            />
            <span>concertforyou.exe</span>
          </div>
          <div className="program-window-quit">
            <span>×</span>
          </div>
        </div>
        <div className="program-window-inner">
          <div className="symbols-box">
            {SYMBOLS.map((symbol, index) => (
              <img
                key={symbol.id}
                src={pressedKeys.c ? symbol.lowerSprite : symbol.higherSprite}
                className={`sprite symbol ${
                  currentNote === symbol.id ||
                  (symbol.id === "shift-octave" && pressedKeys.c)
                    ? "active"
                    : ""
                }`}
                style={{
                  "--i": `${index}`,
                  "--rotation": `${symbol.rotate}deg`,
                }}
                alt={symbol.symbol}
              />
            ))}
          </div>
          <img src={organSprite} className="sprite" alt="Organ" />
          <div className="info-box">
            <p>[Z]:Play</p>
            <p>[C]:Shift Octave</p>
            <p>[K]:Kris</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
