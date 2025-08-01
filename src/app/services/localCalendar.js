// Couleurs inspirées de Samsung Calendar (OneUI Design System)
export const EVENT_COLORS = {
  '1': { background: '#0381fe', foreground: '#ffffff', text: '#ffffff' }, // Samsung Blue (défaut)
  '2': { background: '#4CAF50', foreground: '#ffffff', text: '#ffffff' }, // Vert nature
  '3': { background: '#FF6B35', foreground: '#ffffff', text: '#ffffff' }, // Orange vif
  '4': { background: '#E91E63', foreground: '#ffffff', text: '#ffffff' }, // Rose vif
  '5': { background: '#9C27B0', foreground: '#ffffff', text: '#ffffff' }, // Violet
  '6': { background: '#F44336', foreground: '#ffffff', text: '#ffffff' }, // Rouge
  '7': { background: '#FF9800', foreground: '#ffffff', text: '#ffffff' }, // Orange
  '8': { background: '#795548', foreground: '#ffffff', text: '#ffffff' }, // Marron
  '9': { background: '#607D8B', foreground: '#ffffff', text: '#ffffff' }, // Bleu-gris
  '10': { background: '#009688', foreground: '#ffffff', text: '#ffffff' }, // Teal
  '11': { background: '#8BC34A', foreground: '#ffffff', text: '#ffffff' }, // Vert clair
  '12': { background: '#CDDC39', foreground: '#ffffff', text: '#ffffff' }, // Lime
  '13': { background: '#FFEB3B', foreground: '#ffffff', text: '#ffffff' }, // Jaune
  '14': { background: '#FFC107', foreground: '#ffffff', text: '#ffffff' }, // Ambre
  '15': { background: '#FF5722', foreground: '#ffffff', text: '#ffffff' }, // Deep Orange
  '16': { background: '#3F51B5', foreground: '#ffffff', text: '#ffffff' }, // Indigo
  '17': { background: '#3e91ff', foreground: '#ffffff', text: '#ffffff' }, // Samsung Blue Dark
  '18': { background: '#0072de', foreground: '#ffffff', text: '#ffffff' }, // Samsung Blue Light
  '19': { background: '#00BCD4', foreground: '#ffffff', text: '#ffffff' }, // Cyan
  '20': { background: '#4DD0E1', foreground: '#ffffff', text: '#ffffff' }, // Cyan clair
  '21': { background: '#81C784', foreground: '#ffffff', text: '#ffffff' }, // Vert pastel
  '22': { background: '#AED581', foreground: '#ffffff', text: '#ffffff' }, // Vert lime clair
  '23': { background: '#FFB74D', foreground: '#ffffff', text: '#ffffff' }, // Orange clair
  '24': { background: '#F06292', foreground: '#ffffff', text: '#ffffff' }  // Rose clair
}

// Fonction pour récupérer les couleurs Google Calendar
export const fetchGoogleColors = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/colors', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des couleurs Google:', error)
    throw error
  }
}

// Fonction pour convertir les couleurs Google au format local
export const convertGoogleColors = (googleColorData) => {
  const convertedColors = {}
  
  if (googleColorData && googleColorData.event) {
    Object.entries(googleColorData.event).forEach(([id, colorInfo]) => {
      convertedColors[id] = {
        background: colorInfo.background,
        foreground: colorInfo.foreground || '#ffffff'
      }
    })
  }
  
  return convertedColors
}