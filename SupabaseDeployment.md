# Deployment Guide: The "All-in-One" Supabase Stack

This guide provides a step-by-step process for deploying the Vidora application using a modern, simplified, and powerful stack centered around Supabase. This approach consolidates the backend, database, and file storage into a single platform, dramatically speeding up development and simplifying infrastructure management.

### The Supabase Stack

*   **Frontend:** **Vercel** – For fast, seamless deployments from GitHub.
*   **Backend Logic:** **Supabase Edge Functions** – For serverless, Deno-based backend code.
*   **Database:** **Supabase (PostgreSQL)** – A full-featured, managed Postgres database.
*   **File Storage:** **Supabase Storage** – For handling all video and image uploads.

---

## Step 1: Set Up Your Supabase Project

This single step provisions your database, storage, authentication, and serverless function environment.

1.  **Create an Account:** Sign up for free accounts on [GitHub](https://github.com/), [Supabase](https://supabase.com/), and [Vercel](https://vercel.com/).
2.  **Create a New Supabase Project:**
    *   Log in to your Supabase dashboard and click **"New project"**.
    *   Give your project a name and generate a secure database password. **Save this password**.
    *   Choose a region close to your users and select the free plan.
3.  **Get Your API Keys:**
    *   Once the project is created, navigate to **Project Settings** (the gear icon) > **API**.
    *   You will find your **Project URL** and your `anon` **public key**.
    *   Keep these two values safe. You will need them for your frontend's environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

4.  **Create the Database Schema:**
    *   Navigate to the **Table Editor** in the Supabase dashboard.
    *   Supabase uses PostgreSQL. You can use the graphical interface to create tables or run SQL queries directly. Go to **SQL Editor** > **New query** and run the following SQL to create the initial tables based on the application's types.

    ```sql
    -- Users Table
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user' NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Videos Table
    CREATE TABLE videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        likes INT DEFAULT 0,
        views INT DEFAULT 0,
        status TEXT DEFAULT 'approved' NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT now()
    );

    -- Comments Table
    CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ```

5.  **Create a Storage Bucket:**
    *   Navigate to **Storage** in the Supabase dashboard.
    *   Click **"New bucket"**. Name it `media` (or your preference).
    *   **Crucially, make this a public bucket** by toggling the "Public bucket" option. This allows users to view the videos and images you store here.

## Step 2: Refactor Backend to Supabase Edge Functions

Instead of a monolithic Express server, your backend logic will be a collection of serverless functions.

1.  **Install the Supabase CLI:** Follow the [official guide](https://supabase.com/docs/guides/cli) to install the CLI on your machine.
2.  **Initialize Supabase in Your Project:**
    *   In your project's root directory, run `supabase login`.
    *   Link your project by running `supabase link --project-ref [YOUR_PROJECT_ID]` (find your project ID in the Supabase dashboard URL).
    *   Pull down the schema changes you made in the UI: `supabase db pull`.
3.  **Create an Edge Function:**
    *   Create your first function: `supabase functions new get-feed`.
    *   This creates a folder at `supabase/functions/get-feed/index.ts`.
4.  **Convert Express Logic to a Function:** Open `index.ts` and replace its contents. This function replicates the logic for fetching the video feed.

    ```typescript
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
    ```

5.  **Deploy the Function:** `supabase functions deploy get-feed`. Repeat this process for all other backend API routes.

## Step 3: Refactor the Frontend to use the Supabase Client

1.  **Install the Supabase JS Library:**
    ```bash
    npm install @supabase/supabase-js
    ```
2.  **Create a Supabase Client:** It's best to create a single, shared client instance. Create a file `src/services/supabase.ts`:
    ```typescript
    // src/services/supabase.ts
    import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    ```

3.  **Refactor API Calls:** In `App.tsx`, replace `fetch` calls with the Supabase client.

    **Example: Fetching the Video Feed**
    ```typescript
    // BEFORE (in App.tsx)
    useEffect(() => {
      const fetchVideos = async () => {
        const response = await fetch(`${API_URL}/videos/feed`);
        // ...
      };
      fetchVideos();
    }, []);

    // AFTER (in App.tsx)
    import { supabase } from './services/supabase';

    useEffect(() => {
      const fetchVideos = async () => {
        const { data: videos, error } = await supabase
          .from('videos')
          .select('*, user:users(username, avatar_url)'); // Specify columns for performance
        
        if (error) {
          console.error('Error fetching videos:', error);
        } else {
          // You may need to adapt the data structure slightly
          setVideos(videos);
        }
      };
      fetchVideos();
    }, []);
    ```

4.  **Refactor File Uploads:** Update the `handleUpload` function to use Supabase Storage.
    ```typescript
    // Example updated handleUpload in App.tsx
    import { supabase } from './services/supabase';

    const handleUpload = async (source, description) => {
        if (!currentUser) return;
        if (source.type === 'file') {
            const file = source.data;
            const fileName = `${currentUser.id}/${Date.now()}`;
            
            // 1. Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('media') // The name of your bucket
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading video:', uploadError);
              return;
            }

            // 2. Get the public URL of the uploaded file
            const { data } = supabase.storage
              .from('media')
              .getPublicUrl(fileName);
            
            const publicUrl = data.publicUrl;

            // 3. Save the video metadata to your database
            const { error: dbError } = await supabase
              .from('videos')
              .insert({
                user_id: currentUser.id,
                description,
                video_url: publicUrl,
                thumbnail_url: '...' // Generate this in a real app
              });
            
            if (dbError) console.error('Error saving video to DB:', dbError);
        }
    };
    ```

## Step 4: Deploy the Frontend to Vercel

1.  Push all your code changes to your GitHub repository.
2.  Log in to Vercel and click **"Add New... -> Project"**.
3.  Import your Vidora GitHub repository. Vercel will auto-detect the Vite settings.
4.  Expand the **"Environment Variables"** section and add your Supabase keys:
    *   **Name:** `VITE_SUPABASE_URL`, **Value:** (Your Project URL from Step 1)
    *   **Name:** `VITE_SUPABASE_ANON_KEY`, **Value:** (Your `anon` public key from Step 1)
5.  Click **"Deploy"**.

---

### You're Live!

Your application is now running on a fully serverless, scalable, and integrated stack. By consolidating your services with Supabase, you've simplified your architecture, which makes it easier to maintain, secure, and build upon.