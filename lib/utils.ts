import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEVICE_THRESHOLDS, ALERT_CONFIG, GEOGRAPHIC_CONFIG } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Alert {
  id: string
  deviceId: string
  type: "FALL_DETECTED" | "BUTTON_PRESSED"
  timestamp: Date
  latitude: number
  longitude: number
  batteryLevel: number
  signalStrength: number
  status: "received" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high" | "critical"
}

export interface Device {
  id: string
  name: string
  latitude: number
  longitude: number
  batteryLevel: number
  signalStrength: number
  lastActivity: Date
  status: "active" | "inactive" | "low_battery" | "weak_signal"
  zone: string
}

export function calculateDeviceStatus(device: Device): Device["status"] {
  if (device.batteryLevel <= DEVICE_THRESHOLDS.BATTERY_CRITICAL) {
    return "inactive"
  }
  if (device.batteryLevel <= DEVICE_THRESHOLDS.BATTERY_LOW) {
    return "low_battery"
  }
  if (device.signalStrength <= DEVICE_THRESHOLDS.SIGNAL_WEAK) {
    return "weak_signal"
  }
  return "active"
}

export function calculateResponseTime(alerts: Alert[]): number {
  const resolvedAlerts = alerts.filter(a => a.status === "resolved")
  if (resolvedAlerts.length === 0) return 0

  const totalTime = resolvedAlerts.reduce((sum, alert) => {
    const responseTime = ALERT_CONFIG.RESPONSE_TIME_TARGETS[alert.priority] || 300
    return sum + responseTime
  }, 0)

  return Math.round(totalTime / resolvedAlerts.length)
}

export function calculateZoneForDevice(index: number): string {
  const zoneIndex = Math.floor(index / (GEOGRAPHIC_CONFIG.ZONES.length * 4))
  const zone = GEOGRAPHIC_CONFIG.ZONES[zoneIndex % GEOGRAPHIC_CONFIG.ZONES.length]
  return zone.name
}

export function generateDevicePosition(zoneIndex: number): { lat: number; lng: number } {
  const zone = GEOGRAPHIC_CONFIG.ZONES[zoneIndex % GEOGRAPHIC_CONFIG.ZONES.length]
  return {
    lat: zone.lat + (Math.random() - 0.5) * GEOGRAPHIC_CONFIG.ZONE_RADIUS,
    lng: zone.lng + (Math.random() - 0.5) * GEOGRAPHIC_CONFIG.ZONE_RADIUS,
  }
}

export function updateDeviceBattery(currentLevel: number): number {
  const drain = DEVICE_THRESHOLDS.BATTERY_DRAIN_RATE + (Math.random() * 0.02)
  return Math.max(0, currentLevel - drain)
}

export function updateDeviceSignal(currentStrength: number): number {
  const variation = (Math.random() - 0.5) * DEVICE_THRESHOLDS.SIGNAL_VARIATION_RANGE
  return Math.max(DEVICE_THRESHOLDS.SIGNAL_CRITICAL, Math.min(100, currentStrength + variation))
}

export function calculateActiveDevicesPercentage(devices: Device[]): number {
  const activeCount = devices.filter(d => d.status === "active").length
  return Math.round((activeCount / devices.length) * 100)
}

export function getAlertsByHour(alerts: Alert[]): Array<{ hour: string; alerts: number }> {
  const hourCounts = Array(24).fill(0)
  
  alerts.forEach(alert => {
    const hour = alert.timestamp.getHours()
    hourCounts[hour]++
  })

  return hourCounts.map((count, hour) => ({
    hour: `${hour}h`,
    alerts: count
  }))
}

export function getAlertsByZone(alerts: Alert[], devices: Device[]): Array<{ zone: string; alerts: number; trend: "up" | "down" | "stable" }> {
  const zoneCounts = new Map<string, number>()
  
  alerts.forEach(alert => {
    const device = devices.find(d => d.id === alert.deviceId)
    if (device) {
      zoneCounts.set(device.zone, (zoneCounts.get(device.zone) || 0) + 1)
    }
  })

  return Array.from(zoneCounts.entries()).map(([zone, alerts]) => ({
    zone,
    alerts,
    trend: alerts > 5 ? "up" : alerts < 2 ? "down" : "stable" as const
  }))
}
