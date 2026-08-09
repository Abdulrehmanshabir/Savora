'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);

  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/';

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      setResetSubmitted(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('session', token, { expires: 1 });
      
      // Check role to redirect appropriately
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        toast.success('Welcome back, Admin!');
        router.push('/admin');
      } else {
        toast.success('Logged in successfully!');
        router.push(redirectTarget);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Logged in with Google!');
      router.push(redirectTarget);
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/20 relative overflow-hidden px-4 pt-28 pb-16">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-card/90 backdrop-blur-2xl border border-border/60 shadow-2xl rounded-3xl p-7 sm:p-9 transition-all">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4 shadow-md shadow-primary/10">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {isForgotPassword ? 'Forgot Password' : 'Welcome Back'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              {isForgotPassword 
                ? (resetSubmitted ? "Check your email for the reset link!" : "Enter your email and we'll send you a link to reset your password.")
                : "Sign in to manage orders, reservations & profile"}
            </p>
          </div>

          {/* Dynamic Form Content */}
          {isForgotPassword ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {!resetSubmitted ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="reset-email" className="text-xs font-bold text-foreground/80">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="reset-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-border/80 bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm shadow-xs"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35 active:scale-[0.99] cursor-pointer mt-4" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending Link...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Send Reset Link</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <Button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(false); setResetSubmitted(false); }}
                    className="w-full h-12 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35 cursor-pointer mt-2"
                  >
                    Back to Login
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Didn't receive the email?{' '}
                    <button 
                      onClick={() => setResetSubmitted(false)}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              )}
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsForgotPassword(false)}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-bold text-foreground/80">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border/80 bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-foreground/80">
                  Password
                </Label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="relative z-20 text-xs font-semibold text-primary hover:underline cursor-pointer px-2 py-1 -mr-2 rounded-md hover:bg-primary/5 inline-block"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-border/80 bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35 active:scale-[0.99] cursor-pointer mt-2" 
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
              <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 rounded-xl font-semibold text-sm border-border/80 bg-background/80 hover:bg-muted/60 transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer" 
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </Button>
          </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center pt-5 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-bold transition-colors">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

