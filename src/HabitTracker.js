import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Code, Keyboard, Users, Brain, Dumbbell, Smile, TrendingUp, Calendar, Award, Plus, Minus, RotateCcw } from 'lucide-react';

const HabitTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('today');
  const [showNotification, setShowNotification] = useState(false);
  
  // Habit configurations
  const habitConfig = {
    study: { icon: BookOpen, label: 'Study Hours', unit: 'hrs', max: 8, color: '#3B82F6', bgColor: '#3B82F6' },
    leetcode: { icon: Code, label: 'LeetCode', unit: 'problems', max: 10, color: '#EF4444', bgColor: '#EF4444' },
    typing: { icon: Keyboard, label: 'Typing Club', unit: 'mins', max: 60, color: '#10B981', bgColor: '#10B981' },
    networking: { icon: Users, label: 'LinkedIn Networking', unit: 'connections', max: 5, color: '#8B5CF6', bgColor: '#8B5CF6' },
    topics: { icon: Brain, label: 'New Topics', unit: 'topics', max: 3, color: '#F59E0B', bgColor: '#F59E0B' },
    gym: { icon: Dumbbell, label: 'Gym Sessions', unit: 'sessions', max: 2, color: '#EC4899', bgColor: '#EC4899' },
    mood: { icon: Smile, label: 'Mood Rating', unit: '/5', max: 5, color: '#06B6D4', bgColor: '#06B6D4' }
  };

  // Sample data with current week
  const [habitData, setHabitData] = useState(() => {
    const saved = localStorage.getItem('habitData');
    if (saved) return JSON.parse(saved);
    const data = {};
    const today = new Date();
    
    // Generate data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data[dateStr] = {
        study: Math.floor(Math.random() * 6) + 1,
        leetcode: Math.floor(Math.random() * 8) + 1,
        typing: Math.floor(Math.random() * 45) + 15,
        networking: Math.floor(Math.random() * 4) + 1,
        topics: Math.floor(Math.random() * 3) + 1,
        gym: Math.random() > 0.3 ? 1 : 0,
        mood: Math.floor(Math.random() * 3) + 3
      };
    }
    
    return data;
  });

  // Persist habitData to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('habitData', JSON.stringify(habitData));
  }, [habitData]);

  const todayData = habitData[currentDate] || {};

  const updateHabit = (habit, increment) => {
    setHabitData(prev => ({
      ...prev,
      [currentDate]: {
        ...prev[currentDate],
        [habit]: Math.max(0, Math.min(habitConfig[habit].max, (prev[currentDate]?.[habit] || 0) + increment))
      }
    }));
    
    // Show success animation
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const resetDay = () => {
    setHabitData(prev => ({
      ...prev,
      [currentDate]: {}
    }));
  };

  // Chart data preparation
  const chartData = Object.entries(habitData)
    .sort()
    .slice(-7)
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      ...data
    }));

  const weeklyTotals = Object.values(habitConfig).map(config => {
    const key = Object.keys(habitConfig).find(k => habitConfig[k] === config);
    const total = chartData.reduce((sum, day) => sum + (day[key] || 0), 0);
    const avg = total / 7;
    return {
      name: config.label,
      value: avg,
      total,
      color: config.color,
      unit: config.unit
    };
  });

  const moodData = chartData.map(d => ({ name: d.date, mood: d.mood || 0 }));
  const streakData = Object.keys(habitConfig).map(key => ({
    habit: habitConfig[key].label,
    streak: chartData.filter(d => d[key] > 0).length,
    color: habitConfig[key].color
  }));

  const CompletionRing = ({ value, max, color, size = 120 }) => {
    const percentage = (value / max) * 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</span>
        </div>
      </div>
    );
  };

  const HabitCard = ({ habitKey, config }) => {
    const value = todayData[habitKey] || 0;
    const Icon = config.icon;
    const progress = (value / config.max) * 100;
    
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        border: '1px solid #E5E7EB',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
      onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: config.color + '20'
            }}>
              <Icon size={24} color={config.color} />
            </div>
            <div>
              <h3 style={{ fontWeight: '600', color: '#1F2937', margin: 0 }}>{config.label}</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>{value} {config.unit}</p>
            </div>
          </div>
          <CompletionRing value={value} max={config.max} color={config.color} size={80} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => updateHabit(habitKey, -1)}
              disabled={value <= 0}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: value <= 0 ? '#F3F4F6' : '#E5E7EB',
                border: 'none',
                cursor: value <= 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: value <= 0 ? 0.5 : 1
              }}
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => updateHabit(habitKey, 1)}
              disabled={value >= config.max}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: value >= config.max ? '#F3F4F6' : config.color + '30',
                border: 'none',
                cursor: value >= config.max ? 'not-allowed' : 'pointer',
                color: config.color,
                transition: 'background-color 0.2s',
                opacity: value >= config.max ? 0.5 : 1
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>Max: {config.max}</span>
        </div>
        
        <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '4px', height: '8px' }}>
          <div 
            style={{ 
              height: '8px', 
              borderRadius: '4px', 
              transition: 'all 0.5s ease-out',
              width: `${progress}%`, 
              backgroundColor: config.color 
            }}
          />
        </div>
      </div>
    );
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EBF8FF 0%, #FFFFFF 50%, #F3E8FF 100%)',
      padding: '32px 16px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6B7280',
      fontSize: '16px'
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    dateControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    dateInput: {
      padding: '8px 16px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none'
    },
    resetBtn: {
      padding: '8px',
      color: '#6B7280',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: '#F3F4F6',
      borderRadius: '8px',
      padding: '4px'
    },
    viewBtn: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textTransform: 'capitalize'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    notification: {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 1000,
      backgroundColor: '#10B981',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      animation: 'bounce 1s infinite'
    },
    chartContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    chartTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '24px'
    },
    footer: {
      marginTop: '48px',
      textAlign: 'center'
    },
    footerStats: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '24px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '16px 32px'
    },
    footerStat: {
      textAlign: 'center'
    },
    footerStatValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    footerStatLabel: {
      fontSize: '14px',
      color: '#6B7280'
    },
    divider: {
      width: '1px',
      height: '32px',
      backgroundColor: '#D1D5DB'
    }
  };

  return (
    <div style={styles.container}>
      {/* Add keyframes for animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0, -30px, 0);
            }
            70% {
              transform: translate3d(0, -15px, 0);
            }
            90% {
              transform: translate3d(0, -4px, 0);
            }
          }
        `}
      </style>

      {/* Notification */}
      {showNotification && (
        <div style={styles.notification}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} />
            <span>Great job! Keep it up! 🎉</span>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Daily Habit Tracker</h1>
          <p style={styles.subtitle}>Track your progress and build better habits</p>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.dateControls}>
            <Calendar size={20} color="#6B7280" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={styles.dateInput}
            />
            <button
              onClick={resetDay}
              style={styles.resetBtn}
              onMouseEnter={(e) => {
                e.target.style.color = '#EF4444';
                e.target.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6B7280';
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Reset today"
            >
              <RotateCcw size={20} />
            </button>
          </div>
          
          <div style={styles.viewToggle}>
            {['today', 'week', 'charts'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  ...styles.viewBtn,
                  backgroundColor: view === v ? 'white' : 'transparent',
                  color: view === v ? '#3B82F6' : '#6B7280',
                  fontWeight: view === v ? '500' : 'normal',
                  boxShadow: view === v ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Today View */}
        {view === 'today' && (
          <div style={styles.grid}>
            {Object.entries(habitConfig).map(([key, config]) => (
              <HabitCard key={key} habitKey={key} config={config} />
            ))}
          </div>
        )}

        {/* Week Summary */}
        {view === 'week' && (
          <div>
            <div style={styles.statsGrid}>
              {weeklyTotals.map((item, idx) => (
                <div key={idx} style={styles.statCard}>
                  <h3 style={{ fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>{item.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                    <span style={{ fontSize: '30px', fontWeight: 'bold', color: item.color }}>
                      {item.value.toFixed(1)}
                    </span>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>{item.unit}/day avg</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Total: {item.total} {item.unit}</p>
                </div>
              ))}
            </div>

            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>
                <TrendingUp size={20} color="#3B82F6" />
                7-Day Streak Progress
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px'
              }}>
                {streakData.map((item, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      backgroundColor: item.color
                    }}>
                      {item.streak}
                    </div>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0' }}>{item.habit}</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{item.streak}/7 days</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts View */}
        {view === 'charts' && (
          <div>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Weekly Progress Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  {Object.entries(habitConfig).map(([key, config]) => (
                    <Line 
                      key={key}
                      type="monotone" 
                      dataKey={key} 
                      stroke={config.color}
                      strokeWidth={2}
                      dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: config.color, strokeWidth: 2, fill: 'white' }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Mood Tracking</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis domain={[0, 5]} stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="mood" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Weekly Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={weeklyTotals.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="total"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {weeklyTotals.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div style={styles.footer}>
          <div style={styles.footerStats}>
            <div style={styles.footerStat}>
              <div style={{ ...styles.footerStatValue, color: '#3B82F6' }}>
                {Object.values(todayData).reduce((sum, val) => sum + val, 0)}
              </div>
              <div style={styles.footerStatLabel}>Today's Points</div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.footerStat}>
              <div style={{ ...styles.footerStatValue, color: '#10B981' }}>
                {chartData.reduce((sum, day) => sum + Object.values(day).slice(1).reduce((s, v) => s + v, 0), 0)}
              </div>
              <div style={styles.footerStatLabel}>Week Total</div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.footerStat}>
              <div style={{ ...styles.footerStatValue, color: '#8B5CF6' }}>
                {Object.values(todayData).filter(v => v > 0).length}
              </div>
              <div style={styles.footerStatLabel}>Habits Done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;