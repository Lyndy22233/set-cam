import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Calendar, CheckCircle, Clock, XCircle, Download, 
  TrendingUp, Users, Car, Activity, Filter, CalendarRange
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyDateFilter();
  }, [dateFilter, appointments, customDateRange]);

  useEffect(() => {
    if (filteredAppointments.length > 0) {
      calculateStats();
    }
  }, [filteredAppointments]);

  const fetchAppointments = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/appointments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setAppointments(response.data.appointments);
      setFilteredAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    const now = new Date();
    let filtered = [...appointments];

    switch (dateFilter) {
      case 'today':
        filtered = appointments.filter(appt => {
          const apptDate = parseAppointmentDate(appt.appointmentDate);
          return apptDate && isSameDay(apptDate, now);
        });
        break;

      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = appointments.filter(appt => {
          const apptDate = parseAppointmentDate(appt.appointmentDate);
          return apptDate && apptDate >= weekAgo && apptDate <= now;
        });
        break;

      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = appointments.filter(appt => {
          const apptDate = parseAppointmentDate(appt.appointmentDate);
          return apptDate && apptDate >= monthStart && apptDate <= now;
        });
        break;

      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = appointments.filter(appt => {
          const apptDate = parseAppointmentDate(appt.appointmentDate);
          return apptDate && apptDate >= yearStart && apptDate <= now;
        });
        break;

      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          filtered = appointments.filter(appt => {
            const apptDate = parseAppointmentDate(appt.appointmentDate);
            return apptDate && apptDate >= startDate && apptDate <= endDate;
          });
        }
        break;

      default:
        filtered = appointments;
    }

    setFilteredAppointments(filtered);
  };

  const parseAppointmentDate = (dateStr) => {
    if (!dateStr) return null;
    
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    } else if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const calculateStats = () => {
    const newStats = {
      total: filteredAppointments.length,
      pending: filteredAppointments.filter(a => a.status === 'pending').length,
      approved: filteredAppointments.filter(a => a.status === 'approved').length,
      completed: filteredAppointments.filter(a => a.status === 'completed').length,
      rejected: filteredAppointments.filter(a => a.status === 'rejected').length
    };
    setStats(newStats);
  };

  const getStatusData = () => [
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Approved', value: stats.approved, color: '#3B82F6' },
    { name: 'Completed', value: stats.completed, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
  ];

  const getVehicleTypeData = () => {
    const counts = {};
    filteredAppointments.forEach(appt => {
      const type = appt.serviceName || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrendsData = () => {
    const months = {};
    filteredAppointments.forEach(appt => {
      if (appt.createdAt) {
        const date = appt.createdAt.toDate ? appt.createdAt.toDate() : new Date(appt.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        months[monthYear] = (months[monthYear] || 0) + 1;
      }
    });
    return Object.entries(months)
      .map(([name, appointments]) => ({ name, appointments }))
      .slice(-6);
  };

  const getDailyTrendsData = () => {
    const days = {};
    filteredAppointments.forEach(appt => {
      const apptDate = parseAppointmentDate(appt.appointmentDate);
      if (apptDate) {
        const dateStr = `${apptDate.getMonth() + 1}/${apptDate.getDate()}`;
        days[dateStr] = (days[dateStr] || 0) + 1;
      }
    });
    return Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);
  };

  const getHourlyDistribution = () => {
    const hours = {};
    filteredAppointments.forEach(appt => {
      if (appt.appointmentTime) {
        const hour = appt.appointmentTime.split(':')[0];
        hours[`${hour}:00`] = (hours[`${hour}:00`] || 0) + 1;
      }
    });
    return Object.entries(hours)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time));
  };

  const getStatusTimeline = () => {
    const timeline = {};
    filteredAppointments.forEach(appt => {
      if (appt.updatedAt) {
        const date = appt.updatedAt.toDate ? appt.updatedAt.toDate() : new Date(appt.updatedAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        
        if (!timeline[dateStr]) {
          timeline[dateStr] = { date: dateStr, pending: 0, approved: 0, completed: 0, rejected: 0 };
        }
        timeline[dateStr][appt.status] = (timeline[dateStr][appt.status] || 0) + 1;
      }
    });
    return Object.values(timeline).slice(-10);
  };

  const getCompletionRateByVehicle = () => {
    const vehicleStats = {};
    filteredAppointments.forEach(appt => {
      const type = appt.serviceName || 'Unknown';
      if (!vehicleStats[type]) {
        vehicleStats[type] = { total: 0, completed: 0 };
      }
      vehicleStats[type].total++;
      if (appt.status === 'completed') {
        vehicleStats[type].completed++;
      }
    });

    return Object.entries(vehicleStats).map(([name, stats]) => ({
      name,
      rate: stats.total > 0 ? parseFloat(((stats.completed / stats.total) * 100).toFixed(1)) : 0
    }));
  };

  const getPerformanceMetrics = () => {
    const vehicles = getVehicleTypeData();
    return vehicles.map(v => ({
      vehicle: v.name,
      appointments: v.value,
      completion: getCompletionRateByVehicle().find(c => c.name === v.name)?.rate || 0,
      efficiency: Math.min(100, (v.value / stats.total * 100) + (getCompletionRateByVehicle().find(c => c.name === v.name)?.rate || 0) / 2)
    }));
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(139, 0, 0);
      doc.text('SETCAM Analytics Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
      doc.text(`Filter: ${dateFilter.toUpperCase()}`, 105, 38, { align: 'center' });
      
      // Summary Stats
      doc.setFontSize(16);
      doc.text('Summary Statistics', 20, 50);
      
      doc.autoTable({
        startY: 55,
        head: [['Metric', 'Count']],
        body: [
          ['Total Appointments', stats.total],
          ['Pending', stats.pending],
          ['Approved', stats.approved],
          ['Completed', stats.completed],
          ['Rejected', stats.rejected],
        ],
        theme: 'grid',
        headStyles: { fillColor: [139, 0, 0] }
      });

      // Vehicle Type Distribution
      const vehicleData = getVehicleTypeData();
      doc.setFontSize(16);
      doc.text('Vehicle Type Distribution', 20, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Vehicle Type', 'Count']],
        body: vehicleData.map(v => [v.name, v.value]),
        theme: 'grid',
        headStyles: { fillColor: [139, 0, 0] }
      });

      // Completion Rates
      const completionData = getCompletionRateByVehicle();
      doc.setFontSize(16);
      doc.text('Completion Rates by Vehicle', 20, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Vehicle Type', 'Completion Rate (%)']],
        body: completionData.map(v => [v.name, v.rate]),
        theme: 'grid',
        headStyles: { fillColor: [139, 0, 0] }
      });

      doc.save(`SETCAM_Analytics_${dateFilter}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully!');
      setShowFormatModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const downloadDOCX = async () => {
    try {
      // Create document content as HTML
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SETCAM Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #8B0000; text-align: center; }
            h2 { color: #DC143C; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #8B0000; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .info { text-align: center; color: #666; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>SETCAM Analytics Report</h1>
          <p class="info">Generated: ${new Date().toLocaleString()}</p>
          <p class="info">Filter: ${dateFilter.toUpperCase()}</p>
          
          <h2>Summary Statistics</h2>
          <table>
            <thead>
              <tr><th>Metric</th><th>Count</th></tr>
            </thead>
            <tbody>
              <tr><td>Total Appointments</td><td>${stats.total}</td></tr>
              <tr><td>Pending</td><td>${stats.pending}</td></tr>
              <tr><td>Approved</td><td>${stats.approved}</td></tr>
              <tr><td>Completed</td><td>${stats.completed}</td></tr>
              <tr><td>Rejected</td><td>${stats.rejected}</td></tr>
            </tbody>
          </table>
          
          <h2>Vehicle Type Distribution</h2>
          <table>
            <thead>
              <tr><th>Vehicle Type</th><th>Count</th></tr>
            </thead>
            <tbody>
              ${getVehicleTypeData().map(v => `<tr><td>${v.name}</td><td>${v.value}</td></tr>`).join('')}
            </tbody>
          </table>
          
          <h2>Completion Rates by Vehicle</h2>
          <table>
            <thead>
              <tr><th>Vehicle Type</th><th>Completion Rate (%)</th></tr>
            </thead>
            <tbody>
              ${getCompletionRateByVehicle().map(v => `<tr><td>${v.name}</td><td>${v.rate}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Create a Blob with HTML content
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SETCAM_Analytics_${dateFilter}_${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully!');
      setShowFormatModal(false);
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document. Please try again.');
    }
  };

  const handleDownloadClick = () => {
    setShowFormatModal(true);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statusData = getStatusData();
  const vehicleData = getVehicleTypeData();
  const trendsData = getMonthlyTrendsData();
  const dailyData = getDailyTrendsData();
  const hourlyData = getHourlyDistribution();
  const timelineData = getStatusTimeline();
  const completionData = getCompletionRateByVehicle();
  const performanceData = getPerformanceMetrics();

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Comprehensive appointment analytics and insights</p>
        </div>
        <motion.button
          className="btn-download"
          onClick={handleDownloadClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={20} />
          Download Report
        </motion.button>
      </div>

      {/* Date Filter Section */}
      <motion.div 
        className="filter-section"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="filter-header">
          <Filter size={20} />
          <h3>Time Period</h3>
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDateFilter('all')}
          >
            All Time
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
            onClick={() => setDateFilter('today')}
          >
            Today
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
            onClick={() => setDateFilter('week')}
          >
            This Week
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
            onClick={() => setDateFilter('month')}
          >
            This Month
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'year' ? 'active' : ''}`}
            onClick={() => setDateFilter('year')}
          >
            This Year
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setShowCustomRange(!showCustomRange);
              setDateFilter('custom');
            }}
          >
            <CalendarRange size={16} />
            Custom Range
          </button>
        </div>
        {showCustomRange && (
          <motion.div 
            className="custom-range"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
          >
            <input 
              type="date" 
              value={customDateRange.start}
              onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
              placeholder="Start Date"
            />
            <span>to</span>
            <input 
              type="date" 
              value={customDateRange.end}
              onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
              placeholder="End Date"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div
          className="stat-card total"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon">
            <Calendar size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Appointments</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card pending"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card approved"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="stat-icon">
            <Activity size={32} />
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <p className="stat-number">{stats.approved}</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card completed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="stat-icon">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card rejected"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="stat-icon">
            <XCircle size={32} />
          </div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-number">{stats.rejected}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Status Distribution Pie Chart */}
        <motion.div
          className="chart-card futuristic"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Status Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} filter="url(#glow)" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Vehicle Type Bar Chart */}
        <motion.div
          className="chart-card futuristic"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Appointments by Vehicle Type</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff0066" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8B0000" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,0,0,0.2)" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Trends Area Chart */}
        <motion.div
          className="chart-card futuristic wide"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Daily Appointment Trends (Last 14 Days)</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#0066ff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.2)" />
              <XAxis dataKey="date" stroke="#00d4ff" />
              <YAxis stroke="#00d4ff" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#00d4ff" 
                strokeWidth={3}
                fill="url(#areaGradient)" 
                animationDuration={1800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hourly Distribution */}
        <motion.div
          className="chart-card futuristic"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Hourly Distribution</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <defs>
                <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.2)" />
              <XAxis dataKey="time" stroke="#10B981" />
              <YAxis stroke="#10B981" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="url(#hourGradient)" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          className="chart-card futuristic wide"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Status Timeline (Last 10 Days)</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5 }} animationDuration={1800} />
              <Line type="monotone" dataKey="approved" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} animationDuration={1800} />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} animationDuration={1800} />
              <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} animationDuration={1800} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Completion Rate by Vehicle */}
        <motion.div
          className="chart-card futuristic"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Completion Rate by Vehicle (%)</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionData}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.2)" />
              <XAxis dataKey="name" stroke="#a855f7" />
              <YAxis stroke="#a855f7" />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="rate" fill="url(#completionGradient)" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Radar */}
        <motion.div
          className="chart-card futuristic"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <h3 className="chart-title">
            <span className="title-glow">Vehicle Performance Metrics</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#00d4ff" />
              <PolarAngleAxis dataKey="vehicle" stroke="#00d4ff" />
              <PolarRadiusAxis stroke="#00d4ff" />
              <Radar name="Efficiency" dataKey="efficiency" stroke="#ff0066" fill="#ff0066" fillOpacity={0.6} animationDuration={2000} />
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Format Selection Modal */}
      {showFormatModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFormatModal(false)}
        >
          <motion.div
            className="format-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Select Download Format</h3>
            <p>Choose the format for your analytics report</p>
            <div className="format-buttons">
              <button className="format-btn pdf-btn" onClick={downloadPDF}>
                <Download size={24} />
                <span>PDF Format</span>
                <small>Portable Document Format</small>
              </button>
              <button className="format-btn doc-btn" onClick={downloadDOCX}>
                <Download size={24} />
                <span>DOC Format</span>
                <small>Microsoft Word Document</small>
              </button>
            </div>
            <button className="cancel-btn" onClick={() => setShowFormatModal(false)}>
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
