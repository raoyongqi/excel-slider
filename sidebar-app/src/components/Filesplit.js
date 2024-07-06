import React, { useState } from 'react';
import axios from 'axios';

function FileSplit() {
    const [columns, setColumns] = useState([]);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);

    const handleFileChange = async (event) => {
        const files = event.target.files;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const response = await axios.post('http://localhost:8000/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        setColumns(response.data[Object.keys(response.data)[0]].columns);
        setFileUploaded(true);
    };

    const handleColumnChange = (event) => {
        const value = event.target.value;
        setSelectedColumns(
            selectedColumns.includes(value)
                ? selectedColumns.filter((col) => col !== value)
                : [...selectedColumns, value]
        );
    };

    const handleDownload = async () => {
        const formData = new FormData();
        formData.append('columns', selectedColumns.join(','));

        const response = await axios.post('http://localhost:8000/download/', formData, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'selected_columns.xlsx');
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div>
            <input type="file" multiple onChange={handleFileChange} />
            {fileUploaded && (
                <div>
                    <h2>Select Columns</h2>
                    {columns.map((col) => (
                        <div key={col.key}>
                            <input
                                type="checkbox"
                                value={col.name}
                                onChange={handleColumnChange}
                            />
                            {col.name}
                        </div>
                    ))}
                    <button onClick={handleDownload}>Download</button>
                </div>
            )}
        </div>
    );
}

export default FileSplit;
