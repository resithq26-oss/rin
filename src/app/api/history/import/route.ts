import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const items = await req.json()
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: 'no data' }, { status: 400 })
  }

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < items.length; i += BATCH) {
    const { error } = await admin
      .from('purchase_history')
      .upsert(items.slice(i, i + BATCH), { onConflict: 'id' })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    inserted += Math.min(BATCH, items.length - i)
  }

  return NextResponse.json({ ok: true, inserted })
}
