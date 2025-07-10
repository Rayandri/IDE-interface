"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Clock, User, MapPin, Battery, Signal, CheckCircle, XCircle, PlayCircle } from "lucide-react"

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

interface EmergencyQueueProps {
  alerts: Alert[]
  onUpdateAlert: (alerts: Alert[]) => void
}

export function EmergencyQueue({ alerts, onUpdateAlert }: EmergencyQueueProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [filter, setFilter] = useState<string>("all")

  const teams = [
    { id: "team1", name: "Équipe Alpha", status: "available", location: "Secteur Nord" },
    { id: "team2", name: "Équipe Beta", status: "busy", location: "Secteur Centre" },
    { id: "team3", name: "Équipe Gamma", status: "available", location: "Secteur Sud" },
    { id: "team4", name: "Équipe Delta", status: "available", location: "Secteur Est" },
  ]

  const filteredAlerts = alerts
    .filter((alert) => {
      if (filter === "all") return true
      return alert.status === filter
    })
    .sort((a, b) => {
      // Trier par priorité puis par timestamp
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

  const updateAlertStatus = (alertId: string, newStatus: Alert["status"]) => {
    const updatedAlerts = alerts.map((alert) => (alert.id === alertId ? { ...alert, status: newStatus } : alert))
    onUpdateAlert(updatedAlerts)
  }

  const assignTeam = (alertId: string, teamId: string) => {
    updateAlertStatus(alertId, "in_progress")
    // Ici on pourrait aussi mettre à jour l'équipe assignée
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "text-red-300 bg-red-500/20 border border-red-500/30"
      case "in_progress":
        return "text-orange-300 bg-orange-500/20 border border-orange-500/30"
      case "resolved":
        return "text-green-300 bg-green-500/20 border border-green-500/30"
      default:
        return "text-slate-300 bg-slate-500/20 border border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <AlertTriangle className="h-4 w-4" />
      case "in_progress":
        return <PlayCircle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Queue des alertes */}
      <div className="lg:col-span-3 space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Queue d'Urgence</span>
                <Badge variant="outline" className="text-red-400 border-red-400">
                  {filteredAlerts.filter((a) => a.status === "received").length} en attente
                </Badge>
              </CardTitle>

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-slate-200 focus:bg-slate-700">
                    Toutes
                  </SelectItem>
                  <SelectItem value="received" className="text-slate-200 focus:bg-slate-700">
                    En attente
                  </SelectItem>
                  <SelectItem value="in_progress" className="text-slate-200 focus:bg-slate-700">
                    En cours
                  </SelectItem>
                  <SelectItem value="resolved" className="text-slate-200 focus:bg-slate-700">
                    Résolues
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.priority === "critical"
                    ? "border-l-red-500 bg-red-900/10"
                    : alert.priority === "high"
                      ? "border-l-orange-500 bg-orange-900/10"
                      : alert.priority === "medium"
                        ? "border-l-yellow-500 bg-yellow-900/10"
                        : "border-l-blue-500 bg-blue-900/10"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(alert.priority)}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.type === "FALL_DETECTED" ? "destructive" : "default"} className="text-xs">
                          {alert.type === "FALL_DETECTED" ? "CHUTE DÉTECTÉE" : "BOUTON URGENCE"}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                          <span className="ml-1">
                            {alert.status === "received"
                              ? "REÇU"
                              : alert.status === "in_progress"
                                ? "EN COURS"
                                : "RÉSOLU"}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        ID: {alert.deviceId} • {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <div className="flex items-center space-x-1 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m</span>
                    </div>
                    <div className="text-xs font-medium text-red-400">{alert.priority.toUpperCase()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Battery className="h-4 w-4 text-slate-400" />
                      <span className={`${alert.batteryLevel < 20 ? "text-red-400" : "text-slate-300"}`}>
                        {alert.batteryLevel}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Signal className="h-4 w-4 text-slate-400" />
                      <span className={`${alert.signalStrength < 30 ? "text-orange-400" : "text-slate-300"}`}>
                        {alert.signalStrength}%
                      </span>
                    </div>
                  </div>
                </div>

                {alert.status === "received" && (
                  <div className="flex items-center space-x-2">
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="flex-1 bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Assigner une équipe" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {teams
                          .filter((team) => team.status === "available")
                          .map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} - {team.location}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => selectedTeam && assignTeam(alert.id, selectedTeam)}
                      disabled={!selectedTeam}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Assigner
                    </Button>
                  </div>
                )}

                {alert.status === "in_progress" && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateAlertStatus(alert.id, "resolved")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer Résolu
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Panneau équipes */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <span>Équipes de Secours</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`p-3 rounded-lg border ${
                  team.status === "available"
                    ? "border-green-500 bg-green-900/10"
                    : "border-orange-500 bg-orange-900/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{team.name}</span>
                  <Badge
                    variant={team.status === "available" ? "default" : "secondary"}
                    className={
                      team.status === "available"
                        ? "text-green-400 bg-green-900/20"
                        : "text-orange-400 bg-orange-900/20"
                    }
                  >
                    {team.status === "available" ? "DISPONIBLE" : "OCCUPÉ"}
                  </Badge>
                </div>
                <div className="text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{team.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Statistiques temps réel */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Statistiques Temps Réel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {alerts.filter((a) => a.status === "received").length}
              </div>
              <div className="text-sm text-slate-400">Alertes en attente</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {alerts.filter((a) => a.status === "in_progress").length}
              </div>
              <div className="text-sm text-slate-400">En cours de traitement</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {alerts.filter((a) => a.status === "resolved").length}
              </div>
              <div className="text-sm text-slate-400">Résolues aujourd'hui</div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">2m 34s</div>
                <div className="text-sm text-slate-400">Temps moyen de réponse</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
