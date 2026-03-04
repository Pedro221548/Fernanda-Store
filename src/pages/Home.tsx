import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ChevronRight, ChevronLeft, Layout as LayoutIcon, ShoppingBag, Star, MapPin } from 'lucide-react';

export default function Home({ 
  settings: initialSettings, 
  products: initialProducts = [], 
  banners: initialBanners = [], 
  searchTerm,
  isLoading = false
}: { 
  settings?: any, 
  products?: any[], 
  banners?: any[], 
  searchTerm: string,
  isLoading?: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'Todos');
  const [currentDesktopBanner, setCurrentDesktopBanner] = useState(0);
  const [currentMobileBanner, setCurrentMobileBanner] = useState(0);

  // Sync selectedCategory with URL params
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('Todos');
    }
  }, [urlCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'Todos') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const settings = initialSettings;
  const products = initialProducts;
  const banners = initialBanners;

  const desktopBanners = banners.filter(b => !b.type || b.type === 'desktop');
  const mobileBanners = banners.filter(b => b.type === 'mobile');
  // Fallback to desktop banners if no mobile banners exist
  const effectiveMobileBanners = mobileBanners.length > 0 ? mobileBanners : desktopBanners;

  const CATEGORY_ICONS: Record<string, string> = {
    'Vestidos': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
    'Blusas': 'https://i.imgur.com/JBHccxa.png',
    'Calças': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400',
    'Acessórios': 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=400',
  };

  // Merge legacy categories derived from products with static ones
  const staticCategories = ['Vestidos', 'Blusas', 'Calças', 'Acessórios'];
  const productCategories = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)));
  const allCategoryNames = Array.from(new Set([...staticCategories, ...productCategories])).sort();

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'Novidades') {
      if (!p.created_at) return false;
      const createdDate = new Date(p.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return matchesSearch && diffDays <= 2;
    }

    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Desktop Banner Logic
  const nextDesktopBanner = () => setCurrentDesktopBanner((prev) => (prev + 1) % desktopBanners.length);
  const prevDesktopBanner = () => setCurrentDesktopBanner((prev) => (prev - 1 + desktopBanners.length) % desktopBanners.length);

  useEffect(() => {
    if (desktopBanners.length > 1) {
      const timer = setInterval(nextDesktopBanner, 6000);
      return () => clearInterval(timer);
    }
  }, [desktopBanners.length]);

  // Mobile Banner Logic
  const nextMobileBanner = () => setCurrentMobileBanner((prev) => (prev + 1) % effectiveMobileBanners.length);

  useEffect(() => {
    if (effectiveMobileBanners.length > 1) {
      const timer = setInterval(nextMobileBanner, 6000);
      return () => clearInterval(timer);
    }
  }, [effectiveMobileBanners.length]);

  return (
    <div className="min-h-screen subtle-grid pb-20">
      {/* Desktop Banners (Hidden on Mobile) */}
      <section className="hidden md:block relative h-[500px] lg:h-[700px] overflow-hidden bg-brand-black group">
        {isLoading ? (
          <div className="w-full h-full bg-stone-200 animate-pulse flex items-center justify-center">
            <LayoutIcon size={48} className="text-stone-300" />
          </div>
        ) : desktopBanners.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDesktopBanner}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={desktopBanners[currentDesktopBanner].image_data || `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920`} 
                  alt={desktopBanners[currentDesktopBanner].title}
                  className="w-full h-full object-cover brightness-90"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>

            {desktopBanners.length > 1 && (
              <>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                  {desktopBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentDesktopBanner(idx)}
                      className={`h-1.5 transition-all rounded-full ${currentDesktopBanner === idx ? 'w-10 bg-brand-yellow' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
                <button onClick={prevDesktopBanner} className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={28} />
                </button>
                <button onClick={nextDesktopBanner} className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-brand-gray">
             <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow/10 text-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutIcon size={32} />
                </div>
                <p className="text-stone-400 font-display font-bold uppercase tracking-widest text-xs">Nenhum banner desktop cadastrado</p>
              </div>
          </div>
        )}
      </section>

      {/* Mobile Banners (Hidden on Desktop) */}
      <section className="block md:hidden relative h-[400px] sm:h-[500px] overflow-hidden bg-brand-black">
        {isLoading ? (
          <div className="w-full h-full bg-stone-200 animate-pulse flex items-center justify-center">
            <LayoutIcon size={32} className="text-stone-300" />
          </div>
        ) : effectiveMobileBanners.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMobileBanner}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={effectiveMobileBanners[currentMobileBanner].image_data || `https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800`} 
                  alt={effectiveMobileBanners[currentMobileBanner].title}
                  className="w-full h-full object-cover brightness-90"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>

            {effectiveMobileBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {effectiveMobileBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentMobileBanner(idx)}
                    className={`h-1.5 transition-all rounded-full ${currentMobileBanner === idx ? 'w-6 bg-brand-yellow' : 'w-1.5 bg-white/30'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-brand-gray">
             <div className="text-center">
                <div className="w-12 h-12 bg-brand-yellow/10 text-brand-yellow rounded-xl flex items-center justify-center mx-auto mb-3">
                  <LayoutIcon size={24} />
                </div>
                <p className="text-stone-400 font-display font-bold uppercase tracking-widest text-[10px]">Nenhum banner mobile cadastrado</p>
              </div>
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="bg-brand-white border-b border-brand-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-display font-medium uppercase tracking-tight italic">Coleções</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <Filter size={12} />
              <span>Deslize para ver mais</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            {['Todos', ...allCategoryNames].map(cat => {
              // Find a representative image for the category
              const categoryProduct = products.find((p: any) => p.category === cat);
              const categoryImage = CATEGORY_ICONS[cat] || categoryProduct?.images?.[0]?.image_data;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className="flex flex-col items-center gap-3 sm:gap-4 group flex-shrink-0 w-20 sm:w-32"
                >
                  <div className={`w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center p-3 sm:p-4 transition-all duration-500 ${
                    selectedCategory === cat 
                      ? 'bg-brand-accent shadow-xl shadow-brand-accent/20 scale-105' 
                      : 'bg-brand-gray hover:bg-stone-200'
                  }`}>
                    {cat === 'Todos' ? (
                      <LayoutIcon size={32} className={`sm:w-10 sm:h-10 ${selectedCategory === cat ? 'text-white' : 'text-stone-400'}`} />
                    ) : (
                      <img 
                        src={categoryImage || `https://picsum.photos/seed/${cat}/200/200`} 
                        alt={cat}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors text-center leading-tight ${
                    selectedCategory === cat ? 'text-brand-accent' : 'text-stone-500 group-hover:text-brand-black'
                  }`}>
                    {cat === 'Todos' ? 'Ver Tudo' : cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map((product: any, idx: number) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-brand-border dark:border-white/10 hover:border-brand-accent dark:hover:border-brand-accent transition-all hover:shadow-2xl hover:shadow-brand-black/5 dark:shadow-none"
              >
                <Link to={`/produto/${product.id}`}>
                  <div className="aspect-[3/4] overflow-hidden relative bg-white dark:bg-black">
                    <div className="w-full h-full bg-white dark:bg-black flex items-center justify-center">
                      <img 
                        src={product.images?.[0]?.image_data || `https://picsum.photos/seed/${product.id}/600/800`} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {product.category && (
                      <span className="hidden sm:block absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm z-10">
                        {product.category}
                      </span>
                    )}

                    {product.is_offer && (
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-brand-accent text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg shadow-lg z-20 flex items-center gap-1">
                        <ShoppingBag size={10} className="md:w-3 md:h-3" />
                        Sale
                      </div>
                    )}
                    
                    {product.status === 'reservado' && !product.is_offer && (
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-amber-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg shadow-lg z-10 animate-pulse">
                        Reservado
                      </div>
                    )}

                    {product.status === 'vendido' && (
                      <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="bg-red-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl shadow-2xl transform -rotate-12 border-2 md:border-4 border-white/20">
                          Vendido
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 md:p-6">
                      <span className="w-full bg-white text-brand-black py-2 md:py-3 rounded-lg md:rounded-xl font-display font-black uppercase tracking-tight text-[9px] md:text-[10px] text-center transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                        Ver Detalhes
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-3 md:p-6">
                  <h3 className="font-display font-medium text-xs md:text-lg mb-1 md:mb-2 group-hover:text-brand-accent dark:text-stone-100 transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-[9px] md:text-xs line-clamp-1 md:line-clamp-2 mb-3 md:mb-6 h-4 md:h-8 opacity-70">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.is_offer ? (
                        <div className="flex flex-col">
                          <span className="text-[8px] md:text-[10px] text-stone-400 line-through font-bold">
                            R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-base md:text-xl font-display font-black text-brand-accent leading-none">
                            R$ {Number(product.offer_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5 md:gap-1">
                          <div className="flex items-baseline gap-1 md:gap-1.5">
                            <span className="text-[8px] md:text-[9px] font-black text-stone-400 uppercase tracking-widest">À vista</span>
                            <span className="text-base md:text-xl font-display font-black text-brand-black dark:text-white leading-none">
                              {product.price ? `R$ ${Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob consulta'}
                            </span>
                          </div>
                          {product.price_card && (
                            <div className="flex items-baseline gap-1 md:gap-1.5">
                              <span className="text-[8px] md:text-[9px] font-black text-stone-400 uppercase tracking-widest">Cartão</span>
                              <span className="text-xs md:text-sm font-display font-bold text-stone-500 dark:text-stone-400 leading-none">
                                R$ {Number(product.price_card).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <a
                      href={`https://wa.me/${settings?.contact_whatsapp}?text=Olá! Tenho interesse no produto: ${product.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-gray dark:bg-white/5 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:bg-brand-accent hover:text-white dark:hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <ShoppingBag size={14} className="md:w-[18px] md:h-[18px]" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-brand-gray rounded-full flex items-center justify-center mx-auto mb-8 text-stone-300">
              <Search size={48} />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-black mb-2">Nenhum produto encontrado</h3>
            <p className="text-stone-500 max-w-sm mx-auto">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
            <button 
              onClick={() => { setSelectedCategory('Todos'); }}
              className="mt-8 btn-ghost"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </section>

      {/* Google Reviews Section */}
      <section className="bg-brand-white dark:bg-stone-950 py-16 border-t border-brand-border dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">Avaliações no Google</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-black text-brand-black dark:text-white uppercase tracking-tight">O que dizem nossos clientes</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(4)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                  <Star size={20} fill="currentColor" className="text-stone-300 dark:text-stone-600" />
                </div>
                <span className="font-bold text-brand-black dark:text-white">4.2</span>
                <span className="text-stone-400 text-sm">• Baseado em avaliações reais</span>
              </div>
            </div>
            <a 
              href={settings?.store_location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.store_location)}` : "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-stone-500 bg-brand-gray dark:bg-stone-900 px-4 py-3 rounded-xl border border-brand-border dark:border-stone-800 hover:border-brand-blue transition-colors group"
            >
              <MapPin size={18} className="text-brand-blue group-hover:scale-110 transition-transform" />
              <span className="font-medium dark:text-stone-400 truncate max-w-[200px] sm:max-w-xs">
                {settings?.store_location && !settings.store_location.startsWith('http') 
                  ? settings.store_location 
                  : 'Ver localização no mapa'}
              </span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Ana Beatriz",
                date: "há 2 dias",
                text: "O vestido que comprei é maravilhoso! O caimento ficou perfeito e o tecido é de altíssima qualidade. Chegou super rápido aqui em Vitória. Com certeza comprarei mais vezes!",
                avatar: "A"
              },
              {
                name: "Carla Oliveira",
                date: "há 1 semana",
                text: "Atendimento impecável! As meninas me ajudaram a escolher o look ideal para o evento que eu tinha. A loja é linda e as peças são muito selecionadas. Recomendo muito!",
                avatar: "C"
              },
              {
                name: "Fernanda Souza",
                date: "há 2 semanas",
                text: "Amei as blusas novas! Estilo e conforto definem. É difícil encontrar peças tão exclusivas assim com um preço justo. Parabéns pelo bom gosto!",
                avatar: "F"
              }
            ].map((review, idx) => (
              <div key={idx} className="bg-brand-gray dark:bg-stone-900 p-6 rounded-3xl border border-brand-border dark:border-stone-800 hover:shadow-xl hover:shadow-brand-black/5 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-black dark:text-white text-sm">{review.name}</h4>
                    <span className="text-xs text-stone-400">{review.date}</span>
                  </div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-4 h-4 ml-auto opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
