import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function AdminLogin({ onLogin, settings }: { onLogin: (token: string) => void, settings?: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const storeName = settings?.store_name || 'Fernanda Store';
  const storeLogo = settings?.store_logo || 'https://i.imgur.com/W0Q46wl.jpeg';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await api.login(email, password);
      onLogin(token);
      navigate('/admin');
    } catch (err) {
      setError('Usuário ou senha incorretos. Verifique seus dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background with Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Animated Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-accent/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-accent/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/20 p-8 md:p-12 overflow-hidden">
          {/* Top Branding */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-accent/10 shadow-xl mx-auto bg-white">
                {settings?.store_logo ? (
                  <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-accent flex items-center justify-center text-white">
                    <ShoppingBag size={40} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-accent text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <Lock size={18} />
              </div>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-display font-black text-brand-black uppercase tracking-tighter italic leading-none">
              Painel do Lojista
            </h1>
            <p className="text-stone-500 mt-3 font-medium text-sm md:text-base">
              Bem-vinda de volta! Acesse sua vitrine <span className="text-brand-accent font-bold">{storeName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm border border-red-100"
                >
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                  <p className="font-medium leading-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 mb-2 uppercase tracking-[0.2em] ml-1">Login de Acesso</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-accent transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-brand-gray border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all font-medium text-brand-black placeholder:text-stone-300"
                    placeholder="Seu usuário"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 mb-2 uppercase tracking-[0.2em] ml-1">Senha Secreta</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-accent transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-brand-gray border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all font-medium text-brand-black placeholder:text-stone-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-5 group relative overflow-hidden"
            >
              <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Entrar no Painel
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-brand-gray text-center">
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
              Acesso restrito a administradores
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-8 text-white/40 text-[10px] font-bold uppercase tracking-widest">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Voltar para a Loja</button>
          <span className="opacity-20">•</span>
          <span className="cursor-default">Suporte Técnico</span>
        </div>
      </motion.div>
    </div>
  );
}
