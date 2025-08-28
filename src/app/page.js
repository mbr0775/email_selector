'use client';

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://apovbnmszzeclydfhogt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwb3Zibm1zenplY2x5ZGZob2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjc4NzIsImV4cCI6MjA3MTkwMzg3Mn0.UcBifidrOL4Zc7Uoevxcrw3zxwZg-R3Lj9M2Fz84gnk';

export default function Home() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Email lists organized by device type (from your images)
  const emailsByDevice = {
    'I3 Dell Laptop': [
      "autombrservice@gmail.com",
      "brewmbr@gmail.com", 
      "mbrcocopro@gmail.com",
      "mbrmarketting@gmail.com",
      "fixzoomservices@gmail.com",
      "webmubassir@gmail.com",
      "neonzermbr@gmail.com",
      "reactmbr@gmail.com",
      "mbrspices@gmail.com"
    ],
    'G Tab': [
      "designz.mbr@gmail.com",
      "asmiya0775@gmail.com",
      "azeemahamad0775@gmail.com",
      "mubassirwealth@gmail.com",
      "akmalmbr0775@gmail.com",
      "info.athimart@gmail.com",
      "tokilotech@gmail.com",
      "fixzoomservices@gmail.com",
      "raseemamar@gmail.com"
    ],
    'Redmi 14C': [
      "trendly.services@gmail.com",
      "eatzweefood@gmail.com",
      "mbrmarket.service@gmail.com",
      "mbroasis@gmail.com",
      "mbr.career0775@gmail.com",
      "waseem.ideals@gmail.com",
      "trendly.services@gmail.com",
      "mubassirnasar@gmail.com",
      "ameer.srv@gmail.com"
    ],
    'Poco X3 NFC': [
      "goviceylon@gmail.com",
      "mbrgroup.service@gmail.com",
      "agroherd@gmail.com",
      "tideharver@gmail.com",
      "cismbr7@gmail.com",
      "techmbr.services@gmail.com",
      "busiensmbr@gmail.com",
      "tripzemservices@gmail.com",
      "trazombr@gmail.com"
    ]
  };

  const deviceTypes = Object.keys(emailsByDevice);
  
  const [currentDevice, setCurrentDevice] = useState(null);
  const [deviceUsedEmails, setDeviceUsedEmails] = useState({
    'I3 Dell Laptop': [],
    'G Tab': [],
    'Redmi 14C': [],
    'Poco X3 NFC': []
  });
  const [lastResetDate, setLastResetDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get random device with available emails
  const getRandomDevice = () => {
    const availableDevices = deviceTypes.filter(device => {
      const used = deviceUsedEmails[device]?.length || 0;
      return used < emailsByDevice[device].length;
    });

    if (availableDevices.length === 0) {
      return null;
    }

    return availableDevices[Math.floor(Math.random() * availableDevices.length)];
  };

  // Get today's date string for comparison
  const getTodayDateString = () => {
    return new Date().toDateString();
  };

  // Reset the system for a new day
  const resetSystem = async () => {
    const today = getTodayDateString();
    const resetUsedEmails = {
      'I3 Dell Laptop': [],
      'G Tab': [],
      'Redmi 14C': [],
      'Poco X3 NFC': []
    };
    
    setDeviceUsedEmails(resetUsedEmails);
    setLastResetDate(today);
    const newDevice = getRandomDevice();
    setCurrentDevice(newDevice);
    
    // Save to Supabase
    await saveState(resetUsedEmails, today, newDevice);
  };

  // Fetch state from Supabase
  const fetchState = async () => {
    const { data, error } = await supabase
      .from('emaildesk')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching state:', error);
      alert('Failed to load state from Supabase. Check console for details.');
      return null;
    }

    return data;
  };

  // Save state to Supabase
  const saveState = async (usedEmails = deviceUsedEmails, resetDate = lastResetDate, device = currentDevice) => {
    const { error } = await supabase
      .from('emaildesk')
      .upsert({
        id: 1,
        device_used_emails: usedEmails,
        last_reset_date: resetDate || getTodayDateString(),
        current_device: device ? device : 'NONE'
      });

    if (error) {
      console.error('Error saving state:', error);
      alert('Failed to save state to Supabase. Check console for details.');
    }
  };

  // Load saved state
  useEffect(() => {
    const load = async () => {
      const data = await fetchState();
      
      const today = getTodayDateString();

      if (!data) {
        // If no data, reset
        await resetSystem();
      } else {
        const fetchedUsedEmails = data.device_used_emails || {
          'I3 Dell Laptop': [],
          'G Tab': [],
          'Redmi 14C': [],
          'Poco X3 NFC': []
        };
        const fetchedLastReset = data.last_reset_date;
        const fetchedCurrentDevice = data.current_device === 'NONE' ? null : data.current_device;

        if (fetchedLastReset !== today) {
          // Different day, reset
          await resetSystem();
        } else {
          // Same day, load state
          setDeviceUsedEmails(fetchedUsedEmails);
          setLastResetDate(fetchedLastReset);
          setCurrentDevice(fetchedCurrentDevice);
        }
      }
      
      setIsLoading(false);
    };
    load();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveState();
    }
  }, [deviceUsedEmails, lastResetDate, currentDevice, isLoading]);

  // Get current email for the current device
  const getCurrentEmail = () => {
    if (!currentDevice) return null;
    const currentDeviceEmails = emailsByDevice[currentDevice];
    const currentDeviceUsedEmails = deviceUsedEmails[currentDevice] || [];
    
    // Filter out emails that the CURRENT DEVICE has already used
    const availableEmails = currentDeviceEmails.filter((_, index) => !currentDeviceUsedEmails.includes(index));
    
    if (availableEmails.length === 0) {
      return null; // All emails used by this device
    }
    
    // Return the first available email for this device
    return availableEmails[0];
  };

  // Get the index of current email in the current device's email array
  const getCurrentEmailIndex = () => {
    const currentEmail = getCurrentEmail();
    if (!currentEmail || !currentDevice) return -1;
    const currentDeviceEmails = emailsByDevice[currentDevice];
    return currentDeviceEmails.findIndex(email => email === currentEmail);
  };

  // Handle "Used" button click
  const handleEmailUsed = async () => {
    if (!currentDevice) return;
    const currentEmailIndex = getCurrentEmailIndex();
    
    if (currentEmailIndex !== -1) {
      // Add email to current device's used list
      const newDeviceUsedEmails = {
        ...deviceUsedEmails,
        [currentDevice]: [...deviceUsedEmails[currentDevice], currentEmailIndex]
      };
      setDeviceUsedEmails(newDeviceUsedEmails);
      
      // Switch to a random device for next email
      const newDevice = getRandomDevice();
      setCurrentDevice(newDevice);
      
      // Save immediately
      await saveState(newDeviceUsedEmails, lastResetDate, newDevice);
    }
  };

  // Get remaining time until reset
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeDiff = tomorrow - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Get device icon
  const getDeviceIcon = (device) => {
    switch (device) {
      case 'I3 Dell Laptop': return '💻';
      case 'G Tab': return '📱';
      case 'Redmi 14C': return '📱';
      case 'Poco X3 NFC': return '📱';
      default: return '📱';
    }
  };

  // Get device color
  const getDeviceColor = (device) => {
    switch (device) {
      case 'I3 Dell Laptop': return 'from-blue-400 to-blue-600';
      case 'G Tab': return 'from-orange-400 to-orange-600';
      case 'Redmi 14C': return 'from-blue-500 to-blue-700';
      case 'Poco X3 NFC': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading email system...</div>
        </div>
      </div>
    );
  }

  // Compute totals
  const totalUsed = deviceTypes.reduce((sum, device) => sum + (deviceUsedEmails[device]?.length || 0), 0);
  const totalEmails = deviceTypes.reduce((sum, device) => sum + emailsByDevice[device].length, 0);
  const totalRemaining = totalEmails - totalUsed;

  let currentEmail = null;
  let currentDeviceEmails = [];
  let currentDeviceUsedCount = 0;
  let currentDeviceAvailable = 0;
  let deviceColor = 'from-gray-400 to-gray-600';

  if (currentDevice) {
    currentEmail = getCurrentEmail();
    currentDeviceEmails = emailsByDevice[currentDevice];
    currentDeviceUsedCount = deviceUsedEmails[currentDevice]?.length || 0;
    currentDeviceAvailable = currentDeviceEmails.length - currentDeviceUsedCount;
    deviceColor = getDeviceColor(currentDevice);
  }

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{currentDevice ? getDeviceIcon(currentDevice) : '📴'}</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Email Management System</h1>
          <p className="text-gray-600 mb-2">Device-specific email cycling</p>
          <div className={`inline-flex items-center bg-gradient-to-r ${deviceColor} text-white rounded-full px-4 py-2 shadow-md`}>
            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-semibold">{currentDevice || 'No Device Available'}</span>
          </div>
        </div>

        {currentDevice ? (
          <>
            {/* Current Device Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-md">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{currentDeviceAvailable}</div>
                <div className="text-xs sm:text-sm text-gray-600">Available</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-md">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{currentDeviceUsedCount}</div>
                <div className="text-xs sm:text-sm text-gray-600">Used</div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-md">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{currentDeviceEmails.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Total Remaining */}
            <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-md mb-6 sm:mb-8">
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">{totalRemaining}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Remaining (All Devices)</div>
            </div>

            {/* Current Email Display */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-6">
              {currentEmail ? (
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
                    Email for {currentDevice}:
                  </h2>
                  <div className={`bg-gradient-to-r ${getDeviceColor(currentDevice)} rounded-lg p-4 sm:p-6 mb-6`}>
                    <div className="text-lg sm:text-2xl font-mono text-white break-all">
                      {currentEmail}
                    </div>
                    <div className="text-xs text-white/80 mt-2">
                      Email #{getCurrentEmailIndex() + 1} of {currentDeviceEmails.length}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleEmailUsed}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto transform active:scale-95"
                  >
                    Mark as Used & Switch Device
                  </button>
                  
                  <p className="text-xs sm:text-sm text-gray-500 mt-4">
                    Click to mark email as used and switch to a random device
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl sm:text-6xl mb-4">🎉</div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                    All Emails Used for {currentDevice}!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    This device has used all {currentDeviceEmails.length} assigned emails.
                  </p>
                  <button
                    onClick={async () => {
                      const newDevice = getRandomDevice();
                      setCurrentDevice(newDevice);
                      await saveState(deviceUsedEmails, lastResetDate, newDevice);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Switch to Random Device
                  </button>
                </div>
              )}
            </div>

            {/* Current Device Email List */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">{currentDevice} Emails:</h3>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {currentDeviceEmails.map((email, index) => (
                  <div 
                    key={index} 
                    className={`text-sm p-2 rounded flex justify-between items-center ${
                      deviceUsedEmails[currentDevice]?.includes(index)
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <span className={`font-mono break-all ${deviceUsedEmails[currentDevice]?.includes(index) ? 'line-through' : ''}`}>
                      {email}
                    </span>
                    <span className="ml-2 flex-shrink-0">
                      {deviceUsedEmails[currentDevice]?.includes(index) ? '❌' : '✅'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar for Current Device */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress for {currentDevice}</span>
                <span>{currentDeviceUsedCount}/{currentDeviceEmails.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentDeviceUsedCount / currentDeviceEmails.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-6 text-center">
            <div className="text-4xl sm:text-6xl mb-4">😴</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              All Emails Exhausted Across All Devices!
            </h2>
            <p className="text-gray-600 mb-4">
              All 36 emails have been used. Wait for the daily reset.
            </p>
          </div>
        )}

        {/* All Devices Summary */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">All Devices Summary:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {deviceTypes.map((device) => (
              <div 
                key={device} 
                className={`p-3 rounded-lg border-2 transition-colors ${
                  device === currentDevice 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{getDeviceIcon(device)}</div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">{device}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {deviceUsedEmails[device]?.length || 0}/{emailsByDevice[device].length}
                  </div>
                  <div className="text-xs text-gray-500">emails used</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Info */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">System Reset</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Resets daily at midnight: {getTimeUntilReset()} remaining
              </p>
            </div>
            <button
              onClick={resetSystem}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200 w-full sm:w-auto"
              title="Manual reset (for testing)"
            >
              Manual Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}