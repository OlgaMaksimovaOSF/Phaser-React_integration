import { useState } from 'react'
import {  BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'

import Connection from './components/connection/Connection.jsx';
import Controller from './components/controller/Controller.jsx';
import Screen from './components/screen/Screen.jsx';

function App() {

    return (
        <>
            <Router>
                <Routes>
                    <Route path='/screen/:gameId' element={<Screen />} />
                    <Route path='/controller/:gameId' element={<Controller />} />
                    <Route path='/' element={<Connection />} />
                </Routes>
            </Router>
        </>
    )
}

export default App
