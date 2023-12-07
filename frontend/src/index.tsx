import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Score from './Score';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Wrapping App with a div as a container
root.render(
  <React.StrictMode>
    <div className="container">
      <h1>React BabylonJS</h1>
      <div className="content">
        <div className="app-container">
          <App />
        </div>
        <div className="sidebar">
          <h2>LeaderBoard</h2>
          <Score name="Player 1" score={100} />
        </div>
      </div>
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
