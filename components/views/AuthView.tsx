import React, { useState } from 'react';
import { supabase } from '@/services/supabase';
import { GoogleIcon } from '@/components/icons/Icons';

interface AuthViewProps {
  onLoginSuccess: () => void;
  siteName: string;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, siteName }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onLoginSuccess();
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // You might want to show a message to check email for confirmation
      alert('Check your email for the confirmation link!');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
    }
  };

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

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="w-full mt-10 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        )}
      </div>

      <div className="w-full mt-6 space-y-4">
        <button
          onClick={isLogin ? handleLogin : handleSignUp}
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
          onClick={handleGoogleLogin}
          className="w-full py-3 font-semibold rounded-lg bg-white text-black flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>

      <div className="mt-8">
        <button onClick={() => {
          setIsLogin(!isLogin);
          setError(null);
        }} className="text-gray-400 hover:text-white">
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </button>
      </div>
    </div>
  );
};

export default AuthView;