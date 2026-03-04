import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ShoppingBag, ChevronLeft } from 'lucide-react';

export default function Offers({ settings: initialSettings, products: initialProducts = [] }: { settings?: any, products?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const settings = initialSettings;
  const products = initialProducts;
  
  const offerProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && p.is_offer;
  });

  return (
    <div className="min-h-screen subtle-grid pb-20">
      {/* Header Section */}
      <section className="bg-[#0A0A0A] py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-accent rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-brand-accent transition-colors mb-8 group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para Coleções
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-medium text-white uppercase tracking-tighter italic mb-4">
                Special <span className="text-brand-accent">Sale</span>
              </h1>
              <p className="text-stone-400 max-w-xl font-medium">
                Aproveite os melhores preços em peças selecionadas. Oportunidades únicas com descontos exclusivos por tempo limitado.
              </p>
            </div>
            
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-brand-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar no sale..." 
                className="w-full bg-white/5 border border-white/10 focus:border-brand-accent/50 focus:bg-white/10 px-12 py-4 rounded-2xl outline-none transition-all font-medium text-sm text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {offerProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {offerProducts.map((product: any, idx: number) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-black rounded-3xl overflow-hidden border border-brand-border dark:border-white/10 hover:border-brand-accent dark:hover:border-brand-accent transition-all hover:shadow-2xl hover:shadow-brand-black/5 dark:shadow-none"
              >
                <Link to={`/produto/${product.id}`}>
                  <div className="aspect-[3/4] overflow-hidden relative bg-white dark:bg-black">
                    <div className="w-full h-full bg-white dark:bg-black flex items-center justify-center">
                      <img 
                        src={product.images?.[0]?.image_data || `https://picsum.photos/seed/${product.id}/600/800`} 
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${product.status === 'vendido' ? 'grayscale opacity-50' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {product.status === 'vendido' ? (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg z-20 flex items-center gap-1">
                        Vendido
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg z-20 flex items-center gap-1">
                        <ShoppingBag size={12} />
                        Sale
                      </div>
                    )}

                    {product.status === 'vendido' && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <span className="text-red-500 font-black uppercase text-2xl tracking-widest border-4 border-red-500 px-6 py-2 transform -rotate-12 bg-white/90 shadow-xl">Vendido</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                      <span className="w-full bg-white text-brand-black dark:text-black py-3 rounded-xl font-display font-black uppercase tracking-tight text-xs text-center transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                        Ver Detalhes
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <h3 className="font-display font-medium text-lg mb-2 group-hover:text-brand-accent dark:text-stone-100 transition-colors line-clamp-1">{product.name}</h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-stone-400 line-through font-bold">
                        R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xl font-display font-black text-brand-accent">
                        R$ {Number(product.offer_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${settings?.contact_whatsapp}?text=Olá! Tenho interesse na oferta: ${product.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-brand-gray dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-brand-accent hover:text-white transition-all"
                    >
                      <ShoppingBag size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-brand-gray rounded-full flex items-center justify-center mx-auto mb-8 text-stone-300">
              <ShoppingBag size={48} />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-black mb-2">Nenhuma oferta no momento</h3>
            <p className="text-stone-500 max-w-sm mx-auto">Fique de olho! Em breve teremos novas promoções imperdíveis para você.</p>
            <Link 
              to="/"
              className="mt-8 btn-secondary"
            >
              Ver todos os produtos
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
