import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import './BoxPlotChartFeature.css';

const BoxPlotChartFeature = ({ type }) => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/fetch_feature_box');
            const data = processBoxPlotData(response.data);
            setChartData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const processBoxPlotData = (data) => {
        const boxPlotData = Object.keys(data.rows[0]) // Get all keys (column names)
            .filter(key => key !== 'id') // Exclude 'id' column
            .map(column => {
                const values = data.rows.map(row => row[column]);
                return {
                    name: column,
                    type: 'boxplot',
                    data: calculateBoxPlot(values)
                };
            });
        return {
            legend: {
                data: boxPlotData.map(item => item.name)
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: boxPlotData.map(item => item.name)
            },
            yAxis: {
                type: 'value'
            },
            series: boxPlotData
        };
    };

    const calculateBoxPlot = (values) => {
        // Calculate box plot values here (min, Q1, median, Q3, max)
        // This is a placeholder function; implement your own calculation logic
        values.sort((a, b) => a - b);
        const min = values[0];
        const max = values[values.length - 1];
        const q1 = values[Math.floor(values.length * 0.25)];
        const median = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];
        return [[min, q1, median, q3, max]];
    };

    return (
        <div>
            <h2>{type === 'features' ? '特征变量的箱线图' : '标签变量的箱线图'}</h2>
            <ReactECharts option={chartData} style={{ height: '600px', width: '100%' }} />
        </div>
    );
};

export default BoxPlotChartFeature;
