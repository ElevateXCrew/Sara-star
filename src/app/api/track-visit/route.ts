import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk/.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|windows phone|opera mini/.test(ua)) return 'mobile'
  return 'desktop'
}

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json().catch(() => ({ path: '/' }))
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = detectDevice(userAgent)

    let visitorId = request.cookies.get('visitor-id')?.value
    const isNew = !visitorId
    if (!visitorId) visitorId = crypto.randomUUID()

    await db.siteVisit.create({
      data: { visitorId, path: path || '/', deviceType }
    })

    const res = NextResponse.json({ success: true })
    if (isNew) {
      res.cookies.set('visitor-id', visitorId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
      })
    }
    return res
  } catch {
    return NextResponse.json({ success: false })
  }
}
