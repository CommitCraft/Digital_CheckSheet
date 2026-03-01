import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Factory, Monitor, AlertTriangle } from 'lucide-react';

const slotTimes = [
  '09-10',
  '10-11',
  '11-12',
  '12-01',
  '02-03',
  '03-04',
  '04-05'
];

const stations = [
  { id: 1, name: 'Line 1 - Model A' },
  { id: 2, name: 'Line 2 - Model B' },
  { id: 3, name: 'Line 3 - Model C' },
  { id: 4, name: 'Line 4 - Model D' }
];

const statusStyles = {
  completed: 'bg-green-600 text-white',
  pending: 'bg-yellow-500 text-black',
  upcoming: 'bg-blue-600 text-white',
  missed: 'bg-red-600 text-white animate-pulse'
};

const SlotStatusPage = () => {

  const [tvMode, setTvMode] = useState(false);
  const [alarm, setAlarm] = useState(false);

  const [slotData] = useState({
    1: ['completed', 'pending', 'upcoming', '', '', '', ''],
    2: ['completed', 'completed', 'missed', '', '', '', ''],
    3: ['pending', 'upcoming', '', '', '', '', ''],
    4: ['missed', '', '', '', '', '', '']
  });

  // 🚨 Detect MISSED automatically
  useEffect(() => {
    const hasMissed = Object.values(slotData).flat().includes('missed');
    setAlarm(hasMissed);

    if (hasMissed) {
      const audio = new Audio('/alarm.mp3'); // optional alarm file
      audio.play().catch(() => {});
    }
  }, [slotData]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setTvMode(true);
    } else {
      document.exitFullscreen();
      setTvMode(false);
    }
  };

  return (
    <Layout>

      <div className={`space-y-6 transition-all duration-300 
        ${tvMode ? 'text-lg' : ''}`}>

        {/* 🚨 ANDON ALARM BANNER */}
        {alarm && (
          <div className="flex items-center gap-3 bg-red-700 text-white px-6 py-3 rounded-xl animate-pulse shadow-lg">
            <AlertTriangle />
            <span className="font-bold tracking-wider">
              PRODUCTION ALERT: MISSED SLOT DETECTED
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">

          <div className="flex items-center gap-3">
            <Factory size={28} className='dark:text-white'/>
            <div className='dark:text-white'>
              <h1 className="text-2xl font-bold tracking-wide">
                PRODUCTION SLOT BOARD
              </h1>
              <p className="text-sm opacity-70">
                Live Manufacturing Monitoring
              </p>
            </div>
          </div>

          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
          >
            <Monitor size={18} />
            Full Screen
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm font-semibold uppercase tracking-wide dark:text-white">
          <Legend color="bg-green-600" label="Completed" />
          <Legend color="bg-yellow-500" label="Pending" />
          <Legend color="bg-blue-600" label="Upcoming" />
          <Legend color="bg-red-600" label="Missed" />
        </div>

        {/* GRID */}
        <div className="overflow-auto rounded-xl border shadow-lg
          bg-white dark:bg-gray-900
          border-gray-300 dark:border-gray-700">

          <div className="min-w-[1100px]">

            {/* Header Row */}
            <div className="grid grid-cols-[300px_repeat(7,1fr)] 
              bg-gray-200 dark:bg-gray-800 
              text-gray-900 dark:text-gray-100 
              font-bold border-b border-gray-400 dark:border-gray-700">

              <div className="p-4 border-r border-gray-400 dark:border-gray-700">
                Station / Line / Model
              </div>

              {slotTimes.map((time, index) => (
                <div key={index}
                  className="p-4 text-center border-r border-gray-400 dark:border-gray-700">
                  {time}
                </div>
              ))}
            </div>

            {/* Rows */}
            {stations.map((station) => (
              <div key={station.id}
                className="grid grid-cols-[300px_repeat(7,1fr)]
                border-b border-gray-300 dark:border-gray-800 dark:text-white">

                <div className="p-4 font-semibold
                  bg-gray-100 dark:bg-gray-800
                  border-r border-gray-300 dark:border-gray-700">
                  {station.name}
                </div>

                {slotTimes.map((_, index) => {
                  const status = slotData[station.id]?.[index];

                  return (
                    <div key={index}
                      className="flex items-center justify-center p-4
                      border-r border-gray-300 dark:border-gray-800">

                      {status ? (
                        <div className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusStyles[status]}`}>
                          {status}
                        </div>
                      ) : (
                        <div className="w-full h-6 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

          </div>
        </div>

      </div>
    </Layout>
  );
};

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded ${color}`} />
    <span>{label}</span>
  </div>
);

export default SlotStatusPage;