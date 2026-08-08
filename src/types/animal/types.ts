// Animal Categories
export type AnimalCategory = 
  | 'mammals'
  | 'birds'
  | 'reptiles'
  | 'amphibians'
  | 'fish'
  | 'invertebrates'
  | 'insects'
  | 'marine';

// Conservation Status
export type ConservationStatus = 
  | 'EX' // Extinct
  | 'EW' // Extinct in the Wild
  | 'CR' // Critically Endangered
  | 'EN' // Endangered
  | 'VU' // Vulnerable
  | 'NT' // Near Threatened
  | 'LC' // Least Concern
  | 'DD' // Data Deficient
  | 'NE'; // Not Evaluated

// Data Categories
export type DataCategory = 
  | 'biological'
  | 'behavioral'
  | 'ecological'
  | 'population'
  | 'health'
  | 'agricultural'
  | 'shelter'
  | 'human-interaction';

// Subcategories for each data type
export type BiologicalSubcategory = 
  | 'biometrics'
  | 'genomic'
  | 'physiological'
  | 'endocrine';

export type BehavioralSubcategory = 
  | 'telemetry'
  | 'bioacoustics'
  | 'ethology'
  | 'biomechanics';

export type EcologicalSubcategory = 
  | 'habitat'
  | 'dietary'
  | 'interactions';

export type PopulationSubcategory = 
  | 'abundance'
  | 'demographic'
  | 'conservation';

export type HealthSubcategory = 
  | 'pathogen'
  | 'veterinary'
  | 'zoonotic';

export type AgriculturalSubcategory = 
  | 'yield'
  | 'feed'
  | 'reproductive';

export type ShelterSubcategory = 
  | 'intake'
  | 'operations'
  | 'welfare';

export type HumanInteractionSubcategory = 
  | 'conflict'
  | 'crime'
  | 'infrastructure';

// Location Data
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
  source: string;
}

// Biological & Physiological Data
export interface BiometricsData {
  bodyMass?: number; // in kg
  wingspan?: number; // in cm
  skullWidth?: number; // in mm
  snoutToVentLength?: number; // in mm
  bodyConditionScore?: number; // 1-9 scale
  dentalWear?: string;
  featherCoatQuality?: string;
}

export interface GenomicData {
  wholeGenomeSequence?: string;
  snps?: SNP[];
  parentage?: string[];
  lineage?: string;
  epigeneticMarkers?: EpigeneticMarker[];
  geneExpression?: GeneExpression[];
}

export interface SNP {
  rsId: string;
  chromosome: string;
  position: number;
  allele1: string;
  allele2: string;
  genotype: string;
}

export interface EpigeneticMarker {
  type: 'methylation' | 'acetylation' | 'phosphorylation';
  gene: string;
  position: number;
  value: number;
}

export interface GeneExpression {
  gene: string;
  expressionLevel: number;
  tissue: string;
  condition: string;
}

export interface PhysiologicalMetrics {
  coreBodyTemperature?: number; // in Celsius
  heartRate?: number; // in bpm
  respirationRate?: number; // in breaths per minute
  restingMetabolicRate?: number; // in kJ/day
  bloodPressure?: BloodPressure;
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
  mean: number;
  unit: 'mmHg' | 'kPa';
}

export interface EndocrineData {
  cortisol?: number; // in ng/ml
  corticosterone?: number;
  progesterone?: number;
  testosterone?: number;
  bloodGlucose?: number; // in mg/dL
  lipidProfile?: LipidProfile;
  completeBloodCount?: CBC;
  immuneMarkers?: ImmuneMarker[];
}

export interface LipidProfile {
  totalCholesterol: number;
  hdl: number;
  ldl: number;
  triglycerides: number;
}

export interface CBC {
  redBloodCells: number;
  hemoglobin: number;
  hematocrit: number;
  whiteBloodCells: number;
  platelets: number;
}

export interface ImmuneMarker {
  name: string;
  value: number;
  unit: string;
}

