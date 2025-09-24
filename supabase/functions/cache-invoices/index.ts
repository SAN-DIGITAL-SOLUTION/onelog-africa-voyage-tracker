// Cache Redis pour requêtes factures - OneLog Africa

denofy
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { connect } from 'https://esm.sh/@upstash/redis@1.19.1'

// Configuration
const REDIS_URL = Deno.env.get('UPSTASH_REDIS_URL') || ''
const REDIS_TOKEN = Deno.env.get('UPSTASH_REDIS_TOKEN') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const CACHE_TTL = 600 // secondes (10 min)

// Clients
const redis = connect({
  url: REDIS_URL,
  token: REDIS_TOKEN,
})

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const clientId = url.searchParams.get('client_id')
    
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'client_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Vérifier le cache
    const cacheKey = `invoices:${clientId}:monthly`
    const cachedData = await redis.get(cacheKey)
    
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Récupérer les données fraîches
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .eq('billing_period', 'monthly')
      .order('created_at', { ascending: false })
      .limit(12)
    
    if (error) throw error
    
    // Mettre en cache
    await redis.setex(cacheKey, CACHE_TTL, data)
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
