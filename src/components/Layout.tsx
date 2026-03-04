import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, User, 
  Instagram, Facebook, MessageCircle, 
  Search, ChevronDown, MapPin, X,
  Truck, CreditCard, Moon, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackSearch } from '../services/analytics';

interface LayoutProps {
  children: ReactNode;
  settings?: any;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export default function Layout({ children, settings, isAuthenticated, onLogout, searchTerm, onSearchChange }: LayoutProps) {
  const storeName = settings?.store_name || 'Minha Loja Vitrine';
  const [modalType, setModalType] = useState<'delivery' | 'payment' | 'about' | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to show after page load
      const timer = setTimeout(() => setShowCookieBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = (type: 'all' | 'necessary') => {
    localStorage.setItem('cookie_consent', type);
    setShowCookieBanner(false);
  };

  // Apply Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Update Title and Favicon
  useEffect(() => {
    document.title = storeName;

    const faviconUrl = settings?.store_logo || 'https://i.imgur.com/6NO1exF.png';
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  }, [storeName, settings?.store_logo]);

  const getModalContent = () => {
    if (modalType === 'delivery') {
      return settings?.store_delivery || 'Informações de entrega não disponíveis.';
    }
    if (modalType === 'payment') {
      return settings?.store_payment || 'Informações de pagamento não disponíveis.';
    }
    if (modalType === 'about') {
      return settings?.store_description || "A Fernanda Store é dedicada a oferecer o melhor da moda feminina contemporânea. Nossa missão é realçar a beleza e a confiança de cada mulher através de peças selecionadas com carinho e atenção aos detalhes.\n\nLocalizada em Serra/ES, trazemos as últimas tendências com qualidade superior e atendimento personalizado.\n\n📍 Endereço: Serra, ES\n📲 WhatsApp: (27) 99820-0474\n🕒 Horário de atendimento: Segunda a Sábado das 09:00 às 18:00.";
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-white font-sans selection:bg-brand-accent/30">
      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-brand-white rounded-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                      {modalType === 'delivery' ? <Truck size={24} /> : modalType === 'payment' ? <CreditCard size={24} /> : <ShoppingBag size={24} />}
                    </div>
                    <h3 className="text-xl font-display font-medium uppercase tracking-tight italic">
                      {modalType === 'delivery' ? 'Formas de Entrega' : modalType === 'payment' ? 'Formas de Pagamento' : 'Sobre Nós'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setModalType(null)}
                    className="w-10 h-10 bg-brand-gray hover:bg-stone-200 rounded-full flex items-center justify-center text-stone-500 transition-colors flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="text-stone-600 leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base">
                  {getModalContent()}
                </div>
                <button 
                  onClick={() => setModalType(null)}
                  className="w-full mt-8 btn-secondary"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Top Utility Bar */}
      <div className="bg-brand-gray border-b border-brand-border py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-normal sm:tracking-[0.15em] text-stone-500 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-stone-400 hidden sm:inline">Nossas Redes</span>
              <div className="flex items-center gap-2.5">
                {settings?.social_facebook && (
                  <a href={settings.social_facebook.startsWith('http') ? settings.social_facebook : `https://facebook.com/${settings.social_facebook}`} target="_blank" rel="noreferrer" className="hover:text-brand-black transition-colors">
                    <Facebook size={12} />
                  </a>
                )}
                {settings?.social_instagram && (
                  <a href={settings.social_instagram.startsWith('http') ? settings.social_instagram : `https://instagram.com/${settings.social_instagram}`} target="_blank" rel="noreferrer" className="hover:text-brand-black transition-colors">
                    <Instagram size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Mobile Status */}
            <div className="flex lg:hidden items-center gap-2 border-l border-stone-200 pl-3 ml-3 sm:pl-4 sm:ml-4 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-[9px] font-black text-brand-black whitespace-nowrap">{settings?.store_hours || '08:00 - 18:00'}</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="hover:text-brand-black transition-colors cursor-pointer flex items-center gap-2"
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setModalType('about')} className="hover:text-brand-black transition-colors cursor-pointer">SOBRE NÓS</button>
            {settings?.store_location ? (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.store_location)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-brand-black transition-colors"
              >
                Localização
              </a>
            ) : (
              <Link to="#" className="hover:text-brand-black transition-colors">Localização</Link>
            )}
            <a href="#contato" className="hover:text-brand-black transition-colors">Contato</a>
            {isAuthenticated ? (
              <button onClick={onLogout} className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">Sair</button>
            ) : (
              <Link to="/login" className="hover:text-brand-black transition-colors">Painel</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-brand-white/90 backdrop-blur-md border-b border-brand-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 md:gap-4 group flex-shrink-0">
            <div className="relative">
              {(settings?.store_logo || isDarkMode) ? (
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden border-2 border-brand-accent/20 group-hover:border-brand-accent transition-colors duration-500 shadow-lg">
                  <img 
                    src={settings?.store_logo || 'https://i.imgur.com/W0Q46wl.jpeg'} 
                    alt={storeName} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 md:h-16 md:w-16 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-accent/20 group-hover:rotate-6 transition-transform">
                  <ShoppingBag size={24} className="md:w-8 md:h-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-display italic font-medium text-xl md:text-3xl tracking-tight text-brand-black dark:text-white leading-none">
                FERNANDA STORE
              </span>
              <span className="text-[9px] md:text-[11px] font-sans font-bold text-stone-400 dark:text-stone-500 tracking-[0.3em] uppercase mt-1">
                MODA FEMININA
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-black transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="O que você está procurando?" 
                className="w-full bg-brand-gray border border-transparent focus:border-brand-black/10 focus:bg-brand-white px-12 py-3.5 rounded-2xl outline-none transition-all font-medium text-sm text-brand-black placeholder:text-stone-400"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onBlur={() => trackSearch(searchTerm || '')}
              />
            </div>
          </div>

          {/* Status / Hours */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-6 mr-4 border-r border-brand-border pr-8">
              <Link to="/" className="text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-accent transition-colors">Coleções</Link>
              <Link to="/?category=Novidades" className="text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-accent transition-colors">Novidades</Link>
              <Link to="/ofertas" className="text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-accent transition-colors">Sale</Link>
              <Link to={isAuthenticated ? "/admin" : "/login"} className={`text-xs font-bold uppercase tracking-widest transition-colors ${isAuthenticated ? 'text-brand-accent hover:text-brand-accent/80' : 'text-brand-black hover:text-brand-accent'}`}>
                Painel
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Status da Loja</span>
                <div className="flex items-center gap-2 text-sm font-bold text-brand-black">
                  <span>{settings?.store_hours || 'Aberto das 08:00 às 18:00'}</span>
                  <ChevronDown size={14} className="text-stone-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Icons */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-stone-400 hover:text-brand-black transition-colors">
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="text-stone-400 hover:text-brand-black transition-colors">
              {showMobileSearch ? <X size={22} /> : <Search size={22} />}
            </button>
            <Link to={isAuthenticated ? "/admin" : "/login"} className="text-stone-400 hover:text-brand-black transition-colors">
              <User size={22} />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-brand-border bg-brand-white"
            >
              <div className="px-4 py-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="O que você está procurando?" 
                    className="w-full bg-brand-gray border border-transparent focus:border-brand-black/10 focus:bg-white px-12 py-3.5 rounded-2xl outline-none transition-all font-medium text-sm"
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onBlur={() => trackSearch(searchTerm || '')}
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-brand-border/50 bg-brand-white/50 backdrop-blur-sm">
          <nav className="flex items-center justify-center gap-8 py-3 px-4">
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-brand-black hover:text-brand-blue transition-colors">Produtos</Link>
            <Link to="/?category=Novidades" className="text-[10px] font-bold uppercase tracking-widest text-brand-black hover:text-brand-blue transition-colors">Novidades</Link>
            <Link to="/ofertas" className="text-[10px] font-bold uppercase tracking-widest text-brand-black hover:text-brand-blue transition-colors">Ofertas</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer id="contato" className="bg-[#050505] text-stone-400 py-16 md:py-28 mt-12 md:mt-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            <div id="sobre" className="lg:col-span-4 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-2xl">
                  {settings?.store_logo ? (
                    <img src={settings.store_logo} alt={storeName} className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://i.imgur.com/W0Q46wl.jpeg" alt={storeName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-display italic font-medium text-2xl md:text-3xl tracking-tight leading-none">
                    FERNANDA STORE
                  </span>
                  <span className="text-[10px] md:text-[11px] font-sans font-bold text-brand-accent tracking-[0.4em] uppercase mt-2">
                    MODA FEMININA
                  </span>
                </div>
              </div>
              
              <p className="text-sm md:text-base leading-relaxed font-medium opacity-60 max-w-sm">
                Sua boutique de moda feminina em Serra/ES. Elegância, estilo e sofisticação em cada peça, pensada para a mulher contemporânea.
              </p>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setModalType('delivery')}
                  className="btn-ghost !bg-white/5 !border !border-white/10 !text-white hover:!bg-brand-accent hover:!text-white hover:!border-brand-accent !px-5 !py-3 !rounded-xl"
                >
                  <Truck size={16} />
                  Entrega
                </button>
                <button 
                  onClick={() => setModalType('payment')}
                  className="btn-ghost !bg-white/5 !border !border-white/10 !text-white hover:!bg-brand-accent hover:!text-white hover:!border-brand-accent !px-5 !py-3 !rounded-xl"
                >
                  <CreditCard size={16} />
                  Pagamento
                </button>
              </div>
            </div>

            {/* Links Section */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-display font-bold uppercase tracking-[0.2em] text-[11px] mb-8 opacity-40">Informações</h4>
              <nav className="flex flex-col gap-5 text-sm font-medium">
                <button onClick={() => setModalType('about')} className="text-left hover:text-brand-accent transition-colors">Sobre nós</button>
                <button onClick={() => setModalType('payment')} className="text-left hover:text-brand-accent transition-colors">Pagamento</button>
                <button onClick={() => setModalType('delivery')} className="text-left hover:text-brand-accent transition-colors">Entrega</button>
                <Link to="/login" className="hover:text-brand-accent transition-colors">Área do Lojista</Link>
              </nav>
            </div>

            {/* Social Section */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-display font-bold uppercase tracking-[0.2em] text-[11px] mb-8 opacity-40">Redes Sociais</h4>
              <nav className="flex flex-col gap-5 text-sm font-medium">
                {settings?.social_instagram ? (
                  <a href={settings.social_instagram.startsWith('http') ? settings.social_instagram : `https://instagram.com/${settings.social_instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-brand-accent transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
                      <Instagram size={18} />
                    </div>
                    <span>Instagram</span>
                  </a>
                ) : (
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-brand-accent transition-colors group opacity-40">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Instagram size={18} />
                    </div>
                    <span className="italic">Instagram (em breve)</span>
                  </a>
                )}
                {settings?.social_facebook ? (
                  <a href={settings.social_facebook.startsWith('http') ? settings.social_facebook : `https://facebook.com/${settings.social_facebook}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-brand-accent transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
                      <Facebook size={18} />
                    </div>
                    <span>Facebook</span>
                  </a>
                ) : (
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-brand-accent transition-colors group opacity-40">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Facebook size={18} />
                    </div>
                    <span className="italic">Facebook (em breve)</span>
                  </a>
                )}
              </nav>
            </div>

            {/* Contact Section */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-display font-bold uppercase tracking-[0.2em] text-[11px] mb-8 opacity-40">Atendimento</h4>
              <div className="flex flex-col gap-4">
                <a 
                  href="https://wa.me/5527998200474" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-emerald-500/10 border border-white/10 px-6 py-4 rounded-2xl transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <MessageCircle size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-white mb-0.5">WhatsApp</span>
                    <span className="text-white font-bold text-sm tracking-tight">27 99820-0474</span>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-brand-accent/10 border border-white/10 px-6 py-4 rounded-2xl transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-accent/20 text-brand-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-white mb-0.5">Localização</span>
                    <span className="text-white font-bold text-xs tracking-tight">{storeName}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-20 md:mt-32 pt-10 border-t border-white/5 flex flex-col xl:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
            <p className="whitespace-nowrap">© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
            <p className="normal-case tracking-normal opacity-80 text-[10px] max-w-2xl text-center xl:text-right leading-relaxed">
              Privacidade Garantida: Tratamos seus dados com total segurança e transparência, seguindo a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🍪</span>
                  <h3 className="text-lg font-bold text-brand-black dark:text-white">Valorizamos sua privacidade e experiência!</h3>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Na Fernanda Store, utilizamos cookies e o Google Analytics para entender quais peças são as favoritas das nossas clientes. Isso nos ajuda a oferecer coleções melhores e ofertas exclusivas.
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-2 font-medium">
                  Seus dados são tratados com total segurança conforme a LGPD. Você aceita nos ajudar a melhorar sua experiência?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
                <button
                  onClick={() => handleAcceptCookies('necessary')}
                  className="btn-ghost"
                >
                  Apenas Necessários
                </button>
                <button
                  onClick={() => handleAcceptCookies('all')}
                  className="btn-primary"
                >
                  Aceitar Todos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
