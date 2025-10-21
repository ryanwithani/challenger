import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username || username.length < 3) {
      return NextResponse.json({ available: false, error: 'Invalid username' })
    }

    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('users')
      .select('username')
      .ilike('username', username.trim())
      .maybeSingle()

    return NextResponse.json({ 
      available: !data,
      taken: !!data 
    })
  } catch (error) {
    return NextResponse.json({ available: false, error: 'Check failed' })
  }
}