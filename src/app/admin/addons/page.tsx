'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Plus, Trash2, Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('single');
  const [savingCat, setSavingCat] = useState(false);

  // Edit Option State
  const [isAddOptionOpen, setIsAddOptionOpen] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState('');
  const [newOptName, setNewOptName] = useState('');
  const [newOptPrice, setNewOptPrice] = useState('');
  const [savingOpt, setSavingOpt] = useState(false);

  const fetchAddons = async () => {
    try {
      const snap = await getDocs(collection(db, 'addons'));
      setAddons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching addons:", error);
      toast.error("Failed to load addons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setSavingCat(true);
    try {
      const newDoc = {
        name: newCatName,
        type: newCatType,
        options: []
      };
      const docRef = await addDoc(collection(db, 'addons'), newDoc);
      setAddons([...addons, { id: docRef.id, ...newDoc }]);
      toast.success('Add-on category added');
      setIsAddCatOpen(false);
      setNewCatName('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this entire category and all its options?')) return;
    try {
      await deleteDoc(doc(db, 'addons', id));
      setAddons(addons.filter(a => a.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete category');
    }
  };

  const openAddOption = (addonId: string) => {
    setEditingAddonId(addonId);
    setNewOptName('');
    setNewOptPrice('');
    setIsAddOptionOpen(true);
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptName) return;
    
    setSavingOpt(true);
    try {
      const addon = addons.find(a => a.id === editingAddonId);
      if (!addon) return;

      const newOption = {
        id: newOptName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now(),
        name: newOptName,
        price: parseFloat(newOptPrice) || 0
      };

      const updatedOptions = [...(addon.options || []), newOption];

      await updateDoc(doc(db, 'addons', editingAddonId), {
        options: updatedOptions
      });

      setAddons(addons.map(a => a.id === editingAddonId ? { ...a, options: updatedOptions } : a));
      toast.success('Option added');
      setIsAddOptionOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add option');
    } finally {
      setSavingOpt(false);
    }
  };

  const handleDeleteOption = async (addonId: string, optionId: string) => {
    if (!confirm('Remove this option?')) return;
    try {
      const addon = addons.find(a => a.id === addonId);
      if (!addon) return;

      const updatedOptions = addon.options.filter((o: any) => o.id !== optionId);
      await updateDoc(doc(db, 'addons', addonId), { options: updatedOptions });
      
      setAddons(addons.map(a => a.id === addonId ? { ...a, options: updatedOptions } : a));
      toast.success('Option removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove option');
    }
  };

  const handleLoadDefaults = async () => {
    if (!confirm('This will load the default categories (Drinks, Fries, Extras). Proceed?')) return;
    try {
      const defaultCats = [
        {
          name: "Choose a Drink", type: "single", options: [
            { id: "pepsi", name: "Pepsi", price: 1.50 },
            { id: "coke", name: "Coca Cola", price: 1.50 },
            { id: "sprite", name: "Sprite", price: 1.50 },
            { id: "fanta", name: "Fanta", price: 1.50 }
          ]
        },
        {
          name: "Choose Fries", type: "single", options: [
            { id: "reg_fries", name: "Regular Fries", price: 2.50 },
            { id: "lrg_fries", name: "Large Fries", price: 3.50 },
            { id: "curly_fries", name: "Curly Fries", price: 4.00 }
          ]
        },
        {
          name: "Extra Toppings", type: "multiple", options: [
            { id: "cheese", name: "Extra Cheese", price: 1.00 },
            { id: "sauce", name: "Extra Sauce", price: 0.50 },
            { id: "jalapeno", name: "Jalapenos", price: 0.75 }
          ]
        }
      ];
      
      for (const cat of defaultCats) {
        await addDoc(collection(db, 'addons'), cat);
      }
      
      toast.success('Defaults loaded successfully!');
      fetchAddons(); // refresh the list
    } catch (error) {
      console.error(error);
      toast.error('Failed to load defaults');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add-ons Management</h1>
          <p className="text-muted-foreground mt-1">Manage global add-on categories and their options for food items.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={handleLoadDefaults} className="rounded-full shadow-sm font-semibold">
            Load Defaults
          </Button>
          <Button size="lg" onClick={() => setIsAddCatOpen(true)} className="rounded-full shadow-lg font-bold px-6">
            <Plus className="mr-2 h-5 w-5" /> Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map(addon => (
          <div key={addon.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{addon.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{addon.type} Selection</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(addon.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 flex-1 space-y-3">
              {addon.options && addon.options.length > 0 ? (
                addon.options.map((opt: any) => (
                  <div key={opt.id} className="flex justify-between items-center bg-background border border-border/50 p-2.5 rounded-lg shadow-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{opt.name}</span>
                      {opt.price > 0 && <span className="text-xs text-primary font-semibold">+${opt.price.toFixed(2)}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteOption(addon.id, opt.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
                  No options yet
                </div>
              )}
            </div>

            <div className="p-4 pt-0">
              <Button variant="outline" className="w-full rounded-xl border-dashed border-2 hover:bg-muted/50" onClick={() => openAddOption(addon.id)}>
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
            </div>
          </div>
        ))}
        {addons.length === 0 && (
          <div className="col-span-full text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-2">No Add-on Categories</h3>
            <p className="text-muted-foreground mb-6">Create a category like "Drinks" or "Fries" to get started.</p>
            <Button onClick={() => setIsAddCatOpen(true)} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Create First Category
            </Button>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-0 shadow-2xl bg-card">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-bold text-center">Add New Category</DialogTitle>
            <p className="text-muted-foreground text-center text-sm">Create a new add-on group for your items</p>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Category Name</Label>
              <Input 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Drinks, Sauces, Extras"
                className="h-12 rounded-xl bg-muted/30 focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Selection Type</Label>
              <div className="relative">
                <select 
                  className="appearance-none flex h-12 w-full items-center justify-between rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value)}
                >
                  <option value="single">Single Choice (Customer picks 1)</option>
                  <option value="multiple">Multiple Choice (Customer picks many)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base mt-2 shadow-md" disabled={savingCat}>
              {savingCat ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Category'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Option Dialog */}
      <Dialog open={isAddOptionOpen} onOpenChange={setIsAddOptionOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-0 shadow-2xl bg-card">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-bold text-center">Add New Option</DialogTitle>
            <p className="text-muted-foreground text-center text-sm">Add an item to this category</p>
          </DialogHeader>
          <form onSubmit={handleAddOption} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Option Name</Label>
              <Input 
                value={newOptName}
                onChange={e => setNewOptName(e.target.value)}
                placeholder="e.g. Pepsi, Extra Cheese"
                className="h-12 rounded-xl bg-muted/30 focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Extra Price ($)</Label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={newOptPrice}
                onChange={e => setNewOptPrice(e.target.value)}
                placeholder="0.00 (Leave 0 if free)"
                className="h-12 rounded-xl bg-muted/30 focus-visible:ring-primary/50"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base mt-2 shadow-md" disabled={savingOpt}>
              {savingOpt ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Add Option'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
