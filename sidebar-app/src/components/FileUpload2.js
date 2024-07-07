import React from 'react';

const FileUpload2 = ({ onFileUpload }) => {
    const handleFileChange = (event) => {
        onFileUpload(event.target.files[0]);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
        </div>
    );
};

export default FileUpload2;
