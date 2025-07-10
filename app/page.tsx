"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, MapPin, Activity, Zap, Users, Clock, Play, Pause, RotateCcw } from "lucide-react"
import { RealTimeMap } from "@/components/real-time-map"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { EmergencyQueue } from "@/components/emergency-queue"
import { DeviceMonitoring } from "@/components/device-monitoring"
import { SimulationControls } from "@/components/simulation-controls"
import { SIMULATION_CONFIG, GEOGRAPHIC_CONFIG, DEVICE_THRESHOLDS } from "@/lib/constants"
import { 
  Alert, 
  Device, 
  calculateDeviceStatus, 
  calculateResponseTime, 
  calculateZoneForDevice,
  generateDevicePosition,
  updateDeviceBattery,
  updateDeviceSignal,
  calculateActiveDevicesPercentage
} from "@/lib/utils"
import { SimulationManager, SimulationParams } from "@/lib/simulation-manager"

export default function EmergencyDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [simulationManager] = useState(() => new SimulationManager())
  const [isSimulationRunning, setIsSimulationRunning] = useState(true)
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeDevices: 0,
    avgResponseTime: 0,
    criticalAlerts: 0,
  })

  // Fonction pour mettre à jour les paramètres de simulation
  const updateSimulationParams = (newParams: Partial<SimulationParams>) => {
    simulationManager.updateParams(newParams)
  }

  // Simulation de données en temps réel
  useEffect(() => {
    // Initialisation des dispositifs avec plus de variabilité
    const initDevices = Array.from({ length: SIMULATION_CONFIG.DEVICE_COUNT }, (_, i) => {
      const zoneIndex = Math.floor(i / 20)
      const position = generateDevicePosition(zoneIndex)
      
      // Plus de variabilité sur les niveaux
      const batteryLevel = Math.floor(Math.random() * 90) + 10 // 10-100%
      const signalStrength = Math.floor(Math.random() * 80) + 20 // 20-100%
      
      // Variabilité sur l'activité récente (0-24h)
      const lastActivityOffset = Math.random() * 24 * 3600000 // 0-24h en millisecondes
      
      // Ajouter plus de spread sur les positions
      const positionVariation = (Math.random() - 0.5) * 0.02 // ±0.01 degrés
      
      const device: Device = {
        id: `device_${i + 1}`,
        name: `Dispositif ${i + 1}`,
        latitude: position.lat + positionVariation,
        longitude: position.lng + positionVariation,
        batteryLevel,
        signalStrength,
        lastActivity: new Date(Date.now() - lastActivityOffset),
        status: "active",
        zone: calculateZoneForDevice(i),
      }
      
      device.status = calculateDeviceStatus(device)
      return device
    })
    setDevices(initDevices)

    // Commencer sans alertes pour une simulation propre
    const initAlerts: Alert[] = []
    setAlerts(initAlerts)

    // Mise à jour des statistiques avec calculs réels
    setStats({
      totalAlerts: initAlerts.length,
      activeDevices: initDevices.filter((d) => d.status === "active").length,
      avgResponseTime: calculateResponseTime(initAlerts),
      criticalAlerts: initAlerts.filter((a) => a.priority === "critical").length,
    })
  }, [])

  // Simulation temps réel avec le gestionnaire centralisé
  useEffect(() => {
    simulationManager.updateParams({ isRunning: isSimulationRunning })

    if (!isSimulationRunning) return

    const runSimulation = () => {
      // Générer une nouvelle alerte avec le gestionnaire
      const newAlert = simulationManager.generateAlert(devices)
      
      if (newAlert) {
        setAlerts((prev: Alert[]) => [newAlert, ...prev.slice(0, SIMULATION_CONFIG.MAX_ALERTS_HISTORY - 1)])
        setStats((prev: any) => ({
          ...prev,
          totalAlerts: prev.totalAlerts + 1,
          criticalAlerts: newAlert.priority === "critical" ? prev.criticalAlerts + 1 : prev.criticalAlerts,
        }))
      }

      // Mise à jour des dispositifs avec plus de variabilité
      setDevices((prev: Device[]) =>
        prev.map((device: Device) => {
          // Plus de variabilité dans l'activité
          const activityChance = Math.random()
          const isActive = activityChance > 0.85 // 15% de chance d'activité
          const isMaintenance = activityChance < 0.01 // 1% de chance de maintenance
          
          const updatedDevice = {
            ...device,
            batteryLevel: updateDeviceBattery(device.batteryLevel),
            signalStrength: updateDeviceSignal(device.signalStrength),
            lastActivity: isActive ? new Date() : device.lastActivity,
          }
          
          // Forcer un statut pour la maintenance occasionnelle
          if (isMaintenance) {
            updatedDevice.batteryLevel = Math.min(100, updatedDevice.batteryLevel + 10) // Recharge partielle
            updatedDevice.signalStrength = Math.min(100, updatedDevice.signalStrength + 5) // Amélioration signal
          }
          
          updatedDevice.status = calculateDeviceStatus(updatedDevice)
          return updatedDevice
        }),
      )
    }

    // Utiliser l'intervalle dynamique du gestionnaire
    const intervalTime = simulationManager.getSimulationInterval()
    const interval = setInterval(runSimulation, intervalTime)

    return () => clearInterval(interval)
  }, [isSimulationRunning, devices, simulationManager])

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning)
    simulationManager.updateParams({ isRunning: !isSimulationRunning })
  }

  const resetSimulation = () => {
    simulationManager.reset()
    setStats({
      totalAlerts: 0,
      activeDevices: 0,
      avgResponseTime: 0,
      criticalAlerts: 0,
    })
    window.location.reload()
  }

  const handleGenerateAlert = (alert: Alert) => {
    setAlerts((prev: Alert[]) => [alert, ...prev.slice(0, SIMULATION_CONFIG.MAX_ALERTS_HISTORY - 1)])
    setStats((prev: any) => ({
      ...prev,
      totalAlerts: prev.totalAlerts + 1,
      criticalAlerts: alert.priority === "critical" ? prev.criticalAlerts + 1 : prev.criticalAlerts,
    }))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Centre de Contrôle d'Urgence</h1>
                <p className="text-sm text-slate-400">Développé par Rayan - Emre - Batiste - Marc </p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {isSimulationRunning ? "EN LIGNE" : "HORS LIGNE"}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={toggleSimulation} variant={isSimulationRunning ? "destructive" : "default"} size="sm">
              {isSimulationRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isSimulationRunning ? "Pause" : "Démarrer"}
            </Button>
            <Button onClick={resetSimulation} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Alertes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalAlerts}</div>
              <p className="text-xs text-slate-400">+12% depuis hier</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Dispositifs Actifs</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeDevices}/{SIMULATION_CONFIG.DEVICE_COUNT}</div>
              <p className="text-xs text-slate-400">{calculateActiveDevicesPercentage(devices)}% opérationnels</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Temps Réponse Moyen</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Math.floor(stats.avgResponseTime / 60)}m {stats.avgResponseTime % 60}s
              </div>
              <p className="text-xs text-slate-400">-15% ce mois</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Alertes Critiques</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.criticalAlerts}</div>
              <p className="text-xs text-slate-400">Chutes détectées</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border border-slate-700">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Carte Temps Réel
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
            >
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="emergency"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Queue Urgence
            </TabsTrigger>
            <TabsTrigger
              value="devices"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Dispositifs
            </TabsTrigger>
            <TabsTrigger
              value="simulation"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
            >
              <Zap className="h-4 w-4 mr-2" />
              Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <RealTimeMap alerts={alerts} devices={devices} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard alerts={alerts} />
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <EmergencyQueue alerts={alerts} onUpdateAlert={setAlerts} />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <DeviceMonitoring devices={devices} />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <SimulationControls
              isRunning={isSimulationRunning}
              onToggle={toggleSimulation}
              onReset={resetSimulation}
              onGenerateAlert={handleGenerateAlert}
              simulationManager={simulationManager}
              onUpdateParams={updateSimulationParams}
              devices={devices}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
