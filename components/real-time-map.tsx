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

  const displaySlots = 100
  const recentAlerts = alerts.slice(0, displaySlots)
  const activeAlerts = alerts.filter(alert => alert.status === "received" || alert.status === "in_progress")
  const activeDevices = devices.filter((d) => d.status === "active")

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <Card className="xl:col-span-3 bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-500" />
            <span className="text-xl">Carte de Paris - Temps Réel</span>
            <Badge variant="outline" className="text-green-400 border-green-400 text-sm px-3 py-1">
              {activeAlerts.length} alertes actives
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="h-[32rem] bg-slate-800 rounded-lg relative overflow-hidden border border-slate-700"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23475569' fillOpacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="absolute inset-0 p-3">
              <div className="text-center text-slate-400 mb-3">
                <h3 className="text-xl font-semibold">Région Parisienne</h3>
                <p className="text-sm">100 dispositifs IoT déployés</p>
                <p className="text-xs text-slate-500">
                  Affichage: {recentAlerts.length}/{displaySlots} emplacements • {Math.max(0, alerts.length - displaySlots)} en attente
                </p>
              </div>

              <div className="grid grid-cols-10 gap-1 h-full">
                {Array.from({ length: displaySlots }, (_, index) => {
                  const alert = recentAlerts[index]
                  
                  if (alert) {
                    return (
                      <div
                        key={alert.id}
                        className={`relative rounded p-1 border transition-all duration-300 hover:scale-105 ${
                          alert.type === "FALL_DETECTED"
                            ? "bg-red-500/20 border-red-400 animate-pulse shadow-sm shadow-red-500/30"
                            : "bg-orange-500/20 border-orange-400 shadow-sm shadow-orange-500/30"
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                              alert.type === "FALL_DETECTED" ? "bg-red-400" : "bg-orange-400"
                            }`}
                          />
                          <div className="text-white font-bold text-xs">
                            {alert.type === "FALL_DETECTED" ? "C" : "U"}
                          </div>
                          <div className="text-slate-300 text-xs">{alert.deviceId.split("_")[1]}</div>
                          <div className="text-xs text-slate-400">
                            <div>{Math.round(alert.batteryLevel)}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="relative rounded p-1 border border-slate-600 bg-slate-800/30"
                      >
                        <div className="text-center">
                          <div className="w-2 h-2 rounded-full mx-auto mb-1 bg-slate-600" />
                          <div className="text-slate-500 font-bold text-xs">-</div>
                          <div className="text-slate-600 text-xs">--</div>
                          <div className="text-xs text-slate-600">
                            <div>--%</div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mt-6 text-base">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-slate-300 font-medium">Chute détectée</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span className="text-slate-300 font-medium">Bouton d'urgence</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-slate-600 rounded-full" />
              <span className="text-slate-400 font-medium">Emplacement libre</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-slate-300 font-medium">Dispositif actif</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Alertes Récentes</span>
              <Badge variant="outline" className="text-slate-400">
                {recentAlerts.length}/{displaySlots} affichées
              </Badge>
            </CardTitle>
            {alerts.length > displaySlots && (
              <p className="text-sm text-orange-400">
                +{alerts.length - displaySlots} alertes supplémentaires en file d'attente
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 max-h-[24rem] overflow-y-auto">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 transition-all hover:scale-105 ${
                  alert.type === "FALL_DETECTED"
                    ? "bg-red-900/10 border-l-red-500 shadow-lg shadow-red-500/10"
                    : "bg-orange-900/10 border-l-orange-500 shadow-lg shadow-orange-500/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={alert.type === "FALL_DETECTED" ? "destructive" : "default"} className="text-sm px-3 py-1">
                    {alert.type === "FALL_DETECTED" ? "CHUTE" : "URGENCE"}
                  </Badge>
                  <span className="text-sm text-slate-400 font-medium">{alert.timestamp.toLocaleTimeString()}</span>
                </div>

                <div className="text-base space-y-2">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 font-medium">{alert.deviceId}</span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4" />
                      <span className="font-medium">{Math.round(alert.batteryLevel)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Signal className="h-4 w-4" />
                      <span className="font-medium">{Math.round(alert.signalStrength)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl">Zones d'Activité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {calculateZoneStats(alerts, devices).map((zoneStats) => {
                const maxAlerts = Math.max(...calculateZoneStats(alerts, devices).map(z => z.alertCount), 1)
                const percentage = Math.round((zoneStats.alertCount / maxAlerts) * 100)
                return (
                  <div key={zoneStats.zone} className="flex items-center justify-between py-2">
                    <span className="text-base text-slate-300 font-medium">{zoneStats.zone}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm text-slate-400 w-8 font-bold">{zoneStats.alertCount}</span>
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
