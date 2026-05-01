import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q    = searchParams.get('q') ?? ''
  const year = searchParams.get('year') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 50
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  let query = admin
    .from('purchase_history')
    .select('*', { count: 'exact' })
    .order('order_date', { ascending: false })
    .range(from, to)

  if (q) query = query.ilike('product_name', `%${q}%`)
  if (year) {
    query = query
      .gte('order_date', `${year}-01-01`)
      .lt('order_date',  `${parseInt(year) + 1}-01-01`)
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data, count })
}
