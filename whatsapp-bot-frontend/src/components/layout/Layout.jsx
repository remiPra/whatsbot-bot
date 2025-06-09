import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, activeTab, setActiveTab, connectionStatus }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <Header connectionStatus={connectionStatus} />
      
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;