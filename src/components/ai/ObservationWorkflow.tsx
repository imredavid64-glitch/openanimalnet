'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recordObservation, getCurrentUser, getUserObservations, getUserProfile, getAllBadges, searchSpeciesForObservation, exportObservations } from '@/lib/citizenScience';
import { sampleAnimals } from '@/data/sample/animals';
import { useOfflineSync } from '@/lib/offlineSync';
import { CameraIcon, PinIcon, CalendarIcon, DownloadIcon, XIcon, CheckIcon, AlertTriangleIcon, SearchIcon, ImageIcon, GlobeIcon, StarIcon } from '@/components/icons';

interface ObservationWorkflowProps {
  defaultSpeciesId?: string;
  onClose?: () => void;
}

const HABITATS = [
  'forest', 'rainforest', 'savanna', 'grassland', 'wetland', 'marsh', 'desert',
  'coastal', 'marine', 'freshwater', 'river', 'lake', 'pond', 'stream',
  'mountain', 'alpine', 'cave', 'urban', 'suburban', 'agricultural', 'garden'
];

const BEHAVIORS = [
  'foraging', 'hunting', 'resting', 'sleeping', 'grooming', 'socializing',
  'mating', 'nesting', 'parental_care', 'migrating', 'territorial', 'playing',
  'drinking', 'basking', 'hiding', 'flying', 'swimming', 'climbing'
];

const LIFE_STAGES = ['egg', 'larva', 'juvenile', 'adult', 'senescent'] as const;
const SEXES = ['male', 'female', 'unknown'] as const;

