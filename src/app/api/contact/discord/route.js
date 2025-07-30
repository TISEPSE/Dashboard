import { NextResponse } from 'next/server'

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1397663588813897778/SCe6o7UuzGfriCnEt5rXaEfepEIzxsp3s7jvzOrryJW-GgcZKJ42R_4t1UFaxo_gV-9U'

export async function POST(request) {
  try {
    const { nom, prenom, description } = await request.json()
    
    // Validation des données
    if (!nom || !prenom || !description) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Validation de la longueur
    if (nom.length > 50 || prenom.length > 50 || description.length > 2000) {
      return NextResponse.json(
        { error: 'Un ou plusieurs champs dépassent la longueur maximale autorisée' },
        { status: 400 }
      )
    }

    // Formatage de la date
    const now = new Date()
    const dateString = now.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Construction du message Discord avec un design complet et visible
    const discordMessage = {
      embeds: [{
        description: `📧 **Dashboard - Formulaire de Contact**\n\n👤 **Expéditeur**\n${prenom} ${nom}\n\n📅 **Date**\n<t:${Math.floor(now.getTime() / 1000)}:F>\n\n📝 **Message**\n${description}`,
        color: 0x5865f2,
        timestamp: now.toISOString()
      }]
    }


    // Envoi vers Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordMessage)
    })

    if (!discordResponse.ok) {
      const errorData = await discordResponse.text()
      console.error('❌ Erreur Discord API:', discordResponse.status, errorData)
      throw new Error(`Discord API error: ${discordResponse.status}`)
    }


    return NextResponse.json({
      success: true,
      message: 'Signalement envoyé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi vers Discord:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi du signalement',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}