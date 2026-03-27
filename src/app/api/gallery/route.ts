import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function getUserInfo(request: NextRequest): { userId: string } | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return { userId: decoded.userId }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const contentType = searchParams.get('contentType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    if (category && category !== 'all') where.category = category
    if (contentType) where.contentType = contentType
    const premiumParam = searchParams.get('premium')
    if (premiumParam === 'true') where.isPremium = true
    else where.isPremium = false

    const userInfo = getUserInfo(request)

    // Get user's active plan ID if logged in
    let userPlanId: string | null = null
    if (userInfo) {
      const activeSub = await db.subscription.findFirst({
        where: {
          userId: userInfo.userId,
          status: 'approved',
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }]
        },
        select: { planId: true },
        orderBy: { createdAt: 'desc' }
      })
      userPlanId = activeSub?.planId ?? null
    }

    const [items, total] = await Promise.all([
      db.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          thumbnailUrl: true,
          category: true,
          contentType: true,
          isPremium: true,
          allowedPlanIds: true,
          displayOrder: true,
          views: true,
          likes: true,
          createdAt: true
        }
      }),
      db.gallery.count({ where })
    ])

    const userId = userInfo?.userId ?? null
    let likedSet = new Set<string>()
    if (userId && items.length > 0) {
      const ids = items.map(i => i.id)
      const likedRows = await (db as any).galleryLike.findMany({
        where: { galleryId: { in: ids }, userId },
        select: { galleryId: true }
      })
      likedSet = new Set(likedRows.map((r: any) => r.galleryId))
    }

    // Filter by plan access: if allowedPlanIds is set, only show to matching plan users
    const filteredItems = items.filter(item => {
      if (!item.allowedPlanIds) return true // no restriction = show to all
      try {
        const allowed: string[] = JSON.parse(item.allowedPlanIds)
        if (allowed.length === 0) return true // empty array = show to all
        return userPlanId ? allowed.includes(userPlanId) : false
      } catch {
        return true
      }
    })

    const data = filteredItems.map(item => {
      const isBase64Video = item.contentType === 'video' && item.imageUrl?.startsWith('data:')
      return {
        ...item,
        allowedPlanIds: undefined, // don't expose to client
        imageUrl: isBase64Video ? `/api/gallery/stream/${item.id}` : item.imageUrl,
        thumbnailUrl: item.thumbnailUrl || null,
        liked: likedSet.has(item.id)
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: filteredItems.length, totalPages: Math.ceil(filteredItems.length / limit) }
    })
  } catch (error) {
    console.error('Gallery API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
