

import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import type { Theme } from '../types';
import { ReportTable } from './ExpenseTable';

interface ChartProps {
  data: Array<Record<string, string | number>>;
  theme: Theme;
  customChartColors?: string[] | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const labelStr = String(label);
      const formattedLabel = labelStr === '0'
        ? 'Inversión Inicial'
        : labelStr.startsWith('A') 
            ? labelStr.replace('A', 'Año ').replace(' M', ', Mes ') 
            : `Año ${labelStr}`;
      
      return (
        <div className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg" role="tooltip">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{formattedLabel}</p>
          <div className="space-y-1">
            {payload.map((entry: any) => (
              <div key={`item-${entry.name}`} className="flex items-center text-sm">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color || entry.fill }}></span>
                <span className="text-gray-600 dark:text-gray-300 flex-grow">{entry.name}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
};

const CustomBarTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg" role="tooltip">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{`Año ${label}`}</p>
          <div className="space-y-1">
              {payload.slice().reverse().map((entry: any) => ( // Reverse to show top of stack first
                <div key={`item-${entry.name}`} className="flex items-center text-sm">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.fill }}></span>
                  <span className="text-gray-600 dark:text-gray-300 flex-grow">{entry.name}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(entry.value)}</span>
                </div>
              ))}
          </div>
          <hr className="my-2 border-gray-300 dark:border-gray-600" />
          <div className="flex justify-between items-center font-semibold text-gray-800 dark:text-gray-200 text-sm">
            <span>Total Ventas:</span>
            <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}</span>
          </div>
        </div>
      );
    }
    return null;
};

export const FinancialChart: React.FC<ChartProps> = ({ data, theme, customChartColors }) => {
  const colors = customChartColors || theme.colors.chart;
  return (
    <div id="annual-cashflow-chart" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="year" tickFormatter={(value) => `Año ${value}`} tick={{ fill: '#9CA3AF' }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}} />
                <Legend />
                <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors[1]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors[1]} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="netCashFlow" name="Flujo de Caja Neto" stroke={colors[0]} fillOpacity={1} fill="url(#colorNet)" />
                <Area type="monotone" dataKey="cumulativeCashFlow" name="Flujo Acumulado" stroke={colors[1]} fillOpacity={1} fill="url(#colorCumulative)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export const CostBenefitChart: React.FC<ChartProps> = ({ data, theme }) => {
  return (
    <div id="cost-benefit-chart" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="year" tickFormatter={(value) => `Año ${value}`} tick={{ fill: '#9CA3AF' }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}} />
                <Legend />
                <defs>
                    <linearGradient id="colorBenefits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.colors.positive} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.colors.positive} stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.colors.negative} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.colors.negative} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cumulativeBenefits" name="Beneficios Acumulados" stroke={theme.colors.positive} fillOpacity={1} fill="url(#colorBenefits)" />
                <Area type="monotone" dataKey="cumulativeCosts" name="Costos Acumulados" stroke={theme.colors.negative} fillOpacity={1} fill="url(#colorCosts)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export const MonthlyCashFlowChart: React.FC<ChartProps> = ({ data, theme }) => {
    return (
      <div id="monthly-cashflow-chart" style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
              <AreaChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} interval={data.length > 24 ? 5 : 2} angle={-30} textAnchor="end" height={50}/>
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}} />
                  <Legend wrapperStyle={{ paddingTop: 20 }}/>
                  <defs>
                      <linearGradient id="colorMonthlyNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.colors.chart[0]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.colors.chart[0]} stopOpacity={0}/>
                      </linearGradient>
                       <linearGradient id="colorMonthlyCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.colors.chart[1]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.colors.chart[1]} stopOpacity={0}/>
                      </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="netCashFlow" name="Flujo Neto Mensual" stroke={theme.colors.chart[0]} fillOpacity={1} fill="url(#colorMonthlyNet)" />
                  <Area type="monotone" dataKey="cumulativeCashFlow" name="Flujo Acumulado Mensual" stroke={theme.colors.chart[1]} fillOpacity={1} fill="url(#colorMonthlyCumulative)" />
              </AreaChart>
          </ResponsiveContainer>
      </div>
    );
  };

