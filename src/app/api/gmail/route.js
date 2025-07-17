import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gmail API Error:", response.status, errorData)
      throw new Error(`Erreur Gmail API: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.messages) {
      return NextResponse.json({ messages: [] })
    }

    const detailedMessages = await Promise.all(
      data.messages.map(async (message) => {
        try {
          const messageResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          )
          
          if (!messageResponse.ok) {
            console.error(`Error fetching message ${message.id}:`, messageResponse.status)
            return null
          }
          
          const messageData = await messageResponse.json()
        
        const headers = messageData.payload.headers
        const subject = headers.find(h => h.name === "Subject")?.value || "Sans sujet"
        const from = headers.find(h => h.name === "From")?.value || "Expéditeur inconnu"
        const date = headers.find(h => h.name === "Date")?.value || ""
        const to = headers.find(h => h.name === "To")?.value || ""
        
        // Extraire le nom et email de l'expéditeur
        const fromMatch = from.match(/^(.*?)\s*<(.+)>$/) || [null, from, from]
        const senderName = fromMatch[1]?.trim() || from
        const senderEmail = fromMatch[2]?.trim() || from
        
        // Déterminer la catégorie basée sur l'expéditeur et le sujet
        let category = "primary"
        
        // Réseaux sociaux
        if (senderEmail.includes("linkedin") || senderEmail.includes("facebook") || 
            senderEmail.includes("twitter") || senderEmail.includes("instagram") ||
            senderEmail.includes("tiktok") || senderEmail.includes("youtube")) {
          category = "social"
        }
        // Promotions
        else if (subject.toLowerCase().includes("promo") || subject.toLowerCase().includes("offer") || 
                 subject.toLowerCase().includes("deal") || subject.toLowerCase().includes("sale") ||
                 subject.toLowerCase().includes("discount") || subject.toLowerCase().includes("% off") ||
                 senderEmail.includes("marketing") || senderEmail.includes("promo")) {
          category = "promotions"
        }
        // Notifications
        else if (senderEmail.includes("noreply") || senderEmail.includes("no-reply") ||
                 senderEmail.includes("notification") || senderEmail.includes("alert")) {
          category = "notifications"
        }
        // Mises à jour
        else if (subject.toLowerCase().includes("newsletter") || subject.toLowerCase().includes("update") ||
                 subject.toLowerCase().includes("digest") || subject.toLowerCase().includes("weekly") ||
                 subject.toLowerCase().includes("monthly")) {
          category = "updates"
        }
        // Sinon, reste en "primary"
        
        // Vérifier si lu/non lu
        const isUnread = messageData.labelIds?.includes("UNREAD") || false
        const isImportant = messageData.labelIds?.includes("IMPORTANT") || false
        
          return {
            id: message.id,
            subject,
            from: senderName,
            email: senderEmail,
            to,
            date: new Date(date).toISOString(),
            snippet: messageData.snippet || "",
            isUnread,
            isImportant,
            category,
            labels: messageData.labelIds || []
          }
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error)
          return null
        }
      })
    )
    
    return NextResponse.json({ 
      messages: detailedMessages.filter(msg => msg !== null) 
    })
    
  } catch (error) {
    console.error("Erreur Gmail API:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des emails" },
      { status: 500 }
    )
  }
}