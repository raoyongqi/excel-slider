
import React, { useState } from 'react';
import './DataPreview.css';
import FileUpload from '../components/FileUpload';

function DataPreview() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Excel Upload App</h1>
            </header>
            <main>
                <FileUpload />
            </main>
        </div>
    );
}

export default DataPreview;