export const CompositionChart: React.FC<{ data: any[], theme: Theme, customChartColors?: string[] | null }> = ({ data, theme, customChartColors }) => {
    const colors = customChartColors || theme.colors.chart;
    return (
      <div id="composition-chart" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tickFormatter={(value) => `Año ${value}`} tick={{ fill: '#9CA3AF' }} />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
            <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}}/>
            <Legend />
            <Bar dataKey="grossProfit" stackId="a" name="U. Bruta" fill={colors[0]} />
            <Bar dataKey="fixedCosts" stackId="a" name="C. Fijos" fill={colors[1]} />
            <Bar dataKey="variableCosts" stackId="a" name="C. Variables" fill={colors[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
export const SalesChart: React.FC<{ data: any[], theme: Theme }> = ({ data, theme }) => {
    return (
      <div id="sales-chart" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tickFormatter={(value) => `Año ${value}`} tick={{ fill: '#9CA3AF' }} />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}}/>
            <Legend />
            <Bar dataKey="sales" name="Ventas" fill={theme.colors.chart[1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
export const BreakEvenAnalysisTable: React.FC<{ data: any, theme: Theme }> = ({ data, theme }) => {
    const { annualSummaries, monthlyBreakEvenData } = data;
    
    const annualDataForTable = annualSummaries.map((s: any) => ({
        ...s.breakEven,
        bepAmount: isFinite(s.breakEven.bepAmount) ? s.breakEven.bepAmount : 'N/A',
        bepPercentage: isFinite(s.breakEven.bepPercentage) ? `${s.breakEven.bepPercentage.toFixed(1)}%` : 'N/A',
    }));

    const monthlyDataForTable = monthlyBreakEvenData.map((m: any) => ({
        ...m,
        bepAmount: isFinite(m.bepAmount) ? m.bepAmount : 'N/A',
        bepPercentage: isFinite(m.bepPercentage) ? `${m.bepPercentage.toFixed(1)}%` : 'N/A',
    }));
    
    return (
        <div id="breakeven-table">
            <ReportTable
                headers={['Año', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
                annualData={annualDataForTable}
                keys={['year', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
                monthlyData={monthlyDataForTable}
                monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
                monthlyKeys={['month', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
            />
        </div>
    );
};

export const AnnualNPVChart: React.FC<{ data: any[], theme: Theme, customChartColors?: string[] | null }> = ({ data, theme, customChartColors }) => {
    const colors = customChartColors || [theme.colors.positive, theme.colors.negative];
    return (
      <div id="annual-npv-chart" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tickFormatter={(value) => value === 0 ? 'Inv.' : `Año ${value}`} tick={{ fill: '#9CA3AF' }} />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}}/>
            <Legend />
            <ReferenceLine y={0} stroke="#6c757d" />
            <Bar dataKey="discountedCashFlow" name="VPN Anual">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.discountedCashFlow >= 0 ? colors[0] : colors[1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
export const PaybackPeriodChart: React.FC<ChartProps> = ({ data, theme, customChartColors }) => {
  const colors = customChartColors || [theme.colors.positive, theme.colors.negative];
  return (
    <div id="payback-chart" style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="year" tickFormatter={(value) => (value === 0 ? 'Inv.' : `Año ${value}`)} tick={{ fill: '#9CA3AF' }} />
          <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' }).format(value as number)} tick={{ fill: '#9CA3AF' }} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(206, 213, 224, 0.2)'}} />
          <Legend />
          <ReferenceLine y={0} stroke="#6c757d" strokeDasharray="5 5" />
          <Bar dataKey="cumulativeCashFlow" name="Flujo Acumulado">
            {data.map((entry, index) => (
              // FIX: Ensure cumulativeCashFlow is a number before comparison to resolve TypeScript error.
              <Cell key={`cell-${index}`} fill={Number(entry.cumulativeCashFlow) >= 0 ? colors[0] : colors[1]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};