import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from '../components/FileUpload2';
import ColumnSelector from '../components/ColumnSelector';


function SelectColumns() {
    const [columns, setColumns] = useState([]);
    const [filename, setFilename] = useState('');

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload_select', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setColumns(response.data.columns);
            setFilename(response.data.filename);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDownload = async (selectedColumns) => {
        const formData = new FormData();
        formData.append('filename', filename);
        formData.append('columns', selectedColumns.join(','));

        try {
            const response = await axios.post('http://localhost:8000/download_select', formData, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `selected_${filename}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <div className="App">
            <h1>CSV Column Selector</h1>
            <FileUpload onFileUpload={handleFileUpload} />
            {columns.length > 0 && (
                <ColumnSelector columns={columns} onDownload={handleDownload} />
            )}
        </div>
    );
}

export default SelectColumns;
