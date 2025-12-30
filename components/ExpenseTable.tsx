import React, { useState, useMemo } from 'react';
import type { Theme } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
    <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
);

const MonthlyDetailTable: React.FC<{ data: any[], headers: string[], keys: string[], showSalesPercentage?: boolean }> = ({ data, headers, keys, showSalesPercentage }) => (
    <tr className="bg-gray-50 dark:bg-gray-700/50">
        <td colSpan={headers.length + 2}>
            <div className="p-4">
                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
                        <tr>
                            {headers.map(h => <th key={h} scope="col" className="px-2 py-2 text-right first:text-left">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-600">
                                {keys.map(key => {
                                    const value = row[key];
                                    const isCurrency = typeof value === 'number' && key !== 'month' && key !== 'year';
                                    const isPercentage = key.toLowerCase().includes('percentage');
                                    const shouldShowPercentage = showSalesPercentage && isCurrency && key !== 'sales' && row.sales > 0;
                                    const percentage = shouldShowPercentage ? `(${(value / row.sales * 100).toFixed(1)}%)` : null;
                                    
                                    let displayValue;
                                    if (isCurrency) {
                                        displayValue = formatCurrency(value);
                                    } else if (isPercentage) {
                                        displayValue = isFinite(value) ? `${value.toFixed(1)}%` : 'N/A';
                                    } else {
                                        displayValue = value;
                                    }

                                    return (
                                        <td key={key} className={`px-2 py-2 text-right first:font-medium first:text-gray-900 first:dark:text-white first:text-left align-top ${value < 0 ? 'text-red-400' : ''}`}>
                                            <span>{displayValue}</span>
                                            {percentage && <span className="block text-gray-400 mt-1">{percentage}</span>}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </td>
    </tr>
);

const ViewModeSwitcher: React.FC<{
    currentMode: 'annual' | 'monthly';
    onModeChange: (mode: 'annual' | 'monthly') => void;
    showMonthlyOption: boolean;
}> = ({ currentMode, onModeChange, showMonthlyOption }) => {
    if (!showMonthlyOption) return null;

    return (
        <div className="flex justify-end p-2">
            <div className="flex rounded-md bg-gray-200 dark:bg-gray-600 p-0.5">
                <button
                    type="button"
                    onClick={() => onModeChange('annual')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${currentMode === 'annual' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    Anual
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('monthly')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${currentMode === 'monthly' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    Mensual (Paginado)
                </button>
            </div>
        </div>
    );
};

const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center gap-4 mt-4 text-sm">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>
            <span className="text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Siguiente
            </button>
        </div>
    );
};


export const ReportTable: React.FC<{
    headers: string[], 
    annualData: any[], 
    keys: string[],
    monthlyData: any[],
    monthlyHeaders: string[],
    monthlyKeys: string[],
    showSalesPercentage?: boolean,
}> = ({ headers, annualData, keys, monthlyData, monthlyHeaders, monthlyKeys, showSalesPercentage }) => {
    const [expandedYear, setExpandedYear] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
    const [currentPage, setCurrentPage] = useState(1);

    const ROWS_PER_PAGE = 12;

    const toggleYear = (year: number) => setExpandedYear(expandedYear === year ? null : year);
    
    const handleViewChange = (mode: 'annual' | 'monthly') => {
        setViewMode(mode);
        setCurrentPage(1);
        setExpandedYear(null);
    };

    const { paginatedMonthlyData, totalPages } = useMemo(() => {
        if (!monthlyData || monthlyData.length === 0) {
            return { paginatedMonthlyData: [], totalPages: 1 };
        }
        const total = Math.ceil(monthlyData.length / ROWS_PER_PAGE);
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return {
            paginatedMonthlyData: monthlyData.slice(startIndex, endIndex),
            totalPages: total,
        };
    }, [monthlyData, currentPage]);


    return (
        <div>
            <ViewModeSwitcher 
                currentMode={viewMode}
                onModeChange={handleViewChange}
                showMonthlyOption={monthlyData && monthlyData.length > 0}
            />
            <div className="overflow-x-auto">
                {viewMode === 'annual' ? (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-2 py-3 w-8"></th>
                                {headers.map(h => <th key={h} scope="col" className="px-4 py-3 text-right first:text-left">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {annualData.map((row, index) => (
                                <React.Fragment key={index}>
                                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-2 py-4">
                                        {monthlyData.length > 0 && row.year !== '0' &&
                                            <button onClick={() => toggleYear(row.year)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                                <ExpandIcon expanded={expandedYear === row.year} />
                                            </button>
                                            }
                                        </td>
                                        {keys.map((key) => {
                                            const value = row[key];
                                            const isCurrency = typeof value === 'number' && key !== 'year';
                                            const isPercentage = key.toLowerCase().includes('percentage');
                                            const shouldShowPercentage = showSalesPercentage && isCurrency && key !== 'sales' && row.sales > 0;
                                            const percentage = shouldShowPercentage ? `(${(value / row.sales * 100).toFixed(1)}%)` : null;

                                            let displayValue;
                                            if(isCurrency) {
                                                displayValue = formatCurrency(value);
                                            } else if(isPercentage) {
                                                displayValue = value;
                                            } else {
                                                displayValue = (value === 'N/A' || !value ? value : value.toString());
                                            }

                                            return (
                                                <td key={key} className={`px-4 py-2 text-right first:font-medium first:text-gray-900 first:dark:text-white first:text-left align-top ${typeof value === 'number' && value < 0 ? 'text-red-500' : ''}`}>
                                                    <span>{displayValue}</span>
                                                    {percentage && <span className="block text-xs text-gray-400 mt-1">{percentage}</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {expandedYear === row.year && (
                                        <MonthlyDetailTable 
                                            data={monthlyData.filter(m => m.year === row.year)}
                                            headers={monthlyHeaders}
                                            keys={monthlyKeys}
                                            showSalesPercentage={showSalesPercentage}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <>
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3">Año</th>
                                {monthlyHeaders.map(h => <th key={h} scope="col" className="px-4 py-3 text-right first:text-left">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMonthlyData.map((row, index) => (
                                <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{row.year}</td>
                                    {monthlyKeys.map(key => {
                                        const value = row[key];
                                        const isCurrency = typeof value === 'number' && key !== 'month' && key !== 'year';
                                        const isPercentage = key.toLowerCase().includes('percentage');
                                        const shouldShowPercentage = showSalesPercentage && isCurrency && key !== 'sales' && row.sales > 0;
                                        const percentage = shouldShowPercentage ? `(${(value / row.sales * 100).toFixed(1)}%)` : null;
                                        
                                        let displayValue;
                                        if (isCurrency) {
                                            displayValue = formatCurrency(value);
                                        } else if (isPercentage) {
                                            displayValue = isFinite(value) ? `${Number(value).toFixed(1)}%` : 'N/A';
                                        } else {
                                            displayValue = value;
                                        }

                                        return (
                                            <td key={key} className={`px-4 py-2 text-right first:font-medium first:text-gray-900 first:dark:text-white first:text-left align-top ${typeof value === 'number' && value < 0 ? 'text-red-500' : ''}`}>
                                                <span>{displayValue}</span>
                                                {percentage && <span className="block text-xs text-gray-400 mt-1">{percentage}</span>}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <PaginationControls 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                    </>
                )}
            </div>
        </div>
    );
}

const TabButton: React.FC<{active: boolean; onClick: () => void; children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap
        ${active 
            ? 'bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-white' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
    >{children}</button>
);

const CostHeatmap: React.FC<{ data: any[], theme: Theme }> = ({ data, theme }) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });

  const { matrix, rows, cols, min, max } = useMemo(() => {
    const rowsConfig = [
      { key: 'fixedCosts', label: 'C. Fijos' },
      { key: 'variableCosts', label: 'C. Variables' },
      { key: 'monthlyDepreciation', label: 'Depreciación' },
      { key: 'monthlyInterest', label: 'Intereses' },
      { key: 'taxes', label: 'Impuestos' },
    ];
    const colsLabels = data.map(d => `A${d.year}M${d.month}`);
    
    const matrixData = rowsConfig.map(row => 
      data.map(monthData => monthData[row.key] || 0)
    );
    
    const allValues = matrixData.flat();
    const positiveValues = allValues.filter(v => v > 0);
    const minVal = positiveValues.length > 0 ? Math.min(...positiveValues) : 0;
    const maxVal = positiveValues.length > 0 ? Math.max(...positiveValues) : 0;
    
    return { matrix: matrixData, rows: rowsConfig, cols: colsLabels, min: minVal, max: maxVal };
  }, [data]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };
  
  const startColor = { r: 243, g: 244, b: 246 }; // Tailwind gray-100
  const endColor = hexToRgb(theme.colors.negative) || { r: 239, g: 68, b: 68 };

  const getColorForValue = (value: number) => {
    if (value <= 0) return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`;
    if (min === max) return `rgb(${endColor.r}, ${endColor.g}, ${endColor.b})`;
    
    const logMax = Math.log(max);
    const logMin = Math.log(min);
    const logVal = Math.log(value);
    const intensity = (logVal - logMin) / (logMax - logMin);

    if (isNaN(intensity) || !isFinite(intensity)) return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`;

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * intensity);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * intensity);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMouseEnter = (e: React.MouseEvent, value: number, rowLabel: string, colLabel: string) => {
    setTooltip({
      visible: true,
      content: `<div class="font-bold">${rowLabel}</div><div>${colLabel}</div><div class="font-semibold mt-1">${formatCurrency(value)}</div>`,
      x: e.pageX,
      y: e.pageY,
    });
  };

  const handleMouseLeave = () => setTooltip({ ...tooltip, visible: false });

  const legendSteps = 5;
  const legendItems = Array.from({ length: legendSteps }, (_, i) => {
      const value = min + (i / (legendSteps - 1)) * (max - min);
      return { value, color: getColorForValue(value) };
  });

  return (
    <div className="relative">
      {tooltip.visible && (
        <div
          className="fixed p-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg text-xs z-50 pointer-events-none -translate-y-full -translate-x-1/2"
          style={{ top: tooltip.y - 10, left: tooltip.x }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
      <div className="overflow-x-auto pb-4">
        <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${cols.length}, minmax(40px, 1fr))`, gap: '2px', minWidth: `${cols.length * 42}px` }}>
          <div />
          {cols.map((col, i) => <div key={i} className="text-center text-xs font-medium py-1 text-gray-500 dark:text-gray-400">{col}</div>)}

          {matrix.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <div className="text-right text-xs font-medium pr-2 py-1 sticky left-0 bg-white dark:bg-gray-800 flex items-center justify-end">{rows[rowIndex].label}</div>
              {row.map((value, colIndex) => (
                <div
                  key={colIndex}
                  className="w-full h-8 rounded-sm cursor-pointer"
                  style={{ backgroundColor: getColorForValue(value) }}
                  onMouseMove={(e) => handleMouseEnter(e, value, rows[rowIndex].label, cols[colIndex])}
                  onMouseLeave={handleMouseLeave}
                  role="cell"
                  aria-label={`${rows[rowIndex].label} para ${cols[colIndex]}: ${formatCurrency(value)}`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Bajo</span>
        {legendItems.map((item, i) => (
            <div key={i} className="w-5 h-4 rounded-sm" style={{ backgroundColor: item.color }} title={formatCurrency(item.value)} />
        ))}
        <span>Alto</span>
      </div>
    </div>
  );
};

const AmortizationTables: React.FC<{ loans: any[], schedules: { [key: number]: any[] } }> = ({ loans, schedules }) => {
    if (!loans || loans.length === 0) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">No hay créditos definidos en el proyecto.</div>;
    }

    return (
        <div className="space-y-8 p-2">
            {loans.map(loan => {
                const schedule = schedules[loan.id];
                if (!schedule || schedule.length === 0) {
                    return (
                        <div key={loan.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">{loan.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">No se pudo generar la tabla de amortización para este crédito.</p>
                        </div>
                    );
                };

                const monthlyPayment = schedule[0].payment;

                return (
                    <div key={loan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">{loan.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Monto Principal</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(loan.principal)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Tasa Anual</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{loan.annualInterestRate}%</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Plazo</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{loan.termMonths} meses</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Pago Mensual</p>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(monthlyPayment)}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-96 relative">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center">Mes</th>
                                        <th scope="col" className="px-4 py-3 text-right">Pago Mensual</th>
                                        <th scope="col" className="px-4 py-3 text-right">Intereses</th>
                                        <th scope="col" className="px-4 py-3 text-right">Abono a Capital</th>
                                        <th scope="col" className="px-4 py-3 text-right">Saldo Restante</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map(row => (
                                        <tr key={row.month} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-4 py-2 text-center font-medium text-gray-900 dark:text-white">{row.month}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(row.payment)}</td>
                                            <td className="px-4 py-2 text-right text-red-400">{formatCurrency(row.interest)}</td>
                                            <td className="px-4 py-2 text-right text-green-500">{formatCurrency(row.principal)}</td>
                                            <td className="px-4 py-2 text-right font-semibold">{formatCurrency(row.remainingBalance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


export const FinancialReports: React.FC<{ projections: any, netInitialInvestment: number, theme: Theme, loans: any[] }> = ({ projections, netInitialInvestment, theme, loans }) => {
    const [activeTab, setActiveTab] = useState('income');
    const { annualSummaries, monthlyBreakdown, annualCostBenefitData, monthlyCashFlowData, monthlyBreakEvenData, monthlyCostBenefitData, annualCashFlowData } = projections;
    
    // Derived data for Income Statement with Total Costs
    const annualIncomeData = useMemo(() => annualSummaries.map((s: any) => ({
        ...s.incomeStatement,
        totalCosts: s.incomeStatement.fixedCosts + s.incomeStatement.variableCosts
    })), [annualSummaries]);

    const monthlyIncomeData = useMemo(() => monthlyBreakdown.map((m: any) => ({
        ...m,
        totalCosts: m.fixedCosts + m.variableCosts
    })), [monthlyBreakdown]);

    // Derived data for Fixed vs Variable Costs tab
    const annualFixedData = useMemo(() => annualSummaries.map((s: any) => ({
        year: s.year,
        fixedCosts: s.incomeStatement.fixedCosts
    })), [annualSummaries]);

    const monthlyFixedData = useMemo(() => monthlyBreakdown.map((m: any) => ({
        year: m.year,
        month: m.month,
        fixedCosts: m.fixedCosts
    })), [monthlyBreakdown]);
    
    const annualVariableData = useMemo(() => annualSummaries.map((s: any) => ({
        year: s.year,
        variableCosts: s.incomeStatement.variableCosts
    })), [annualSummaries]);

    const monthlyVariableData = useMemo(() => monthlyBreakdown.map((m: any) => ({
        year: m.year,
        month: m.month,
        variableCosts: m.variableCosts
    })), [monthlyBreakdown]);


    return (
        <div>
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                    <TabButton active={activeTab === 'income'} onClick={() => setActiveTab('income')}>Estado de Resultados</TabButton>
                    <TabButton active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')}>Flujo de Efectivo</TabButton>
                    <TabButton active={activeTab === 'breakeven'} onClick={() => setActiveTab('breakeven')}>Punto de Equilibrio</TabButton>
                    <TabButton active={activeTab === 'costBenefit'} onClick={() => setActiveTab('costBenefit')}>Costo-Beneficio</TabButton>
                    <TabButton active={activeTab === 'amortization'} onClick={() => setActiveTab('amortization')}>Amortización de Créditos</TabButton>
                    <TabButton active={activeTab === 'fixedVariable'} onClick={() => setActiveTab('fixedVariable')}>Costos Fijos vs Variables</TabButton>
                    <TabButton active={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')}>Mapa de Calor</TabButton>
                </nav>
            </div>

            {activeTab === 'income' && (
                <ReportTable 
                    headers={['Año', 'Ventas', 'C. Fijos', 'C. Variables', 'C. Totales', 'U. Bruta', 'Deprec.', 'G. Finan.', 'U. A. Imp.', 'Impuestos', 'U. Neta']}
                    annualData={annualIncomeData}
                    keys={['year', 'sales', 'fixedCosts', 'variableCosts', 'totalCosts', 'grossProfit', 'annualDepreciation', 'annualInterest', 'ebt', 'taxes', 'netIncome']}
                    monthlyData={monthlyIncomeData}
                    monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'C. Variables', 'C. Totales', 'U. Bruta', 'Deprec.', 'Intereses', 'U. A. Imp.', 'Imp.', 'U. Neta']}
                    monthlyKeys={['month', 'sales', 'fixedCosts', 'variableCosts', 'totalCosts', 'grossProfit', 'monthlyDepreciation', 'monthlyInterest', 'ebt', 'taxes', 'netIncome']}
                    showSalesPercentage={true}
                />
            )}
            {activeTab === 'cashflow' && (
                 <ReportTable 
                    headers={['Año', 'U. Neta', '+ Deprec.', '- Amortización', '+ V. Rescate', 'Flujo Neto', 'Flujo Acum.']}
                    annualData={annualCashFlowData.map((flowItem: any) => {
                        const summary = annualSummaries.find((s: any) => s.year === flowItem.year);
                        if (summary) {
                            return {
                                ...summary.cashFlow,
                                cumulativeCashFlow: flowItem.cumulativeCashFlow
                            };
                        }
                        // For year 0
                        return {
                            year: '0',
                            netIncome: '',
                            annualDepreciation: '',
                            annualPrincipalRepayment: '',
                            salvageValue: '',
                            netCashFlow: flowItem.netCashFlow,
                            cumulativeCashFlow: flowItem.cumulativeCashFlow,
                        };
                    })}
                    keys={['year', 'netIncome', 'annualDepreciation', 'annualPrincipalRepayment', 'salvageValue', 'netCashFlow', 'cumulativeCashFlow']}
                    monthlyData={monthlyCashFlowData}
                    monthlyHeaders={['Mes', 'Flujo Neto Mensual', 'Flujo Acumulado']}
                    monthlyKeys={['month', 'netCashFlow', 'cumulativeCashFlow']}
                />
            )}
            {activeTab === 'breakeven' && (
                <ReportTable
                    headers={['Año', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
                    annualData={annualSummaries.map((s: any) => ({
                        ...s.breakEven,
                        bepAmount: isFinite(s.breakEven.bepAmount) ? s.breakEven.bepAmount : 'N/A',
                        bepPercentage: isFinite(s.breakEven.bepPercentage) ? `${s.breakEven.bepPercentage.toFixed(1)}%` : 'N/A',
                    }))}
                    keys={['year', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
                    monthlyData={monthlyBreakEvenData}
                    monthlyHeaders={['Mes', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']}
                    monthlyKeys={['month', 'sales', 'fixedCosts', 'bepAmount', 'bepPercentage']}
                />
            )}
            {activeTab === 'costBenefit' && (
                <ReportTable
                    headers={['Año', 'Beneficios', 'Costos', 'Beneficio Neto', 'Beneficios Acum.', 'Costos Acum.', 'Beneficio Neto Acum.']}
                    annualData={annualCostBenefitData}
                    keys={['year', 'benefits', 'costs', 'netBenefit', 'cumulativeBenefits', 'cumulativeCosts', 'cumulativeNetBenefit']}
                    monthlyData={monthlyCostBenefitData}
                    monthlyHeaders={['Mes', 'Beneficios', 'Costos', 'B. Neto', 'B. Acum.', 'C. Acum.', 'B.N. Acum.']}
                    monthlyKeys={['month', 'benefits', 'costs', 'netBenefit', 'cumulativeBenefits', 'cumulativeCosts', 'cumulativeNetBenefit']}
                />
            )}
            {activeTab === 'amortization' && (
                <AmortizationTables loans={loans} schedules={projections.loanSchedules} />
            )}
            {activeTab === 'fixedVariable' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Costos Fijos</h3>
                        <ReportTable
                            headers={['Año', 'Costo Fijo Anual']}
                            annualData={annualFixedData}
                            keys={['year', 'fixedCosts']}
                            monthlyData={monthlyFixedData}
                            monthlyHeaders={['Mes', 'Costo Fijo Mensual']}
                            monthlyKeys={['month', 'fixedCosts']}
                        />
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Costos Variables</h3>
                        <ReportTable
                            headers={['Año', 'Costo Variable Anual']}
                            annualData={annualVariableData}
                            keys={['year', 'variableCosts']}
                            monthlyData={monthlyVariableData}
                            monthlyHeaders={['Mes', 'Costo Variable Mensual']}
                            monthlyKeys={['month', 'variableCosts']}
                        />
                    </div>
                </div>
            )}
            {activeTab === 'heatmap' && (
                <CostHeatmap data={monthlyBreakdown} theme={theme} />
            )}
        </div>
    );
};