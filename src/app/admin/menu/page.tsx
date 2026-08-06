'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Plus, Trash2, Search, ChevronDown, ChevronRight, FolderPlus, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminMenuPage() {
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [catSaving, setCatSaving] = useState(false);
  
  // To track which categories are expanded (open)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // New Food Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    image: '',
    isPopular: false
  });

  // Edit Food Item State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '', description: '', price: '', discountPrice: '', categoryId: '', image: '', isPopular: false
  });
  const [editSaving, setEditSaving] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');

  const fetchData = async () => {
    try {
      const [fSnap, cSnap] = await Promise.all([
        getDocs(collection(db, 'foods')),
        getDocs(collection(db, 'categories'))
      ]);
      setFoods(fSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'foods', id));
      setFoods(foods.filter(f => f.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    }
  };

  const [isRemoveCatOpen, setIsRemoveCatOpen] = useState(false);
  const [catToRemove, setCatToRemove] = useState('');

  const handleDeleteCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catToRemove) return;
    
    const cat = categories.find(c => c.id === catToRemove);
    if (!cat) return;

    if (!confirm(`Are you sure you want to delete the category "${cat.name}"? Items inside it will not be deleted but will lose their category grouping.`)) return;
    
    try {
      await deleteDoc(doc(db, 'categories', catToRemove));
      setCategories(categories.filter(c => c.id !== catToRemove));
      toast.success('Category deleted successfully');
      setIsRemoveCatOpen(false);
      setCatToRemove('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete category');
    }
  };

  const openAddDialogWithCategory = (categoryId: string) => {
    setFormData({ name: '', description: '', price: '', discountPrice: '', categoryId, image: '', isPopular: false });
    setIsAddOpen(true);
    // Auto expand the category if it was collapsed so they can see the new item
    if (!expandedCats[categoryId]) {
      toggleCategory(categoryId);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedPrice = parseFloat(formData.price);
      const parsedDiscount = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
      
      const newFood: any = {
        name: formData.name,
        description: formData.description,
        price: parsedPrice,
        categoryId: formData.categoryId,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        isPopular: formData.isPopular,
        rating: 5.0,
        reviews: 0
      };
      
      if (parsedDiscount && !isNaN(parsedDiscount)) {
        newFood.discountPrice = parsedDiscount;
      }
      
      const docRef = await addDoc(collection(db, 'foods'), newFood);
      setFoods([...foods, { id: docRef.id, ...newFood }]);
      toast.success('Item added successfully');
      setIsAddOpen(false);
      setFormData({ name: '', description: '', price: '', discountPrice: '', categoryId: '', image: '', isPopular: false });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatSaving(true);
    try {
      const newCat = { name: newCatName.trim() };
      const docRef = await addDoc(collection(db, 'categories'), newCat);
      setCategories([...categories, { id: docRef.id, ...newCat }]);
      toast.success('New category added!');
      setIsCatOpen(false);
      setNewCatName('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add category');
    } finally {
      setCatSaving(false);
    }
  };

  const openEditDialog = (food: any) => {
    setEditingFood(food);
    setEditFormData({
      name: food.name || '',
      description: food.description || '',
      price: food.price?.toString() || '',
      discountPrice: food.discountPrice?.toString() || '',
      categoryId: food.categoryId || '',
      image: food.image || '',
      isPopular: food.isPopular || false
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;
    setEditSaving(true);
    try {
      const parsedPrice = parseFloat(editFormData.price);
      const parsedDiscount = editFormData.discountPrice ? parseFloat(editFormData.discountPrice) : null;
      
      const updatedData: any = {
        name: editFormData.name,
        description: editFormData.description,
        price: parsedPrice,
        categoryId: editFormData.categoryId,
        image: editFormData.image,
        isPopular: editFormData.isPopular
      };
      
      if (parsedDiscount && !isNaN(parsedDiscount)) {
        updatedData.discountPrice = parsedDiscount;
      } else {
        updatedData.discountPrice = null;
      }
      
      await updateDoc(doc(db, 'foods', editingFood.id), updatedData);
      setFoods(foods.map(f => f.id === editingFood.id ? { ...f, ...updatedData } : f));
      toast.success('Item updated successfully');
      setIsEditOpen(false);
      setEditingFood(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update item');
    } finally {
      setEditSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCats(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const filteredFoods = foods.filter(f => 
    f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove items category-wise.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search menu items..." 
              className="pl-9 bg-card rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Add Category Dialog */}
          <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
            <DialogTrigger render={<Button className="rounded-full shadow-sm shrink-0 flex items-center justify-center gap-2 px-5" />}>
              <FolderPlus className="h-4 w-4" />
              <span className="hidden md:inline">New Category</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="mb-2">
                <DialogTitle>Add New Category</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1.5">Create a new category to group your menu items (e.g. Pizzas, Desserts).</p>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Category Name</Label>
                  <Input required value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Italian Pizzas" className="h-11 bg-muted/30" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-full text-base font-medium mt-2" disabled={catSaving}>
                  {catSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FolderPlus className="h-5 w-5 mr-2" />}
                  {catSaving ? 'Creating...' : 'Create Category'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Remove Category Dialog */}
          <Dialog open={isRemoveCatOpen} onOpenChange={setIsRemoveCatOpen}>
            <DialogTrigger render={<Button variant="outline" className="rounded-full shadow-sm shrink-0 flex items-center justify-center gap-2 px-5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" />}>
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Remove Category</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="mb-2">
                <DialogTitle className="text-destructive">Remove Category</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1.5">Select a category to permanently remove it.</p>
              </DialogHeader>
              <form onSubmit={handleDeleteCategory} className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Category Name</Label>
                  <select 
                    required
                    className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={catToRemove} 
                    onChange={e => setCatToRemove(e.target.value)}
                  >
                    <option value="">Select category to remove...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="destructive" className="w-full h-11 rounded-full text-base font-medium mt-2" disabled={!catToRemove}>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete Category
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Item Dialog (Controlled, no trigger) */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader className="mb-2">
                <DialogTitle>Add New Menu Item</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1.5">Fill in the details below to add a new dish or drink to your menu.</p>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Item Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Double Cheese Burger" className="bg-muted/30 h-11" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe the item ingredients..." className="bg-muted/30 h-11" />
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold">Price ($)</Label>
                    <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="bg-muted/30 h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold">Sale Price ($)</Label>
                    <Input type="number" step="0.01" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} placeholder="Optional" className="bg-muted/30 h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold">Category</Label>
                    <select 
                      required
                      className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={formData.categoryId} 
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Image URL (Optional)</Label>
                  <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="bg-muted/30 h-11" />
                  <p className="text-xs text-muted-foreground">Provide a direct link to a high-quality image of the item.</p>
                </div>
                <Button type="submit" className="w-full h-11 rounded-full text-base font-medium mt-4" disabled={saving}>
                  {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {saving ? 'Adding Item...' : 'Add Item to Menu'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Item Dialog (Controlled, no trigger) */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader className="mb-2">
                <DialogTitle>Edit Menu Item</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1.5">Update the details below to modify this menu item.</p>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Item Name</Label>
                  <Input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} placeholder="e.g. Double Cheese Burger" className="bg-muted/30 h-11" />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Input required value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} placeholder="Briefly describe the item ingredients..." className="bg-muted/30 h-11" />
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold">Price ($)</Label>
                    <Input type="number" step="0.01" required value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} placeholder="0.00" className="bg-muted/30 h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold">Sale Price ($)</Label>
                    <Input type="number" step="0.01" value={editFormData.discountPrice} onChange={e => setEditFormData({...editFormData, discountPrice: e.target.value})} placeholder="Optional" className="bg-muted/30 h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold">Category</Label>
                    <select
                      required
                      className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={editFormData.categoryId}
                      onChange={e => setEditFormData({...editFormData, categoryId: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Image URL (Optional)</Label>
                  <Input value={editFormData.image} onChange={e => setEditFormData({...editFormData, image: e.target.value})} placeholder="https://..." className="bg-muted/30 h-11" />
                  <p className="text-xs text-muted-foreground">Provide a direct link to a high-quality image of the item.</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
                  <input
                    type="checkbox"
                    id="edit-isPopular"
                    checked={editFormData.isPopular}
                    onChange={e => setEditFormData({...editFormData, isPopular: e.target.checked})}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <Label htmlFor="edit-isPopular" className="text-sm font-semibold cursor-pointer">
                    🔥 Mark as Popular (appears on homepage)
                  </Label>
                </div>
                <Button type="submit" className="w-full h-11 rounded-full text-base font-medium mt-4" disabled={editSaving}>
                  {editSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(category => {
          const categoryFoods = filteredFoods.filter(f => f.categoryId === category.id);
          const isExpanded = expandedCats[category.id];
          
          if (searchQuery && categoryFoods.length === 0) return null;

          // Always auto-expand if searching so users can see results
          const shouldShowContent = isExpanded || (searchQuery && categoryFoods.length > 0);

          return (
            <div key={category.id} className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden transition-all duration-300">
              {/* Category Accordion Header */}
              <div 
                className={`flex items-center justify-between p-6 cursor-pointer hover:bg-muted/30 transition-colors ${shouldShowContent ? 'border-b border-border/50' : ''}`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {!shouldShowContent ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {category.name}
                    <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
                      {categoryFoods.length} items
                    </span>
                  </h2>
                </div>
                  <Button 
                    size="sm"
                    className="rounded-full shadow-sm shrink-0 flex items-center justify-center gap-1.5 px-4 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddDialogWithCategory(category.id);
                    }}
                  >
                    <Plus className="h-4 w-4" /> 
                    <span className="hidden md:inline">Add Item</span>
                  </Button>
              </div>
              
              {/* Category Content */}
              {shouldShowContent && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  {categoryFoods.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/10">
                      <p className="font-medium">No items in {category.name} yet.</p>
                      <p className="text-sm mt-1">Click the button above to add your first item.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-xs border-b border-border/50">
                          <tr>
                            <th className="px-6 py-4">Item Details</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {categoryFoods.map((food) => {
                            return (
                              <tr key={food.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden shrink-0 shadow-sm">
                                      <img src={food.image || (food.images && food.images[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'} alt={food.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-base text-foreground">
                                        {food.name}
                                        {food.isPopular && <span className="ml-2 text-sm">🔥</span>}
                                      </p>
                                      <p className="text-xs text-muted-foreground max-w-[250px] line-clamp-2 mt-0.5">{food.description}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-base">
                                  ${food.price?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full" onClick={() => openEditDialog(food)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full" onClick={() => handleDelete(food.id)}>
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
