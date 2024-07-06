import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Router>
            <div className="app">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <MainContent isSidebarOpen={isSidebarOpen} />
            </div>
        </Router>
    );
};

export default App;
