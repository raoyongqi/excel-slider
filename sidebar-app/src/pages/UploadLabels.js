
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UploadLabels() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/fetch_label');
        setData(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload_label', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFilename(response.data.filename);
      setError('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Upload Excel File and Fetch Database Data</h1>
      
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {filename && <p>Uploaded File: {filename}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Database Data</h2>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

export default UploadLabels;
