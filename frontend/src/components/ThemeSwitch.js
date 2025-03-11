import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import '../assets/css/ThemeSwitch.css';

const ThemeSwitch = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-switch-wrapper">
      <span className="theme-switch-icon">
        {darkMode ? '🌙' : '☀️'}
      </span>
      <label className="theme-switch">
        <input 
          type="checkbox" 
          checked={darkMode} 
          onChange={toggleTheme} 
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ThemeSwitch;