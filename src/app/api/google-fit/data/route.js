import { NextResponse } from 'next/server'

// API pour soumettre des données vers Google Fit
export async function POST(request) {
  try {
    // Vérifier l'authentification via le cookie custom
    const authCookie = request.cookies.get('auth-session')
    let sessionData = null
    
    if (authCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(authCookie.value))
      } catch (parseError) {
        console.error('❌ [GOOGLE-FIT-API] Erreur parsing session:', parseError)
      }
    }
    
    if (!sessionData || !sessionData.accessToken || Date.now() > sessionData.expiresAt) {
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
        'Authorization': `Bearer ${sessionData.accessToken}`,
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