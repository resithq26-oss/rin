import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await admin
    .from('purchase_history')
    .select('order_date, total_amount, quantity, product_name')
    .order('order_date', { ascending: true })
    .limit(10000)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ ok: true, data: null })

  // 年別集計
  const byYear: Record<string, { count: number; total: number }> = {}
  let totalSpend = 0
  let totalItems = 0

  for (const row of data) {
    const year = row.order_date.slice(0, 4)
    if (!byYear[year]) byYear[year] = { count: 0, total: 0 }
    byYear[year].count++
    byYear[year].total += row.total_amount ?? 0
    totalSpend += row.total_amount ?? 0
    totalItems++
  }

  return NextResponse.json({
    ok: true,
    data: {
      totalItems,
      totalSpend,
      firstDate: data[0].order_date,
      lastDate:  data[data.length - 1].order_date,
      byYear,
    },
  })
}