// Behavioral & Spatial Data
export interface TelemetryData {
  gpsCoordinates: Location[];
  altitude?: number[];
  flightHeight?: number[];
  divingDepth?: number[];
  homeRangeBoundary?: GeoJSON.Polygon;
  migrationCorridors?: GeoJSON.LineString[];
}

export interface BioacousticsData {
  vocalizationRecordings?: string[];
  echoLocationFrequencies?: number[];
  frequencyDistributions?: FrequencyDistribution[];
  callCounts?: CallCount[];
}

export interface FrequencyDistribution {
  frequency: number;
  amplitude: number;
  timestamp: Date;
}

export interface CallCount {
  species: string;
  count: number;
  timestamp: Date;
  stressLevel?: 'low' | 'medium' | 'high';
}

export interface EthologicalData {
  foragingTime?: number; // in minutes
  sleepingTime?: number;
  groomingTime?: number;
  matingTime?: number;
  territorialDefenseTime?: number;
}

export interface BiomechanicsData {
  accelerometerData?: TriAxialData[];
  gaitSymmetry?: number;
  strideLength?: number;
  burstSpeed?: number; // in m/s
}

export interface TriAxialData {
  x: number;
  y: number;
  z: number;
  timestamp: Date;
}

// Ecological & Environmental Data
export interface HabitatData {
  vegetationCover?: number; // NDVI
  canopyDensity?: number;
  ambientTemperature?: number;
  humidity?: number;
  waterQuality?: WaterQuality;
  elevation?: number;
}

export interface WaterQuality {
  ph?: number;
  dissolvedOxygen?: number;
  salinity?: number;
}

export interface DietaryData {
  stableIsotopeRatios?: IsotopeRatio;
  fecalDNAMetabarcoding?: string[];
  stomachContentAnalysis?: string[];
  preyDensity?: number;
}

export interface IsotopeRatio {
  carbon13: number;
  nitrogen15: number;
}

export interface InteractionData {
  predatorPreyEncounters?: Encounter[];
  competitiveDisplacements?: Displacement[];
  mutualisticInteractions?: MutualisticInteraction[];
}

export interface Encounter {
  predator: string;
  prey: string;
  timestamp: Date;
  location: Location;
}

export interface Displacement {
  species1: string;
  species2: string;
  timestamp: Date;
  location: Location;
}

export interface MutualisticInteraction {
  species1: string;
  species2: string;
  type: 'pollination' | 'seed_dispersal' | 'symbiosis';
  rate: number;
  timestamp: Date;
}

// Population & Demographic Data
export interface AbundanceData {
  markRecaptureRecords?: MarkRecapture[];
  cameraTrapCaptureRates?: number;
  lineTransectSightCounts?: number;
  aerialSurveyCounts?: number;
}

export interface MarkRecapture {
  individualId: string;
  captureDates: Date[];
  locations: Location[];
}

export interface DemographicData {
  ageClassDistribution?: AgeClass[];
  sexRatio?: SexRatio;
  birthRate?: number;
  fecundityRate?: number;
  juvenileSurvivalRate?: number;
  naturalMortalityRate?: number;
}

export interface AgeClass {
  class: 'juvenile' | 'subadult' | 'adult' | 'senior';
  count: number;
}

export interface SexRatio {
  male: number;
  female: number;
  unknown: number;
}

export interface ConservationMetrics {
  iucnStatus: ConservationStatus;
  rangeContractionPercentage?: number;
  populationFragmentationIndex?: number;
}

// Health, Disease & Zoonotic Risk Data
export interface PathogenData {
  viralLoads?: PathogenLoad[];
  bacterialLoads?: PathogenLoad[];
  parasiteCounts?: ParasiteCount[];
  antibodyTiters?: AntibodyTiter[];
  seroprevalenceRates?: Seroprevalence[];
}

export interface PathogenLoad {
  pathogen: string;
  load: number;
  unit: string;
  timestamp: Date;
}

