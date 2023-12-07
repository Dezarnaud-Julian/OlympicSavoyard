import React from 'react';
import './Score.css'; // You can create a separate CSS file for styling

interface ScoreProps {
  name: string;
  score: number;
}

const Score: React.FC<ScoreProps> = ({ name, score }) => {
  return (
    <div className="score-container">
      <div className="score-rectangle">
        <p className="score-name">{name}</p>
        <p className="score-value">{score}</p>
      </div>
    </div>
  );
};

export default Score;
