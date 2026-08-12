'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Animal } from '@/types/animal/types';
import { useState } from 'react';
import { CategoryIcon, DataCategoryIcon, UsersIcon, PinIcon } from '@/components/icons';

const conservationStatusColors: Record<string, string> = {
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

const conservationStatusNames: Record<string, string> = {
  EX: 'Extinct',
  EW: 'Extinct in the Wild',
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
};

export default function AnimalCard({ animal }: { animal: Animal }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/animal/${animal.id}`}
      className="block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none',
          backgroundColor: '#f0f9ff',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-3 py-1.5"
        >
          <CategoryIcon category={animal.category} className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">{animal.category}</span>
        </motion.div>
      </div>
      
      {/* Conservation Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`px-3 py-1.5 rounded-xl text-white text-sm font-medium ${
            conservationStatusColors[animal.conservationStatus]
          }`}
          title={conservationStatusNames[animal.conservationStatus]}
        >
          {animal.conservationStatus}
        </motion.div>
      </div>
      
      {/* Animal Info */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative z-10"
        >
          <h3 className="text-xl font-bold text-white mb-1">{animal.commonName}</h3>
          <p className="text-white/80 text-sm mb-3">{animal.scientificName}</p>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-white/90 text-sm mb-4">
            <div className="flex items-center space-x-1">
              <UsersIcon className="w-4 h-4" />
              <span>{animal.populationEstimate?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <PinIcon className="w-4 h-4" />
              <span>{animal.habitat?.slice(0, 2).join(', ') || 'Unknown'}</span>
            </div>
          </div>
          
          {/* Data Categories and Monitoring Status */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {animal.dataCategories.slice(0, 4).map((category) => (
                <motion.span
                  key={category}
                  whileHover={{ scale: 1.2 }}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                  title={category}
                >
                  <DataCategoryIcon category={category} className="w-3.5 h-3.5 text-white" />
                </motion.span>
              ))}
              {animal.dataCategories.length > 4 && (
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  +{animal.dataCategories.length - 4}
                </span>
              )}
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              animal.isMonitored ? 'text-success-400' : 'text-secondary-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>{animal.isMonitored ? 'Monitored' : 'Not Monitored'}</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Hover Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.8 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
      />
      
      {/* View Profile Button (visible on hover) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
      >
        <button className="bg-white/20 backdrop-blur-lg text-white px-6 py-2 rounded-xl font-medium hover:bg-white/30 transition-colors duration-300">
          View Profile
        </button>
      </motion.div>
    </Link>
  );
}
