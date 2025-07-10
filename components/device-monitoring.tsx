"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Smartphone,
  Battery,
  Signal,
  MapPin,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

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

interface DeviceMonitoringProps {
  devices: Device[]
}

export function DeviceMonitoring({ devices }: DeviceMonitoringProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [zoneFilter, setZoneFilter] = useState("all")

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || device.status === statusFilter
    const matchesZone = zoneFilter === "all" || device.zone === zoneFilter

    return matchesSearch && matchesStatus && matchesZone
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-300 bg-green-500/20 border border-green-500/30"
      case "inactive":
        return "text-red-300 bg-red-500/20 border border-red-500/30"
      case "low_battery":
        return "text-orange-300 bg-orange-500/20 border border-orange-500/30"
      case "weak_signal":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30"
      default:
        return "text-slate-300 bg-slate-500/20 border border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <XCircle className="h-4 w-4" />
      case "low_battery":
        return <Battery className="h-4 w-4" />
      case "weak_signal":
        return <Signal className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "ACTIF"
      case "inactive":
        return "INACTIF"
      case "low_battery":
        return "BATTERIE FAIBLE"
      case "weak_signal":
        return "SIGNAL FAIBLE"
      default:
        return "INCONNU"
    }
  }

  const zones = [...new Set(devices.map((d) => d.zone))]
  const statusCounts = {
    active: devices.filter((d) => d.status === "active").length,
    inactive: devices.filter((d) => d.status === "inactive").length,
    low_battery: devices.filter((d) => d.status === "low_battery").length,
    weak_signal: devices.filter((d) => d.status === "weak_signal").length,
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des dispositifs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Dispositifs Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.active}</div>
            <p className="text-xs text-slate-400">
              {((statusCounts.active / devices.length) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Batterie Faible</CardTitle>
            <Battery className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.low_battery}</div>
            <p className="text-xs text-slate-400">Nécessitent attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Signal Faible</CardTitle>
            <Signal className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.weak_signal}</div>
            <p className="text-xs text-slate-400">Problèmes de réseau</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Hors Ligne</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.inactive}</div>
            <p className="text-xs text-slate-400">Intervention requise</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-blue-500" />
            <span>Monitoring des Dispositifs IoT</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {filteredDevices.length}/{devices.length} dispositifs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="low_battery">Batterie faible</SelectItem>
                <SelectItem value="weak_signal">Signal faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">Toutes les zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des dispositifs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className={`p-4 rounded-lg border ${
                  device.status === "active"
                    ? "border-green-500 bg-green-900/10"
                    : device.status === "inactive"
                      ? "border-red-500 bg-red-900/10"
                      : device.status === "low_battery"
                        ? "border-orange-500 bg-orange-900/10"
                        : "border-yellow-500 bg-yellow-900/10"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-white">{device.name}</div>
                      <div className="text-xs text-slate-400">{device.id}</div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(device.status)}`}>
                    {getStatusIcon(device.status)}
                    <span className="ml-1">{getStatusLabel(device.status)}</span>
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Battery className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">Batterie</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden border border-slate-500">
                        <div
                          className={`h-full rounded-full ${
                            device.batteryLevel > 50
                              ? "bg-green-400"
                              : device.batteryLevel > 20
                                ? "bg-orange-400"
                                : "bg-red-400"
                          }`}
                          style={{ width: `${device.batteryLevel}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          device.batteryLevel < 20 ? "text-red-400" : "text-slate-300"
                        }`}
                      >
                        {device.batteryLevel}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Signal className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">Signal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden border border-slate-500">
                        <div
                          className={`h-full rounded-full ${
                            device.signalStrength > 70
                              ? "bg-green-400"
                              : device.signalStrength > 30
                                ? "bg-orange-400"
                                : "bg-red-400"
                          }`}
                          style={{ width: `${device.signalStrength}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          device.signalStrength < 30 ? "text-red-400" : "text-slate-300"
                        }`}
                      >
                        {device.signalStrength}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 text-xs">{device.zone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 text-xs">
                        {Math.floor((Date.now() - device.lastActivity.getTime()) / 60000)}m
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-1">
                    Position: {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse par zone */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Analyse par Zone Géographique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => {
              const zoneDevices = devices.filter((d) => d.zone === zone)
              const activeCount = zoneDevices.filter((d) => d.status === "active").length
              const totalCount = zoneDevices.length
              const healthPercentage = (activeCount / totalCount) * 100

              return (
                <div key={zone} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{zone}</h3>
                    <Badge
                      variant="outline"
                      className={`${
                        healthPercentage > 80
                          ? "text-green-400 border-green-400"
                          : healthPercentage > 60
                            ? "text-orange-400 border-orange-400"
                            : "text-red-400 border-red-400"
                      }`}
                    >
                      {healthPercentage.toFixed(0)}%
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total dispositifs</span>
                      <span className="text-white font-medium">{totalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actifs</span>
                      <span className="text-green-400 font-medium">{activeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Problèmes</span>
                      <span className="text-red-400 font-medium">{totalCount - activeCount}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          healthPercentage > 80
                            ? "bg-green-500"
                            : healthPercentage > 60
                              ? "bg-orange-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${healthPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
