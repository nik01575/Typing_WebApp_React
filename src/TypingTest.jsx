import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import paragraphs from "../paragraph";

const TypingTest = () => {
  const maxTime = 60; // Set maximum time
  const [text, setText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Load a random paragraph
  const loadRandomParagraph = () => {
    clearInterval(timerRef.current);
    if (paragraphs.length === 0) {
      console.error("No paragraphs available");
      return;
    }
    setText(paragraphs[Math.floor(Math.random() * paragraphs.length)]);
    setCharIndex(0);
    setMistakes(0);
    setTimeLeft(maxTime);
    setIsTyping(false);
    setWpm(0);
    setCpm(0);
    setIsGameOver(false);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  // Start timer when user starts typing
  useEffect(() => {
    if (isTyping && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsGameOver(true);
            setIsTyping(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTyping, timeLeft]);

  // Update WPM dynamically every second
  useEffect(() => {
    if (isTyping && (maxTime - timeLeft) > 0) {
      setWpm(Math.round((((charIndex - mistakes) / 5) / ((maxTime - timeLeft) / 60)) || 0));
    }
  }, [charIndex, mistakes, timeLeft, isTyping]);

  // Handle user typing
  const handleTyping = (event) => {
    if (isGameOver) return;
    const typedValue = event.target.value;
    const textArray = text.split("");
    if (!isTyping && timeLeft > 0) {
      setIsTyping(true);
    }
    let newMistakes = 0;
    let correctChars = 0;
    for (let i = 0; i < typedValue.length; i++) {
      if (typedValue[i] === textArray[i]) {
        correctChars++;
      } else {
        newMistakes++;
      }
    }
    setCharIndex(typedValue.length);
    setMistakes(newMistakes);
    setCpm(correctChars);
  };

  // Reset game
  const resetGame = () => {
    loadRandomParagraph();
    setIsTyping(false); // Ensure isTyping is reset
  };

  // Load paragraph on mount
  useEffect(() => {
    loadRandomParagraph();
  }, []);

  return (
    <div className="wrapper">
      <input
        type="text"
        ref={inputRef}
        className="input-field"
        onChange={handleTyping}
        autoFocus
        disabled={isGameOver}
      />
      <div className="content-box">
        <div className="typing-text">
          <p>
            {text.split("").map((char, index) => {
              const typedValue = inputRef.current?.value || "";
              return (
                <span
                  key={index}
                  className={
                    index < typedValue.length
                      ? char === typedValue[index]
                        ? "correct"
                        : "incorrect"
                      : index === typedValue.length
                      ? "active"
                      : ""
                  }
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>
        <div className="content">
          <ul className="result-details">
            <li className="time">
              <p>Time Left :</p>
              <span>
                <b>{timeLeft}</b>s
              </span>
            </li>
            <li className="mistake">
              <p>Mistakes :</p>
              <span>
                <b>{mistakes}</b>
              </span>
            </li>
            <li className="wpm">
              <p>WPM :</p>
              <span>
                <b>{wpm}</b>
              </span>
            </li>
            <li className="cpm">
              <p>CPM :</p>
              <span>
                <b>{cpm}</b>
              </span>
            </li>
          </ul>
          <button onClick={resetGame}>Try Again</button>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
