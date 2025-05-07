import React, { useEffect, useState } from "react";
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function App() {
  const [data, setData] = useState([]);
  const [indices, setIndices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const [chartData, setChartData] = useState(null);

  // Fetch and parse CSV data
  useEffect(() => {
    fetch('./dump.csv').then(res => res.text()).then(csv => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data;
          setData(rows);
          const uniqueIndices = [...new Set(rows.map(row => row.index_name))];
          setIndices(uniqueIndices);
        }
      });
    });
  }, []);

  // Update chart based on selected index and field (Turnover, PE Ratio, etc.)
  const updateChart = (indexValue, fieldName) => {
    if (!indexValue || !fieldName) return;

    // Filter the data based on selected index and sort by date
    const filtered = data
      .filter(row => row.index_name === indexValue)
      .sort((a, b) => new Date(a.index_date) - new Date(b.index_date));

    // Prepare data for Line chart
    const labels = filtered.map(row => row.index_date);
    const values = filtered.map(row => parseFloat(row[fieldName]));

    setChartData({
      labels, 
      datasets: [{
        label: `${indexValue} - ${fieldName}`,
        data: values,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40,167,69,0.3)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  // Handle company selection
  const handleSelect = (indexValue) => {
    setSelectedIndex(indexValue);
    setOptionValue('');  // Reset selected option when new index is selected
    setChartData(null);  // Clear previous chart
  };

  // Trigger chart update when an option is selected
  useEffect(() => {
    if (selectedIndex && optionValue) {
      updateChart(selectedIndex, optionValue);
    }
  }, [optionValue]);

  return (
    <div className="container">
      <div className="sidebar">
        <h3>Companies</h3>
        <ul>
          {indices.map(index => (
            <li
              key={index}
              onClick={() => handleSelect(index)}
              className={index === selectedIndex ? 'active' : ''}
            >
              {index}
            </li>
          ))}
        </ul>
      </div>
      <div className="chart-area">
        {selectedIndex ? (
          <>
            <h2>{selectedIndex} Chart</h2>
            <select
              value={optionValue}
              onChange={(e) => setOptionValue(e.target.value)}
              disabled={!selectedIndex}
            >
              <option value="" disabled>Select an Option</option>
              <option value="turnover_rs_cr">Turn Over</option>
              <option value="pe_ratio">PE Ratio</option>
              <option value="pb_ratio">PB Ratio</option>
              <option value="div_yield">Div Yield</option>
            </select>
            {chartData ? (
              <Line data={chartData} />
            ) : (
              <p>Please select a field to view the chart</p>
            )}
          </>
        ) : (
          <p>Select a company to view its chart</p>
        )}
      </div>
    </div>
  );
}

export default App;
