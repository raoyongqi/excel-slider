
import React from 'react';
import FeatureImportanceChart from '../components/FeatureImportanceChart';


function ModelDisplay() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Random Forest Feature Importances</h1>
            </header>
            <FeatureImportanceChart />
        </div>
    );
}

export default ModelDisplay;
