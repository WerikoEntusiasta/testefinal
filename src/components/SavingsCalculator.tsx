import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  Gauge, 
  Sparkles, 
  Dumbbell,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { sanitizeOverrides } from '../lib/api';

interface SavingsCalculatorProps {
  productId?: string;
}

export default function SavingsCalculator({ productId = 'varrefort-s' }: SavingsCalculatorProps) {
  const [hoursPerYear, setHoursPerYear] = useState<number>(300); // Default worked hours per year
  const [dieselPrice, setDieselPrice] = useState<number>(7.00);  // Default diesel price per Liter

  // Overrides state loaded dynamically
  const [calcOverrides, setCalcOverrides] = useState({
    competitorHourlyLiters: productId === 'varremax-x' ? 8.5 : productId === 'pasiparts' ? 5.2 : 5.0,
    ourHourlyLiters: productId === 'varremax-x' ? 6.0 : productId === 'pasiparts' ? 3.6 : 3.5,
    name: productId === 'varremax-x' ? 'RecolheFort-C' : productId === 'pasiparts' ? 'Peças de Reposição & Suporte Técnico' : 'VarreFort-S'
  });

  React.useEffect(() => {
    const loadValues = () => {
      try {
        const stored = localStorage.getItem('agropasi_main_products_overrides');
        const defComp = productId === 'varremax-x' ? 8.5 : productId === 'pasiparts' ? 5.2 : 5.0;
        const defOur = productId === 'varremax-x' ? 6.0 : productId === 'pasiparts' ? 3.6 : 3.5;
        const defName = productId === 'varremax-x' ? 'RecolheFort-C' : productId === 'pasiparts' ? 'Peças de Reposição & Suporte Técnico' : 'VarreFort-S';

        if (stored) {
          const overrides = sanitizeOverrides(JSON.parse(stored));
          const current = overrides[productId] || {};
          setCalcOverrides({
            competitorHourlyLiters: current.competitorHourlyLiters !== undefined ? Number(current.competitorHourlyLiters) : defComp,
            ourHourlyLiters: current.ourHourlyLiters !== undefined ? Number(current.ourHourlyLiters) : defOur,
            name: current.name || defName
          });
        } else {
          setCalcOverrides({
            competitorHourlyLiters: defComp,
            ourHourlyLiters: defOur,
            name: defName
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadValues();
    window.addEventListener('storage_updated', loadValues);
    return () => window.removeEventListener('storage_updated', loadValues);
  }, [productId]);

  const competitorHourlyLiters = calcOverrides.competitorHourlyLiters;
  const varrefortHourlyLiters = calcOverrides.ourHourlyLiters;
  const hourlySavingsLiters = Math.max(0.1, Number((competitorHourlyLiters - varrefortHourlyLiters).toFixed(2)));

  // Dynamic calculations based on user input
  const annualSavingsLiters = useMemo(() => {
    return Number((hourlySavingsLiters * hoursPerYear).toFixed(0));
  }, [hoursPerYear]);

  const hourlySavingsBrl = useMemo(() => {
    return Number((hourlySavingsLiters * dieselPrice).toFixed(2));
  }, [dieselPrice]);

  const dailySavingsBrl = useMemo(() => {
    return Number((hourlySavingsBrl * 8).toFixed(2));
  }, [hourlySavingsBrl]);

  const annualSavingsBrl = useMemo(() => {
    return Number((annualSavingsLiters * dieselPrice).toFixed(2));
  }, [annualSavingsLiters, dieselPrice]);

  const benefits = [
    "Menor consumo de diesel",
    "Menor desgaste do motor",
    "Menor custo operacional",
    "Menor peso estrutural",
    "Compatível com tratores de diversas marcas",
    "Alto rendimento na cafeicultura"
  ];

  return (
    <section id="calculadora" className="py-20 bg-zinc-950 text-zinc-150 relative overflow-hidden font-sans scroll-mt-10">
      {/* Decorative background vectors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-[#d48743] border border-[#d48743] text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-3 font-mono">
            Quanto o {calcOverrides.name} pode economizar na sua lavoura?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-150 mb-4">
            Calcule sua Economia Real com o <span className="text-[#d48743]">{calcOverrides.name}</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            O {calcOverrides.name} opera entre 1.300 e 1.500 RPM — bem abaixo dos concorrentes que exigem até 2.100 RPM. Isso se traduz em menos diesel consumido, menos desgaste no motor e mais lucro no final da safra. Informe suas horas de trabalho e o preço do diesel para ver sua economia estimada.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Inputs & Specs Section */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center text-zinc-100 border-b border-zinc-800 pb-3 font-sans">
                <Fuel className="h-5 w-5 mr-3 text-[#d48743]" />
                1. Configurações da sua Operação
              </h3>

              {/* Input: Hours run per year */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="year-hours-range" className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Horas de Serviço por Ano
                  </label>
                  <span className="text-xs font-bold text-white bg-[#d48743] border border-[#d48743] px-2.5 py-0.5 rounded font-mono">
                    {hoursPerYear} Horas / Ano
                  </span>
                </div>
                <input
                  id="year-hours-range"
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={hoursPerYear}
                  onChange={(e) => setHoursPerYear(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-zinc-850 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] bg-zinc-950 p-2 rounded-lg border border-zinc-850 text-slate-400 font-mono">
                  <span>50h (Pequeno Produtor)</span>
                  <span>400h (Colheita Intensiva)</span>
                  <span>1000h (Frotas e Locadores)</span>
                </div>
              </div>

              {/* Input: Diesel price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="diesel-price-input" className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Valor do Óleo Diesel (R$/L)
                  </label>
                  <strong className="text-xs font-mono text-slate-200">R$ {dieselPrice.toFixed(2)}/L</strong>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-zinc-550 text-xs">R$</span>
                  </div>
                  <input
                    id="diesel-price-input"
                    type="number"
                    step="0.05"
                    min="1.00"
                    max="15.00"
                    value={dieselPrice}
                    onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-[#27272a] rounded-lg py-2.5 pl-8 pr-3 text-xs text-zinc-150 focus:outline-none focus:border-[#d48743] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Bullet Benefits */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1">Diferenciais do {calcOverrides.name}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-4 h-4 text-[#d48743] shrink-0 mt-0.5" />
                      <span className="text-slate-200 leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanatory Box on Engineering Specs */}
            <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-850 space-y-2.5 mt-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#d48743] shrink-0" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Tecnologia de Baixa Rotação</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                O {calcOverrides.name} foi desenvolvido sob rígido controle de processo industrial para otimizar o rendimento operacional de forma econômica.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Enquanto muitos equipamentos concorrentes exigem maior potência e rotação de trabalho, o {calcOverrides.name} aproveita melhor o torque do trator, reduzindo o consumo de combustível sem perder eficiência operacional.
              </p>
            </div>
          </div>

          {/* Results & Live Comparison Section */}
          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none">
              <Sparkles className="w-48 h-48 text-[#d48743]" />
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-6">
                <h3 className="text-lg font-bold text-zinc-150 flex items-center">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500 mr-2" />
                  Economia Estimada para sua Lavoura
                </h3>
                <span className="text-[10px] font-mono bg-emerald-800 text-white border border-emerald-700 px-2.5 py-1.5 rounded font-bold uppercase tracking-wide">
                  Retorno Garantido
                </span>
              </div>

              {/* Grand Total Benefit Display */}
              <div className="bg-zinc-950/90 border border-[#d48743]/30 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden mb-6 shadow-sm">
                <div className="absolute top-2 right-2 bg-[#d48743] px-2 py-0.5 rounded border border-[#d48743] text-[8px] font-bold uppercase tracking-wider text-white font-mono">
                  Economia Direta de Diesel
                </div>
                
                <span className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                  ECONOMIA FINANCEIRA ANUAL ESTIMADA
                </span>
                
                <h4 className="text-4xl sm:text-5xl font-mono font-bold text-[#d48743] tracking-tight">
                  R$ {annualSavingsBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                
                <div className="grid grid-cols-3 gap-2 text-center pt-3 text-[11px] border-t border-zinc-850">
                  <div className="text-slate-300">
                    <span className="block text-[9px] text-slate-400 uppercase leading-none mb-1">Por Hora</span>
                    <strong className="text-slate-200 text-xs font-mono">R$ {hourlySavingsBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="text-slate-300 border-x border-zinc-800 px-1">
                    <span className="block text-[9px] text-slate-400 uppercase leading-none mb-1">Por Dia (8h)</span>
                    <strong className="text-slate-200 text-xs font-mono font-bold">R$ {dailySavingsBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="text-slate-300">
                    <span className="block text-[9px] text-slate-400 uppercase leading-none mb-1">Combustível Salvo</span>
                    <strong className="text-[#d48743] text-xs font-mono">{annualSavingsLiters.toLocaleString('pt-BR')} L/ano</strong>
                  </div>
                </div>
              </div>

              {/* Exact comparison graph representation in CSS */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4.5 space-y-3 mb-6">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Comparativo de Consumo Fixo (Litragem / Hora):</span>
                
                <div className="space-y-3 text-xs text-slate-300">
                  {/* Competitor Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Equipamentos Concorrentes (Regime Comum ~2.100 RPM)</span>
                      <strong className="font-mono text-slate-300">{competitorHourlyLiters.toFixed(1)} L/h</strong>
                    </div>
                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                      <div className="bg-zinc-650 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  {/* VarreFort-S Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-250">Agropasi {calcOverrides.name}</span>
                      <strong className="font-mono text-[#d48743] font-bold">{varrefortHourlyLiters.toFixed(1)} L/h</strong>
                    </div>
                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="bg-[#d48743] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(varrefortHourlyLiters / competitorHourlyLiters) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white font-semibold bg-[#d48743] px-3 py-2 rounded-lg border border-[#d48743]">
                  <span>Diferença exata por hora de serviço:</span>
                  <span className="font-mono font-bold bg-[#d48743] px-2 py-0.5 rounded text-white">
                    - {hourlySavingsLiters.toFixed(1)} Litro(s) / hora (Até 30% de economia)
                  </span>
                </div>
              </div>

              {/* Example of Economy Box */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4.5 space-y-3">
                <span className="text-xs uppercase font-bold text-[#d48743] block">Exemplo de Economia (Referência de Mercado):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5 border-r border-zinc-800 pr-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Concorrência:</span>
                      <strong className="text-slate-200">{competitorHourlyLiters.toFixed(1)} L/h</strong>
                    </div>
                    <div className="flex justify-between text-[#d48743]">
                      <span>Agropasi {calcOverrides.name}:</span>
                      <strong>{varrefortHourlyLiters.toFixed(1)} L/h</strong>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800 flex justify-between text-slate-200 font-bold">
                      <span>Economia:</span>
                      <span className="text-[#d48743]">{hourlySavingsLiters.toFixed(1)} Litro(s) por hora</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <span className="text-[11px] block text-slate-200 font-semibold mb-1">Considerando o diesel a R$ 7,00/L:</span>
                    <div className="flex justify-between text-[11px]">
                      <span>Economia por hora:</span>
                      <strong className="text-slate-250 font-mono">R$ 10,50</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Economia por dia (8h):</span>
                      <strong className="text-slate-250 font-mono">R$ 84,00</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#d48743] font-bold">
                      <span>Economia em 100 dias:</span>
                      <strong className="text-[#d48743] font-mono">R$ 8.400,00</strong>
                    </div>
                  </div>
                </div>
              </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 space-y-4">
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                O Agropasi {calcOverrides.name} foi projetado visando máxima otimização operacional e economia de diesel. O equipamento trabalha de forma inteligente, aproveitando melhor o torque do trator e reduzindo drasticamente o consumo de óleo diesel, proporcionando menor custo operacional, menor desgaste do trator e maior rendimento de trabalho na cafeicultura.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[10px] text-slate-450 max-w-sm leading-normal">
                  Os valores acima são baseados em dados técnicos do {calcOverrides.name} em condições normais de operação. A economia real pode variar conforme o modelo do trator, regulagem do equipamento, topografia da lavoura e umidade do solo.
                </p>
                <a
                  href="#contato"
                  className="inline-flex items-center justify-center bg-[#262b3f] hover:bg-[#383f5c] text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all text-center whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  Garantir esses Benefícios no Meu Campo
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
