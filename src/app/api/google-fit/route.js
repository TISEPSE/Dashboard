import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    // Récupérer le token d'accès depuis le cookie de session
    let accessToken = null
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('auth-session')
      
      if (sessionCookie?.value) {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
        
        // Vérifier si le token n'est pas expiré
        if (Date.now() < sessionData.expiresAt) {
          accessToken = sessionData.accessToken
        } else {
          console.log('🔄 [GOOGLE FIT] Token expiré')
        }
      }
    } catch (error) {
      console.error('❌ [GOOGLE FIT] Erreur lecture session:', error)
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Pas d\'authentification ou de token d\'accès' },
        { status: 401 }
      )
    }

    const { type, value } = await request.json()
    
    if (!type || !value || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Type et valeur requis' },
        { status: 400 }
      )
    }

    // Validation des valeurs
    if (type === 'weight' && (value <= 0 || value > 300)) {
      return NextResponse.json(
        { error: 'Poids invalide (doit être entre 0 et 300 kg)' },
        { status: 400 }
      )
    }

    if (type === 'height' && (value <= 0 || value > 3)) {
      return NextResponse.json(
        { error: 'Taille invalide (doit être entre 0 et 3 m)' },
        { status: 400 }
      )
    }

    // Configuration selon le type de données
    let dataTypeName = ''
    let dataValue = {}

    switch (type) {
      case 'weight':
        dataTypeName = 'com.google.weight'
        dataValue = { fpVal: value }
        break
      case 'height':
        dataTypeName = 'com.google.height'
        dataValue = { fpVal: value }
        break
      default:
        return NextResponse.json(
          { error: 'Type de données non supporté' },
          { status: 400 }
        )
    }

    // Timestamp actuel
    const now = Date.now()
    const startTimeNanos = (now * 1000000).toString()
    const endTimeNanos = ((now + 1000) * 1000000).toString() // +1 seconde

    // Corps de la requête pour Google Fit
    const requestBody = {
      dataSourceId: `derived:${dataTypeName}:com.google.android.gms:merge_${type}`,
      point: [{
        startTimeNanos,
        endTimeNanos,
        dataTypeName,
        value: [dataValue]
      }]
    }

    console.log('📤 Envoi vers Google Fit:', JSON.stringify(requestBody, null, 2))

    // Envoi vers l'API Google Fit
    const fitApiUrl = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${requestBody.dataSourceId}/dataPointChanges`
    
    const response = await fetch(fitApiUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataSourceId: requestBody.dataSourceId,
        point: requestBody.point
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur Google Fit API (soumission):', response.status, errorText)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token d\'accès expiré ou invalide' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi vers Google Fit', details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ Données envoyées avec succès vers Google Fit:', result)

    return NextResponse.json({
      success: true,
      message: `${type === 'weight' ? 'Poids' : 'Taille'} envoyé(e) avec succès vers Google Fit`,
      data: result
    })

  } catch (error) {
    console.error('❌ Erreur dans l\'API de soumission Google Fit:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // Récupérer le token d'accès depuis le cookie de session
    let accessToken = null
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('auth-session')
      
      if (sessionCookie?.value) {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
        
        // Vérifier si le token n'est pas expiré
        if (Date.now() < sessionData.expiresAt) {
          accessToken = sessionData.accessToken
        } else {
          console.log('🔄 [GOOGLE FIT] Token expiré')
        }
      }
    } catch (error) {
      console.error('❌ [GOOGLE FIT] Erreur lecture session:', error)
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Pas d\'authentification ou de token d\'accès' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') || 'steps'
    let days = parseInt(searchParams.get('days') || '7')

    // Limiter les périodes très longues pour éviter les erreurs Google Fit
    if (days > 90) {
      days = 90 // Limite à 3 mois maximum
    }

    // Calculer la période pour les données
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - (days * 24 * 60 * 60 * 1000))
    
    const startTimeMillis = startTime.getTime()
    const endTimeMillis = endTime.getTime()

    let dataSourceId = ''
    let aggregateBy = {}

    // Configuration selon le type de données demandé
    switch (dataType) {
      case 'steps':
        aggregateBy = {
          dataTypeName: 'com.google.step_count.delta'
        }
        break
      case 'calories':
        aggregateBy = {
          dataTypeName: 'com.google.calories.expended'
        }
        break
      case 'distance':
        aggregateBy = {
          dataTypeName: 'com.google.distance.delta'
        }
        break
      case 'heart_rate':
        aggregateBy = {
          dataTypeName: 'com.google.heart_rate.bpm'
        }
        break
      case 'weight':
        aggregateBy = {
          dataTypeName: 'com.google.weight'
        }
        break
      case 'height':
        aggregateBy = {
          dataTypeName: 'com.google.height'
        }
        break
      case 'active_minutes':
        aggregateBy = {
          dataTypeName: 'com.google.active_minutes'
        }
        break
      case 'sleep':
        aggregateBy = {
          dataTypeName: 'com.google.sleep.segment'
        }
        break
      case 'heart_points':
        aggregateBy = {
          dataTypeName: 'com.google.heart_minutes'
        }
        break
      case 'body_fat':
        aggregateBy = {
          dataTypeName: 'com.google.body.fat.percentage'
        }
        break
      case 'oxygen_saturation':
        aggregateBy = {
          dataTypeName: 'com.google.oxygen_saturation'
        }
        break
      default:
        return NextResponse.json(
          { error: 'Type de données non supporté' },
          { status: 400 }
        )
    }

    // Ajuster la durée des buckets selon la période
    let bucketDuration = 86400000 // 1 jour par défaut
    if (days > 30) {
      bucketDuration = 86400000 * 7 // 1 semaine pour les longues périodes
    }

    // Requête vers l'API Google Fit
    const fitApiUrl = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'
    
    const requestBody = {
      aggregateBy: [aggregateBy],
      bucketByTime: { durationMillis: bucketDuration },
      startTimeMillis: startTimeMillis.toString(),
      endTimeMillis: endTimeMillis.toString()
    }

    const response = await fetch(fitApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur Google Fit API:', response.status, errorText)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token d\'accès expiré ou invalide' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données Google Fit' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Debug pour voir les données brutes
    if (dataType === 'weight') {
      console.log('🔍 Données brutes Google Fit pour poids:', JSON.stringify(data, null, 2))
    }
    
    // Traitement des données pour un format plus utilisable
    const processedData = data.bucket?.map(bucket => {
      const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().split('T')[0]
      let value = 0
      
      if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point) {
        const points = bucket.dataset[0].point
        if (points.length > 0) {
          // Pour les données simples (steps, calories, distance)
          if (points[0].value && points[0].value[0]) {
            if (dataType === 'distance') {
              // Convertir les mètres en kilomètres
              value = Math.round((points[0].value[0].fpVal || 0) / 1000 * 100) / 100
            } else if (dataType === 'weight') {
              // Prendre la dernière valeur de poids (pas d'agrégation)
              const lastPoint = points[points.length - 1]
              value = Math.round((lastPoint.value[0].fpVal || 0) * 100) / 100
            } else if (dataType === 'height') {
              // Prendre la dernière valeur de taille (en mètres)
              const lastPoint = points[points.length - 1]
              value = Math.round((lastPoint.value[0].fpVal || 0) * 100) / 100
            } else if (dataType === 'heart_rate') {
              // Moyenne des valeurs de fréquence cardiaque
              const heartRateValues = points.map(p => p.value[0].fpVal || 0).filter(v => v > 0)
              value = heartRateValues.length > 0 ? Math.round(heartRateValues.reduce((sum, val) => sum + val, 0) / heartRateValues.length) : 0
            } else if (dataType === 'sleep') {
              // Sommeil en heures (convertir de millisecondes)
              const sleepDuration = points.reduce((sum, p) => sum + (p.value[0].intVal || 0), 0)
              value = Math.round(sleepDuration / (1000 * 60 * 60) * 100) / 100 // Heures
            } else if (dataType === 'body_fat') {
              // Pourcentage de graisse corporelle
              const lastPoint = points[points.length - 1]
              value = Math.round((lastPoint.value[0].fpVal || 0) * 100) / 100
            } else if (dataType === 'oxygen_saturation') {
              // Saturation en oxygène moyenne
              const oxygenValues = points.map(p => p.value[0].fpVal || 0).filter(v => v > 0)
              value = oxygenValues.length > 0 ? Math.round(oxygenValues.reduce((sum, val) => sum + val, 0) / oxygenValues.length * 100) / 100 : 0
            } else {
              value = Math.round(points[0].value[0].fpVal || points[0].value[0].intVal || 0)
            }
          }
        }
      }
      
      return {
        date,
        value,
        type: dataType
      }
    }) || []

    // Calculer les statistiques
    const values = processedData.map(d => d.value).filter(v => v > 0)
    const isCurrentValueType = ['weight', 'height', 'body_fat'].includes(dataType)
    const stats = {
      total: isCurrentValueType ? (values.length > 0 ? values[values.length - 1] : 0) : values.reduce((sum, val) => sum + val, 0),
      average: values.length > 0 ? (isCurrentValueType ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length * 100) / 100 : Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      min: values.length > 0 ? Math.min(...values) : 0,
      daysWithData: values.length
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      stats,
      period: {
        startDate: startTime.toISOString().split('T')[0],
        endDate: endTime.toISOString().split('T')[0],
        days
      },
      dataType
    })

  } catch (error) {
    console.error('❌ Erreur dans l\'API Google Fit:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}