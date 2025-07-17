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
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50&labelIds=INBOX`,
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
        
        const subjectLower = subject.toLowerCase()
        const senderEmailLower = senderEmail.toLowerCase()
        
        // Exclure les emails envoyés par l'utilisateur lui-même de la catégorie principale
        const userEmail = session.user?.email?.toLowerCase()
        if (userEmail && senderEmailLower === userEmail) {
          category = "notifications"
        }
        // Entreprises légitimes qui doivent rester en "primary"
        else if (senderEmailLower.includes("anthropic") || senderEmailLower.includes("claude") ||
                 senderEmailLower.includes("mcdonalds") || senderEmailLower.includes("mcdonald") ||
                 senderEmailLower.includes("microsoft") || senderEmailLower.includes("apple") ||
                 senderEmailLower.includes("google") || senderEmailLower.includes("amazon") ||
                 senderEmailLower.includes("netflix") || senderEmailLower.includes("spotify") ||
                 senderEmailLower.includes("paypal") || senderEmailLower.includes("stripe") ||
                 senderEmailLower.includes("github") || senderEmailLower.includes("gitlab") ||
                 senderEmailLower.includes("stackoverflow") || senderEmailLower.includes("reddit") ||
                 senderEmailLower.includes("discord") || senderEmailLower.includes("slack") ||
                 senderEmailLower.includes("notion") || senderEmailLower.includes("figma") ||
                 senderEmailLower.includes("adobe") || senderEmailLower.includes("canva") ||
                 senderEmailLower.includes("dropbox") || senderEmailLower.includes("onedrive") ||
                 senderEmailLower.includes("zoom") || senderEmailLower.includes("teams") ||
                 senderEmailLower.includes("trello") || senderEmailLower.includes("asana") ||
                 senderEmailLower.includes("banking") || senderEmailLower.includes("bank") ||
                 senderEmailLower.includes("universit") || senderEmailLower.includes("school") ||
                 senderEmailLower.includes("education") || senderEmailLower.includes(".edu") ||
                 senderEmailLower.includes(".gov") || senderEmailLower.includes(".org")) {
          category = "primary"
        }
        // Réseaux sociaux
        else if (senderEmailLower.includes("linkedin") || senderEmailLower.includes("facebook") || 
                 senderEmailLower.includes("twitter") || senderEmailLower.includes("instagram") ||
                 senderEmailLower.includes("tiktok") || senderEmailLower.includes("youtube") ||
                 senderEmailLower.includes("snapchat") || senderEmailLower.includes("pinterest")) {
          category = "social"
        }
        // Promotions - Très large pour capturer toutes les promotions
        else if (subjectLower.includes("promo") || subjectLower.includes("offer") || 
                 subjectLower.includes("deal") || subjectLower.includes("sale") ||
                 subjectLower.includes("discount") || subjectLower.includes("% off") ||
                 subjectLower.includes("offre") || subjectLower.includes("réduction") ||
                 subjectLower.includes("solde") || subjectLower.includes("gratuit") ||
                 subjectLower.includes("free") || subjectLower.includes("limited time") ||
                 subjectLower.includes("special") || subjectLower.includes("exclusive") ||
                 subjectLower.includes("save") || subjectLower.includes("économis") ||
                 subjectLower.includes("black friday") || subjectLower.includes("cyber monday") ||
                 subjectLower.includes("flash sale") || subjectLower.includes("clearance") ||
                 senderEmailLower.includes("marketing") || senderEmailLower.includes("promo") ||
                 senderEmailLower.includes("deals") || senderEmailLower.includes("offers") ||
                 senderEmailLower.includes("shop") || senderEmailLower.includes("store") ||
                 senderEmailLower.includes("ecommerce") || senderEmailLower.includes("unsubscribe") ||
                 senderEmailLower.includes("campaign")) {
          category = "promotions"
        }
        // Notifications automatiques
        else if (senderEmailLower.includes("noreply") || senderEmailLower.includes("no-reply") ||
                 senderEmailLower.includes("notification") || senderEmailLower.includes("alert") ||
                 senderEmailLower.includes("automated") || senderEmailLower.includes("system") ||
                 senderEmailLower.includes("donotreply") || senderEmailLower.includes("do-not-reply") ||
                 senderEmailLower.includes("support") || senderEmailLower.includes("help") ||
                 senderEmailLower.includes("service") || senderEmailLower.includes("info@") ||
                 senderEmailLower.includes("contact@") || senderEmailLower.includes("admin@")) {
          category = "notifications"
        }
        // Mises à jour et newsletters
        else if (subjectLower.includes("newsletter") || subjectLower.includes("update") ||
                 subjectLower.includes("digest") || subjectLower.includes("weekly") ||
                 subjectLower.includes("monthly") || subjectLower.includes("daily") ||
                 subjectLower.includes("bulletin") || subjectLower.includes("news") ||
                 subjectLower.includes("recap") || subjectLower.includes("summary") ||
                 subjectLower.includes("roundup") || subjectLower.includes("highlights")) {
          category = "updates"
        }
        // Sinon, reste en "primary" - seulement pour les vrais messages personnels et professionnels
        
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