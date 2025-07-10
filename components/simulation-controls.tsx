"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Zap, Settings, AlertTriangle, MapPin, Activity } from "lucide-react"
import { Alert, Device } from "@/lib/utils"
import { SimulationManager, SimulationParams } from "@/lib/simulation-manager"

interface SimulationControlsProps {
  isRunning: boolean
  onToggle: () => void
  onReset: () => void
  onGenerateAlert: (alert: Alert) => void
  simulationManager: SimulationManager
  onUpdateParams: (newParams: Partial<SimulationParams>) => void
  devices: Device[]
}

export function SimulationControls({ 
  isRunning, 
  onToggle, 
  onReset, 
  onGenerateAlert,
  simulationManager, 
  onUpdateParams,
  devices 
}: SimulationControlsProps) {
  const [alertFrequency, setAlertFrequency] = useState([3])
  const [selectedZone, setSelectedZone] = useState("random")
  const [alertType, setAlertType] = useState("random")
  const [scenario, setScenario] = useState("normal")
  const [, forceUpdate] = useState({})

  // Forcer le re-render toutes les secondes pour les stats en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({})
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Synchroniser les paramètres avec le gestionnaire
  const updateParameter = (key: keyof SimulationParams, value: any) => {
    const newParams = { [key]: value }
    onUpdateParams(newParams)
    
    // Mettre à jour l'état local
    switch (key) {
      case 'alertFrequency':
        setAlertFrequency([value])
        break
      case 'selectedZone':
        setSelectedZone(value)
        break
      case 'alertType':
        setAlertType(value)
        break
      case 'scenario':
        setScenario(value)
        break
    }
  }

  // Utiliser les statistiques du gestionnaire
  const getSimulationStats = () => {
    const state = simulationManager.getState()
    return {
      totalGeneratedAlerts: state.stats.totalGeneratedAlerts,
      uptime: simulationManager.getUptime(),
      eventsPerHour: simulationManager.getEventsPerHour(),
      systemReliability: simulationManager.getSystemReliability(),
    }
  }

  const zones = [
    { id: "random", name: "Aléatoire", coords: { lat: 48.8566, lng: 2.3522 } },
    { id: "zone1", name: "Zone 1 - Centre", coords: { lat: 48.8566, lng: 2.3522 } },
    { id: "zone2", name: "Zone 2 - Nord", coords: { lat: 48.88, lng: 2.3522 } },
    { id: "zone3", name: "Zone 3 - Sud", coords: { lat: 48.83, lng: 2.3522 } },
    { id: "zone4", name: "Zone 4 - Est", coords: { lat: 48.8566, lng: 2.38 } },
    { id: "zone5", name: "Zone 5 - Ouest", coords: { lat: 48.8566, lng: 2.32 } },
  ]

  const scenarios = [
    { id: "normal", name: "Fonctionnement Normal", description: "Alertes sporadiques normales" },
    { id: "peak", name: "Heure de Pointe", description: "Augmentation du trafic d'alertes" },
    { id: "emergency", name: "Situation d'Urgence", description: "Pic d'alertes critiques" },
    { id: "maintenance", name: "Mode Maintenance", description: "Alertes de test système" },
  ]

  const generateTestAlert = () => {
    // Utiliser le gestionnaire pour générer une alerte cohérente
    const testAlert = simulationManager.generateAlert(devices)
    
    if (testAlert) {
      // Modifier l'ID pour indiquer que c'est un test manuel
      testAlert.id = `manual_test_${Date.now()}`
      onGenerateAlert(testAlert)
    }
  }

  const runScenario = (scenarioId: string) => {
    updateParameter('scenario', scenarioId)

    switch (scenarioId) {
      case "peak":
        // Mode heure de pointe : fréquence élevée
        updateParameter('alertFrequency', 1)
        updateParameter('customAlertProbability', 0.8)
        break
      case "emergency":
        // Mode urgence : beaucoup de chutes critiques
        updateParameter('alertFrequency', 2)
        updateParameter('alertType', 'FALL_DETECTED')
        updateParameter('customAlertProbability', 0.9)
        updateParameter('customFallProbability', 0.8)
        break
      case "maintenance":
        // Mode maintenance : alertes moins fréquentes, principalement boutons
        updateParameter('alertFrequency', 5)
        updateParameter('alertType', 'BUTTON_PRESSED')
        updateParameter('customAlertProbability', 0.3)
        break
      case "normal":
      default:
        // Retour aux paramètres normaux
        updateParameter('alertFrequency', 3)
        updateParameter('alertType', 'random')
        updateParameter('customAlertProbability', undefined)
        updateParameter('customFallProbability', undefined)
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Contrôles principaux */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <span>Contrôles de Simulation</span>
            <Badge
              variant="outline"
              className={isRunning ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}
            >
              {isRunning ? "ACTIF" : "ARRÊTÉ"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button onClick={onToggle} variant={isRunning ? "destructive" : "default"} size="lg" className="flex-1">
              {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isRunning ? "Arrêter la Simulation" : "Démarrer la Simulation"}
            </Button>

            <Button onClick={onReset} variant="outline" size="lg">
              <RotateCcw className="h-5 w-5 mr-2" />
              Réinitialiser
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Fréquence des Alertes (secondes)
                </label>
                <Slider
                  value={alertFrequency}
                  onValueChange={(value) => updateParameter('alertFrequency', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 mt-1">
                  Nouvelle alerte toutes les {alertFrequency[0]} secondes
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Zone Géographique</label>
                <Select value={selectedZone} onValueChange={(value) => updateParameter('selectedZone', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Type d'Alerte</label>
                <Select value={alertType} onValueChange={(value) => updateParameter('alertType', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="random">Aléatoire</SelectItem>
                    <SelectItem value="FALL_DETECTED">Chute Détectée</SelectItem>
                    <SelectItem value="BUTTON_PRESSED">Bouton d'Urgence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button onClick={generateTestAlert} className="w-full bg-orange-600 hover:bg-orange-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Générer Alerte Test
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scénarios prédéfinis */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Scénarios de Démonstration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenarioItem) => (
              <div
                key={scenarioItem.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  scenario === scenarioItem.id
                    ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-750"
                }`}
                onClick={() => runScenario(scenarioItem.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{scenarioItem.name}</h3>
                  {scenario === scenarioItem.id && <Badge className="text-blue-400 bg-blue-900/20">ACTIF</Badge>}
                </div>
                <p className="text-sm text-slate-400">{scenarioItem.description}</p>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    runScenario(scenarioItem.id)
                  }}
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                >
                  Lancer le Scénario
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de simulation */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Statistiques de Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">{getSimulationStats().totalGeneratedAlerts}</div>
              <div className="text-sm text-slate-300">Alertes Générées</div>
            </div>

            <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-green-400">{getSimulationStats().uptime}</div>
              <div className="text-sm text-slate-300">Temps d'Activité</div>
            </div>

            <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-orange-400">{getSimulationStats().eventsPerHour}</div>
              <div className="text-sm text-slate-300">Événements/Heure</div>
            </div>

            <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-purple-400">{getSimulationStats().systemReliability}%</div>
              <div className="text-sm text-slate-300">Fiabilité Système</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="font-medium text-white mb-3">Paramètres Actuels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Fréquence:</span>
                <span className="text-white ml-2">{alertFrequency[0]}s</span>
              </div>
              <div>
                <span className="text-slate-400">Zone:</span>
                <span className="text-white ml-2">{zones.find((z) => z.id === selectedZone)?.name || "Aléatoire"}</span>
              </div>
              <div>
                <span className="text-slate-400">Type:</span>
                <span className="text-white ml-2">
                  {alertType === "random" ? "Aléatoire" : alertType === "FALL_DETECTED" ? "Chutes" : "Boutons"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Scénario:</span>
                <span className="text-white ml-2">{scenarios.find((s) => s.id === scenario)?.name || "Normal"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
