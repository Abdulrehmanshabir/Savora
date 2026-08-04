'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';

export default function AdminSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user) return;
    setSaving(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: avatarUrl,
      });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        avatarUrl,
      });

      // Refresh AuthContext so navbar avatar updates immediately
      await refreshUser();

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your admin profile settings and preferences.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full bg-muted border-4 border-background shadow-lg overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl text-primary font-bold">{name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="h-5 w-5" />
              </label>
              {/* Dummy input for clicking camera icon */}
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={() => {
                toast('Paste an image URL in the field below', { icon: '📸' });
              }} />
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h3 className="font-semibold text-lg">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">We recommend an image of at least 400x400px.</p>
              <div className="mt-4 space-y-2 text-left w-full">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input 
                  id="avatarUrl"
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  placeholder="https://example.com/my-photo.jpg" 
                  className="w-full bg-muted/50"
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border/50" />

          {/* General Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">General Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email || ''} 
                  disabled 
                  className="bg-muted/30 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Account Role</Label>
              <Input 
                id="role" 
                value={user.role?.toUpperCase()} 
                disabled 
                className="bg-muted/30 text-muted-foreground cursor-not-allowed font-semibold w-1/2"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving} className="rounded-full px-8 shadow-md">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
