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
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des messages")
    }

    const data = await response.json()
    
    if (!data.messages) {
      return NextResponse.json({ messages: [] })
    }

    const detailedMessages = await Promise.all(
      data.messages.map(async (message) => {
        const messageResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )
        
        if (!messageResponse.ok) {
          return null
        }
        
        const messageData = await messageResponse.json()
        
        const headers = messageData.payload.headers
        const subject = headers.find(h => h.name === "Subject")?.value || "Sans sujet"
        const from = headers.find(h => h.name === "From")?.value || "Expéditeur inconnu"
        const date = headers.find(h => h.name === "Date")?.value || ""
        
        let body = ""
        if (messageData.payload.body?.data) {
          body = Buffer.from(messageData.payload.body.data, "base64").toString("utf-8")
        } else if (messageData.payload.parts) {
          const textPart = messageData.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf-8")
          }
        }
        
        return {
          id: message.id,
          subject,
          from,
          date,
          body: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
          snippet: messageData.snippet || ""
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