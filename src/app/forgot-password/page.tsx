'use client';

import { useState } from 'react';
import { auth } from '@/firebase/client';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, Loader2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      setSubmitted(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/20 relative overflow-hidden px-4 pt-28 pb-16">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 left-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-card/90 backdrop-blur-2xl border border-border/60 shadow-2xl rounded-3xl p-7 sm:p-9 transition-all">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4 shadow-md shadow-primary/10">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Forgot Password</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              {!submitted 
                ? "Enter your email and we'll send you a link to reset your password." 
                : "Check your email for the reset link!"}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleReset} className="space-y-4">
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
                onClick={() => router.push('/login')}
                className="w-full h-12 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35 cursor-pointer mt-2"
              >
                Back to Login
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Didn't receive the email?{' '}
                <button 
                  onClick={() => setSubmitted(false)}
                  className="font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
