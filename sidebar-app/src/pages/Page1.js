
import React, { useState } from 'react';
import './Page1.css';
import FileUpload from '../components/FileUpload';

function Page1() {
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

export default Page1;