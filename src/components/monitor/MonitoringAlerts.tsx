'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { sampleAnimals, sampleMonitoringData } from '@/data/sample/animals';
import { ConservationStatus } from '@/types/animal/types';

const conservationStatusColors: Record<ConservationStatus, string> = {
  EX: 'bg-danger-500',
  EW: 'bg-danger-500',
  CR: 'bg-danger-400',
  EN: 'bg-warning-500',
  VU: 'bg-warning-400',
  NT: 'bg-warning-300',
  LC: 'bg-success-500',
  DD: 'bg-secondary-500',
  NE: 'bg-secondary-400',
};

const alertTypes = [
  { type: 'critical', name: 'Critical', icon: '🚨', color: 'bg-danger-500' },
  { type: 'warning', name: 'Warning', icon: '⚠️', color: 'bg-warning-500' },
  { type: 'info', name: 'Info', icon: 'ℹ️', color: 'bg-primary-500' },
];

// Sample alerts
const sampleAlerts = [
  {
    id: 'alert-001',
    type: 'critical' as const,
    animal: sampleAnimals[1],
    message: 'Elephant herd approaching human settlement in Kenya',
    timestamp: new Date(Date.now() - 3600000),
    severity: 9,
    location: { lat: -1.2921, lng: 36.8219 },
    action: 'Immediate intervention required',
  },
  {
    id: 'alert-002',
    type: 'warning' as const,
    animal: sampleAnimals[0],
    message: 'Lion pride showing unusual movement patterns',
    timestamp: new Date(Date.now() - 7200000),
    severity: 6,
    location: { lat: -2.3333, lng: 35.0833 },
    action: 'Monitor closely',
  },
  {
    id: 'alert-003',
    type: 'info' as const,
    animal: sampleAnimals[3],
    message: 'New bald eagle nest discovered in Alaska',
    timestamp: new Date(Date.now() - 10800000),
    severity: 3,
    location: { lat: 61.3707, lng: -152.3978 },
    action: 'Document and verify',
  },
  {
    id: 'alert-004',
    type: 'critical' as const,
    animal: sampleAnimals[2],
    message: 'Tiger sighting near village in India',
    timestamp: new Date(Date.now() - 14400000),
    severity: 8,
    location: { lat: 23.0, lng: 88.0 },
    action: 'Alert local authorities',
  },
  {
    id: 'alert-005',
    type: 'warning' as const,
    animal: sampleAnimals[4],
    message: 'Blue whale migration path deviation detected',
    timestamp: new Date(Date.now() - 18000000),
    severity: 7,
    location: { lat: -30.0, lng: -120.0 },
    action: 'Investigate environmental factors',
  },
];