export interface ParasiteCount {
  type: 'endoparasite' | 'ectoparasite';
  species: string;
  count: number;
  timestamp: Date;
}

export interface AntibodyTiter {
  antibody: string;
  titer: number;
  timestamp: Date;
}

export interface Seroprevalence {
  pathogen: string;
  prevalence: number; // percentage
  population: number;
  timestamp: Date;
}

export interface VeterinaryData {
  clinicalDiagnoses?: Diagnosis[];
  surgicalHistory?: Surgery[];
  vaccinationRecords?: Vaccination[];
  pharmacologicalTreatments?: Treatment[];
  pathologyReports?: PathologyReport[];
}

export interface Diagnosis {
  condition: string;
  diagnosisDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  treatment: string;
}

export interface Surgery {
  type: string;
  date: Date;
  outcome: 'success' | 'complication' | 'failure';
}

export interface Vaccination {
  vaccine: string;
  date: Date;
  nextDue: Date;
}

export interface Treatment {
  medication: string;
  dosage: string;
  startDate: Date;
  endDate?: Date;
}

export interface PathologyReport {
  necropsyDate: Date;
  findings: string[];
  causeOfDeath: string;
}

export interface ZoonoticData {
  vectorAbundance?: VectorAbundance[];
  spilloverEvents?: SpilloverEvent[];
  pathogenMutations?: PathogenMutation[];
}

export interface VectorAbundance {
  vector: 'mosquito' | 'tick' | 'flea' | 'other';
  species: string;
  count: number;
  location: Location;
  timestamp: Date;
}

export interface SpilloverEvent {
  pathogen: string;
  fromSpecies: string;
  toSpecies: string;
  timestamp: Date;
  location: Location;
}

export interface PathogenMutation {
  pathogen: string;
  mutation: string;
  timestamp: Date;
  significance: 'low' | 'medium' | 'high';
}

// Agricultural & Livestock Data
export interface YieldData {
  milkVolume?: number;
  milkFatContent?: number;
  dailyWeightGain?: number;
  eggProductionRate?: number;
  woolFleeceWeight?: number;
}

export interface FeedData {
  feedConversionRatio?: number;
  dailyFeedConsumption?: number;
  waterUsage?: number;
}

export interface ReproductiveData {
  estrusDetectionLogs?: EstrusLog[];
  aiSuccessRate?: number;
  litterSize?: number;
  birthInterval?: number; // in days
}

export interface EstrusLog {
  individualId: string;
  detectionDate: Date;
  method: string;
}

// Shelter, Welfare & Companion Animal Data
export interface IntakeData {
  strayArrivalCounts?: number;
  ownerSurrenderReasons?: string[];
  liveReleaseRate?: number;
  euthanasiaCounts?: number;
  returnToOwnerStats?: RTOStats;
}

export interface RTOStats {
  count: number;
  percentage: number;
}

export interface ShelterOperationsData {
  microchipRegistrationRate?: number;
  averageLengthOfStay?: number; // in days
  adoptionReturnRate?: number;
  shelterCapacity?: CapacityData;
}

export interface CapacityData {
  current: number;
  maximum: number;
  percentage: number;
}

export interface WelfareData {
  aggressionAssessmentScores?: AssessmentScore[];
  separationAnxietyMetrics?: AnxietyMetric[];
  stereotypicBehaviorFrequencies?: StereotypicBehavior[];
}

export interface AssessmentScore {
  individualId: string;
  score: number; // 1-10 scale
  timestamp: Date;
}

export interface AnxietyMetric {
  individualId: string;
  score: number;
  timestamp: Date;
}

export interface StereotypicBehavior {
  individualId: string;
  behavior: 'pacing' | 'feather_plucking' | 'tail_chasing' | 'other';
  frequency: number; // per hour
  timestamp: Date;
}

// Human-Animal Interaction & Threat Data
export interface ConflictData {
  cropRaidingIncidents?: Incident[];
  livestockDepredationCases?: Case[];
  humanAttackLogs?: AttackLog[];
}

