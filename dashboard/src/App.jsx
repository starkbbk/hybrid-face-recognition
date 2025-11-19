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
      case 'dashboard': return <Dashboard events={events} onNavigate={setActiveTab} />;
      case 'users': return <Users />;
      case 'camera': return <Camera />;
      case 'logs': return <Logs events={events} />;
      case 'settings': return <div className="p-8 text-slate-400 text-center text-lg">Settings Placeholder</div>;
      default: return <Dashboard events={events} />;
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-[#0f172a]" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] animate-pulse delay-1000" />
      <div className="fixed top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse delay-700" />
      <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        <div className="px-6 pb-10 mt-6 relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
