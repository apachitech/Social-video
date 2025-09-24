// supabase/functions/get-feed/index.ts

    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
    
    // Define CORS headers to allow requests from your frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Replace with your Vercel URL in production
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    Deno.serve(async (req) => {
      // Handle CORS preflight requests
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
      }

      try {
        // Create a Supabase client with the user's authorization
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Fetch videos and their authors from the database
        const { data: videos, error } = await supabase
          .from('videos')
          .select('*, user:users(*)') // This joins the users table
          .eq('status', 'approved')
          .order('upload_date', { ascending: false })

        if (error) throw error

        return new Response(JSON.stringify({ videos }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
    })