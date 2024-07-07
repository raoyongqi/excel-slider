import React, { useState } from 'react';

const ColumnSelector = ({ columns, onDownload }) => {
    const [selectedColumns, setSelectedColumns] = useState([]);

    const handleColumnChange = (event) => {
        const column = event.target.value;
        const isChecked = event.target.checked;

        setSelectedColumns((prev) => {
            if (isChecked) {
                return [...prev, column];
            } else {
                return prev.filter((col) => col !== column);
            }
        });
    };

    const handleDownload = () => {
        onDownload(selectedColumns);
    };

    return (
        <div>
            <h3>Select Columns:</h3>
            {columns.map((col, index) => (
                <div key={index}>
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
    );
};

export default ColumnSelector;