export default function MonitoringAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredAlerts = filterType === 'all'
    ? sampleAlerts
    : sampleAlerts.filter(alert => alert.type === filterType);

  const displayedAlerts = isExpanded ? filteredAlerts : filteredAlerts.slice(0, 4);

  // Auto-scroll alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Auto-select first alert for demo purposes
      if (filteredAlerts.length > 0 && !selectedAlert) {
        setSelectedAlert(filteredAlerts[0].id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredAlerts, selectedAlert]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          <span className="text-4xl">🔔</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
          Real-Time Monitoring Alerts
        </h2>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
          Stay informed with real-time alerts from our global animal monitoring network.
          Track critical events, unusual behaviors, and conservation concerns.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex space-x-2">
          {alertTypes.map((alertType) => (
            <button
              key={alertType.type}
              onClick={() => setFilterType(alertType.type === 'all' ? 'all' : alertType.type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                filterType === alertType.type
                  ? 'bg-white text-primary-600 shadow-lg'
                  : 'bg-white/20 dark:bg-secondary-800/50 text-white dark:text-secondary-300 hover:bg-white/30 dark:hover:bg-secondary-700/50'
              }`}
            >
              <span>{alertType.icon}</span>
              <span>{alertType.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-300"
        >
          {isExpanded ? 'Show Less' : 'Show All'}
        </button>
        <Link
          href="/monitor"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-900 dark:text-secondary-100 transition-colors duration-300"
        >
          View All Alerts
        </Link>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
            className={`relative cursor-pointer ${
              selectedAlert === alert.id ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            {/* Alert Card */}
            <div
              className={`relative rounded-2xl overflow-hidden shadow-lg transition-shadow duration-300 ${
                alert.type === 'critical' ? 'bg-danger-50 dark:bg-danger-900/20' :
                alert.type === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20' :
                'bg-primary-50 dark:bg-primary-900/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    alert.type === 'critical' ? 'bg-danger-500' :
                    alert.type === 'warning' ? 'bg-warning-500' :
                    'bg-primary-500'
                  }`}>
                    <span className="text-xl text-white">
                      {alertTypes.find(a => a.type === alert.type)?.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">
                      {alert.type.toUpperCase()}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{alert.severity}</span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full ${
                      alert.animal.isMonitored ? 'bg-success-500' : 'bg-secondary-400'
                    }`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center">
                    <span className="text-xl">{alert.animal.category[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">
                      {alert.animal.commonName}
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      {alert.animal.scientificName}
                    </div>
                  </div>
                </div>
                <p className="text-secondary-700 dark:text-secondary-300 mb-4 line-clamp-2">
                  {alert.message}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-secondary-500 dark:text-secondary-400">
                    <span>📍</span>
                    <span>{alert.location.lat.toFixed(2)}, {alert.location.lng.toFixed(2)}</span>
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium">
                    {alert.action}
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-1 bg-white/20 dark:bg-white/10 mx-4 mb-4 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    alert.type === 'critical' ? 'bg-danger-500' :
                    alert.type === 'warning' ? 'bg-warning-500' :
                    'bg-primary-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${alert.severity * 10}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-secondary-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {(() => {
                const alert = sampleAlerts.find(a => a.id === selectedAlert);
                if (!alert) return null;
                
                return (
                  <>
                    {/* Header */}
                    <div className="relative p-6 border-b border-secondary-200 dark:border-secondary-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                            alert.type === 'critical' ? 'bg-danger-500' :
                            alert.type === 'warning' ? 'bg-warning-500' :
                            'bg-primary-500'
                          }`}>
                            <span className="text-3xl text-white">
                              {alertTypes.find(a => a.type === alert.type)?.icon}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                              {alert.type.toUpperCase()} ALERT
                            </h2>
                            <div className="text-sm text-secondary-500 dark:text-secondary-400">
                              Severity: {alert.severity}/10
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedAlert(null)}
                          className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors duration-300"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                      <div className="mt-4 text-sm text-secondary-500 dark:text-secondary-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Animal Info */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div
                          className="w-20 h-20 rounded-2xl bg-cover bg-center"
                          style={{
                            backgroundImage: alert.animal.images?.[0] ? `url(${alert.animal.images[0]})` : 'none',
                            backgroundColor: '#f0f9ff',
                          }}
                        />
                        <div>
                          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                            {alert.animal.commonName}
                          </h3>
                          <p className="text-secondary-600 dark:text-secondary-400">
                            {alert.animal.scientificName}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className={`px-2 py-1 rounded-lg text-white text-xs font-medium ${
                              conservationStatusColors[alert.animal.conservationStatus]
                            }`}>
                              {alert.animal.conservationStatus}
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              alert.animal.isMonitored ? 'bg-success-500 text-white' : 'bg-secondary-500 text-white'
                            }`}>
                              {alert.animal.isMonitored ? '✅ Monitored' : '❌ Not Monitored'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alert Details */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                          Alert Message
                        </h4>
                        <p className="text-secondary-700 dark:text-secondary-300">
                          {alert.message}
                        </p>
                      </div>
                      
                      {/* Location and Action */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                            Location
                          </h4>
                          <div className="text-secondary-700 dark:text-secondary-300">
                            <div>Latitude: {alert.location.lat.toFixed(4)}</div>
                            <div>Longitude: {alert.location.lng.toFixed(4)}</div>
                            <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                              {alert.animal.habitat?.join(', ') || 'Unknown habitat'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                            Recommended Action
                          </h4>
                          <div className={`px-3 py-2 rounded-xl text-sm font-medium ${
                            alert.type === 'critical' ? 'bg-danger-50 text-danger-700' :
                            alert.type === 'warning' ? 'bg-warning-50 text-warning-700' :
                            'bg-primary-50 text-primary-700'
                          }`}>
                            {alert.action}
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl p-4">
                        <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                          Animal Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-secondary-400">Category</div>
                            <div className="text-secondary-700 dark:text-secondary-300">{alert.animal.category}</div>
                          </div>
                          <div>
                            <div className="text-secondary-400">Population</div>
                            <div className="text-secondary-700 dark:text-secondary-300">{alert.animal.populationEstimate?.toLocaleString() || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-secondary-400">Last Updated</div>
                            <div className="text-secondary-700 dark:text-secondary-300">{new Date(alert.animal.lastUpdated).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-secondary-400">Data Categories</div>
                            <div className="text-secondary-700 dark:text-secondary-300">{alert.animal.dataCategories.length}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-4 mt-6">
                        <Link
                          href={`/animal/${alert.animal.id}`}
                          className="btn-primary flex-1 text-center"
                        >
                          View Animal Profile
                        </Link>
                        <Link
                          href={`/monitor?animal=${alert.animal.id}`}
                          className="btn-secondary flex-1 text-center"
                        >
                          Monitor This Animal
                        </Link>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
