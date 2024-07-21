
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import DataPreview from '../pages/DataPreview';
import SelectTable from '../pages/SelectTable';
import SelectColumns from '../pages/SelectColumns';
import UploadFeatures from '../pages/UploadFeatures';
import UploadLabels from '../pages/UploadLabels';
import ModelDisplay from '../pages/ModelDisplay';
import BoxPlotFeatures from '../pages/BoxPlotFeatures';
import BoxPlotLabels from '../pages/BoxPlotLabels'
import './MainContent.css';

const App = () => {
    return (
                <div className="content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/data-preview" element={<DataPreview />} />
                <Route path="/select-table"  element={<SelectTable />} />
                <Route path="/select-columns"  element={<SelectColumns />} />
                <Route path="/upload-features" element={<UploadFeatures />} />
                <Route path="/upload-labels" element={<UploadLabels />} />            
                <Route path="/boxplot-features" element={<BoxPlotFeatures/>} />
                <Route path="/boxplot-labels" element={<BoxPlotLabels/>} />
                <Route path="/model-display"  element={<ModelDisplay />} />
                {/* 添加更多路由 */}
            </Routes>
        </div>

    );
};

export default App;
