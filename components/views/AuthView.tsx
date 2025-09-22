import React, { useState } from 'react';
// Fix: Correct import for Icons which is now created.
import { GoogleIcon } from '../icons/Icons';

interface AuthViewProps {
  onLoginSuccess: () => void;
  siteName: string;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, siteName }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-screen w-screen bg-zinc-900 text-white flex flex-col justify-center items-center p-6 max-w-md mx-auto">
      <div className="w-full text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
          {siteName.toUpperCase()}
        </h1>
        <p className="text-gray-400 mt-2">
          {isLogin ? 'Welcome back!' : 'Join the community.'}
        </p>
      </div>

      <div className="w-full mt-10 space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {!isLogin && (
            <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
        )}
      </div>

      <div className="w-full mt-6 space-y-4">
        <button
          onClick={onLoginSuccess}
          className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transform hover:scale-105 transition-transform"
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-zinc-700" />
          <span className="mx-4 text-gray-400">OR</span>
          <hr className="flex-grow border-zinc-700" />
        </div>

        <button
          onClick={onLoginSuccess}
          className="w-full py-3 font-semibold rounded-lg bg-white text-black flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>

      <div className="mt-8">
        <button onClick={() => setIsLogin(!isLogin)} className="text-gray-400 hover:text-white">
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </button>
      </div>
    </div>
  );
};

export default AuthView;