import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await api.login(email, password);
      onLogin(token);
      navigate('/admin');
    } catch (err) {
      setError('Usuário ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-brand-gray">
      <div className="max-w-md w-full bg-brand-white rounded-3xl shadow-2xl border border-brand-black/5 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-black text-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-brand-black uppercase tracking-tighter italic">Área do Lojista</h1>
          <p className="text-stone-500 mt-2 font-medium">Gerencie seus produtos Fernanda Store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-shake">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-wide">Login</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-brand-gray border border-brand-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                placeholder="Login"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-wide">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-brand-gray border border-brand-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary !bg-brand-yellow !text-brand-black hover:!bg-brand-yellow/80"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
