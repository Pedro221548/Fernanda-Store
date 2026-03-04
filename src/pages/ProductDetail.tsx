import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, ChevronLeft, Share2, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { trackViewItem, trackContact } from '../services/analytics';

export default function ProductDetail({ settings }: { settings?: any }) {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.getPublicData()
        .then(({ products }) => {
          const foundProduct = products.find((p: any) => p.id === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            trackViewItem(foundProduct);
            
            // Filter related products
            const related = products
              .filter((p: any) => p.category === foundProduct.category && p.id !== foundProduct.id)
              .slice(0, 4);
            setRelatedProducts(related);
          } else {
            setError("Produto não encontrado.");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching data:", err);
          setError("Erro ao carregar produto.");
          setLoading(false);
        });
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-black mb-4">Produto não encontrado</h2>
        <Link to="/" className="text-brand-accent font-bold hover:underline">
          Voltar para Coleções
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ image_data: `https://picsum.photos/seed/${product.id}/800/1000` }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-accent transition-colors mb-8 group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Coleções
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Images Gallery */}
        <div className="space-y-4">
          {/* Mobile Header: Name and Category above images */}
          <div className="md:hidden mb-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <span className="inline-block bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
              )}
              {product.status === 'reservado' && (
                <span className="inline-block bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                  Reservado
                </span>
              )}
              {product.status === 'vendido' && (
                <span className="inline-block bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                  Vendido
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-brand-black leading-tight mb-2">
              {product.name}
            </h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-brand-white border border-brand-black/5 shadow-sm flex items-center justify-center"
          >
            <img 
              src={images[selectedImage].image_data} 
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all bg-brand-white flex items-center justify-center ${
                    selectedImage === idx ? 'border-brand-accent' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img.image_data} 
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            {/* Desktop Header: Hidden on mobile since it's now above images */}
            <div className="hidden md:block">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.category && (
                  <span className="inline-block bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
                {product.status === 'reservado' && (
                  <span className="inline-block bg-amber-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm animate-pulse">
                    Reservado
                  </span>
                )}
                {product.status === 'vendido' && (
                  <span className="inline-block bg-red-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Vendido
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-brand-black mb-4 leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-col">
              {product.is_offer ? (
                <div className="flex flex-col">
                  <span className="text-sm text-stone-400 line-through font-bold">
                    R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-medium font-display text-brand-accent mb-6">
                    R$ {Number(product.offer_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ) : (
                <div className="text-3xl md:text-4xl lg:text-5xl font-medium font-display text-brand-black mb-6">
                  {product.price ? `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Preço sob consulta'}
                </div>
              )}
            </div>
            <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            {product.status === 'vendido' ? (
              <div className="w-full bg-stone-100 dark:bg-stone-900 text-stone-400 dark:text-stone-600 py-4 rounded-2xl font-black text-lg text-center cursor-not-allowed border border-stone-200 dark:border-stone-800">
                Produto Indisponível (Vendido)
              </div>
            ) : (
              <a
                href={`https://wa.me/${settings?.contact_whatsapp}?text=${encodeURIComponent(`Olá, vim saber mais a respeito do produto ${product.name}, poderia me ajudar ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackContact('whatsapp', product)}
                className="btn-primary w-full !text-lg !py-5 shadow-2xl shadow-brand-accent/30"
              >
                <MessageCircle size={24} />
                Falar com Consultora
              </a>
            )}
            
            <button 
              onClick={handleShare}
              className="btn-ghost w-full !py-4 !text-sm"
            >
              <Share2 size={20} />
              Compartilhar Produto
            </button>
          </div>

          {/* Trust Badges / Info */}
          <div className="grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-brand-black/5">
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-stone-400">
                <ShoppingBag size={20} />
              </div>
              <span>Produto Original</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-stone-400">
                <MessageCircle size={20} />
              </div>
              <span>Suporte via WhatsApp</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-brand-border dark:border-stone-800">
          <h2 className="text-2xl md:text-3xl font-display font-black text-brand-black dark:text-white uppercase tracking-tight mb-8">
            Produtos Relacionados
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((related: any, idx: number) => (
              <motion.div
                key={related.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-black rounded-3xl overflow-hidden border border-brand-border dark:border-white/10 hover:border-brand-yellow dark:hover:border-brand-yellow transition-all hover:shadow-2xl hover:shadow-brand-black/5 dark:shadow-none"
              >
                <Link to={`/produto/${related.id}`} onClick={() => window.scrollTo(0, 0)}>
                  <div className="aspect-[3/4] overflow-hidden relative bg-white dark:bg-black">
                    <div className="w-full h-full bg-white dark:bg-black flex items-center justify-center">
                      <img 
                        src={related.images?.[0]?.image_data || `https://picsum.photos/seed/${related.id}/600/800`} 
                        alt={related.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {related.is_offer && (
                      <div className="absolute top-4 right-4 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg z-20 flex items-center gap-1">
                        <ShoppingBag size={12} />
                        Sale
                      </div>
                    )}
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                      <span className="w-full bg-white text-brand-black py-3 rounded-xl font-display font-black uppercase tracking-tight text-[10px] text-center transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                        Ver Detalhes
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4 md:p-6">
                  <h3 className="font-display font-medium text-sm md:text-lg mb-1 md:mb-2 group-hover:text-brand-accent dark:text-stone-100 transition-colors line-clamp-1">{related.name}</h3>
                  <div className="flex flex-col">
                    {related.is_offer ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs text-stone-400 line-through font-bold">
                          R$ {related.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-lg md:text-xl font-display font-black text-brand-accent">
                          R$ {Number(related.offer_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg md:text-xl font-display font-black text-brand-black dark:text-white">
                        {related.price ? `R$ ${related.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob consulta'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
