import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import './FeatureImportanceChart.css';

const FeatureImportanceChart = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchFeatureImportances();
    }, []);

    const fetchFeatureImportances = async () => {
        try {
            const response = await axios.get('http://localhost:8000/feature_importances');
            setChartData(response.data.data);
        } catch (error) {
            console.error("Error fetching feature importances:", error);
        }
    };

    const generateChartOptions = (label, features, importances) => ({
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
            },
        ],
    });

    return (
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
    );
};

export default FeatureImportanceChart;
