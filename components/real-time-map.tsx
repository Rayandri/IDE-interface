"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Battery, Signal } from "lucide-react"

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

interface RealTimeMapProps {
  alerts: Alert[]
  devices: Device[]
}

export function RealTimeMap({ alerts, devices }: RealTimeMapProps) {
  function calculateZoneStats(alerts: Alert[], devices: Device[]): Array<{ zone: string; alertCount: number }> {
    const zoneCounts = new Map<string, number>()
    
    // Zones par défaut
    const defaultZones = ["Zone 1 - Centre", "Zone 2 - Nord", "Zone 3 - Sud", "Zone 4 - Est", "Zone 5 - Ouest"]
    defaultZones.forEach(zone => zoneCounts.set(zone, 0))
    
    alerts.forEach(alert => {
      const device = devices.find(d => d.id === alert.deviceId)
      if (device) {
        const currentCount = zoneCounts.get(device.zone) || 0
        zoneCounts.set(device.zone, currentCount + 1)
      }
    })

    return Array.from(zoneCounts.entries()).map(([zone, alertCount]) => ({
      zone,
      alertCount
    }))
  }
  const mapRef = useRef<HTMLDivElement>(null)

  // Simulation d'une carte interactive
  const recentAlerts = alerts.slice(0, 10)
  const activeDevices = devices.filter((d) => d.status === "active")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Carte principale */}
      <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span>Carte de Paris - Temps Réel</span>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {recentAlerts.length} alertes actives
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="h-96 bg-slate-800 rounded-lg relative overflow-hidden border border-slate-700"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23475569' fillOpacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Simulation de markers sur la carte */}
            <div className="absolute inset-0 p-4">
              <div className="text-center text-slate-400 mb-4">
                <h3 className="text-lg font-semibold">Région Parisienne</h3>
                <p className="text-sm">100 dispositifs IoT déployés</p>
              </div>

              {/* Zones d'alertes simulées - Affichage optimisé 1080p */}
              <div className="grid grid-cols-4 gap-3 h-full">
                {recentAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className={`relative rounded-lg p-3 border-2 transition-all duration-300 ${
                      alert.type === "FALL_DETECTED"
                        ? "bg-red-500/20 border-red-400 animate-pulse shadow-lg shadow-red-500/20"
                        : "bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20"
                    }`}
                  >
                    <div className="text-xs text-center">
                      <div
                        className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                          alert.type === "FALL_DETECTED" ? "bg-red-400" : "bg-orange-400"
                        } shadow-lg`}
                      />
                      <div className="text-white font-bold text-sm">
                        {alert.type === "FALL_DETECTED" ? "CHUTE" : "URGENCE"}
                      </div>
                      <div className="text-slate-300 font-medium">{alert.deviceId.split("_")[1]}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {Math.round(alert.batteryLevel)}% • {Math.round(alert.signalStrength)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-slate-400">Chute détectée</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-slate-400">Bouton d'urgence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-slate-400">Dispositif actif</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panneau d'informations */}
      <div className="space-y-4">
        {/* Alertes récentes */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Alertes Récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === "FALL_DETECTED"
                    ? "bg-red-900/10 border-l-red-500"
                    : "bg-orange-900/10 border-l-orange-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={alert.type === "FALL_DETECTED" ? "destructive" : "default"} className="text-xs">
                    {alert.type === "FALL_DETECTED" ? "CHUTE" : "URGENCE"}
                  </Badge>
                  <span className="text-xs text-slate-400">{alert.timestamp.toLocaleTimeString()}</span>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-300">{alert.deviceId}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Battery className="h-3 w-3" />
                      <span>{Math.round(alert.batteryLevel)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Signal className="h-3 w-3" />
                      <span>{Math.round(alert.signalStrength)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Statistiques géographiques */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Zones d'Activité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calculateZoneStats(alerts, devices).map((zoneStats) => {
                const maxAlerts = Math.max(...calculateZoneStats(alerts, devices).map(z => z.alertCount), 1)
                const percentage = Math.round((zoneStats.alertCount / maxAlerts) * 100)
                return (
                  <div key={zoneStats.zone} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{zoneStats.zone}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-8">{zoneStats.alertCount}</span>
                    </div>
                  </div>
                )
              }
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
