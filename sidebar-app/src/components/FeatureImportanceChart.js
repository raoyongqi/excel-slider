import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';
import './FeatureImportanceChart.css';

const FeatureImportanceChart = () => {
    const [chartData, setChartData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        fetchFeatureImportances();
    }, []);

    useEffect(() => {
        if (chartData.length > 0) {
            const featureColumns = chartData[0].importances.map(imp => imp.feature);
            setColumns(featureColumns);

            // 从localStorage中恢复上一次选择的列
            const savedColumns = localStorage.getItem('selectedColumns');
            if (savedColumns) {
                setSelectedColumns(JSON.parse(savedColumns));
            } else {
                setSelectedColumns(featureColumns);
            }
        }
    }, [chartData]);

    const fetchFeatureImportances = async () => {
        try {
            const response = await axios.get('http://localhost:8000/feature_importances');
            setChartData(response.data.data);
        } catch (error) {
            console.error("Error fetching feature importances:", error);
        }
    };

    const handleColumnChange = (event) => {
        const column = event.target.value;
        const isChecked = event.target.checked;

        setSelectedColumns((prev) => {
            const updatedColumns = isChecked ? [...prev, column] : prev.filter((col) => col !== column);
            // 保存选中的列到localStorage
            localStorage.setItem('selectedColumns', JSON.stringify(updatedColumns));
            return updatedColumns;
        });
    };

    const handleToggleSelection = () => {
        const updatedColumns = selectedColumns.length === columns.length ? [] : columns;
        setSelectedColumns(updatedColumns);
        // 保存选中的列到localStorage
        localStorage.setItem('selectedColumns', JSON.stringify(updatedColumns));
    };

    const generateChartOptions = (label, features, importances) => {
        const colors = features.map(feature => selectedColumns.includes(feature) ? '#c23531' : '#2f4554');
        return {
            title: {
                text: `Feature Importances for ${label}`,
            },
            tooltip: {},
            xAxis: {
                type: 'category',
                data: features,
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: importances,
                    type: 'bar',
                    itemStyle: {
                        color: (params) => colors[params.dataIndex],
                    },
                },
            ],
        };
    };

    const handleDownloadExcel = () => {
        const wb = XLSX.utils.book_new();

        chartData.forEach((item) => {
            const data = item.importances
                .filter((imp) => selectedColumns.includes(imp.feature))
                .map((imp) => [imp.feature, imp.importance]);
            
            const ws = XLSX.utils.aoa_to_sheet([['Feature', 'Importance'], ...data]);
            XLSX.utils.book_append_sheet(wb, ws, item.label);
        });

        XLSX.writeFile(wb, 'Feature_Importances.xlsx');
    };

    return (
        <div>
            <div className="column-selection">
                <button onClick={handleToggleSelection}>
                    {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
                </button>
                {columns.map((column, index) => (
                    <label key={index}>
                        <input
                            type="checkbox"
                            value={column}
                            checked={selectedColumns.includes(column)}
                            onChange={handleColumnChange}
                        />
                        {column}
                    </label>
                ))}
            </div>
            <button onClick={handleDownloadExcel}>Download Excel</button>
            <div className="feature-importance-chart-container">
                {chartData.map((item, index) => (
                    <div key={index} className="feature-importance-chart">
                        <ReactECharts
                            option={generateChartOptions(
                                item.label,
                                item.importances.map(imp => imp.feature),
                                item.importances.map(imp => imp.importance)
                            )}
                            style={{ height: '400px', width: '100%' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeatureImportanceChart;
