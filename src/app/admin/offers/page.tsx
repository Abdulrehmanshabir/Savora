'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { Loader2, Plus, Trash2, Search, Tag, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: '',
    code: '',
    imageUrl: '',
    isActive: true
  });

  const fetchData = async () => {
    try {
      const snap = await getDocs(collection(db, 'offers'));
      setOffers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await deleteDoc(doc(db, 'offers', id));
      setOffers(offers.filter(o => o.id !== id));
      toast.success('Offer deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete offer');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newOffer = {
        title: formData.title,
        description: formData.description,
        discountPercent: parseInt(formData.discountPercent) || 0,
        code: formData.code.toUpperCase() || 'SAVORA',
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
        isActive: formData.isActive,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      };
      
      const docRef = await addDoc(collection(db, 'offers'), newOffer);
      setOffers([...offers, { id: docRef.id, ...newOffer }]);
      toast.success('Offer added successfully');
      setIsAddOpen(false);
      setFormData({ title: '', description: '', discountPercent: '', code: '', imageUrl: '', isActive: true });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add offer');
    } finally {
      setSaving(false);
    }
  };

  const filteredOffers = offers.filter(o => 
    o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage special offers and promotions.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="gap-2 rounded-xl h-11 px-6 shadow-md" size="lg">
              <Plus className="h-5 w-5" /> Add New Offer
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Offer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Offer Title</Label>
                <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. 20% Off Weekend Special" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short description of the offer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Discount %</Label>
                  <Input id="discountPercent" type="number" required min="0" max="100" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} placeholder="20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Promo Code</Label>
                  <Input id="code" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. SAVORA20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Offer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 max-w-sm mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search offers..." 
            className="pl-9 bg-muted/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl">
            <p className="text-muted-foreground">No offers found. Add your first offer!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="group relative bg-muted/20 border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-[2/1] relative bg-muted w-full overflow-hidden">
                  <img src={offer.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    {offer.discountPercent || 0}% OFF
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg leading-tight mb-1">{offer.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{offer.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                      <Tag className="h-3 w-3" /> {offer.code || 'SAVORA'}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(offer.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
