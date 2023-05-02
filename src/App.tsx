import React from 'react';
import logo from './logo.svg';
import './App.css';
import Game from './Game';

function App() {
    return (
        <Game gameSize={{ w: 10, h: 10}} snakeStartLength={3}/>
    );
}

export default App;
