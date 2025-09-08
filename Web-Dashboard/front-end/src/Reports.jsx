import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import API_BASE from './lib/apiBase';
import './styles/DashboardPages.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

const API = {
  historical: (device, range) => `${API_BASE}/sensors/historical?device=${device}&range=${range}`,
  logs: (type, from, to) => `${API_BASE}/system/logs?type=${type || ''}&from=${from || ''}&to=${to || ''}`,
};

function useHistorical(device, range, metric) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(API.historical(device, range));
        const json = await res.json();
        if (!ignore && json?.success) setData(json.data || []);
      } catch (e) {
        console.error('Historical fetch failed:', e);
        if (!ignore) setData([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [device, range, metric]);

  const chart = useMemo(() => {
    const ts = data.map(d => new Date(d.timestamp));
    const sets = [
      { key: 'temperature', label: 'Temperature (°C)', color: 'rgb(239,68,68)', bg: 'rgba(239,68,68,.15)', axis: 'y' },
      { key: 'humidity', label: 'Humidity (%)', color: 'rgb(59,130,246)', bg: 'rgba(59,130,246,.15)', axis: 'y1' },
      { key: 'soil_moisture', label: 'Soil Moisture (%)', color: 'rgb(34,197,94)', bg: 'rgba(34,197,94,.15)', axis: 'y1' },
      { key: 'light_level', label: 'Light Level', color: 'rgb(245,158,11)', bg: 'rgba(245,158,11,.15)', axis: 'y2' },
    ];
    const filtered = metric === 'all' ? sets : sets.filter(s => s.key === metric);
    return {
      data: {
        labels: ts,
        datasets: filtered.map(s => ({
          label: s.label,
          data: data.map(d => d[s.key]),
          borderColor: s.color,
          backgroundColor: s.bg,
          yAxisID: s.axis,
        })),
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { type: 'time', title: { display: true, text: 'Time' } },
          y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperature (°C)' } },
          y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Percentage (%)' } },
          y2: { type: 'linear', position: 'right', display: false },
        },
      },
    };
  }, [data, metric]);

  return { loading, data, chart };
}

function toCSV(rows) {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
}

