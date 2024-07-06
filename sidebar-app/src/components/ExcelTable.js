import React, { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';

const ExcelTable = ({ data }) => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      setColumns(data.columns);
      setRows(data.rows);
    }
  }, [data]);

  return (
    <div>
      <HotTable
        data={rows}
        colHeaders={columns.map(col => col.name)}
        rowHeaders={true}
        columns={columns.map(col => ({ data: col.name, editor: 'text' }))}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
};

export default ExcelTable;
