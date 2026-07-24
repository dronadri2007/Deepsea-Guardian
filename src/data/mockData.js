// ============================================================
//  DeepSea Guardian — Mock Data  (hardcoded / dummy data, per hackathon rules)
//  x / y are PERCENT positions (0–100) for placing markers on a styled map.
// ============================================================

// ---- Top-level KPIs (dashboard header cards) ----
export const kpis = {
  activeAlerts: 7,
  plasticHotspots: 3,
  ghostNets: 5,
  bleachingRisk: 'HIGH', // LOW | MODERATE | HIGH
  dronesOnline: 12,
  sensorsLive: 48,
};

// ---- Monitoring zones (core of the Ocean Health Index) ----
// severity levels 0–3:  0 none · 1 low · 2 moderate · 3 high
export const zones = [
  { id: 'C-4', name: 'North Pacific C-4', region: 'North Pacific',  x: 34, y: 42, plastic: 3, bleaching: 3, ghostNets: 2, risk: 'high',     lat: 34.2,  lng: -142.1 },
  { id: 'B-2', name: 'Mariana B-2',       region: 'Mariana Trench', x: 62, y: 55, plastic: 1, bleaching: 0, ghostNets: 3, risk: 'moderate', lat: 17.7,  lng: 142.5 },
  { id: 'A-7', name: 'Coral Sea A-7',     region: 'Coral Sea',      x: 71, y: 71, plastic: 0, bleaching: 1, ghostNets: 0, risk: 'low',      lat: -18.2, lng: 152.0 },
  { id: 'D-1', name: 'Bengal Deep D-1',   region: 'Bay of Bengal',  x: 48, y: 33, plastic: 2, bleaching: 1, ghostNets: 1, risk: 'moderate', lat: 12.5,  lng: 88.0 },
  { id: 'E-9', name: 'Atlantic Rise E-9', region: 'Mid-Atlantic',   x: 20, y: 62, plastic: 1, bleaching: 0, ghostNets: 0, risk: 'low',      lat: 2.1,   lng: -30.4 },
  { id: 'F-3', name: 'Java Basin F-3',    region: 'Java Sea',       x: 80, y: 47, plastic: 3, bleaching: 2, ghostNets: 2, risk: 'high',     lat: -5.9,  lng: 110.3 },
];

// ---- Ocean Health Index (SIGNATURE feature) ----
// Fuses four threat signals into one 0–100 score. Higher = healthier.
export function oceanHealthIndex(zone) {
  const w = { plastic: 7, bleaching: 7, ghostNets: 3 };
  const riskPenalty = { low: 3, moderate: 7, high: 12 }[zone.risk] ?? 0;
  const raw = 100
    - zone.plastic * w.plastic
    - zone.bleaching * w.bleaching
    - Math.min(zone.ghostNets, 3) * w.ghostNets
    - riskPenalty;
  return Math.max(0, Math.min(100, raw));
}

export function healthBand(score) {
  if (score >= 70) return { label: 'Good', color: '#2ec16e' };
  if (score >= 40) return { label: 'Moderate', color: '#ffb020' };
  return { label: 'Critical', color: '#ff5a4d' };
}

export const fleetHealthIndex = Math.round(
  zones.reduce((s, z) => s + oceanHealthIndex(z), 0) / zones.length
);

// ---- AI detection feed ----
// severity: critical (red) | warning (amber) | info (teal/green)
export const detections = [
  { id: 1, type: 'Illegal dumping detected', zone: 'C-4', confidence: 96, severity: 'critical', time: '2 min ago' },
  { id: 2, type: 'Ghost net cluster', zone: 'B-2', confidence: 91, severity: 'warning', time: '9 min ago' },
  { id: 3, type: 'Endangered species sighted', detail: 'Leatherback turtle', zone: 'A-7', confidence: 88, severity: 'info', time: '14 min ago' },
  { id: 4, type: 'Coral bleaching onset', zone: 'C-4', confidence: 84, severity: 'critical', time: '22 min ago', detail: '+1.8°C anomaly' },
  { id: 5, type: 'Plastic accumulation', zone: 'F-3', confidence: 93, severity: 'warning', time: '31 min ago' },
  { id: 6, type: 'Ghost net cluster', zone: 'F-3', confidence: 79, severity: 'warning', time: '48 min ago' },
  { id: 7, type: 'Whale pod detected', detail: 'Blue whale ×3', zone: 'E-9', confidence: 90, severity: 'info', time: '1 hr ago' },
  { id: 8, type: 'Illegal trawling flagged', zone: 'D-1', confidence: 82, severity: 'critical', time: '1 hr ago' },
];

// ---- Endangered species tracker ----
export const species = [
  { name: 'Leatherback Turtle', status: 'Vulnerable', sightings: 12, trend: 'up', zone: 'A-7' },
  { name: 'Blue Whale', status: 'Endangered', sightings: 3, trend: 'flat', zone: 'E-9' },
  { name: 'Hawksbill Turtle', status: 'Critically Endangered', sightings: 5, trend: 'up', zone: 'A-7' },
  { name: 'Whale Shark', status: 'Endangered', sightings: 7, trend: 'down', zone: 'D-1' },
  { name: 'Dugong', status: 'Vulnerable', sightings: 4, trend: 'flat', zone: 'F-3' },
  { name: 'Hammerhead Shark', status: 'Critically Endangered', sightings: 2, trend: 'down', zone: 'B-2' },
];

