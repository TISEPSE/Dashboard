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
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=100&labelIds=INBOX`,
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
        
        // Utiliser les labels Gmail natifs pour la catégorisation
        let category = "primary"
        
        const labels = messageData.labelIds || []
        
        // Vérifier les labels Gmail natifs d'abord
        if (labels.includes("CATEGORY_PROMOTIONS")) {
          category = "promotions"
        }
        else if (labels.includes("CATEGORY_SOCIAL")) {
          category = "social"
        }
        else if (labels.includes("CATEGORY_UPDATES")) {
          category = "updates"
        }
        else if (labels.includes("CATEGORY_FORUMS")) {
          category = "notifications"
        }
        else if (labels.includes("CATEGORY_PRIMARY")) {
          category = "primary"
        }
        else {
          // Fallback pour les emails sans catégorie Gmail
          const senderEmailLower = senderEmail.toLowerCase()
          
          // Exclure les emails envoyés par l'utilisateur lui-même
          const userEmail = session.user?.email?.toLowerCase()
          if (userEmail && senderEmailLower === userEmail) {
            category = "notifications"
          }
          // Détection basique pour les emails non catégorisés
          else if (senderEmailLower.includes("noreply") || senderEmailLower.includes("no-reply") ||
                   senderEmailLower.includes("notification") || senderEmailLower.includes("support")) {
            category = "notifications"
          }
          else {
            category = "primary"
          }
        }
        
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