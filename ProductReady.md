# Production Deployment Guide: Vidora on Vercel & Supabase

This guide provides a step-by-step roadmap for transforming the Vidora prototype from a mock-data application into a fully functional, production-ready application deployed on a modern, scalable stack.

### The Chosen Stack

*   **Frontend Hosting:** **Vercel** – For fast, seamless deployments from GitHub, a global CDN, and automatic SSL.
*   **Backend, Database & Storage:** **Supabase** – An all-in-one open-source platform that provides a PostgreSQL database, authentication, file storage, and serverless edge functions. This will replace the entire mock backend.

---

## Step 1: Set Up Your Supabase Project

This single step provisions your database, storage, authentication, and serverless function environment.

1.  **Create Free Accounts:**
    *   [GitHub](https://github.com/)
    *   [Supabase](https://supabase.com/)
    *   [Vercel](https://vercel.com/)

2.  **Create a New Supabase Project:**
    *   Log in to your Supabase dashboard and click **"New project"**.
    *   Give your project a name and generate a secure database password. **Save this password**.
    *   Choose a region close to your users and select the free plan.

3.  **Get Your API Keys:**
    *   Once the project is created, navigate to **Project Settings** (the gear icon) > **API**.
    *   You will find your **Project URL** and your `anon` **public key**.
    *   Keep these two values safe. You will need them for your frontend's environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

4.  **Create the Database Schema:**
    *   Navigate to the **Table Editor** in the Supabase dashboard. Supabase uses PostgreSQL.
    *   Go to **SQL Editor** > **New query** and run the following SQL to create the initial tables. This schema is based on your `types.ts` file.

    ```sql
    -- Users Table (Supabase Auth handles this, but we create a public profile table)
    CREATE TABLE profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT UNIQUE NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user' NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        streak_count INT DEFAULT 0
    );

    -- Videos Table
    CREATE TABLE videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        likes INT DEFAULT 0,
        views INT DEFAULT 0,
        shares INT DEFAULT 0,
        status TEXT DEFAULT 'approved' NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT now()
    );

    -- Comments Table
    CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Wallets & Transactions
    CREATE TABLE wallets (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        balance INT DEFAULT 0
    );

    CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_user_id UUID REFERENCES wallets(user_id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount INT NOT NULL,
        description TEXT,
        timestamp TIMESTAMPTZ DEFAULT now()
    );
    ```

5.  **Create a Storage Bucket:**
    *   Navigate to **Storage** in the Supabase dashboard.
    *   Click **"New bucket"**. Name it `media`.
    *   **Crucially, make this a public bucket** by toggling the "Public bucket" option. This allows users to view the videos and images you store here.

---

## Step 2: Refactor the Frontend to use the Supabase Client

Your Express backend is no longer needed; we will interact with Supabase directly from the frontend.

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

3.  **Refactor API Calls in `App.tsx`:** Replace `fetch` calls and mock data with the Supabase client.

    **Example: Fetching the Video Feed**
    ```typescript
    // BEFORE (in App.tsx)
    // setCurrentUser(mockUser);
    // setVideos(mockVideos);

    // AFTER (in App.tsx)
    import { supabase } from './services/supabase';

    useEffect(() => {
      const fetchData = async () => {
        // Fetch videos and their authors from the database
        const { data: videos, error } = await supabase
          .from('videos')
          .select('*, profile:profiles(username, avatar_url)') // This joins the profiles table
          .eq('status', 'approved')
          .order('upload_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching videos:', error);
        } else {
          // You may need to adapt the data structure slightly to match the 'profile' join
          setVideos(videos);
        }
      };
      fetchData();
    }, []);
    ```

4.  **Refactor File Uploads (`UploadView.tsx`):** Update the `handleUpload` function to use Supabase Storage.

    ```typescript
    // Example updated handleUpload logic
    import { supabase } from './services/supabase';

    const handleUpload = async (source: UploadSource, description: string) => {
        if (!currentUser) return; // You'll need to implement real auth first
        if (source.type === 'file') {
            const file = source.data;
            // Create a unique file name
            const fileName = `${currentUser.id}/${Date.now()}`;
            
            // 1. Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('media') // The name of your bucket from Step 1
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
                thumbnail_url: '...' // Generate this on the backend or frontend
              });
            
            if (dbError) console.error('Error saving video to DB:', dbError);
        }
        // Handle 'url' type similarly if needed
    };
    ```

5.  **Implement Real Authentication:** The current app uses mock login. You must switch to a real authentication provider. Supabase Auth is an excellent choice.
    *   In `AuthView.tsx`, replace `onLoginSuccess` with Supabase's `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOAuth()` for social logins.
    *   Your user state will now come from `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()`.

---

## Step 3: Deploy the Frontend to Vercel

1.  **Push Code to GitHub:** Make sure all your code changes are committed and pushed to your GitHub repository.

2.  **Create Vercel Project:**
    *   Log in to Vercel and click **"Add New... -> Project"**.
    *   Import your Vidora GitHub repository.
    *   Vercel will auto-detect that it's a Vite project. The default settings are typically correct.

3.  **Configure Environment Variables:**
    *   Expand the **"Environment Variables"** section.
    *   Add your Supabase keys:
        *   **Name:** `VITE_SUPABASE_URL`, **Value:** (Your Project URL from Supabase)
        *   **Name:** `VITE_SUPABASE_ANON_KEY`, **Value:** (Your `anon` public key from Supabase)

4.  **Deploy:** Click **"Deploy"**. Vercel will build and deploy your frontend to its global CDN.

---

### You're Live!

Your application is now running on a fully serverless, scalable, and integrated stack. By consolidating your services with Supabase, you've simplified your architecture, which makes it easier to maintain, secure, and build upon. The `backend` folder in your project is no longer needed for deployment.
