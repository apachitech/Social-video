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
        username TEXT UNIQUE,
        avatar_url TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user' NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        level INT DEFAULT 1 NOT NULL,
        xp INT DEFAULT 0,
        streak_count INT DEFAULT 0
    );

    -- Videos Table
    CREATE TABLE videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        likes INT DEFAULT 0,
        shares INT DEFAULT 0,
        status TEXT DEFAULT 'approved' NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT now()
    );

    -- Comments Table
    CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Wallets & Transactions
    CREATE TABLE wallets (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        balance INT DEFAULT 0 NOT NULL
    );

    CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount INT NOT NULL,
        description TEXT,
        timestamp TIMESTAMPTZ DEFAULT now()
    );

    -- Reports Table
    CREATE TABLE reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
        content_id TEXT NOT NULL,
        content_type TEXT NOT NULL, -- 'video', 'user', or 'comment'
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'resolved', 'dismissed'
        timestamp TIMESTAMPTZ DEFAULT now()
    );

    -- Payout Requests Table
    CREATE TABLE payout_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        amount INT NOT NULL,
        method TEXT NOT NULL,
        payout_info TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
        request_date TIMESTAMPTZ DEFAULT now(),
        processed_date TIMESTAMPTZ
    );

    -- Gifts Table
    CREATE TABLE gifts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        price INT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT DEFAULT 'Classic' NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL
    );

    -- Followers (Join Table)
    CREATE TABLE followers (
        follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (follower_id, following_id)
    );

    -- Likes (Join Table)
    CREATE TABLE likes (
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (user_id, video_id)
    );

    -- Messages Table
    CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        text TEXT,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    ```

5.  **Create a Storage Bucket:**
    *   Navigate to **Storage** in the Supabase dashboard.
    *   Click **"New bucket"**. Name it `media`.
    *   **Crucially, make this a public bucket** by toggling the "Public bucket" option. This allows users to view the videos and images you store here.

---

## Step 1.5: Automate Profile Creation

To ensure every new user gets a corresponding entry in your public `profiles` table, you need to create a trigger in your database.

1.  Navigate to **Database** > **Triggers** in your Supabase dashboard.
2.  Click **"Create a new function"**.
3.  Use the following SQL to define a function that inserts a new profile whenever a new user signs up in `auth.users`.

```sql
-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a wallet for a new user
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Don't forget to create the triggers in the Supabase Dashboard's "Database" -> "Triggers" section.
```

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

---

## Step 4: Secure Your Database with Row Level Security (RLS)

**This is the most critical step for a production application.** By default, your tables are open to anyone with the public `anon` key. RLS adds a security layer to your database to ensure users can only access data they are permitted to.

Navigate to **SQL Editor** in your Supabase dashboard and run the following queries.

```sql
-- Helper function to get a user's role from their profile
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. ENABLE RLS FOR ALL TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR `profiles`
-- Anyone can view profiles.
CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT USING (true);
-- Users can update their own profile.
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Admins can do anything.
CREATE POLICY "Allow admin full access" ON profiles FOR ALL USING (get_my_role() = 'admin');

-- 3. POLICIES FOR `videos`
-- Anyone can view approved videos.
CREATE POLICY "Allow public read access to approved videos" ON videos FOR SELECT USING (status = 'approved');
-- Any logged-in user can create a video.
CREATE POLICY "Allow authenticated users to insert videos" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Users can update their own videos.
CREATE POLICY "Allow users to update their own videos" ON videos FOR UPDATE USING (auth.uid() = user_id);

-- 4. POLICIES FOR `comments`
-- Anyone can read comments.
CREATE POLICY "Allow public read access to comments" ON comments FOR SELECT USING (true);
-- Any logged-in user can create a comment.
CREATE POLICY "Allow authenticated users to insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Users can delete their own comments.
CREATE POLICY "Allow users to delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- 5. POLICIES FOR `wallets` & `transactions` (VERY IMPORTANT)
-- Users can only see their own wallet and transactions.
CREATE POLICY "Allow users to see their own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to see their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
-- No one can update their own balance directly. This should be handled by secure Edge Functions.

-- 6. POLICIES FOR `reports`
-- Any logged-in user can create a report.
CREATE POLICY "Allow authenticated users to create reports" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Admins and moderators can manage all reports.
CREATE POLICY "Allow admins and mods to manage reports" ON reports FOR ALL USING (get_my_role() IN ('admin', 'moderator'));

-- 7. POLICIES FOR `payout_requests`
-- Users can manage their own payout requests.
CREATE POLICY "Allow users to manage their own payout requests" ON payout_requests FOR ALL USING (auth.uid() = user_id);
-- Admins can manage all payout requests.
CREATE POLICY "Allow admins to manage all payout requests" ON payout_requests FOR ALL USING (get_my_role() = 'admin');
```
