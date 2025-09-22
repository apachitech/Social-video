# A Prompt-Driven Guide to Taking Vidora to Production

This guide provides a step-by-step roadmap for transforming the Vidora prototype into a fully functional, production-ready application. Each step outlines a critical development goal and provides a specific prompt you can use with your AI engineering assistant to implement the necessary code changes.

---

### **Step 1: Activate the Backend & Database**

**Goal:** Transition the application from using temporary, in-browser mock data to a persistent, live database. This involves making the backend communicate with MongoDB via Prisma and making the frontend communicate with the backend via API calls.

#### **Part A: Connect the Backend to the Database**

**Your Prompt:**
```
Refactor all controller files in `backend/src/controllers/` to use a shared Prisma Client instance for all database operations instead of importing from `backend/src/data.ts`. Ensure all controller functions that interact with the database are `async` and include `try...catch` blocks for robust error handling. The data models should match the Prisma schema.
```

#### **Part B: Connect the Frontend to the Backend**

**Your Prompt:**
```
Refactor the `App.tsx` component to manage its core state (users, videos, conversations, etc.) by fetching data from the live backend API instead of using the mock API from `services/mockApi.ts`. Use `useEffect` hooks for data fetching on initial load. The API base URL should be read from the environment variable `import.meta.env.VITE_API_BASE_URL`. Implement loading and error states to improve the user experience during API calls.
```

---

### **Step 2: Implement Secure Authentication**

**Goal:** Replace the mock login with a secure, token-based authentication system using JWT (JSON Web Tokens) and password hashing.

#### **Part A: Secure the Backend Authentication Flow**

**Your Prompt:**
```
In `backend/src/controllers/auth.controller.ts`, implement secure user registration and login. For registration, use `bcryptjs` to hash the user's password before saving it to the database with Prisma. For login, compare the provided password with the stored hash. On successful authentication, generate a JWT signed with the `JWT_SECRET` that includes the user's ID in the payload.
```

#### **Part B: Implement Backend Route Protection**

**Your Prompt:**
```
Create an authentication middleware in the backend that verifies the JWT from the `Authorization` header. Apply this middleware to all private API routes in `backend/src/routes/` to protect them from unauthorized access. The decoded user information from the token should be attached to the request object for use in the controllers.
```

#### **Part C: Implement Frontend Token Management**

**Your Prompt:**
```
In the frontend, update the `handleLogin` function in `App.tsx` to store the received JWT in `localStorage`. Create a utility function to include this token in the `Authorization: 'Bearer <token>'` header of all subsequent API requests. Update `handleLogout` to clear the token from `localStorage`.
```

---

### **Step 3: Integrate Scalable File Storage**

**Goal:** Store user-uploaded files (videos, avatars) in a dedicated cloud storage service like Cloudinary or AWS S3 instead of trying to handle them on the ephemeral backend server.

**Your Prompt (using Cloudinary as the example):**
```
Implement file uploading using Cloudinary. In the backend, create a new controller to generate a secure signature for direct frontend uploads. In the frontend's `UploadView.tsx` and `EditProfileModal.tsx`, when a user selects a file, make a request to the backend for the signature, then upload the file directly to Cloudinary using the received signature. Store the returned Cloudinary URL in the database, not the file itself.
```

---

### **Step 4: Secure the Live Streaming Service**

**Goal:** Ensure that only authenticated users can start or join live streams by having the backend issue secure tokens for LiveKit.

**Your Prompt:**
```
Implement a secure LiveKit token generation system. Create a new endpoint in the backend (e.g., `/api/v1/live/token`) that uses the LiveKit Server SDK to generate a short-lived join token for an authenticated user. In the frontend, before a user attempts to join or start a stream in `LiveView.tsx` or `BroadcasterView.tsx`, they must first fetch this token from the backend and use it to connect to the LiveKit server.
```

---

### **Step 5: Implement Real Payment Processing**

**Goal:** Replace the simulated coin purchase and payout system with a real payment gateway like Stripe to handle transactions securely.

#### **Part A: Coin Purchases**

**Your Prompt:**
```
Integrate Stripe for coin purchases. In the backend, create an endpoint to generate a Stripe `PaymentIntent` and return its `client_secret`. In the frontend's `PurchaseCoinsView.tsx`, use Stripe.js and the `client_secret` to securely collect payment details and confirm the purchase.
```

#### **Part B: Secure Order Fulfillment**

**Your Prompt:**
```
Create a secure webhook endpoint in the backend to listen for the `payment_intent.succeeded` event from Stripe. Upon receiving a valid event, verify its signature using the Stripe webhook secret, and only then update the user's coin balance in the database. This ensures coins are only granted for successful payments.
```

#### **Part C: Creator Payouts**

**Your Prompt:**
```
To handle creator payouts, integrate a service like Stripe Connect. Create backend endpoints to onboard creators, allowing them to connect their bank accounts securely. Update the Admin Panel's `FinancialsView` so that approving a payout triggers a backend API call that initiates a Stripe transfer to the creator's connected account.
```
