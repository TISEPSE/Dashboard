// FICHIER SUPPRIMÉ - Utiliser /api/google-fit/data à la place
import { NextResponse } from 'next/server'

export async function POST(request) {
  return NextResponse.json({ error: 'Route déplacée vers /api/google-fit/data' }, { status: 404 })
}