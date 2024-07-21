import React, { useState } from 'react';
import axios from 'axios';

const SelectTable = () => {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [filename, setFilename] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('http://localhost:8000/upload_table/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    setSheets(response.data.sheet_names);
    setFilename(response.data.filename);
  };

  const handleDownload = async () => {
    const response = await axios.get(`http://localhost:8000/download_table/${filename}/${selectedSheet}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedSheet}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="select-table">
      <h1>Upload and Select Table from XLSX</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {sheets.length > 0 && (
        <>
          <h2>Select a sheet to download:</h2>
          <select onChange={(e) => setSelectedSheet(e.target.value)} value={selectedSheet}>
            {sheets.map((sheet, index) => (
              <option key={index} value={sheet}>{sheet}</option>
            ))}
          </select>
          <button onClick={handleDownload} disabled={!selectedSheet}>Download</button>
        </>
      )}
    </div>
  );
}

export default SelectTable;
