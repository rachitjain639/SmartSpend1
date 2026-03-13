import React, { useState } from 'react';

const ThemeToggle = () => {
    const [darkTheme, setDarkTheme] = useState(false);

    const toggleTheme = () => {
        setDarkTheme(!darkTheme);
        document.body.classList.toggle('dark', !darkTheme);
    };

    return (
        <button onClick={toggleTheme}>
            Switch to {darkTheme ? 'Light' : 'Dark'} Theme
        </button>
    );
};

export default ThemeToggle;