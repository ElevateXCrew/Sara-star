import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'

async function checkAdmin(request: NextRequest) {
  try { return await verifyAdminAuth(request) } catch { return null }
}

export async function GET(request: NextRequest) {
  const admin = await checkAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await db.plan.findMany({ orderBy: { price: 'asc' } })
  return NextResponse.json({
    success: true,
    plans: plans.map(p => ({ ...p, features: JSON.parse(p.features) }))
  })
}

export async function POST(request: NextRequest) {
  const admin = await checkAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, price, currency, duration, features, isActive, discountPercent } = body

  if (!name || price === undefined || !duration) {
    return NextResponse.json({ error: 'name, price, duration required' }, { status: 400 })
  }

  const plan = await db.plan.create({
    data: {
      name,
      price: parseFloat(price),
      currency: currency || 'USD',
      duration,
      features: JSON.stringify(Array.isArray(features) ? features : []),
      isActive: isActive !== false,
      discountPercent: parseFloat(discountPercent || 0),
    }
  })

  return NextResponse.json({ success: true, plan: { ...plan, features: JSON.parse(plan.features) } })
}

export async function PATCH(request: NextRequest) {
  const admin = await checkAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const body = await request.json()
  const { name, price, currency, duration, features, isActive, discountPercent } = body

  const data: any = {}
  if (name !== undefined) data.name = name
  if (price !== undefined) data.price = parseFloat(price)
  if (currency !== undefined) data.currency = currency
  if (duration !== undefined) data.duration = duration
  if (features !== undefined) data.features = JSON.stringify(Array.isArray(features) ? features : [])
  if (isActive !== undefined) data.isActive = isActive
  if (discountPercent !== undefined) data.discountPercent = parseFloat(discountPercent)

  const plan = await db.plan.update({ where: { id }, data })
  return NextResponse.json({ success: true, plan: { ...plan, features: JSON.parse(plan.features) } })
}

export async function DELETE(request: NextRequest) {
  const admin = await checkAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.plan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
