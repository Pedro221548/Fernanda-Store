import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { AlertTriangle, Search, MousePointer, Globe, MessageCircle, RefreshCw, Clock, ArrowLeft, Users, Smartphone, Activity, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface StrategyData {
  topSearchTerms: { term: string; count: number }[];
  topClickedProducts: { name: string; clicks: number; conversion: number }[];
  trafficSource: { name: string; value: number; color: string }[];
  trafficByCity: { name: string; value: number }[]; // Actually Device Types
  whatsappConversion: { name: string; views: number; contacts: number }[];
  totalEvents: number;
}

export default function AdminStrategy({ token }: { token: string }) {
  const navigate = useNavigate();
  const [data, setData] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      // Clear cache if manual refresh
      if (isRefresh) (api as any)._strategyCache = null;
      
      const result = await api.getStrategyData(token);
      setData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load strategy data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Memoize chart calculations for better performance
  const chartMetrics = useMemo(() => {
    if (!data) return { totalTraffic: 0, pieGradient: '' };
    
    const totalTraffic = data.trafficSource.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;
    const gradientParts = data.trafficSource.map(source => {
      const percentage = totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0;
      const start = currentAngle;
      const end = currentAngle + percentage;
      currentAngle = end;
      return `${source.color} ${start}% ${end}%`;
    });
    
    return {
      totalTraffic,
      pieGradient: `conic-gradient(${gradientParts.join(', ')})`
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-bold animate-pulse uppercase tracking-widest text-xs">Processando Inteligência...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 p-4 md:p-12 font-sans text-stone-800 dark:text-stone-200">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Header & Warning */}
        <div className="flex flex-col gap-4 border-b border-stone-100 dark:border-stone-800 pb-6 md:pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/admin')}
                className="btn-ghost !p-2 flex-shrink-0"
                title="Voltar ao Painel"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <h1 className="text-xl md:text-3xl font-display font-black uppercase tracking-tight text-stone-900 dark:text-white leading-tight">
                Estratégia <span className="hidden xs:inline">de Negócio</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => loadData(true)}
                disabled={refreshing}
                className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex-shrink-0 ${refreshing ? 'animate-spin text-brand-yellow' : 'text-stone-400'}`}
                title="Atualizar Dados"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium">
                Monitoramento de inteligência para tomada de decisão.
              </p>
              {lastUpdated && (
                <div className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-stone-400 uppercase bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded-md border border-stone-100 dark:border-stone-800">
                  <Clock size={10} />
                  <span>Atualizado: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] md:text-sm font-bold shadow-sm self-start sm:self-auto">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <span>Área Restrita: Fernanda Store</span>
            </div>
          </div>
        </div>

        {/* 1. Quantas pessoas acessam seu site */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-black dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 text-brand-yellow-dark flex items-center justify-center">
              <Users size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">1. Quantas pessoas acessam seu site</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-lg shadow-stone-200/50 dark:shadow-black/20 border border-stone-100 dark:border-stone-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Total de Interações</p>
                  <h3 className="text-4xl font-black text-brand-black dark:text-white">{data.totalEvents}</h3>
                </div>
                <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-400">
                  <Activity size={24} />
                </div>
              </div>
              <p className="mt-4 text-xs text-stone-400 leading-relaxed">
                Este número representa o total de ações (buscas, cliques, visualizações) registradas recentemente. Um volume maior indica maior interesse e tráfego na loja.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* 2. De onde elas vêm */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-brand-black dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Globe size={18} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">2. De onde elas vêm</h2>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-lg shadow-stone-200/50 dark:shadow-black/20 border border-stone-100 dark:border-stone-800 h-full"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div 
                  className="w-40 h-40 rounded-full relative"
                  style={{ background: chartMetrics.totalTraffic > 0 ? chartMetrics.pieGradient : '#f5f5f4' }}
                >
                  <div className="absolute inset-0 m-auto w-24 h-24 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center flex-col shadow-inner">
                    <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase">Origem</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
                  {data.trafficSource.length > 0 ? (
                    data.trafficSource.map((source, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-100 dark:border-stone-700">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: source.color }} />
                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase">{source.name}</span>
                        <span className="text-xs font-medium text-stone-400 border-l border-stone-200 dark:border-stone-600 pl-2 ml-1">{source.value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400 italic">Sem dados de origem.</span>
                  )}
                </div>
              </div>
            </motion.div>
          </section>

          {/* 3. Como acessam */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-brand-black dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Smartphone size={18} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">3. Como acessam</h2>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-lg shadow-stone-200/50 dark:shadow-black/20 border border-stone-100 dark:border-stone-800 h-full"
            >
              <div className="space-y-6 py-4">
                {data.trafficByCity.length > 0 ? (
                  data.trafficByCity.map((device, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                          {device.name === 'Mobile' ? <Smartphone size={16} /> : <Globe size={16} />}
                          {device.name === 'Mobile' ? 'Celular (Mobile)' : 'Computador (Desktop)'}
                        </span>
                        <span className="text-brand-black dark:text-white">{device.value} acessos</span>
                      </div>
                      <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${device.name === 'Mobile' ? 'bg-brand-blue' : 'bg-stone-400'}`}
                          style={{ width: chartMetrics.totalTraffic > 0 ? `${(device.value / chartMetrics.totalTraffic) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-400 italic text-center">Sem dados de dispositivos.</p>
                )}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mt-6">
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                    💡 <strong>Dica:</strong> Se a maioria dos acessos for via celular, certifique-se de que seus banners e descrições de produtos estejam otimizados para telas pequenas.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>

        {/* 4. O que elas fazem */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-black dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MousePointer size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">4. O que elas fazem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buscas */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-lg shadow-stone-200/50 dark:shadow-black/20 border border-stone-100 dark:border-stone-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <Search size={20} className="text-stone-400" />
                <h3 className="font-bold text-stone-900 dark:text-white">O que estão buscando?</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.topSearchTerms.length > 0 ? (
                  data.topSearchTerms.map((item, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-2 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold border border-stone-100 dark:border-stone-700 flex items-center gap-2"
                    >
                      {item.term} 
                      <span className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 px-1.5 py-0.5 rounded text-[10px]">{item.count}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">Nenhuma busca registrada.</p>
                )}
              </div>
            </motion.div>

            {/* Produtos Vistos */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-lg shadow-stone-200/50 dark:shadow-black/20 border border-stone-100 dark:border-stone-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <MousePointer size={20} className="text-stone-400" />
                <h3 className="font-bold text-stone-900 dark:text-white">O que estão vendo?</h3>
              </div>
              <div className="space-y-3">
                {data.topClickedProducts.length > 0 ? (
                  data.topClickedProducts.map((prod, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-black text-stone-300 dark:text-stone-600 w-4">#{idx + 1}</span>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{prod.name}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md whitespace-nowrap">
                        {prod.clicks} views
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic">Nenhum clique registrado.</p>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5. Conversões */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-black dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Target size={18} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">5. Conversões</h2>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-lg shadow-stone-200/50 dark:shadow-black/20 border border-stone-100 dark:border-stone-800"
          >
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle size={20} className="text-green-500" />
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white">Funil de WhatsApp</h3>
                <p className="text-xs text-stone-400 uppercase tracking-widest">De visualização para contato</p>
              </div>
            </div>
            
            <div className="w-full space-y-6">
              {data.whatsappConversion.length > 0 ? (
                data.whatsappConversion.map((item, idx) => {
                  const maxVal = Math.max(...data.whatsappConversion.map(i => i.views));
                  const viewWidth = maxVal > 0 ? (item.views / maxVal) * 100 : 0;
                  const contactWidth = maxVal > 0 ? (item.contacts / maxVal) * 100 : 0;
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                        <span className="truncate pr-4">{item.name}</span>
                        <div className="flex gap-4 flex-shrink-0">
                          <span className="text-stone-400 dark:text-stone-500">{item.views} visualizações</span>
                          <span className="text-green-600 dark:text-green-400">{item.contacts} contatos</span>
                        </div>
                      </div>
                      <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden relative">
                        {/* Views Bar */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-stone-300 dark:bg-stone-700 rounded-full transition-all duration-1000" 
                          style={{ width: `${viewWidth}%` }}
                        />
                        {/* Contacts Bar (Overlay) */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-green-500 rounded-full opacity-90 transition-all duration-1000 delay-100" 
                          style={{ width: `${contactWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-stone-400 italic text-center py-8">Dados insuficientes para gerar o funil de conversão.</p>
              )}
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
