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

// Types pour les données
interface Alert {
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

interface Device {
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

export default function EmergencyDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isSimulationRunning, setIsSimulationRunning] = useState(true)
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeDevices: 0,
    avgResponseTime: 0,
    criticalAlerts: 0,
  })

  // Simulation de données en temps réel
  useEffect(() => {
    // Initialisation des dispositifs (100 dans Paris)
    const initDevices = Array.from({ length: 100 }, (_, i) => ({
      id: `device_${i + 1}`,
      name: `Dispositif ${i + 1}`,
      latitude: 48.8566 + (Math.random() - 0.5) * 0.1, // Paris ±5km
      longitude: 2.3522 + (Math.random() - 0.5) * 0.1,
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: Math.floor(Math.random() * 100),
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
      status: Math.random() > 0.8 ? "inactive" : ("active" as Device["status"]),
      zone: `Zone ${Math.floor(i / 20) + 1}`,
    }))
    setDevices(initDevices)

    // Génération d'alertes initiales
    const initAlerts = Array.from({ length: 15 }, (_, i) => {
      const device = initDevices[Math.floor(Math.random() * initDevices.length)]
      const alertType = Math.random() > 0.6 ? "FALL_DETECTED" : "BUTTON_PRESSED"
      return {
        id: `alert_${i + 1}`,
        deviceId: device.id,
        type: alertType,
        timestamp: new Date(Date.now() - Math.random() * 7200000),
        latitude: device.latitude,
        longitude: device.longitude,
        batteryLevel: device.batteryLevel,
        signalStrength: device.signalStrength,
        status: ["received", "in_progress", "resolved"][Math.floor(Math.random() * 3)] as Alert["status"],
        priority: alertType === "FALL_DETECTED" ? "critical" : ("high" as Alert["priority"]),
      }
    })
    setAlerts(initAlerts)

    // Mise à jour des statistiques
    setStats({
      totalAlerts: initAlerts.length,
      activeDevices: initDevices.filter((d) => d.status === "active").length,
      avgResponseTime: Math.floor(Math.random() * 300 + 120), // 2-7 minutes
      criticalAlerts: initAlerts.filter((a) => a.priority === "critical").length,
    })
  }, [])

  // Simulation temps réel
  useEffect(() => {
    if (!isSimulationRunning) return

    const interval = setInterval(() => {
      // Nouvelle alerte aléatoire
      if (Math.random() > 0.7) {
        const device = devices[Math.floor(Math.random() * devices.length)]
        const alertType = Math.random() > 0.6 ? "FALL_DETECTED" : "BUTTON_PRESSED"
        const newAlert: Alert = {
          id: `alert_${Date.now()}`,
          deviceId: device.id,
          type: alertType,
          timestamp: new Date(),
          latitude: device.latitude + (Math.random() - 0.5) * 0.001,
          longitude: device.longitude + (Math.random() - 0.5) * 0.001,
          batteryLevel: device.batteryLevel,
          signalStrength: device.signalStrength,
          status: "received",
          priority: alertType === "FALL_DETECTED" ? "critical" : "high",
        }

        setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]) // Garder 50 alertes max
        setStats((prev) => ({
          ...prev,
          totalAlerts: prev.totalAlerts + 1,
          criticalAlerts: alertType === "FALL_DETECTED" ? prev.criticalAlerts + 1 : prev.criticalAlerts,
        }))
      }

      // Mise à jour des dispositifs
      setDevices((prev) =>
        prev.map((device) => ({
          ...device,
          batteryLevel: Math.max(0, device.batteryLevel - Math.random() * 0.1),
          signalStrength: Math.max(20, device.signalStrength + (Math.random() - 0.5) * 5),
          status: device.batteryLevel < 20 ? "low_battery" : device.signalStrength < 30 ? "weak_signal" : "active",
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isSimulationRunning, devices])

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning)
  }

  const resetSimulation = () => {
    window.location.reload()
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
                <p className="text-sm text-slate-400">Développé par Rayan Drissi - EPITA</p>
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
              <div className="text-2xl font-bold text-white">{stats.activeDevices}/100</div>
              <p className="text-xs text-slate-400">98% opérationnels</p>
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
              onGenerateAlert={(alert) => setAlerts((prev) => [alert, ...prev])}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
