import React from 'react';
import './App.css';
import './index.css';
import {Home} from './components/Home'
import {About} from './components/About'
import {Routes, Route} from "react-router-dom";
export const App = () => {
    return (
        <div className="App">
            <h1>Welcome to React Router!</h1>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="about" element={<About/>}/>
            </Routes>
        </div>
    );
}
