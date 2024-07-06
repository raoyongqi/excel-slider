import React, { useState } from 'react';
import axios from 'axios';
import ExcelTable from './ExcelTable';

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedData, setUploadedData] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("files", selectedFile);

        try {
            const response = await axios.post('http://localhost:8000/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadedData(response.data[selectedFile.name]);
        } catch (error) {
            console.error('Error uploading file: ', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h2>Upload Excel File</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>Upload</button>

            {uploading && <p>Uploading...</p>}

            {uploadedData && (
                <div>
                    <h3>Uploaded Data</h3>
                    <ExcelTable data={uploadedData} />
                </div>
            )}
        </div>
    );
};

export default FileUpload;
