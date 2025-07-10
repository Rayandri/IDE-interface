export const SIMULATION_CONFIG = {
  DEVICE_COUNT: 100,
  SIMULATION_INTERVAL: 3000,
  MAX_ALERTS_HISTORY: 50,
  ALERT_GENERATION_PROBABILITY: 0.3,
  FALL_DETECTION_PROBABILITY: 0.6,
} as const

export const GEOGRAPHIC_CONFIG = {
  PARIS_CENTER: {
    lat: 48.8566,
    lng: 2.3522,
  },
  ZONE_RADIUS: 0.1,
  DEVICE_SPREAD: 0.001,
  ZONES: [
    { id: 1, name: "Zone 1 - Centre", lat: 48.8566, lng: 2.3522 },
    { id: 2, name: "Zone 2 - Nord", lat: 48.88, lng: 2.3522 },
    { id: 3, name: "Zone 3 - Sud", lat: 48.83, lng: 2.3522 },
    { id: 4, name: "Zone 4 - Est", lat: 48.8566, lng: 2.38 },
    { id: 5, name: "Zone 5 - Ouest", lat: 48.8566, lng: 2.32 },
  ],
} as const

export const DEVICE_THRESHOLDS = {
  BATTERY_LOW: 20,
  BATTERY_CRITICAL: 10,
  SIGNAL_WEAK: 30,
  SIGNAL_CRITICAL: 10,
  BATTERY_DRAIN_RATE: 0.05,
  SIGNAL_VARIATION_RANGE: 3,
} as const

export const ALERT_CONFIG = {
  PRIORITY_WEIGHTS: {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  },
  RESPONSE_TIME_TARGETS: {
    critical: 120,
    high: 180,
    medium: 300,
    low: 600,
  },
} as const

export const UI_CONFIG = {
  COLORS: {
    success: "#22c55e",
    warning: "#f59e0b", 
    error: "#ef4444",
    info: "#3b82f6",
  },
  GRID_SIZES: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
} as const 
