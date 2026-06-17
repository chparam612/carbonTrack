/**
 * Google Charts wrapper component.
 * Renders pie, bar, or line charts using the Google Charts CDN library.
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const EARTHY_COLORS = ['#0f3d26', '#8B4513', '#DAA520', '#D2691E', '#3d6b1f', '#CD853F', '#5d9f31'];

export default function ChartCard({ type, data, options = {}, title = '', className = '' }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!window.google?.charts) return;

    window.google.charts.load('current', { packages: ['corechart', 'bar'] });
    window.google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      if (!containerRef.current) return;

      const defaultOptions = {
        backgroundColor: 'transparent',
        colors: EARTHY_COLORS,
        fontName: 'Inter',
        titleTextStyle: { color: '#1a5c3a', fontSize: 14, bold: true },
        legend: { textStyle: { color: '#1a5c3a' } },
        ...options,
      };

      let chart, chartData;

      if (type === 'pie') {
        chartData = window.google.visualization.arrayToDataTable(data);
        chart = new window.google.visualization.PieChart(containerRef.current);
        chart.draw(chartData, { ...defaultOptions, pieHole: 0.4, pieSliceTextStyle: { color: '#F5F0E8' }, ...options });
      } else if (type === 'line') {
        chartData = window.google.visualization.arrayToDataTable(data);
        chart = new window.google.visualization.LineChart(containerRef.current);
        chart.draw(chartData, {
          ...defaultOptions,
          curveType: 'function',
          lineWidth: 2.5,
          hAxis: { textStyle: { color: '#1a5c3a' }, gridlines: { color: '#1a5c3a20' } },
          vAxis: { textStyle: { color: '#1a5c3a' }, gridlines: { color: '#1a5c3a20' } },
          ...options,
        });
      } else if (type === 'bar') {
        chartData = window.google.visualization.arrayToDataTable(data);
        chart = new window.google.visualization.BarChart(containerRef.current);
        chart.draw(chartData, {
          ...defaultOptions,
          hAxis: { textStyle: { color: '#1a5c3a' }, gridlines: { color: '#1a5c3a20' } },
          vAxis: { textStyle: { color: '#1a5c3a' } },
          ...options,
        });
      }

      chartRef.current = chart;
    }

    const handleResize = () => chartRef.current && drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [type, data, options]);

  return (
    <div className={`glass-card p-4 ${className}`}>
      {title && (
        <h3 className="font-display font-semibold text-forest-800 dark:text-cream-100 mb-3 text-sm">
          {title}
        </h3>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '220px' }} role="img" aria-label={title || 'Chart'} />
    </div>
  );
}

ChartCard.propTypes = {
  type: PropTypes.oneOf(['pie', 'bar', 'line']).isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  options: PropTypes.object,
  className: PropTypes.string,
};

