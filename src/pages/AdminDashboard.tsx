import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, Image as ImageIcon, 
  Settings as SettingsIcon, Package, Layout as LayoutIcon,
  Check, X, ExternalLink, LogOut, AlertTriangle, FileSpreadsheet,
  MessageCircle, MapPin, Search as SearchIcon, BarChart3, Phone, User, Filter, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { api } from '../services/api';

export default function AdminDashboard({ token }: { token: string }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'settings' | 'reports'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [managingReservation, setManagingReservation] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, type: 'product' | 'banner', name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value || '';
  
  const updateSetting = (key: string, value: string) => {
    const newSettings = settings.map(s => s.key === key ? { ...s, value } : s);
    if (!newSettings.find(s => s.key === key)) {
      newSettings.push({ key, value });
    }
    setSettings(newSettings);
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingReservation) return;

    try {
      await api.saveProduct(token, managingReservation);
      const updatedProducts = await api.getAdminProducts(token);
      setProducts(updatedProducts);
      setManagingReservation(null);
    } catch (error) {
      console.error("Error saving reservation:", error);
      alert("Erro ao salvar reserva.");
    }
  };

  const renderSettingInput = (key: string, label: string, isTextArea = false) => {
    const value = getSettingValue(key);
    
    if (key === 'store_logo') {
      return (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">{label}</label>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-[#f0f0f0] bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] border-2 border-stone-200 rounded-2xl overflow-hidden flex items-center justify-center relative group transition-all hover:border-brand-blue/50 shadow-inner">
              {value ? (
                <img src={value} className="w-full h-full object-contain p-2 drop-shadow-sm" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon size={32} className="text-stone-300" />
              )}
              <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                 <span className="text-white text-xs font-bold uppercase tracking-wider">Alterar</span>
              </div>
            </div>
            <div className="flex-1 space-y-4 pt-2">
              <label className="inline-flex items-center gap-2 bg-brand-black text-brand-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-blue hover:text-white cursor-pointer transition-all shadow-lg shadow-brand-black/10 hover:shadow-brand-blue/20 hover:-translate-y-0.5">
                <ImageIcon size={16} />
                Fazer Upload
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve) => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });
                    updateSetting(key, base64);
                  }} 
                />
              </label>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Recomendado: Imagem PNG com fundo transparente.<br/>
                Tamanho ideal: 500x500px.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">{label}</label>
        {isTextArea ? (
          <textarea
            rows={5}
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all resize-none text-sm font-medium text-[#333333] placeholder:text-stone-400"
            value={value}
            onChange={(e) => updateSetting(key, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm font-medium text-[#333333] placeholder:text-stone-400"
            value={value}
            onChange={(e) => updateSetting(key, e.target.value)}
          />
        )}
      </div>
    );
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, b, s] = await Promise.all([
        api.getAdminProducts(token),
        api.getAdminBanners(token),
        api.getAdminSettings(token)
      ]);
      setProducts(p);
      setBanners(b);
      setSettings(s);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem.category) {
      alert('Por favor, selecione uma categoria para o produto.');
      return;
    }

    const stock = parseInt(String(editingItem.stock_quantity || '0'), 10);
    if (stock < 1) {
      alert('A quantidade em estoque deve ser no mínimo 1.');
      return;
    }

    let productToSave = { ...editingItem };

    // Logic for "Sell 1 unit" behavior
    if (productToSave.id && productToSave.status === 'vendido') {
        const originalProduct = products.find(p => p.id === productToSave.id);
        
        // Only apply if it wasn't already sold (to avoid re-triggering on edits of sold items)
        if (originalProduct && originalProduct.status !== 'vendido') {
            const currentStock = parseInt(String(originalProduct.stock_quantity || '1'), 10);
            
            if (currentStock > 1) {
                // Case: Multiple items in stock. Sell 1, keep rest available.
                
                // 1. Create the "Sold" copy
                const soldCopy = {
                    ...productToSave,
                    id: null, // Ensure new ID creation
                    status: 'vendido',
                    stock_quantity: '1',
                    status_updated_at: new Date().toISOString(),
                    images: productToSave.images?.map((img: any) => 
                        typeof img === 'string' ? { image_data: img } : { image_data: img.image_data }
                    )
                };
                
                // Remove undefined values
                const sanitizedSoldCopy = Object.fromEntries(
                    Object.entries(soldCopy).filter(([_, v]) => v !== undefined)
                );
                
                await api.saveProduct(token, sanitizedSoldCopy);

                // 2. Update the current item to remain available with decremented stock
                productToSave.status = 'disponivel';
                productToSave.stock_quantity = (currentStock - 1).toString();
                delete productToSave.status_updated_at; 
            } else {
                // Case: Single item. Mark as sold, stock 0.
                productToSave.stock_quantity = '0';
            }
        }
    }

    const finalPayload = {
      ...productToSave,
      created_at: productToSave.created_at || new Date().toISOString(),
      images: productToSave.images?.map((img: any) => 
        typeof img === 'string' ? { image_data: img } : { image_data: img.image_data }
      )
    };

    // Remove undefined values to prevent Firebase update errors
    const sanitizedProduct = Object.fromEntries(
      Object.entries(finalPayload).filter(([_, v]) => v !== undefined)
    );

    await api.saveProduct(token, sanitizedProduct);
    setEditingItem(null);
    fetchData();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(base64);
    }

    setEditingItem({
      ...editingItem,
      images: [...(editingItem.images || []), ...newImages.map(data => ({ image_data: data }))]
    });
  };

  const removeImage = (idx: number) => {
    const newImages = [...editingItem.images];
    newImages.splice(idx, 1);
    setEditingItem({ ...editingItem, images: newImages });
  };

  const handleDeleteProduct = async (id: number) => {
    const product = products.find(p => p.id === id);
    setDeleteConfirm({ id, type: 'product', name: product?.name || 'este produto' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'product') {
      await api.deleteProduct(token, deleteConfirm.id);
    } else {
      await api.deleteBanner(token, deleteConfirm.id);
    }
    
    setDeleteConfirm(null);
    fetchData();
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveBanner(token, editingItem);
    setEditingItem(null);
    fetchData();
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    setEditingItem({ ...editingItem, image_data: base64 });
  };

  const handleDeleteBanner = async (id: number) => {
    const banner = banners.find(b => b.id === id);
    setDeleteConfirm({ id, type: 'banner', name: banner?.title || 'este banner' });
  };

  const handleSaveSettings = async () => {
    await api.saveSettings(token, settings);
    alert('Configurações salvas com sucesso!');
    window.location.reload();
  };

  const handleExportExcel = () => {
    if (!products || products.length === 0) {
      alert('Não há produtos para exportar.');
      return;
    }

    // Define headers and map data to rows
    const headers = ['Status do Produto', 'Nome do Produto', 'Valor do Produto', 'Quantidade em Estoque', 'Descrição do Produto'];
    const rows = products.map(p => [
      p.status || 'disponivel',
      p.name || '',
      p.price || 0,
      p.stock_quantity || 0,
      p.description || ''
    ]);

    // Create worksheet from Array of Arrays (AOA)
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
    
    // Auto-size columns based on content
    const maxWidths = [headers, ...rows].reduce((acc: number[], row: any[]) => {
      row.forEach((val, i) => {
        const strVal = val ? val.toString().length : 0;
        acc[i] = Math.max(acc[i] || 0, strVal);
      });
      return acc;
    }, []);
    worksheet['!cols'] = maxWidths.map((w: number) => ({ wch: w + 5 }));

    // Generate and download file
    const fileName = `produtos_export_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const DEFAULT_CATEGORIES = ['Vestidos', 'Blusas', 'Calças', 'Acessórios'];
  const uniqueCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map(p => p.category).filter(Boolean)])).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray pb-20 font-sans">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-brand-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-display font-black uppercase tracking-tight italic mb-2">Confirmar Exclusão</h3>
                <p className="text-stone-500 text-sm mb-8">
                  Deseja realmente excluir <span className="font-bold text-brand-black">"{deleteConfirm.name}"</span>? Esta ação não pode ser desfeita.
                </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-ghost w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="btn-primary !bg-red-500 hover:!bg-red-600 w-full sm:w-auto"
                >
                  Excluir
                </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <div className="bg-[#0A0A0A] text-white py-6 md:py-10 mb-8 md:mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 subtle-grid" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 relative z-10">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center text-brand-black overflow-hidden shadow-2xl flex-shrink-0">
              {settings.find(s => s.key === 'store_logo')?.value ? (
                <img src={settings.find(s => s.key === 'store_logo')?.value} className="w-full h-full object-contain" />
              ) : (
                <Package size={24} className="md:w-8 md:h-8" />
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-display font-black uppercase tracking-tighter italic leading-none mb-1 md:mb-2">Painel de Gestão</h1>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-[9px] md:text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em] bg-brand-white/5 px-2 py-1 rounded">v2.4.0</span>
                <span className="text-[9px] md:text-[10px] text-emerald-400 uppercase font-bold tracking-[0.2em] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-ghost !bg-white/5 !border !border-white/10 !text-white hover:!bg-white/10 flex-1 md:flex-none"
            >
              <ExternalLink size={16} />
              <span className="md:hidden">Ver Loja</span>
              <span className="hidden md:inline">Visualizar Loja</span>
            </button>
            <button 
              onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }}
              className="btn-ghost !bg-red-500/10 !text-red-400 hover:!bg-red-500/20 flex-1 md:flex-none"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-72 space-y-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              activeTab === 'products' 
                ? 'bg-brand-yellow text-brand-black border-brand-yellow/60 shadow-lg shadow-brand-yellow/20' 
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'products' ? 'bg-brand-black/10' : 'bg-stone-100'}`}>
              <Package size={18} />
            </div>
            Gestão de Produtos
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              activeTab === 'banners' 
                ? 'bg-brand-yellow text-brand-black border-brand-yellow/60 shadow-lg shadow-brand-yellow/20' 
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'banners' ? 'bg-brand-black/10' : 'bg-stone-100'}`}>
              <LayoutIcon size={18} />
            </div>
            Banners & Destaques
          </button>
          <button
            onClick={() => navigate('/admin-estrategia')}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all border-b-4 border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:border-stone-300 active:translate-y-1 active:border-b-0"
          >
            <div className="p-2 rounded-xl bg-stone-100">
              <BarChart3 size={18} />
            </div>
            Estratégia de Negócio
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              activeTab === 'settings' 
                ? 'bg-brand-yellow text-brand-black border-brand-yellow/60 shadow-lg shadow-brand-yellow/20' 
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'settings' ? 'bg-brand-black/10' : 'bg-stone-100'}`}>
              <SettingsIcon size={18} />
            </div>
            Configurações Gerais
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              activeTab === 'reports' 
                ? 'bg-brand-yellow text-brand-black border-brand-yellow/60 shadow-lg shadow-brand-yellow/20' 
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'reports' ? 'bg-brand-black/10' : 'bg-stone-100'}`}>
              <BarChart3 size={18} />
            </div>
            Relatórios de Vendas
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-brand-white rounded-3xl shadow-sm border border-brand-black/5 p-8">
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-brand-black uppercase tracking-tight">Gerenciar Produtos</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={handleExportExcel}
                      className="btn-ghost !bg-emerald-500 !text-white hover:!bg-emerald-600 w-full sm:w-auto"
                    >
                      <FileSpreadsheet size={20} />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => setEditingItem({ 
                        name: '', 
                        description: '', 
                        price: '', 
                        price_card: '',
                        category: '', 
                        active: 1, 
                        status: 'disponivel',
                        stock_quantity: '',
                        is_offer: false,
                        offer_price: '',
                        images: []
                      })}
                      className="btn-primary !bg-brand-yellow !text-brand-black hover:!bg-brand-yellow/80 w-full sm:w-auto"
                    >
                      <Plus size={20} />
                      Novo Produto
                    </button>
                  </div>
                </div>

                {/* Category Filter - Desktop */}
                <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                  {['Todos', ...uniqueCategories].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${
                        selectedCategory === cat
                          ? 'bg-brand-yellow text-brand-black border-brand-yellow shadow-lg shadow-brand-yellow/20'
                          : 'bg-brand-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Category Filter - Mobile Button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-brand-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl font-bold text-xs uppercase tracking-widest text-stone-600 dark:text-stone-300 shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Filter size={16} />
                      {selectedCategory === 'Todos' ? 'Filtrar por Categoria' : selectedCategory}
                    </span>
                    <ChevronRight size={16} className="rotate-90" />
                  </button>
                </div>

                {/* Mobile Category Modal */}
                <AnimatePresence>
                  {showCategoryModal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 md:hidden">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCategoryModal(false)}
                        className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="relative w-full max-w-sm bg-brand-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                      >
                        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900">
                          <h3 className="text-lg font-black text-brand-black dark:text-white uppercase tracking-tight">Categorias</h3>
                          <button onClick={() => setShowCategoryModal(false)} className="p-2 bg-stone-200 dark:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="p-4 overflow-y-auto bg-brand-white dark:bg-stone-900">
                          <div className="grid grid-cols-1 gap-2">
                            {['Todos', ...uniqueCategories].map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setShowCategoryModal(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
                                  selectedCategory === cat
                                    ? 'bg-brand-yellow text-brand-black shadow-md'
                                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon size={18} className="text-stone-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar produtos por nome, categoria ou descrição..."
                    className="w-full pl-10 pr-4 py-3 bg-brand-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {products
                  .filter(p => 
                    ((p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (selectedCategory === 'Todos' || p.category === selectedCategory)
                  )
                  .sort((a, b) => {
                    // Sort by created_at desc (newest first)
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-brand-gray rounded-2xl border border-brand-black/5 group relative overflow-hidden">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src={p.images?.[0]?.image_data || 'https://picsum.photos/200'} alt={p.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0 sm:hidden">
                        <h4 className="font-bold text-brand-black text-base truncate pr-2">{p.name}</h4>
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                            p.status === 'reservado' ? 'bg-amber-100 text-amber-600' :
                            p.status === 'vendido' ? 'bg-red-100 text-red-600' :
                            p.status === 'oculto' ? 'bg-stone-200 text-stone-500' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {p.status || 'disponivel'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
                        <h4 className="font-bold text-brand-black text-sm md:text-base truncate pr-2">{p.name}</h4>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            p.status === 'reservado' ? 'bg-amber-100 text-amber-600' :
                            p.status === 'vendido' ? 'bg-red-100 text-red-600' :
                            p.status === 'oculto' ? 'bg-stone-200 text-stone-500' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {p.status || 'disponivel'}
                          </span>
                          {p.is_offer && (
                            <span className="text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-brand-yellow text-brand-black flex items-center gap-1 whitespace-nowrap">
                              Oferta
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-stone-500 text-xs md:text-sm truncate">
                        {p.category} • R$ {p.price?.toLocaleString('pt-BR')}
                        {p.stock_quantity && (
                          <span className="ml-2 px-1.5 py-0.5 bg-brand-black/5 text-stone-600 rounded-md font-bold text-[9px] uppercase">
                            Qtd: {p.stock_quantity}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Mobile-only info block */}
                    <div className="sm:hidden w-full space-y-2">
                      <p className="text-stone-500 text-sm">
                        <span className="font-bold text-brand-black">{p.category}</span> • R$ {p.price?.toLocaleString('pt-BR')}
                      </p>
                      {p.stock_quantity && (
                        <p className="text-xs text-stone-400 font-medium">
                          Estoque: <span className="text-brand-black font-bold">{p.stock_quantity}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 sm:border-none">
                      <button onClick={() => setEditingItem(p)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-white sm:bg-transparent p-3 sm:p-2 text-stone-600 sm:text-stone-400 hover:text-brand-blue transition-colors rounded-xl border sm:border-none border-stone-200">
                        <Edit2 size={20} className="sm:w-5 sm:h-5" />
                        <span className="sm:hidden text-xs font-bold uppercase tracking-widest">Editar</span>
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-white sm:bg-transparent p-3 sm:p-2 text-stone-600 sm:text-stone-400 hover:text-red-600 transition-colors rounded-xl border sm:border-none border-stone-200">
                        <Trash2 size={20} className="sm:w-5 sm:h-5" />
                        <span className="sm:hidden text-xs font-bold uppercase tracking-widest">Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-brand-black uppercase tracking-tight">Gerenciar Banners</h2>
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    Gerencie os banners que aparecem na página inicial.
                  </p>
                </div>
                <button
                  onClick={() => setEditingItem({ title: '', subtitle: '', image_url: '', link: '', active: 1, type: 'desktop' })}
                  className="w-full md:w-auto justify-center flex items-center gap-2 bg-brand-yellow text-brand-black px-4 py-2 rounded-xl font-bold uppercase tracking-tight hover:bg-brand-yellow/80 transition-all"
                >
                  <Plus size={20} />
                  Novo Banner
                </button>
              </div>

              {/* Desktop Banners */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <LayoutIcon size={20} className="text-brand-blue" />
                  <h3 className="text-lg font-bold text-brand-black uppercase tracking-tight">Banners Desktop (PC)</h3>
                  <span className="text-xs text-stone-400 font-medium ml-auto">Recomendado: 1920x600px</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {banners.filter(b => !b.type || b.type === 'desktop').map(b => (
                    <div key={b.id} className="flex items-center gap-4 p-4 bg-brand-gray rounded-2xl border border-brand-black/5 group">
                      <div className="w-32 h-16 bg-stone-200 rounded-xl overflow-hidden">
                        <img src={b.image_data || 'https://picsum.photos/400/200'} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-brand-black">{b.title}</h4>
                        <p className="text-stone-500 text-sm">{b.subtitle}</p>
                        <span className="text-[10px] uppercase font-bold bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-md mt-1 inline-block">Desktop</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingItem(b)} className="p-2 text-stone-400 hover:text-brand-blue transition-colors">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {banners.filter(b => !b.type || b.type === 'desktop').length === 0 && (
                    <p className="text-stone-400 text-sm italic text-center py-4">Nenhum banner para desktop cadastrado.</p>
                  )}
                </div>
              </div>

              {/* Mobile Banners */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <Phone size={20} className="text-brand-yellow-dark" />
                  <h3 className="text-lg font-bold text-brand-black uppercase tracking-tight">Banners Mobile (Celular)</h3>
                  <span className="text-xs text-stone-400 font-medium ml-auto">Recomendado: 800x800px</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {banners.filter(b => b.type === 'mobile').map(b => (
                    <div key={b.id} className="flex items-center gap-4 p-4 bg-brand-gray rounded-2xl border border-brand-black/5 group">
                      <div className="w-16 h-16 bg-stone-200 rounded-xl overflow-hidden">
                        <img src={b.image_data || 'https://picsum.photos/200/200'} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-brand-black">{b.title}</h4>
                        <p className="text-stone-500 text-sm">{b.subtitle}</p>
                        <span className="text-[10px] uppercase font-bold bg-brand-yellow/20 text-brand-yellow-dark px-2 py-1 rounded-md mt-1 inline-block">Mobile</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingItem(b)} className="p-2 text-stone-400 hover:text-brand-blue transition-colors">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {banners.filter(b => b.type === 'mobile').length === 0 && (
                    <p className="text-stone-400 text-sm italic text-center py-4">Nenhum banner para mobile cadastrado.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-brand-black uppercase tracking-tight">Relatórios de Vendas</h2>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-2 text-emerald-600">
                    <Check size={20} />
                    <span className="font-bold text-xs uppercase tracking-widest">Total Vendidos</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-900">
                    {products.filter(p => p.status === 'vendido').length}
                  </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-2 text-amber-600">
                    <AlertTriangle size={20} />
                    <span className="font-bold text-xs uppercase tracking-widest">Total Reservados</span>
                  </div>
                  <div className="text-3xl font-black text-amber-900">
                    {products.filter(p => p.status === 'reservado').length}
                  </div>
                </div>
                <div className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/10">
                  <div className="flex items-center gap-3 mb-2 text-brand-blue">
                    <Package size={20} />
                    <span className="font-bold text-xs uppercase tracking-widest">Total em Estoque</span>
                  </div>
                  <div className="text-3xl font-black text-brand-black">
                    {products.filter(p => !['vendido', 'reservado', 'oculto'].includes(p.status)).length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Reserved Products Section */}
                <section className="bg-brand-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-tight">Produtos Reservados</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Aguardando Pagamento/Retirada</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {products.filter(p => p.status === 'reservado').length === 0 ? (
                      <p className="text-stone-400 text-sm italic text-center py-8">Nenhum produto reservado no momento.</p>
                    ) : (
                      products.filter(p => p.status === 'reservado').map(p => (
                        <div key={p.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                          <img src={p.images?.[0]?.image_data || 'https://picsum.photos/200'} alt={p.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <h4 className="font-bold text-brand-black">{p.name}</h4>
                            <p className="text-stone-500 text-xs mb-2">R$ {p.price?.toLocaleString('pt-BR')}</p>
                            
                            {(p.reserved_client_name || p.reserved_client_phone) && (
                              <div className="flex flex-wrap gap-3 mt-2">
                                {p.reserved_client_name && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg">
                                    <User size={12} />
                                    {p.reserved_client_name}
                                  </div>
                                )}
                                {p.reserved_client_phone && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg">
                                    <Phone size={12} />
                                    {p.reserved_client_phone}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => setManagingReservation(p)}
                            className="px-4 py-2 bg-brand-white border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-amber-50 transition-colors"
                          >
                            Gerenciar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Best Sellers Section */}
                <section className="bg-brand-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-tight">Produtos Mais Vendidos</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Top 5 Itens Populares</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const soldProducts = products.filter(p => p.status === 'vendido');
                      if (soldProducts.length === 0) {
                        return <p className="text-stone-400 text-sm italic text-center py-8">Nenhum dado de vendas suficiente.</p>;
                      }

                      const productCounts = soldProducts.reduce((acc: Record<string, number>, product: any) => {
                        const name = product.name || 'Sem Nome';
                        acc[name] = (acc[name] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      const bestSellers = Object.entries(productCounts)
                        .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                        .slice(0, 5);

                      return bestSellers.map(([name, count], index) => (
                        <div key={name} className="flex items-center justify-between p-4 bg-brand-gray rounded-2xl border border-brand-black/5">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-brand-yellow text-brand-black' : 'bg-brand-black/10 text-stone-500'}`}>
                              {index + 1}
                            </div>
                            <h4 className="font-bold text-brand-black">{name}</h4>
                          </div>
                          <div className="text-sm font-bold text-stone-500">
                            {count as number} {(count as number) === 1 ? 'venda' : 'vendas'}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </section>

                {/* Sold Products Section */}
                <section className="bg-brand-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-tight">Produtos Vendidos</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Histórico de Vendas</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {products.filter(p => p.status === 'vendido').length === 0 ? (
                      <p className="text-stone-400 text-sm italic text-center py-8">Nenhum produto vendido registrado.</p>
                    ) : (
                      products
                        .filter(p => p.status === 'vendido')
                        .sort((a, b) => (new Date(b.status_updated_at || b.created_at).getTime() - new Date(a.status_updated_at || a.created_at).getTime()))
                        .map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 opacity-75 hover:opacity-100 transition-opacity">
                          <img src={p.images?.[0]?.image_data || 'https://picsum.photos/200'} alt={p.name} className="w-16 h-16 rounded-xl object-cover grayscale" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <h4 className="font-bold text-brand-black line-through decoration-emerald-500/50">{p.name}</h4>
                            <p className="text-emerald-700 text-xs font-bold">Vendido por R$ {p.price?.toLocaleString('pt-BR')}</p>
                            {p.status_updated_at && (
                              <p className="text-[10px] text-stone-400 mt-1">
                                Data: {new Date(p.status_updated_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-brand-black uppercase tracking-tight">Configurações da Loja</h2>
                <button
                  onClick={handleSaveSettings}
                  className="w-full md:w-auto justify-center flex items-center gap-2 bg-brand-yellow text-brand-black px-6 py-3 rounded-xl font-bold uppercase tracking-tight hover:bg-brand-yellow/80 transition-all shadow-lg shadow-brand-yellow/20 hover:-translate-y-0.5"
                >
                  <Save size={20} />
                  Salvar Alterações
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Identidade Visual */}
                <section className="bg-brand-white p-8 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-full -mr-10 -mt-10" />
                  
                  <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6 relative">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-sm">
                      <ImageIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-tight">Identidade Visual</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Logo e Cores</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {renderSettingInput('store_name', 'Nome da Loja')}
                    <div className="md:col-span-2 bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                       {renderSettingInput('store_logo', 'Logo da Loja')}
                    </div>
                  </div>
                </section>

                <section className="bg-brand-white p-8 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-10 -mt-10" />

                  <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6 relative">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-sm">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-tight">Contato e Redes Sociais</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Canais de Atendimento</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {renderSettingInput('contact_whatsapp', 'WhatsApp (apenas números)')}
                    {renderSettingInput('contact_email', 'E-mail de Contato')}
                    {renderSettingInput('social_instagram', 'Instagram (@usuario)')}
                    {renderSettingInput('social_facebook', 'Facebook (URL ou usuário)')}
                  </div>
                </section>

                {/* Informações da Loja */}
                <section className="bg-brand-white p-8 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-black/5 rounded-bl-full -mr-10 -mt-10" />

                  <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6 relative">
                    <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 text-brand-yellow-dark flex items-center justify-center shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-tight">Informações da Loja</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Endereço e Políticas</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {renderSettingInput('store_location', 'Endereço Completo')}
                    {renderSettingInput('store_hours', 'Horário de Funcionamento (Ex: Seg a Sex 08:00 às 18:00)')}
                    {renderSettingInput('store_description', 'Sobre a Loja (Descrição)', true)}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {renderSettingInput('store_delivery', 'Política de Entrega', true)}
                      {renderSettingInput('store_payment', 'Formas de Pagamento', true)}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>

      {/* Modal for Managing Reservation */}
      {managingReservation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-3 text-amber-700">
                <User size={24} />
                <h3 className="text-xl font-black uppercase tracking-tight">Gerenciar Reserva</h3>
              </div>
              <button onClick={() => setManagingReservation(null)} className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveReservation} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-widest">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 font-bold text-stone-700"
                  placeholder="Ex: João Silva"
                  value={managingReservation.reserved_client_name || ''}
                  onChange={e => setManagingReservation({...managingReservation, reserved_client_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-widest">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 font-bold text-stone-700"
                  placeholder="Ex: 27 99999-9999"
                  value={managingReservation.reserved_client_phone || ''}
                  onChange={e => setManagingReservation({...managingReservation, reserved_client_phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-widest">Data da Reserva</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 font-bold text-stone-700"
                  value={managingReservation.reservation_date ? new Date(managingReservation.reservation_date).toISOString().split('T')[0] : ''}
                  onChange={e => setManagingReservation({...managingReservation, reservation_date: new Date(e.target.value).toISOString()})}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setManagingReservation(null)} 
                  className="flex-1 px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold uppercase tracking-tight hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold uppercase tracking-tight hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Salvar Dados
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal for Editing Products/Banners */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="bg-brand-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                {editingItem.id ? 'Editar' : 'Novo'} {activeTab === 'products' ? 'Produto' : 'Banner'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5">
              <form onSubmit={activeTab === 'products' ? handleSaveProduct : handleSaveBanner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTab === 'products' ? (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Nome do Produto</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm dark:text-white"
                        value={editingItem.name}
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Preço à Vista (R$)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm dark:text-white"
                        value={editingItem.price ? String(editingItem.price).replace('.', ',') : ''}
                        onChange={e => {
                          const val = e.target.value.replace(',', '.');
                          if (!isNaN(Number(val)) || val === '' || val === '.') {
                            setEditingItem({...editingItem, price: val});
                          }
                        }}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Preço no Cartão (R$)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm dark:text-white"
                        value={editingItem.price_card ? String(editingItem.price_card).replace('.', ',') : ''}
                        onChange={e => {
                          const val = e.target.value.replace(',', '.');
                          if (!isNaN(Number(val)) || val === '' || val === '.') {
                            setEditingItem({...editingItem, price_card: val});
                          }
                        }}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Categoria</label>
                      <select
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm dark:text-white"
                        value={editingItem.category || ''}
                        onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                      >
                        <option value="">Selecione uma categoria</option>
                        {uniqueCategories.map((cat: any) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Status do Produto</label>
                      <select
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 font-bold text-xs dark:text-white"
                        value={editingItem.status || 'disponivel'}
                        onChange={e => {
                          const newStatus = e.target.value;
                          const updates: any = { status: newStatus };
                          if (newStatus === 'vendido' && editingItem.status !== 'vendido') {
                            updates.status_updated_at = new Date().toISOString();
                          }
                          setEditingItem({...editingItem, ...updates});
                        }}
                      >
                        <option value="disponivel">🟢 Disponível</option>
                        <option value="reservado">🟡 Reservado</option>
                        <option value="vendido">🔴 Vendido</option>
                        <option value="oculto">⚫ Oculto</option>
                      </select>
                    </div>

                    {editingItem.status === 'reservado' && (
                      <div className="md:col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-amber-700 mb-1">
                          <User size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Dados da Reserva</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 mb-0.5 uppercase">Nome do Cliente</label>
                            <input
                              type="text"
                              className="w-full px-2 py-1 bg-brand-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-xs"
                              placeholder="Ex: João Silva"
                              value={editingItem.reserved_client_name || ''}
                              onChange={e => setEditingItem({...editingItem, reserved_client_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 mb-0.5 uppercase">Telefone / WhatsApp</label>
                            <input
                              type="text"
                              className="w-full px-2 py-1 bg-brand-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-xs"
                              placeholder="Ex: 27 99999-9999"
                              value={editingItem.reserved_client_phone || ''}
                              onChange={e => setEditingItem({...editingItem, reserved_client_phone: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Quantidade (Privado)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm dark:text-white"
                        placeholder="Ex: 10"
                        value={editingItem.stock_quantity || ''}
                        onChange={e => setEditingItem({...editingItem, stock_quantity: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 bg-brand-yellow/5 dark:bg-brand-yellow/10 p-3 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-brand-black dark:text-white uppercase tracking-tight">Ativar Oferta</label>
                        <button 
                          type="button"
                          onClick={() => setEditingItem({...editingItem, is_offer: !editingItem.is_offer})}
                          className={`w-10 h-5 rounded-full transition-all relative ${editingItem.is_offer ? 'bg-brand-blue' : 'bg-stone-300 dark:bg-stone-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-brand-white rounded-full transition-all ${editingItem.is_offer ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {editingItem.is_offer && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-widest">Preço da Oferta (R$)</label>
                          <input
                            type="text"
                            required={editingItem.is_offer}
                            className="w-full px-3 py-1.5 bg-brand-white dark:bg-stone-800 border border-brand-yellow/30 dark:border-brand-yellow/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-sm dark:text-white"
                            placeholder="Valor com desconto"
                            value={editingItem.offer_price ? String(editingItem.offer_price).replace('.', ',') : ''}
                            onChange={e => {
                              const val = e.target.value.replace(',', '.');
                              if (!isNaN(Number(val)) || val === '' || val === '.') {
                                setEditingItem({...editingItem, offer_price: val});
                              }
                            }}
                          />
                          <p className="text-[9px] text-stone-400 mt-1 font-medium italic">O preço original (R$ {editingItem.price}) aparecerá riscado.</p>
                        </motion.div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Fotos do Produto</label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {editingItem.images?.map((img: any, idx: number) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 group">
                            <img src={img.image_data} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-brand-black/10 dark:border-white/10 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 hover:border-brand-blue dark:hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-blue cursor-pointer transition-all">
                          <Plus size={20} />
                          <span className="text-[9px] font-bold mt-0.5 uppercase">Adicionar</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-wide">Descrição</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm resize-none dark:text-white"
                        value={editingItem.description}
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Tipo de Banner</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setEditingItem({...editingItem, type: 'desktop'})}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-bold uppercase tracking-tight transition-all ${
                            (!editingItem.type || editingItem.type === 'desktop')
                              ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-stone-300 dark:hover:border-stone-600'
                          }`}
                        >
                          <LayoutIcon size={20} />
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem({...editingItem, type: 'mobile'})}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-bold uppercase tracking-tight transition-all ${
                            editingItem.type === 'mobile'
                              ? 'bg-brand-yellow/20 border-brand-yellow-dark text-brand-yellow-dark'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-stone-300 dark:hover:border-stone-600'
                          }`}
                        >
                          <Phone size={20} />
                          Mobile
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Título</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                        value={editingItem.title}
                        onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Subtítulo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                        value={editingItem.subtitle}
                        onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Imagem do Banner 
                        <span className="text-xs font-normal text-stone-400 ml-2">
                          (Recomendado: {editingItem.type === 'mobile' ? '800x800px' : '1920x600px'})
                        </span>
                      </label>
                      <div className="flex items-center gap-4">
                        <div className={`bg-stone-100 rounded-xl overflow-hidden border border-stone-200 ${editingItem.type === 'mobile' ? 'w-32 h-32' : 'w-32 h-16'}`}>
                          {editingItem.image_data ? (
                            <img src={editingItem.image_data} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <label className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold hover:bg-stone-200 cursor-pointer transition-all">
                          Escolher Foto
                          <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Link de Destino</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                        value={editingItem.link}
                        onChange={e => setEditingItem({...editingItem, link: e.target.value})}
                      />
                    </div>
                  </>
                )}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={editingItem.active === 1}
                      onChange={e => setEditingItem({...editingItem, active: e.target.checked ? 1 : 0})}
                    />
                    <label htmlFor="active" className="text-sm font-semibold text-stone-700">Ativo</label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4 sticky bottom-0 bg-brand-white dark:bg-stone-900 pb-2">
                  <button type="button" onClick={() => setEditingItem(null)} className="flex-1 bg-brand-gray text-stone-600 py-3 rounded-xl font-bold hover:bg-brand-gray/80 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 bg-brand-yellow text-brand-black py-3 rounded-xl font-black uppercase tracking-tight hover:bg-brand-yellow/80 transition-all">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
