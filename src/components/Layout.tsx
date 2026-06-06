import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#060B1A] dark:bg-[#060B1A] text-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Aurora Background Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple/10 blur-[150px]"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-cian/10 blur-[150px]"
            />
        </div>
        
        <div className="relative z-10 px-8 py-10 max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
