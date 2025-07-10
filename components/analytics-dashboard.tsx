"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react"

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

interface AnalyticsDashboardProps {
  alerts: Alert[]
}

export function AnalyticsDashboard({ alerts }: AnalyticsDashboardProps) {
  // Données pour les graphiques
  const alertsByType = [
    { name: "Chutes Détectées", value: alerts.filter((a) => a.type === "FALL_DETECTED").length, color: "#ef4444" },
    { name: "Boutons Urgence", value: alerts.filter((a) => a.type === "BUTTON_PRESSED").length, color: "#f97316" },
  ]

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourAlerts = alerts.filter((alert) => {
      const alertHour = alert.timestamp.getHours()
      return alertHour === hour
    }).length
    return {
      hour: `${hour}h`,
      alerts: hourAlerts + Math.floor(Math.random() * 5), // Simulation de données historiques
    }
  })

  const responseTimeData = [
    { time: "00h-04h", avgTime: 180 },
    { time: "04h-08h", avgTime: 165 },
    { time: "08h-12h", avgTime: 145 },
    { time: "12h-16h", avgTime: 160 },
    { time: "16h-20h", avgTime: 175 },
    { time: "20h-24h", avgTime: 155 },
  ]

  const zoneData = [
    { zone: "Zone 1", alerts: 25, trend: "up" },
    { zone: "Zone 2", alerts: 18, trend: "down" },
    { zone: "Zone 3", alerts: 32, trend: "up" },
    { zone: "Zone 4", alerts: 14, trend: "stable" },
    { zone: "Zone 5", alerts: 21, trend: "up" },
  ]

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Alertes Aujourd'hui</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{alerts.length}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span>
              <span className="text-slate-400">vs hier</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Taux de Résolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">94.2%</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+2.1%</span>
              <span className="text-slate-400">ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2m 45s</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">-15s</span>
              <span className="text-slate-400">vs moyenne</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Efficacité</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">98.7%</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+0.3%</span>
              <span className="text-slate-400">optimal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des alertes par type */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Distribution des Alertes par Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {alertsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertes par heure */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Alertes par Heure (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="hour" stroke="#cbd5e1" fontSize={12} />
                <YAxis stroke="#cbd5e1" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="alerts"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: "#60a5fa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temps de réponse par période */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Temps de Réponse Moyen par Période</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="avgTime" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hotspots géographiques */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Hotspots par Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zoneData.map((zone, index) => (
                <div key={zone.zone} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-slate-300">{zone.zone}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-white font-semibold">{zone.alerts} alertes</span>
                    <div
                      className={`flex items-center space-x-1 ${
                        zone.trend === "up"
                          ? "text-red-500"
                          : zone.trend === "down"
                            ? "text-green-500"
                            : "text-slate-400"
                      }`}
                    >
                      {zone.trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : zone.trend === "down" ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap des alertes */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Heatmap des Alertes - Dernières 7 jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, day) => (
              <div key={day} className="space-y-2">
                <div className="text-center text-xs text-slate-400">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][day]}
                </div>
                <div className="space-y-1">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const intensity = Math.random()
                    return (
                      <div
                        key={hour}
                        className={`h-3 rounded-sm border border-slate-600 ${
                          intensity > 0.7
                            ? "bg-red-500 shadow-sm shadow-red-500/50"
                            : intensity > 0.4
                              ? "bg-orange-500 shadow-sm shadow-orange-500/50"
                              : intensity > 0.2
                                ? "bg-yellow-500 shadow-sm shadow-yellow-500/50"
                                : "bg-slate-700"
                        }`}
                        title={`${hour}h - ${Math.floor(intensity * 10)} alertes`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-slate-400">
            <span>Moins</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-slate-700 rounded-sm" />
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <div className="w-3 h-3 bg-orange-500 rounded-sm" />
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
            </div>
            <span>Plus</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
