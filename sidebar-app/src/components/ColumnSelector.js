import React, { useState, useEffect } from 'react';

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

    const handleToggleSelection = () => {
        if (selectedColumns.length === columns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(columns.map(col => col.name));
        }
    };

    useEffect(() => {
        setSelectedColumns(columns.map(col => col.name));
    }, [columns]);

    return (
        <div>
            <h3>Select Columns:</h3>
            {columns.map((col, index) => (
                <div key={index}>
                    <input
                        type="checkbox"
                        value={col.name}
                        checked={selectedColumns.includes(col.name)}
                        onChange={handleColumnChange}
                    />
                    {col.name}
                </div>
            ))}
            <button onClick={handleToggleSelection}>
                {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
            </button>
            <button onClick={handleDownload}>Download</button>
        </div>
    );
};

export default ColumnSelector;
