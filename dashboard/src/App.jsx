import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Camera from './pages/Camera';
import Logs from './pages/Logs';
import { socket, api } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Initial fetch
    api.get('/events').then(res => {
      setEvents(res.data);
    }).catch(console.error);

    // Socket subscription
    socket.on('face_event', (event) => {
      setEvents(prev => {
        const newEvents = [event, ...prev];
        return newEvents.slice(0, 100); // Keep last 100
      });
    });

    return () => {
      socket.off('face_event');
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard events={events} />;
      case 'users': return <Users />;
      case 'camera': return <Camera />;
      case 'logs': return <Logs events={events} />;
      case 'settings': return <div className="p-6 text-gray">Settings Placeholder</div>;
      default: return <Dashboard events={events} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-[250px]">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
