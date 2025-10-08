// Import required dependencies
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Twilio } from 'https://esm.sh/twilio@4.23.0'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Twilio client
const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilio = new Twilio(accountSid, authToken)

// Handle incoming HTTP requests
serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse the request body
    const formData = await req.formData()
    const body = Object.fromEntries(formData.entries())
    
    // Log the incoming message
    console.log('Received webhook:', body)
    
    // Verify the request comes from Twilio
    const twilioSignature = req.headers.get('x-twilio-signature')
    const url = new URL(req.url)
    const params = new URLSearchParams()
    
    // Rebuild the parameters for validation
    for (const [key, value] of formData.entries()) {
      params.append(key, value.toString())
    }
    
    const isFromTwilio = twilio.validateRequest(
      authToken,
      twilioSignature || '',
      `${url.protocol}//${url.host}${url.pathname}`,
      params
    )
    
    if (!isFromTwilio) {
      console.error('Invalid Twilio signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Process the message
    const { Body, From, To } = body
    
    // Log the message to the database
    const { data, error } = await supabase
      .from('notification_logs')
      .insert([
        {
          type: 'incoming_message',
          channel: 'whatsapp',
          status: 'received',
          recipient: To,
          sender: From,
          content: Body,
          metadata: { ...body }
        }
      ])
      .select()
    
    if (error) {
      console.error('Error logging message:', error)
      // Continue processing even if logging fails
    }
    
    // Prepare response
    const response = new Response(null, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
    
    // Simple auto-response for testing
    if (Body?.toString().toLowerCase().includes('hello')) {
      const twiml = new Twilio.twiml.MessagingResponse()
      twiml.message('Bonjour ! Merci pour votre message. Comment puis-je vous aider ?')
      response.body = twiml.toString()
    }
    
    return response
    
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