export default function Reports() {
  const [device, setDevice] = useState('1');
  const [range, setRange] = useState('24h');
  const [metric, setMetric] = useState('all');
  const { loading, data, chart } = useHistorical(device, range, metric);
  const chartRef = useRef(null);

  // Logs
  const [logType, setLogType] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLogsLoading(true);
      try {
        const res = await fetch(API.logs(logType, from, to));
        const json = await res.json();
        if (!ignore && json?.success) setLogs(json.data || []);
        else if (!ignore) setLogs([]);
      } catch (e) {
        console.warn('Logs endpoint missing or failed, using demo data.');
        if (!ignore) setLogs([
          { ts: new Date().toISOString(), type: 'irrigation', action: 'ON' },
          { ts: new Date(Date.now()-3600e3).toISOString(), type: 'exhaust_fan', action: 'OFF' },
          { ts: new Date(Date.now()-2*3600e3).toISOString(), type: 'light', action: 'ON' },
          { ts: new Date(Date.now()-3*3600e3).toISOString(), type: 'shading', action: 'DEPLOYED' },
          { ts: new Date(Date.now()-4*3600e3).toISOString(), type: 'intake_fan', action: 'ON' },
        ]);
      } finally {
        if (!ignore) setLogsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [logType, from, to]);

  const filteredLogs = useMemo(() => (
    logs.filter(l => (logType==='all' || l.type===logType))
  ), [logs, logType]);

  // Export handlers
  const handleExportCSV = () => {
    const rows = data.map(d => ({ timestamp: d.timestamp, temperature: d.temperature, humidity: d.humidity, soil_moisture: d.soil_moisture, light_level: d.light_level }));
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'historical_data.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const rows = data.map(d => ({ timestamp: d.timestamp, temperature: d.temperature, humidity: d.humidity, soil_moisture: d.soil_moisture, light_level: d.light_level }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'historical_data.xlsx');
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'l', unit: 'pt' });
    doc.text('Historical Sensor Data', 40, 40);
    const rows = data.map(d => [d.timestamp, d.temperature, d.humidity, d.soil_moisture, d.light_level]);
    autoTable(doc, { startY: 60, head: [['Timestamp','Temp (°C)','Humidity (%)','Soil Moisture (%)','Light']], body: rows });
    try {
      if (chartRef.current) {
        const canvas = chartRef.current.canvas; // react-chartjs-2 exposes canvas
        const img = canvas.toDataURL('image/png', 1.0);
        doc.addPage();
        doc.text('Chart Snapshot', 40, 40);
        doc.addImage(img, 'PNG', 40, 60, 760, 360);
      }
    } catch {}
    doc.save('historical_data.pdf');
  };

  const logIcon = (t) => ({
    irrigation: '💧',
    shading: '🛡️',
    light: '💡',
    exhaust_fan: '🌀',
    intake_fan: '🌬️',
  }[t] || '📘');

  const logColor = (t) => ({
    irrigation: 'text-blue-700',
    shading: 'text-amber-700',
    light: 'text-yellow-700',
    exhaust_fan: 'text-cyan-700',
    intake_fan: 'text-emerald-700',
  }[t] || 'text-primary-700');

  return (
    <main className="page-container" role="main">
      <header className="page-header fade-in">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Historical insights and system activity logs. Export data for analysis.</p>
      </header>

      {/* Historical */}
      <section className="page-section fade-in" aria-labelledby="historical-title">
        <div className="chart-card mb-6" role="region" aria-labelledby="historical-filters">
          <div className="chart-body">
            <h2 id="historical-filters" className="card-title mb-3">Historical Data Filters</h2>
            <div className="filters-grid">
              <label className="visually-hidden" htmlFor="rep-device">Device</label>
              <select id="rep-device" className="form-select" value={device} onChange={e=>setDevice(e.target.value)}>
                <option value="1">Device 1</option>
                <option value="2">Device 2</option>
                <option value="3">Device 3</option>
              </select>
              <label className="visually-hidden" htmlFor="rep-range">Range</label>
              <select id="rep-range" className="form-select" value={range} onChange={e=>setRange(e.target.value)}>
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <label className="visually-hidden" htmlFor="rep-metric">Metric</label>
              <select id="rep-metric" className="form-select" value={metric} onChange={e=>setMetric(e.target.value)}>
                <option value="all">All Metrics</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="soil_moisture">Soil Moisture</option>
                <option value="light_level">Light Level</option>
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>Export CSV</button>
              <button className="btn btn-info btn-sm" onClick={handleExportExcel}>Export Excel</button>
              <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>Export PDF</button>
            </div>
          </div>
        </div>

        <div className="chart-card" role="region" aria-labelledby="historical-title">
          <div className="chart-body">
            <h2 id="historical-title" className="card-title mb-2">Historical Trends</h2>
            <p className="card-subtitle mb-4">Responsive charts for selected metrics.</p>
            <div className="w-full h-[320px] sm:h-[380px] lg:h-[440px]">
              {loading ? (
                <div className="loading">Loading historical data...</div>
              ) : (
                <Line ref={chartRef} data={chart.data} options={chart.options} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Logs */}
      <section className="page-section fade-in" aria-labelledby="logs-title">
        <div className="chart-card mb-6" role="region" aria-labelledby="log-filters">
          <div className="chart-body">
            <h2 id="log-filters" className="card-title mb-3">System Logs Filters</h2>
            <div className="filters-grid">
              <label className="visually-hidden" htmlFor="log-type">Action Type</label>
              <select id="log-type" className="form-select" value={logType} onChange={e=>setLogType(e.target.value)}>
                <option value="all">All</option>
                <option value="irrigation">Irrigation</option>
                <option value="shading">Shading</option>
                <option value="light">Light</option>
                <option value="exhaust_fan">Exhaust Fan</option>
                <option value="intake_fan">Intake Fan</option>
              </select>
              <input className="form-input" type="date" aria-label="From date" value={from} onChange={e=>setFrom(e.target.value)} />
              <input className="form-input" type="date" aria-label="To date" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" role="region" aria-labelledby="logs-title">
          <div className="card-body">
            <h2 id="logs-title" className="card-title mb-2">System Logs</h2>
            <p className="card-subtitle mb-4">Chronological actions with timestamps.</p>
            {logsLoading ? (
              <div className="loading">Loading logs...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-primary-700">
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2 pr-4">Action</th>
                      <th className="py-2 pr-4">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((l, idx) => (
                      <tr key={idx} className="border-t border-primary-200/60 hover:bg-primary-50/60 focus-within:bg-primary-50/60">
                        <td className="py-2 pr-4 whitespace-nowrap">{new Date(l.ts).toLocaleString()}</td>
                        <td className={`py-2 pr-4 whitespace-nowrap flex items-center gap-2 ${logColor(l.type)}`}>
                          <span aria-hidden>{logIcon(l.type)}</span>
                          <span className="capitalize">{l.type.replace('_',' ')}</span>
                        </td>
                        <td className="py-2 pr-4 font-semibold">{l.action}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td className="py-6 text-primary-700" colSpan={3}>No logs for selected filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