export interface Incident {
  species: string;
  location: Location;
  timestamp: Date;
  damage: number;
}

export interface Case {
  predator: string;
  livestock: string;
  count: number;
  location: Location;
  timestamp: Date;
}

export interface AttackLog {
  species: string;
  severity: 'minor' | 'moderate' | 'severe' | 'fatal';
  location: Location;
  timestamp: Date;
}

export interface CrimeData {
  snareCounts?: Snare[];
  illegalWildlifeTrade?: TradeData[];
  poachingHotspots?: Location[];
}

export interface Snare {
  location: Location;
  count: number;
  removalDate: Date;
}

export interface TradeData {
  species: string;
  marketPrice: number;
  currency: string;
  quantity: number;
  timestamp: Date;
}

export interface InfrastructureData {
  animalVehicleCollisions?: Collision[];
  powerlineElectrocutions?: Electrocution[];
  windTurbineCollisions?: TurbineCollision[];
}

export interface Collision {
  species: string;
  location: Location;
  timestamp: Date;
  outcome: 'survived' | 'injured' | 'fatal';
}

export interface Electrocution {
  species: string;
  location: Location;
  timestamp: Date;
}

export interface TurbineCollision {
  species: string;
  location: Location;
  timestamp: Date;
  turbineId: string;
}

// Main Animal Data Interface
export interface Animal {
  id: string;
  commonName: string;
  scientificName: string;
  category: AnimalCategory;
  description?: string;
  images?: string[];
  conservationStatus: ConservationStatus;
  taxonomy: Taxonomy;
  location: Location;
  habitat?: string[];
  populationEstimate?: number;
  isMonitored: boolean;
  lastUpdated: Date;
  dataCategories: DataCategory[];
}

export interface Taxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

// Comprehensive Animal Data
export interface AnimalData {
  animal: Animal;
  biological?: {
    biometrics?: BiometricsData;
    genomic?: GenomicData;
    physiological?: PhysiologicalMetrics;
    endocrine?: EndocrineData;
  };
  behavioral?: {
    telemetry?: TelemetryData;
    bioacoustics?: BioacousticsData;
    ethology?: EthologicalData;
    biomechanics?: BiomechanicsData;
  };
  ecological?: {
    habitat?: HabitatData;
    dietary?: DietaryData;
    interactions?: InteractionData;
  };
  population?: {
    abundance?: AbundanceData;
    demographic?: DemographicData;
    conservation?: ConservationMetrics;
  };
  health?: {
    pathogen?: PathogenData;
    veterinary?: VeterinaryData;
    zoonotic?: ZoonoticData;
  };
  agricultural?: {
    yield?: YieldData;
    feed?: FeedData;
    reproductive?: ReproductiveData;
  };
  shelter?: {
    intake?: IntakeData;
    operations?: ShelterOperationsData;
    welfare?: WelfareData;
  };
  humanInteraction?: {
    conflict?: ConflictData;
    crime?: CrimeData;
    infrastructure?: InfrastructureData;
  };
  metadata: {
    collectedBy: string;
    collectionDate: Date;
    sources: string[];
    confidence: number; // 0-1
  };
}

// Monitoring Status
export interface MonitoringStatus {
  isActive: boolean;
  lastCheck: Date;
  frequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  alerts: Alert[];
}

export interface Alert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  severity: number; // 1-10
}

// Filter Types
export interface AnimalFilter {
  categories?: AnimalCategory[];
  conservationStatus?: ConservationStatus[];
  dataCategories?: DataCategory[];
  location?: {
    latitude: [number, number];
    longitude: [number, number];
  };
  populationRange?: [number, number];
  isMonitored?: boolean;
  searchQuery?: string;
}

export interface DataFilter {
  category?: DataCategory;
  subcategory?: string;
  dateRange?: [Date, Date];
  location?: {
    latitude: [number, number];
    longitude: [number, number];
  };
  animalId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
