"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { motion } from "framer-motion"
import SwappyGrid from "../../components/SwappyGrid"
import { 
  FaHeartbeat, 
  FaRunning, 
  FaFire, 
  FaRoute, 
  FaClock, 
  FaGoogle, 
  FaChartLine,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaWeight,
  FaTimes,
  FaExpand,
  FaMousePointer,
  FaRulerVertical,
  FaEdit,
  FaPaperPlane,
  FaBed,
  FaAward,
  FaTint,
  FaPercent
} from "react-icons/fa"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import LoaderPortal from "../../components/LoaderPortal"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function SantePage() {
  const { user, authenticated, signIn, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [fitData, setFitData] = useState({})
  const [loadingData, setLoadingData] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(1)
  const [error, setError] = useState(null)
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showInputModal, setShowInputModal] = useState(false)
  const [inputType, setInputType] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchFitData()
    }
  }, [authenticated, selectedPeriod])

  const fetchFitData = async () => {
    setLoadingData(true)
    setError(null)
    
    try {
      const dataTypes = ['steps', 'calories', 'distance', 'weight', 'height', 'heart_rate', 'sleep', 'active_minutes', 'heart_points', 'body_fat', 'oxygen_saturation']
      const promises = dataTypes.map(type => 
        fetch(`/api/google-fit?type=${type}&days=${selectedPeriod}`)
          .then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      const newFitData = {}
      
      results.forEach((result, index) => {
        if (result.success) {
          newFitData[dataTypes[index]] = result
        }
      })
      
      setFitData(newFitData)
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err)
      setError('Erreur lors de la récupération des données')
    } finally {
      setLoadingData(false)
    }
  }

  const openMetricModal = (metricType, data) => {
    // Filtrer les données selon la période sélectionnée
    const filteredData = filterDataByPeriod(data, selectedPeriod)
    setSelectedMetric({ type: metricType, data: filteredData })
    setShowModal(true)
  }

  const filterDataByPeriod = (data, period) => {
    if (!data || !data.data) return data

    const now = new Date()
    let startDate

    switch (period) {
      case 1: // Aujourd'hui
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 7: // Cette semaine
        startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
        break
      case 30: // Ce mois
        startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
        break
      default:
        return data
    }

    const filteredDataPoints = data.data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })

    // Recalculer les statistiques pour la période filtrée
    const values = filteredDataPoints.map(item => item.value)
    const newStats = {
      total: values.reduce((sum, val) => sum + val, 0),
      average: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      min: values.length > 0 ? Math.min(...values) : 0,
      daysWithData: values.length
    }

    return {
      ...data,
      data: filteredDataPoints,
      stats: newStats
    }
  }

  const openInputModal = (type) => {
    setInputType(type)
    setInputValue('')
    setShowInputModal(true)
  }

  const submitData = async () => {
    if (!inputValue || !inputType) return
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/google-fit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: inputType,
          value: parseFloat(inputValue)
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowInputModal(false)
        // Recharger les données
        fetchFitData()
      } else {
        setError(result.error || 'Erreur lors de l\'envoi des données')
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err)
      setError('Erreur lors de l\'envoi des données')
    } finally {
      setSubmitting(false)
    }
  }

  const getChartData = (data, type) => {
    if (!data?.data) return null

    const labels = data.data.map(item => new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }))
    const values = data.data.map(item => item.value)

    const getColor = () => {
      switch (type) {
        case 'steps': return { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' }
        case 'calories': return { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 1)' }
        case 'distance': return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' }
        case 'weight': return { bg: 'rgba(147, 51, 234, 0.2)', border: 'rgba(147, 51, 234, 1)' }
        case 'height': return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 1)' }
        default: return { bg: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 1)' }
      }
    }

    const colors = getColor()

    return {
      labels,
      datasets: [{
        label: type === 'steps' ? 'Pas' : 
               type === 'calories' ? 'Calories' :
               type === 'distance' ? 'Distance (km)' : 
               type === 'weight' ? 'Poids (kg)' : 'Taille (m)',
        data: values,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 2,
        fill: (type === 'weight' || type === 'height') ? false : true,
        tension: 0.4
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  }

  if (isLoading) {
    return <LoaderPortal />
  }

  if (authLoading) {
    return <LoaderPortal />
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-4 md:p-6 lg:p-8">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl text-center"
          >
            <FaHeartbeat className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Santé & Fitness</h1>
            <p className="text-slate-400 mb-8">Connectez-vous avec Google pour accéder à vos données de santé Google Fit</p>
            <button
              onClick={() => signIn('google')}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg mx-auto"
            >
              <FaGoogle className="w-5 h-5" />
              Se connecter avec Google
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-4 md:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaHeartbeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Santé & Fitness</h1>
              <p className="text-slate-400">Vos données de santé Google Fit</p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { days: 1, label: "Aujourd'hui" },
                { days: 7, label: "1 semaine" },
                { days: 21, label: "3 semaines" },
                { days: 30, label: "1 mois" },
                { days: 90, label: "3 mois" }
              ].map(period => (
                <button
                  key={period.days}
                  onClick={() => setSelectedPeriod(period.days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.days
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/60 border border-slate-600/30'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            {/* Indicateur de chargement compact */}
            {loadingData && (
              <div className="flex items-center gap-2 text-slate-400 bg-slate-800/30 px-3 py-2 rounded-lg">
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span className="text-sm">Mise à jour...</span>
              </div>
            )}
          </div>
        </motion.div>


        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-2xl p-6 shadow-2xl border border-red-500/30 backdrop-blur-xl mb-6"
          >
            <div className="flex items-center gap-3 text-red-300">
              <FaExclamationTriangle className="w-5 h-5" />
              {error}
            </div>
          </motion.div>
        )}

        {/* Grille des statistiques */}
        <SwappyGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" enabled={true}>
          {/* Pas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('steps', fitData.steps)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaRunning className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Pas</h3>
                <p className="text-xs text-slate-400">Total période</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.steps?.stats?.total?.toLocaleString() || '---'}
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 
                `Objectif: ${fitData.steps?.stats?.total >= 10000 ? 'Atteint ✓' : '10 000 pas'}` :
                `Moyenne: ${fitData.steps?.stats?.average?.toLocaleString() || '---'}/jour`
              }
            </div>
          </motion.div>

          {/* Calories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('calories', fitData.calories)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FaFire className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Calories</h3>
                <p className="text-xs text-slate-400">Brûlées</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.calories?.stats?.total?.toLocaleString() || '---'}
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 
                `Objectif: ${fitData.calories?.stats?.total >= 2000 ? 'Atteint ✓' : '2 000 cal'}` :
                `Moyenne: ${fitData.calories?.stats?.average?.toLocaleString() || '---'}/jour`
              }
            </div>
          </motion.div>

          {/* Distance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('distance', fitData.distance)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaRoute className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Distance</h3>
                <p className="text-xs text-slate-400">Parcourue</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.distance?.stats?.total?.toFixed(1) || '---'} km
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 
                `Objectif: ${fitData.distance?.stats?.total >= 8 ? 'Atteint ✓' : '8 km'}` :
                `Moyenne: ${fitData.distance?.stats?.average?.toFixed(1) || '---'} km/jour`
              }
            </div>
          </motion.div>

          {/* Poids */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('weight', fitData.weight)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaWeight className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Poids</h3>
                <p className="text-xs text-slate-400">{selectedPeriod === 1 ? "Aujourd'hui" : "Moyen"}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openInputModal('weight')
                  }}
                  className="w-8 h-8 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <FaEdit className="w-3 h-3 text-purple-400" />
                </button>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {selectedPeriod === 1 ? 
                (fitData.weight?.data?.find(d => d.value > 0)?.value?.toFixed(1) || '---') :
                (fitData.weight?.stats?.average?.toFixed(1) || '---')
              } kg
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 
                `IMC: ${fitData.weight?.stats?.average && fitData.height?.stats?.average ? 
                  (fitData.weight.stats.average / Math.pow(fitData.height.stats.average, 2)).toFixed(1) : '---'}` :
                `Évolution: ${fitData.weight?.data?.length > 1 ? 
                  (fitData.weight.data[fitData.weight.data.length - 1]?.value - fitData.weight.data[0]?.value)?.toFixed(1) : '---'} kg`
              }
            </div>
          </motion.div>

          {/* Taille */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('height', fitData.height)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FaRulerVertical className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Taille</h3>
                <p className="text-xs text-slate-400">{selectedPeriod === 1 ? "Aujourd'hui" : "Actuelle"}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openInputModal('height')
                  }}
                  className="w-8 h-8 bg-green-600/20 hover:bg-green-600/40 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <FaEdit className="w-3 h-3 text-green-400" />
                </button>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {selectedPeriod === 1 ? 
                (fitData.height?.data?.find(d => d.value > 0)?.value?.toFixed(2) || fitData.height?.stats?.average?.toFixed(2) || '---') :
                (fitData.height?.stats?.average?.toFixed(2) || '---')
              } m
            </div>
            <div className="text-sm text-slate-400">
              IMC: {fitData.weight?.stats?.average && fitData.height?.stats?.average 
                ? (fitData.weight.stats.average / Math.pow(fitData.height.stats.average, 2)).toFixed(1)
                : '---'}
            </div>
          </motion.div>

          {/* Fréquence cardiaque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('heart_rate', fitData.heart_rate)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <FaHeartbeat className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Rythme</h3>
                <p className="text-xs text-slate-400">Cardiaque</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.heart_rate?.stats?.average || '---'} bpm
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 'Aujourd\'hui' : 
                fitData.heart_rate?.stats?.daysWithData > 0 ? 
                `${fitData.heart_rate.stats.daysWithData} jour${fitData.heart_rate.stats.daysWithData > 1 ? 's' : ''}` : 
                'Aucune donnée'}
            </div>
          </motion.div>

          {/* Sommeil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('sleep', fitData.sleep)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FaBed className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Sommeil</h3>
                <p className="text-xs text-slate-400">Heures</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.sleep?.stats?.average?.toFixed(1) || '---'}h
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 'Aujourd\'hui' : 
                fitData.sleep?.stats?.daysWithData > 0 ? 
                `${fitData.sleep.stats.daysWithData} jour${fitData.sleep.stats.daysWithData > 1 ? 's' : ''}` : 
                'Aucune donnée'}
            </div>
          </motion.div>

          {/* Minutes actives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('active_minutes', fitData.active_minutes)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <FaClock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Actif</h3>
                <p className="text-xs text-slate-400">Minutes</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.active_minutes?.stats?.total || '---'} min
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 'Aujourd\'hui' : 
                fitData.active_minutes?.stats?.daysWithData > 0 ? 
                `${fitData.active_minutes.stats.daysWithData} jour${fitData.active_minutes.stats.daysWithData > 1 ? 's' : ''}` : 
                'Aucune donnée'}
            </div>
          </motion.div>

          {/* Points cardio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('heart_points', fitData.heart_points)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FaAward className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Points</h3>
                <p className="text-xs text-slate-400">Cardio</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-pink-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.heart_points?.stats?.total || '---'} pts
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 'Aujourd\'hui' : 
                fitData.heart_points?.stats?.daysWithData > 0 ? 
                `${fitData.heart_points.stats.daysWithData} jour${fitData.heart_points.stats.daysWithData > 1 ? 's' : ''}` : 
                'Aucune donnée'}
            </div>
          </motion.div>

          {/* Graisse corporelle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('body_fat', fitData.body_fat)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                <FaPercent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Graisse</h3>
                <p className="text-xs text-slate-400">Corporelle</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.body_fat?.stats?.average?.toFixed(1) || '---'}%
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 'Aujourd\'hui' : 
                fitData.body_fat?.stats?.daysWithData > 0 ? 
                `${fitData.body_fat.stats.daysWithData} jour${fitData.body_fat.stats.daysWithData > 1 ? 's' : ''}` : 
                'Aucune donnée'}
            </div>
          </motion.div>

          {/* Saturation en oxygène */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl h-40 cursor-pointer hover:from-[#1e293b]/80 hover:to-[#0f172a]/80 hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-200 relative group"
            onClick={() => openMetricModal('oxygen_saturation', fitData.oxygen_saturation)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <FaTint className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">SpO2</h3>
                <p className="text-xs text-slate-400">Oxygène</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaExpand className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {fitData.oxygen_saturation?.stats?.average?.toFixed(1) || '---'}%
            </div>
            <div className="text-sm text-slate-400">
              {selectedPeriod === 1 ? 'Aujourd\'hui' : 
                fitData.oxygen_saturation?.stats?.daysWithData > 0 ? 
                `${fitData.oxygen_saturation.stats.daysWithData} jour${fitData.oxygen_saturation.stats.daysWithData > 1 ? 's' : ''}` : 
                'Aucune donnée'}
            </div>
          </motion.div>
        </SwappyGrid>

        {/* Graphique de tendance (placeholder pour l'instant) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Évolution {
                selectedPeriod === 1 ? "d'aujourd'hui" : 
                selectedPeriod === 7 ? "sur 1 semaine" :
                selectedPeriod === 21 ? "sur 3 semaines" :
                selectedPeriod === 30 ? "sur 1 mois" :
                selectedPeriod === 90 ? "sur 3 mois" :
                `sur ${selectedPeriod} jours`
              }</h3>
              <p className="text-sm text-slate-400">Tendance de vos activités</p>
            </div>
          </div>
          
          <div className="h-64 bg-slate-700/20 rounded-xl flex items-center justify-center">
            <div className="text-center text-slate-400">
              <FaChartLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Graphique en cours de développement</p>
              <p className="text-sm">Les données sont récupérées avec succès</p>
            </div>
          </div>
        </motion.div>

        {/* Modale de détails avec graphique */}
        {showModal && selectedMetric && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedMetric.type === 'steps' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                    selectedMetric.type === 'calories' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    selectedMetric.type === 'distance' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    selectedMetric.type === 'weight' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    selectedMetric.type === 'height' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    selectedMetric.type === 'heart_rate' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    selectedMetric.type === 'sleep' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                    selectedMetric.type === 'active_minutes' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    selectedMetric.type === 'heart_points' ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                    selectedMetric.type === 'body_fat' ? 'bg-gradient-to-r from-violet-500 to-violet-600' :
                    selectedMetric.type === 'oxygen_saturation' ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {selectedMetric.type === 'steps' && <FaRunning className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'calories' && <FaFire className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'distance' && <FaRoute className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'weight' && <FaWeight className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'height' && <FaRulerVertical className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'heart_rate' && <FaHeartbeat className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'sleep' && <FaBed className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'active_minutes' && <FaClock className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'heart_points' && <FaAward className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'body_fat' && <FaPercent className="w-5 h-5 text-white" />}
                    {selectedMetric.type === 'oxygen_saturation' && <FaTint className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {selectedMetric.type === 'steps' ? 'Détails des Pas' :
                       selectedMetric.type === 'calories' ? 'Détails des Calories' :
                       selectedMetric.type === 'distance' ? 'Détails de la Distance' :
                       selectedMetric.type === 'weight' ? 'Détails du Poids' :
                       selectedMetric.type === 'height' ? 'Détails de la Taille' :
                       selectedMetric.type === 'heart_rate' ? 'Détails du Rythme Cardiaque' :
                       selectedMetric.type === 'sleep' ? 'Détails du Sommeil' :
                       selectedMetric.type === 'active_minutes' ? 'Détails des Minutes Actives' :
                       selectedMetric.type === 'heart_points' ? 'Détails des Points Cardio' :
                       selectedMetric.type === 'body_fat' ? 'Détails de la Graisse Corporelle' :
                       selectedMetric.type === 'oxygen_saturation' ? 'Détails de la Saturation en Oxygène' :
                       'Détails de la Métrique'}
                    </h2>
                    <p className="text-sm text-slate-400">Analyse {
                      selectedPeriod === 1 ? "d'aujourd'hui" : 
                      selectedPeriod === 7 ? "sur 1 semaine" :
                      selectedPeriod === 21 ? "sur 3 semaines" :
                      selectedPeriod === 30 ? "sur 1 mois" :
                      selectedPeriod === 90 ? "sur 3 mois" :
                      `sur ${selectedPeriod} jours`
                    }</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(selectedMetric.type === 'weight' || selectedMetric.type === 'height') && (
                    <button
                      onClick={() => {
                        setShowModal(false)
                        openInputModal(selectedMetric.type)
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        selectedMetric.type === 'weight' 
                          ? 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-purple-200' 
                          : 'bg-green-600/20 hover:bg-green-600/40 text-green-300 hover:text-green-200'
                      }`}
                    >
                      <FaEdit className="w-3 h-3" />
                      Modifier
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200"
                  >
                    <FaTimes className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className={`grid gap-4 mb-6 ${selectedPeriod === 1 && (selectedMetric.type === 'weight' || selectedMetric.type === 'height') ? 'grid-cols-2' : selectedPeriod === 1 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {/* Première statistique - adaptée selon le type */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">
                    {selectedMetric.type === 'steps' ? 'Total des pas' :
                     selectedMetric.type === 'calories' ? 'Total brûlées' :
                     selectedMetric.type === 'distance' ? 'Distance totale' :
                     selectedMetric.type === 'weight' ? 'Poids actuel' :
                     selectedMetric.type === 'height' ? 'Taille actuelle' :
                     selectedMetric.type === 'heart_rate' ? 'Fréquence moyenne' :
                     selectedMetric.type === 'sleep' ? 'Sommeil moyen' :
                     selectedMetric.type === 'active_minutes' ? 'Minutes totales' :
                     selectedMetric.type === 'heart_points' ? 'Points totaux' :
                     selectedMetric.type === 'body_fat' ? 'Graisse corporelle' :
                     selectedMetric.type === 'oxygen_saturation' ? 'SpO2 moyenne' :
                     'Total'}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedMetric.type === 'weight' ? 
                      (selectedMetric.data?.stats?.average?.toFixed(1) || '---') + ' kg' :
                     selectedMetric.type === 'height' ? 
                      (selectedMetric.data?.stats?.average?.toFixed(2) || '---') + ' m' :
                     selectedMetric.type === 'heart_rate' ? 
                      (selectedMetric.data?.stats?.average || '---') + ' bpm' :
                     selectedMetric.type === 'sleep' ? 
                      (selectedMetric.data?.stats?.average?.toFixed(1) || '---') + 'h' :
                     selectedMetric.type === 'active_minutes' ? 
                      (selectedMetric.data?.stats?.total || '---') + ' min' :
                     selectedMetric.type === 'heart_points' ? 
                      (selectedMetric.data?.stats?.total || '---') + ' pts' :
                     selectedMetric.type === 'body_fat' ? 
                      (selectedMetric.data?.stats?.average?.toFixed(1) || '---') + '%' :
                     selectedMetric.type === 'oxygen_saturation' ? 
                      (selectedMetric.data?.stats?.average?.toFixed(1) || '---') + '%' :
                     selectedMetric.type === 'distance' ? 
                      (selectedMetric.data?.stats?.total?.toFixed(1) || '---') + ' km' :
                      (selectedMetric.data?.stats?.total?.toLocaleString() || '---')}
                  </div>
                </div>

                {/* Deuxième statistique - adaptée selon le type */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">
                    {selectedPeriod === 1 ? (
                      selectedMetric.type === 'steps' ? 'Objectif' :
                      selectedMetric.type === 'calories' ? 'Objectif' :
                      selectedMetric.type === 'distance' ? 'Objectif' :
                      selectedMetric.type === 'weight' ? 'IMC' :
                      selectedMetric.type === 'height' ? 'IMC' :
                      selectedMetric.type === 'heart_rate' ? 'Zone cible' :
                      selectedMetric.type === 'sleep' ? 'Objectif' :
                      selectedMetric.type === 'active_minutes' ? 'Objectif OMS' :
                      selectedMetric.type === 'heart_points' ? 'Objectif' :
                      selectedMetric.type === 'body_fat' ? 'Catégorie' :
                      selectedMetric.type === 'oxygen_saturation' ? 'Normal' :
                      'Objectif'
                    ) : (
                      selectedMetric.type === 'steps' ? 'Moyenne/jour' :
                      selectedMetric.type === 'calories' ? 'Moyenne/jour' :
                      selectedMetric.type === 'distance' ? 'Moyenne/jour' :
                      selectedMetric.type === 'weight' ? 'Évolution' :
                      selectedMetric.type === 'height' ? 'IMC' :
                      selectedMetric.type === 'heart_rate' ? 'Maximum relevé' :
                      selectedMetric.type === 'sleep' ? 'Meilleure nuit' :
                      selectedMetric.type === 'active_minutes' ? 'Meilleur jour' :
                      selectedMetric.type === 'heart_points' ? 'Meilleur jour' :
                      selectedMetric.type === 'body_fat' ? 'Minimum' :
                      selectedMetric.type === 'oxygen_saturation' ? 'Maximum' :
                      'Moyenne/jour'
                    )}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedPeriod === 1 ? (
                      selectedMetric.type === 'steps' ? '10 000' :
                      selectedMetric.type === 'calories' ? '2 000' :
                      selectedMetric.type === 'distance' ? '8 km' :
                      selectedMetric.type === 'weight' ? 
                        (fitData.weight?.stats?.average && fitData.height?.stats?.average ? 
                          (fitData.weight.stats.average / Math.pow(fitData.height.stats.average, 2)).toFixed(1) : 
                          '---') :
                      selectedMetric.type === 'height' ? 
                        (fitData.weight?.stats?.average && selectedMetric.data?.stats?.average ? 
                          (fitData.weight.stats.average / Math.pow(selectedMetric.data.stats.average, 2)).toFixed(1) : 
                          '---') :
                      selectedMetric.type === 'heart_rate' ? '60-100 bpm' :
                      selectedMetric.type === 'sleep' ? '7-9h' :
                      selectedMetric.type === 'active_minutes' ? '150 min' :
                      selectedMetric.type === 'heart_points' ? '150 pts' :
                      selectedMetric.type === 'body_fat' ? 
                        (selectedMetric.data?.stats?.average >= 15 && selectedMetric.data?.stats?.average <= 20 ? 'Normal' : 
                         selectedMetric.data?.stats?.average < 15 ? 'Faible' : 'Élevé') :
                      selectedMetric.type === 'oxygen_saturation' ? '95-100%' :
                      '---'
                    ) : (
                      selectedMetric.type === 'weight' ? 
                        (selectedMetric.data?.data?.length > 1 ? 
                          ((selectedMetric.data.data[selectedMetric.data.data.length - 1]?.value - selectedMetric.data.data[0]?.value)?.toFixed(1) || '---') + ' kg' : 
                          '--- kg') :
                       selectedMetric.type === 'height' ? 
                        (fitData.weight?.stats?.average && selectedMetric.data?.stats?.average ? 
                          (fitData.weight.stats.average / Math.pow(selectedMetric.data.stats.average, 2)).toFixed(1) : 
                          '---') :
                       selectedMetric.type === 'heart_rate' ? 
                        (selectedMetric.data?.stats?.max || '---') + ' bpm' :
                       selectedMetric.type === 'sleep' ? 
                        (selectedMetric.data?.stats?.max?.toFixed(1) || '---') + 'h' :
                       selectedMetric.type === 'active_minutes' ? 
                        (selectedMetric.data?.stats?.max || '---') + ' min' :
                       selectedMetric.type === 'heart_points' ? 
                        (selectedMetric.data?.stats?.max || '---') + ' pts' :
                       selectedMetric.type === 'body_fat' ? 
                        (selectedMetric.data?.stats?.min?.toFixed(1) || '---') + '%' :
                       selectedMetric.type === 'oxygen_saturation' ? 
                        (selectedMetric.data?.stats?.max?.toFixed(1) || '---') + '%' :
                       selectedMetric.type === 'distance' ? 
                        (selectedMetric.data?.stats?.average?.toFixed(1) || '---') + ' km' :
                        (selectedMetric.data?.stats?.average?.toLocaleString() || '---')
                    )}
                  </div>
                </div>

                {/* Troisième statistique - adaptée selon le type */}
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">
                    {selectedPeriod === 1 ? (
                      selectedMetric.type === 'steps' ? 'Progression' :
                      selectedMetric.type === 'calories' ? 'Progression' :
                      selectedMetric.type === 'distance' ? 'Progression' :
                      selectedMetric.type === 'weight' ? 'Catégorie IMC' :
                      selectedMetric.type === 'height' ? 'Catégorie IMC' :
                      selectedMetric.type === 'heart_rate' ? 'État' :
                      selectedMetric.type === 'sleep' ? 'Qualité' :
                      selectedMetric.type === 'active_minutes' ? 'Statut OMS' :
                      selectedMetric.type === 'heart_points' ? 'Statut' :
                      selectedMetric.type === 'body_fat' ? 'Catégorie' :
                      selectedMetric.type === 'oxygen_saturation' ? 'État' :
                      'Progression'
                    ) : (
                      selectedMetric.type === 'steps' ? 'Meilleur jour' :
                      selectedMetric.type === 'calories' ? 'Meilleur jour' :
                      selectedMetric.type === 'distance' ? 'Meilleure journée' :
                      selectedMetric.type === 'weight' ? 'Poids minimum' :
                      selectedMetric.type === 'height' ? 'Stabilité' :
                      selectedMetric.type === 'heart_rate' ? 'Minimum relevé' :
                      selectedMetric.type === 'sleep' ? 'Nuit la plus courte' :
                      selectedMetric.type === 'active_minutes' ? 'Minimum' :
                      selectedMetric.type === 'heart_points' ? 'Minimum' :
                      selectedMetric.type === 'body_fat' ? 'Maximum' :
                      selectedMetric.type === 'oxygen_saturation' ? 'Minimum' :
                      'Dernière mesure'
                    )}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedPeriod === 1 ? (
                      selectedMetric.type === 'steps' ? 
                        (selectedMetric.data?.stats?.total >= 10000 ? '✓ Objectif atteint' : 
                         selectedMetric.data?.stats?.total >= 7500 ? 'Bon' :
                         selectedMetric.data?.stats?.total >= 5000 ? 'Moyen' : 'Faible') :
                      selectedMetric.type === 'calories' ? 
                        (selectedMetric.data?.stats?.total >= 2000 ? '✓ Objectif atteint' : 
                         selectedMetric.data?.stats?.total >= 1500 ? 'Bon' :
                         selectedMetric.data?.stats?.total >= 1000 ? 'Moyen' : 'Faible') :
                      selectedMetric.type === 'distance' ? 
                        (selectedMetric.data?.stats?.total >= 8 ? '✓ Objectif atteint' : 
                         selectedMetric.data?.stats?.total >= 5 ? 'Bon' :
                         selectedMetric.data?.stats?.total >= 3 ? 'Moyen' : 'Faible') :
                      selectedMetric.type === 'weight' || selectedMetric.type === 'height' ? 
                        (() => {
                          const imc = fitData.weight?.stats?.average && (selectedMetric.type === 'weight' ? fitData.height?.stats?.average : selectedMetric.data?.stats?.average) ?
                            fitData.weight.stats.average / Math.pow((selectedMetric.type === 'weight' ? fitData.height.stats.average : selectedMetric.data.stats.average), 2) : null
                          return imc ? 
                            (imc < 18.5 ? 'Insuffisant' : imc < 25 ? 'Normal' : imc < 30 ? 'Surpoids' : 'Obésité') : 
                            '---'
                        })() :
                      selectedMetric.type === 'heart_rate' ? 
                        (selectedMetric.data?.stats?.average >= 60 && selectedMetric.data?.stats?.average <= 100 ? 'Normal' : 
                         selectedMetric.data?.stats?.average < 60 ? 'Faible' : 'Élevé') :
                      selectedMetric.type === 'sleep' ? 
                        (selectedMetric.data?.stats?.average >= 7 ? 'Bonne' : 
                         selectedMetric.data?.stats?.average >= 6 ? 'Correcte' : 'Insuffisante') :
                      selectedMetric.type === 'active_minutes' ? 
                        (selectedMetric.data?.stats?.total >= 150 ? '✓ Recommandation OMS' : 
                         selectedMetric.data?.stats?.total >= 75 ? 'Partiellement' : 'Insuffisant') :
                      selectedMetric.type === 'heart_points' ? 
                        (selectedMetric.data?.stats?.total >= 150 ? '✓ Objectif atteint' : 
                         selectedMetric.data?.stats?.total >= 75 ? 'Bien' : 'À améliorer') :
                      selectedMetric.type === 'body_fat' ? 
                        (selectedMetric.data?.stats?.average >= 15 && selectedMetric.data?.stats?.average <= 20 ? 'Normal' : 
                         selectedMetric.data?.stats?.average < 15 ? 'Faible' : 'Élevé') :
                      selectedMetric.type === 'oxygen_saturation' ? 
                        (selectedMetric.data?.stats?.average >= 95 ? 'Normal' : 
                         selectedMetric.data?.stats?.average >= 90 ? 'Limite' : 'Faible') :
                      '---'
                    ) : (
                      selectedMetric.type === 'weight' ? 
                        (selectedMetric.data?.stats?.min?.toFixed(1) || '---') + ' kg' :
                       selectedMetric.type === 'height' ? 
                        '✓ Stable' :
                       selectedMetric.type === 'heart_rate' ? 
                        (selectedMetric.data?.stats?.min || '---') + ' bpm' :
                       selectedMetric.type === 'sleep' ? 
                        (selectedMetric.data?.stats?.min?.toFixed(1) || '---') + 'h' :
                       selectedMetric.type === 'active_minutes' ? 
                        (selectedMetric.data?.stats?.min || '---') + ' min' :
                       selectedMetric.type === 'heart_points' ? 
                        (selectedMetric.data?.stats?.min || '---') + ' pts' :
                       selectedMetric.type === 'body_fat' ? 
                        (selectedMetric.data?.stats?.max?.toFixed(1) || '---') + '%' :
                       selectedMetric.type === 'oxygen_saturation' ? 
                        (selectedMetric.data?.stats?.min?.toFixed(1) || '---') + '%' :
                       selectedMetric.type === 'distance' ? 
                        (selectedMetric.data?.stats?.max?.toFixed(1) || '---') + ' km' :
                        (selectedMetric.data?.stats?.max?.toLocaleString() || '---')
                    )}
                  </div>
                </div>

                {/* Quatrième statistique - adaptée selon le type - masquée pour aujourd'hui et pour les statuts */}
                {!(selectedPeriod === 1) && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="text-xs text-slate-400 mb-1">
                      {selectedMetric.type === 'weight' ? 'Poids maximum' :
                       selectedMetric.type === 'height' ? 'Stabilité' :
                       "Jours actifs"}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {selectedMetric.type === 'weight' ? 
                        (selectedMetric.data?.stats?.max?.toFixed(1) || '---') + ' kg' :
                       selectedMetric.type === 'height' ? 
                        '✓ Stable' :
                        `${selectedMetric.data?.stats?.daysWithData || 0} / ${selectedPeriod}`}
                    </div>
                  </div>
                )}
              </div>

              {/* Graphique interactif */}
              <div className="bg-slate-800/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Évolution quotidienne</h3>
                <div className="h-80">
                  {selectedMetric.data?.data?.length > 0 ? (
                    <Line 
                      data={getChartData(selectedMetric.data, selectedMetric.type)} 
                      options={chartOptions} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <FaChartLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune donnée disponible pour cette période</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {/* Modale de saisie pour poids/taille */}
        {showInputModal && inputType && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInputModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    inputType === 'weight' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}>
                    {inputType === 'weight' ? <FaWeight className="w-5 h-5 text-white" /> : <FaRulerVertical className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {inputType === 'weight' ? 'Saisir le poids' : 'Saisir la taille'}
                    </h2>
                    <p className="text-sm text-slate-400">Envoyer vers Google Fit</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInputModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200"
                >
                  <FaTimes className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {inputType === 'weight' ? 'Poids (kg)' : 'Taille (m)'}
                </label>
                <input
                  type="number"
                  step={inputType === 'weight' ? '0.1' : '0.01'}
                  min="0"
                  max={inputType === 'weight' ? '300' : '3'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputType === 'weight' ? 'Ex: 70.5' : 'Ex: 1.75'}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/60 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={submitData}
                  disabled={!inputValue || submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}