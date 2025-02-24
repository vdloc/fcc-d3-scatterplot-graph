import { ScatterPlotChart } from './src/chart';
import './style.css';

const chart = new ScatterPlotChart({
  title: 'Doping in Professional Bicycle Racing',
  description: "35 Fastest times up Alpe d'Huez",
  width: 800,
  height: 600,
  spacing: 60,
  chartElement: document.getElementById('chart'),
});
chart.init();
