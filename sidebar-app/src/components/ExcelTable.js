import React from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';

const ExcelTable = ({ data }) => {
    const columns = data.columns.map((col) => ({
        data: col.name,
        title: col.name,
        editor: col.editable ? 'text' : false,
    }));

    return (
        <div>
            <HotTable
                data={data.rows}
                colHeaders={data.columns.map(col => col.name)}
                columns={columns}
                rowHeaders={true}
                width="100%"
                height="400px"
                licenseKey="non-commercial-and-evaluation" // Use proper license key for production
            />
        </div>
    );
};

export default ExcelTable;
