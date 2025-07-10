import { Alert, Device } from "./utils"
import { SIMULATION_CONFIG, GEOGRAPHIC_CONFIG } from "./constants"

export interface SimulationParams {
  alertFrequency: number // en secondes
  selectedZone: string
  alertType: string
  scenario: string
  isRunning: boolean
  customAlertProbability?: number
  customFallProbability?: number
}

export interface SimulationState {
  params: SimulationParams
  stats: {
    totalGeneratedAlerts: number
    startTime: Date
    lastAlertTime: Date | null
    scenarioStartTime: Date | null
  }
}

export class SimulationManager {
  private state: SimulationState

  constructor() {
    this.state = {
      params: {
        alertFrequency: 3,
        selectedZone: "random",
        alertType: "random",
        scenario: "normal",
        isRunning: true,
      },
      stats: {
        totalGeneratedAlerts: 0,
        startTime: new Date(),
        lastAlertTime: null,
        scenarioStartTime: null,
      }
    }
  }

  updateParams(newParams: Partial<SimulationParams>) {
    this.state.params = { ...this.state.params, ...newParams }
    
    // Si on change de scénario, reset le timer du scénario
    if (newParams.scenario) {
      this.state.stats.scenarioStartTime = new Date()
    }
  }

  getState(): SimulationState {
    return { ...this.state }
  }

  shouldGenerateAlert(): boolean {
    if (!this.state.params.isRunning) return false

    const now = Date.now()
    const lastAlert = this.state.stats.lastAlertTime?.getTime() || 0
    const interval = this.state.params.alertFrequency * 1000

    // Vérifier si assez de temps s'est écoulé
    if (now - lastAlert < interval) return false

    // Probabilité basée sur le scénario
    const probability = this.getAlertProbability()
    return Math.random() < probability
  }

  private getAlertProbability(): number {
    const baseProbability = this.state.params.customAlertProbability || SIMULATION_CONFIG.ALERT_GENERATION_PROBABILITY

    switch (this.state.params.scenario) {
      case "peak":
        return baseProbability * 3 // 3x plus d'alertes
      case "emergency":
        return baseProbability * 5 // 5x plus d'alertes
      case "maintenance":
        return baseProbability * 0.5 // 50% moins d'alertes
      default:
        return baseProbability
    }
  }

  getFallDetectionProbability(): number {
    const baseProbability = this.state.params.customFallProbability || SIMULATION_CONFIG.FALL_DETECTION_PROBABILITY

    switch (this.state.params.scenario) {
      case "emergency":
        return 0.8 // 80% de chutes en mode urgence
      case "maintenance":
        return 0.1 // 10% de chutes en maintenance
      default:
        return baseProbability
    }
  }

  generateAlert(devices: Device[]): Alert | null {
    if (!this.shouldGenerateAlert() || devices.length === 0) return null

    // Incrémenter le compteur
    this.state.stats.totalGeneratedAlerts++
    this.state.stats.lastAlertTime = new Date()

    // Sélectionner un dispositif basé sur la zone
    const device = this.selectDevice(devices)
    if (!device) return null

    // Déterminer le type d'alerte
    const alertType = this.getAlertType()

    // Déterminer la priorité basée sur le scénario
    const priority = this.getAlertPriority(alertType)

    // Ajouter plus de variabilité dans les alertes
    const batteryVariation = (Math.random() - 0.5) * 20 // ±10%
    const signalVariation = (Math.random() - 0.5) * 30 // ±15%
    const positionSpread = GEOGRAPHIC_CONFIG.DEVICE_SPREAD * (1 + Math.random() * 2) // 1x à 3x plus de spread
    
    const alert: Alert = {
      id: `sim_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId: device.id,
      type: alertType,
      timestamp: new Date(),
      latitude: device.latitude + (Math.random() - 0.5) * positionSpread,
      longitude: device.longitude + (Math.random() - 0.5) * positionSpread,
      batteryLevel: Math.max(0, Math.min(100, device.batteryLevel + batteryVariation)),
      signalStrength: Math.max(0, Math.min(100, device.signalStrength + signalVariation)),
      status: "received",
      priority,
    }

    return alert
  }

  private selectDevice(devices: Device[]): Device | null {
    if (this.state.params.selectedZone === "random") {
      return devices[Math.floor(Math.random() * devices.length)]
    }

    // Filtrer par zone si spécifiée
    const zoneName = this.getZoneNameFromId(this.state.params.selectedZone)
    const zoneDevices = devices.filter(d => d.zone === zoneName)
    
    if (zoneDevices.length === 0) {
      return devices[Math.floor(Math.random() * devices.length)]
    }

    return zoneDevices[Math.floor(Math.random() * zoneDevices.length)]
  }

  private getZoneNameFromId(zoneId: string): string {
    const zones = {
      "zone1": "Zone 1 - Centre",
      "zone2": "Zone 2 - Nord", 
      "zone3": "Zone 3 - Sud",
      "zone4": "Zone 4 - Est",
      "zone5": "Zone 5 - Ouest"
    }
    return zones[zoneId as keyof typeof zones] || "Zone 1 - Centre"
  }

  private getAlertType(): Alert["type"] {
    if (this.state.params.alertType !== "random") {
      return this.state.params.alertType as Alert["type"]
    }

    const fallProbability = this.getFallDetectionProbability()
    return Math.random() < fallProbability ? "FALL_DETECTED" : "BUTTON_PRESSED"
  }

  private getAlertPriority(alertType: Alert["type"]): Alert["priority"] {
    if (alertType === "FALL_DETECTED") {
      return "critical"
    }

    // Pour les boutons d'urgence, varie selon le scénario
    switch (this.state.params.scenario) {
      case "emergency":
        return "high"
      case "maintenance":
        return "low"
      default:
        return "high"
    }
  }

  getSimulationInterval(): number {
    // Plus le scénario est intense, plus on vérifie souvent
    switch (this.state.params.scenario) {
      case "emergency":
        return 1000 // Vérifier chaque seconde
      case "peak":
        return 1500 // Vérifier toutes les 1.5 secondes
      default:
        return SIMULATION_CONFIG.SIMULATION_INTERVAL
    }
  }

  getUptime(): string {
    const uptime = Date.now() - this.state.stats.startTime.getTime()
    const hours = Math.floor(uptime / (1000 * 60 * 60))
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h${minutes}m` : `${minutes}m`
  }

  getEventsPerHour(): number {
    const uptime = (Date.now() - this.state.stats.startTime.getTime()) / (1000 * 60 * 60)
    return uptime > 0 ? Math.round(this.state.stats.totalGeneratedAlerts / uptime) : 0
  }

  getSystemReliability(): string {
    const baseReliability = 95
    const uptime = (Date.now() - this.state.stats.startTime.getTime()) / (1000 * 60 * 60)
    
    // Bonus de stabilité avec le temps
    const stabilityBonus = Math.min(uptime * 0.1, 3)
    
    // Malus selon le scénario
    const scenarioMalus = this.state.params.scenario === "emergency" ? 2 : 0
    
    return (baseReliability + stabilityBonus - scenarioMalus).toFixed(1)
  }

  reset() {
    this.state.stats = {
      totalGeneratedAlerts: 0,
      startTime: new Date(),
      lastAlertTime: null,
      scenarioStartTime: null,
    }
  }
} 