// ---- 7-day risk index (Recharts) ----
export const riskTrend = [
  { day: 'Mon', index: 54 },
  { day: 'Tue', index: 60 },
  { day: 'Wed', index: 58 },
  { day: 'Thu', index: 67 },
  { day: 'Fri', index: 64 },
  { day: 'Sat', index: 71 },
  { day: 'Sun', index: 68 },
];

// ---- Alerts & Reports (table page) ----
export const alerts = [
  { id: 'ALT-1042', zone: 'C-4', type: 'Illegal dumping', severity: 'Critical', status: 'Open', raised: '2 min ago' },
  { id: 'ALT-1041', zone: 'F-3', type: 'Plastic hotspot', severity: 'High', status: 'Open', raised: '31 min ago' },
  { id: 'ALT-1039', zone: 'C-4', type: 'Coral bleaching', severity: 'Critical', status: 'Investigating', raised: '22 min ago' },
  { id: 'ALT-1037', zone: 'B-2', type: 'Ghost net cluster', severity: 'Medium', status: 'Dispatched', raised: '1 hr ago' },
  { id: 'ALT-1030', zone: 'D-1', type: 'Illegal trawling', severity: 'Critical', status: 'Resolved', raised: '3 hr ago' },
  { id: 'ALT-1024', zone: 'A-7', type: 'Species sighting', severity: 'Low', status: 'Logged', raised: '5 hr ago' },
];

// ---- Fleet status ----
export const fleet = {
  drones: { online: 12, total: 14, status: 'operational' },
  sensors: { online: 48, total: 52, status: 'operational' },
  satellite: { status: 'syncing', lastSync: '3 min ago' },
};

// ---- "How it works" pipeline (Home) ----
export const pipeline = [
  { step: 1, title: 'Collect', text: 'Drones, sonar, satellite & IoT sensors stream ocean data.' },
  { step: 2, title: 'Detect', text: 'AI flags dumping, plastic, ghost nets, bleaching & species.' },
  { step: 3, title: 'Score', text: 'The Ocean Health Index fuses it into one 0–100 number per zone.' },
  { step: 4, title: 'Predict', text: 'Risk heatmaps forecast threat zones before damage occurs.' },
  { step: 5, title: 'Act', text: 'Alerts & reports reach authorities, researchers and NGOs.' },
];

// ---- Problem stats (Home hero band) ----
export const problemStats = [
  { value: '80%+', label: 'of the ocean is unexplored & unmonitored' },
  { value: '8–14Mt', label: 'of plastic dumped into oceans every year' },
  { value: '~1Mt', label: 'of ghost-fishing gear lost yearly' },
  { value: '84%', label: "of the world's reefs hit by bleaching (2023–25)" },
];

// ---- Feature grid (Home) ----
export const features = [
  { icon: 'Map', title: 'Live Monitoring Map', text: 'Real-time drones, sensors and vessels across every active zone.' },
  { icon: 'ScanEye', title: 'AI Detection Feed', text: 'Auto-flags dumping, plastic, ghost nets, bleaching & species.' },
  { icon: 'Activity', title: 'Predictive Risk Maps', text: 'Forecast pollution spread and threat zones before damage occurs.' },
  { icon: 'Gauge', title: 'Ocean Health Index', text: 'One AI-fused 0–100 score per zone — complexity made actionable.' },
  { icon: 'Fish', title: 'Biodiversity Tracker', text: 'Monitor endangered species populations and sighting trends.' },
  { icon: 'BellRing', title: 'Alerts & Reports', text: 'Actionable, shareable insights for authorities, researchers & NGOs.' },
];

// ---- Multi-source sensor network layers (x/y are percent positions) ----
export const sensorLayers = {
  drones: [
    { id: 'DRN-01', x: 30, y: 40, battery: 82, status: 'surveying' },
    { id: 'DRN-02', x: 66, y: 58, battery: 64, status: 'surveying' },
    { id: 'DRN-03', x: 74, y: 30, battery: 91, status: 'returning' },
    { id: 'DRN-04', x: 24, y: 66, battery: 55, status: 'surveying' },
  ],
  sonar: [
    { id: 'S1', x: 34, y: 42, label: 'Hard contact' },
    { id: 'S2', x: 48, y: 33, label: 'Debris field' },
    { id: 'S3', x: 80, y: 47, label: 'Net cluster' },
    { id: 'S4', x: 62, y: 55, label: 'Sediment plume' },
  ],
  satellite: {
    swath: { top: 12, height: 34 },   // percent band representing the orbital pass
    flags: [
      { id: 'SAT1', x: 34, y: 30, label: 'Surface plastic' },
      { id: 'SAT2', x: 62, y: 38, label: 'Turbidity spike' },
    ],
  },
  iot: [
    { id: 'IOT-14', x: 20, y: 62, temp: 3.8, ph: 7.9 },
    { id: 'IOT-22', x: 48, y: 33, temp: 6.1, ph: 7.7 },
    { id: 'IOT-31', x: 71, y: 71, temp: 9.4, ph: 8.0 },
    { id: 'IOT-09', x: 62, y: 55, temp: 4.2, ph: 7.8 },
    { id: 'IOT-05', x: 80, y: 47, temp: 7.6, ph: 7.6 },
  ],
};