export default function ObservationWorkflow({ defaultSpeciesId, onClose }: ObservationWorkflowProps) {
  const { online, queueSighting: queueSightingOffline } = useOfflineSync();
  const [step, setStep] = useState<'species' | 'details' | 'media' | 'review' | 'success'>('species');
  const [speciesQuery, setSpeciesQuery] = useState(defaultSpeciesId ? '' : '');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(defaultSpeciesId ?? null);
  const [speciesSuggestions, setSpeciesSuggestions] = useState<string[]>([]);
  
  // Details
  const [count, setCount] = useState(1);
  const [confidence, setConfidence] = useState(80);
  const [identificationMethod, setIdentificationMethod] = useState<'ai' | 'manual' | 'field_guide' | 'expert'>('manual');
  const [notes, setNotes] = useState('');
  const [habitat, setHabitat] = useState<string[]>([]);
  const [behavior, setBehavior] = useState<string[]>([]);
  const [lifeStage, setLifeStage] = useState<'egg' | 'larva' | 'juvenile' | 'adult' | 'senescent'>('adult');
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>('unknown');
  
  // Location
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Media
  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Search species on query change
  useEffect(() => {
    if (speciesQuery.length >= 2) {
      const results = searchSpeciesForObservation(speciesQuery);
      setSpeciesSuggestions(results.map(a => a.id));
    } else {
      setSpeciesSuggestions([]);
    }
  }, [speciesQuery]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    setGettingLocation(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGettingLocation(false);
      },
      err => {
        setLocationError(err.message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      setError('Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotos(prev => [...prev, dataUrl].slice(0, 5));
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const selectSpecies = useCallback((speciesId: string) => {
    setSelectedSpecies(speciesId);
    setSpeciesQuery('');
    setSpeciesSuggestions([]);
  }, []);

  const toggleHabitat = useCallback((h: string) => {
    setHabitat(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  }, []);

  const toggleBehavior = useCallback((b: string) => {
    setBehavior(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecies) { setError('Please select a species'); return; }
    if (!coordinates) { setError('Please get your location'); return; }
    if (photos.length === 0) { setError('Please add at least one photo'); return; }
    
    setSubmitting(true);
    setError('');
    
    const animal = sampleAnimals.find(a => a.id === selectedSpecies)!;
    
    try {
      await recordObservation({
        speciesId: selectedSpecies,
        speciesName: animal.commonName,
        scientificName: animal.scientificName,
        confidence,
        identificationMethod,
        coordinates,
        timestamp: Date.now(),
        photos,
        notes,
        habitat,
        behavior: behavior.length > 0 ? behavior[0] : undefined,
        count,
        lifeStage,
        sex,
      });
      
      setStep('success');
    } catch (err) {
      setError('Failed to save observation');
    } finally {
      setSubmitting(false);
    }
  }, [selectedSpecies, confidence, identificationMethod, coordinates, photos, notes, habitat, behavior, count, lifeStage, sex]);

  const handleExport = useCallback((format: 'json' | 'csv' | 'geojson') => {
    const data = exportObservations(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observations_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const renderSpeciesSearch = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h3 className="text-xl font-bold text-secondary-900 dark:text-white">What did you see?</h3>
      <p className="text-secondary-500 dark:text-secondary-400">Search for a species by common or scientific name</p>
      
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <input
          type="text"
          value={speciesQuery}
          onChange={e => setSpeciesQuery(e.target.value)}
          placeholder="Search species... (e.g., 'lion', 'Panthera leo')"
          className="w-full pl-12 pr-4 py-4 text-lg bg-white dark:bg-secondary-800 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          autoFocus
        />
      </div>
      
      {speciesSuggestions.length > 0 && (
        <div className="max-h-60 overflow-y-auto bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
          {speciesSuggestions.map(speciesId => {
            const animal = sampleAnimals.find(a => a.id === speciesId)!;
            return (
              <button
                key={speciesId}
                onClick={() => selectSpecies(speciesId)}
                className={`w-full px-4 py-3 text-left border-b border-secondary-100 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors ${selectedSpecies === speciesId ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${animal.images?.[0]})` }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary-900 dark:text-white truncate">{animal.commonName}</p>
                    <p className="text-sm italic text-secondary-500 dark:text-secondary-400 truncate">{animal.scientificName}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300">{animal.conservationStatus}</span>
                  </div>
                  {selectedSpecies === speciesId && <CheckIcon className="w-5 h-5 text-primary-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {!selectedSpecies && speciesQuery.length < 2 && (
        <p className="text-sm text-secondary-400 dark:text-secondary-500">Type at least 2 characters to search</p>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={() => { if (selectedSpecies) setStep('details'); }}
          disabled={!selectedSpecies}
          className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
        {onClose && (
          <button onClick={onClose} className="px-4 py-3 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Observation Details</h3>
        <button onClick={() => setStep('species')} className="text-sm text-primary-600 hover:underline">Change species</button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Count</label>
          <input type="number" value={count} onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={1000} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Confidence</label>
          <input type="range" value={confidence} onChange={e => setConfidence(parseInt(e.target.value))} min={0} max={100} step={5} className="w-full accent-primary-600" />
          <p className="text-sm text-secondary-500 mt-1">{confidence}%</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Identification Method</label>
        <div className="grid grid-cols-2 gap-2">
          {(['ai', 'manual', 'field_guide', 'expert'] as const).map(method => (
            <button
              key={method}
              onClick={() => setIdentificationMethod(method)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${identificationMethod === method ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'}`}
            >
              {method === 'ai' ? '🧠 AI Vision' : method === 'manual' ? '👁️ Visual ID' : method === 'field_guide' ? '📖 Field Guide' : '👨‍🔬 Expert'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Life Stage</label>
          <select value={lifeStage} onChange={e => setLifeStage(e.target.value as any)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
            {LIFE_STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Sex</label>
          <select value={sex} onChange={e => setSex(e.target.value as any)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
            {SEXES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Habitat</label>
        <div className="flex flex-wrap gap-2">
          {HABITATS.map(h => (
            <button key={h} type="button" onClick={() => toggleHabitat(h)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${habitat.includes(h) ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'}`}>
              {h}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Behavior</label>
        <div className="flex flex-wrap gap-2">
          {BEHAVIORS.map(b => (
            <button key={b} type="button" onClick={() => toggleBehavior(b)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${behavior.includes(b) ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-secondary-500 dark:text-secondary-400 mb-1">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
      </div>
      
      <div className="flex gap-3">
        <button onClick={() => setStep('species')} className="flex-1 py-3 px-4 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">Back</button>
        <button onClick={() => setStep('media')} className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors">Next: Add Photos</button>
      </div>
    </motion.div>
  );

  const renderMedia = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Add Photos</h3>
      <p className="text-secondary-500 dark:text-secondary-400">Add up to 5 photos (max 10MB each)</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-secondary-200 dark:border-secondary-700">
            <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            <button onClick={() => removePhoto(index)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"><XIcon className="w-4 h-4" /></button>
            <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">{index + 1}</span>
          </div>
        ))}
        {photos.length < 5 && (
          <button onClick={startCamera} className="aspect-square rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-600 flex flex-col items-center justify-center gap-2 text-secondary-500 hover:border-primary-500 hover:text-primary-600 transition-colors bg-secondary-50 dark:bg-secondary-900/50">
            <CameraIcon className="w-8 h-8" />
            <span className="text-sm">Take Photo</span>
          </button>
        )}
        {photos.length < 5 && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-600 flex flex-col items-center justify-center gap-2 text-secondary-500 hover:border-primary-500 hover:text-primary-600 transition-colors bg-secondary-50 dark:bg-secondary-900/50 cursor-pointer">
            <input type="file" accept="image/*" capture="environment" multiple onChange={e => {
              const files = Array.from(e.target.files ?? []);
              const remaining = 5 - photos.length;
              files.slice(0, remaining).forEach(file => {
                const reader = new FileReader();
                reader.onload = ev => setPhotos(prev => [...prev, ev.target?.result as string].slice(0, 5));
                reader.readAsDataURL(file);
              });
            }} className="hidden" />
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">Upload Photos</span>
          </label>
        )}
      </div>
      
      <div className="flex gap-3">
        <button onClick={() => setStep('details')} className="flex-1 py-3 px-4 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">Back</button>
        <button onClick={() => setStep('review')} className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors">Review & Submit</button>
      </div>
      
      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[70vh] rounded-xl" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3 mt-4">
              <button onClick={capturePhoto} className="flex-1 py-3 px-6 rounded-xl bg-white text-black font-medium hover:bg-secondary-100 transition-colors">Capture</button>
              <button onClick={stopCamera} className="flex-1 py-3 px-6 rounded-xl bg-secondary-800 text-white font-medium hover:bg-secondary-700 transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderReview = () => {
    const animal = selectedSpecies ? sampleAnimals.find(a => a.id === selectedSpecies) : null;
    
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Review & Submit</h3>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${animal?.images?.[0]})` }} />
            <div>
              <p className="font-semibold text-secondary-900 dark:text-white">{animal?.commonName}</p>
              <p className="text-sm italic text-secondary-500">{animal?.scientificName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-secondary-500">Count:</span> <span className="font-medium">{count}</span></div>
            <div><span className="text-secondary-500">Confidence:</span> <span className="font-medium">{confidence}%</span></div>
            <div><span className="text-secondary-500">Method:</span> <span className="font-medium">{identificationMethod}</span></div>
            <div><span className="text-secondary-500">Life Stage:</span> <span className="font-medium">{lifeStage}</span></div>
            <div><span className="text-secondary-500">Sex:</span> <span className="font-medium">{sex}</span></div>
            <div><span className="text-secondary-500">Photos:</span> <span className="font-medium">{photos.length}</span></div>
          </div>
          {habitat.length > 0 && (
            <div><span className="text-secondary-500">Habitat:</span> <span className="font-medium">{habitat.join(', ')}</span></div>
          )}
          {behavior.length > 0 && (
            <div><span className="text-secondary-500">Behavior:</span> <span className="font-medium">{behavior.join(', ')}</span></div>
          )}
          {coordinates && (
            <div><span className="text-secondary-500">Location:</span> <span className="font-medium">{coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)} (±{Math.round(coordinates.accuracy)}m)</span></div>
          )}
        </div>
        
        {error && <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 text-sm flex items-center gap-2"><AlertTriangleIcon className="w-4 h-4" />{error}</div>}
        
        <div className="flex gap-3">
          <button onClick={() => setStep('media')} className="flex-1 py-3 px-4 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">Back</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : 'Submit Observation'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderSuccess = () => {
    const profile = getUserProfile();
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.3 }} className="w-24 h-24 mx-auto mb-6 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
          <CheckIcon className="w-12 h-12 text-success-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Observation Submitted!</h3>
        <p className="text-secondary-500 dark:text-secondary-400 mb-6 max-w-sm mx-auto">
          Your observation has been recorded and will sync automatically when online.
        </p>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 mb-6 border border-secondary-200 dark:border-secondary-700 inline-block">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Your stats</p>
          <div className="flex gap-6 mt-2 justify-center">
            <div className="text-center"><p className="text-2xl font-bold font-data text-secondary-900 dark:text-white">{profile.observationsCount + 1}</p><p className="text-xs text-secondary-500">Observations</p></div>
            <div className="text-center"><p className="text-2xl font-bold font-data text-secondary-900 dark:text-white">{profile.speciesCount + (selectedSpecies ? 1 : 0)}</p><p className="text-xs text-secondary-500">Species</p></div>
            <div className="text-center"><p className="text-2xl font-bold font-data text-secondary-900 dark:text-white">{profile.reputation + 5}</p><p className="text-xs text-secondary-500">Reputation</p></div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => { setStep('species'); setSelectedSpecies(null); setPhotos([]); setNotes(''); setHabitat([]); setBehavior([]); setCoordinates(null); }} className="flex-1 py-3 px-6 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors">Record Another</button>
          {onClose && <button onClick={onClose} className="flex-1 py-3 px-6 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">Done</button>}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <CameraIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Record Observation</h1>
              <p className="text-sm text-secondary-500">Contribute to citizen science</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${online ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'}`}>
              {online ? <span className="w-1.5 h-1.5 rounded-full bg-success-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />}
              {online ? 'Online' : 'Offline'}
            </span>
            {onClose && <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"><XIcon className="w-5 h-5" /></button>}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {['species', 'details', 'media', 'review', 'success'].map((s, i) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  ['species', 'details', 'media', 'review', 'success'].indexOf(step) >= i 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500'
                }`}>
                  {['species', 'details', 'media', 'review', 'success'].indexOf(step) === i ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (i + 1)}
                </div>
                <span className="text-[10px] text-secondary-500 mt-1 text-center w-20">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'species' && renderSpeciesSearch()}
          {step === 'details' && renderDetails()}
          {step === 'media' && renderMedia()}
          {step === 'review' && renderReview()}
          {step === 'success' && renderSuccess()}
        </AnimatePresence>

        {/* Offline Notice */}
        {!online && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
            <div className="flex items-center gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-warning-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-warning-800 dark:text-warning-200">You&apos;re offline</p>
                <p className="text-sm text-warning-700 dark:text-warning-300">Observations will be saved locally and synced automatically when connection restores.</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}