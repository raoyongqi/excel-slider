import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import './BoxPlotChartLabel.css';
const BoxPlotChartLabel  =  ({ type }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const response = await axios.get('http://localhost:8000/fetch_label_box');
          const data = processBoxPlotData(response.data);
          setChartData(data);
      } catch (error) {
          console.error("Error fetching data:", error);
      }
  };

  const processBoxPlotData = (data) => {
      return Object.keys(data.rows[0]) // Get all keys (column names)
          .filter(key => key !== 'id') // Exclude 'id' column
          .map(column => ({
              name: column,
              option: {
                  legend: {},
                  tooltip: {
                      trigger: 'item',
                      axisPointer: {
                          type: 'shadow'
                      }
                  },
                  xAxis: {
                      type: 'category',
                      data: ['Boxplot']
                  },
                  yAxis: {
                      type: 'value'
                  },
                  series: [{
                      name: column,
                      type: 'boxplot',
                      data: calculateBoxPlot(data.rows.map(row => row[column]))
                  }]
              }
          }));
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
      <div className="boxplot-container">
          {chartData.map((item, index) => (
              <div key={index} className="boxplot-item">
                  <h2>{item.name}</h2>
                  <ReactECharts option={item.option} style={{ height: '400px', width: '150%' }} />
              </div>
          ))}
      </div>
  );
};

export default BoxPlotChartLabel;
