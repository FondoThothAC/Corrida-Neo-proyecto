import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { produce } from 'immer';
import { ControlPanel } from './components/ControlPanel';
import { FinancialChart, CompositionChart, BreakEvenAnalysisTable, AnnualNPVChart, PaybackPeriodChart } from './components/FinancialChart';
import { FinancialReports } from './components/ExpenseTable';
import type { ProjectData, Handlers, BOMItem, Theme, SavedProject } from './types';
import { calculateFinancialProjections } from './financial-calculations';
import { PROYECCION_ANUAL_SCENARIO, THEMES, BLANK_SCENARIO, MARYS_VELAS_SCENARIO, TAQUERIA_TACOS_SCENARIO, VELAS_AROMATICAS_ELAN_SCENARIO, SABORES_CASEROS_SCENARIO, ALITAS_BONELESS_SCENARIO, RESTAURANTE_EL_BUEN_SABOR_SCENARIO, CONSULTORIA_IMPULSO_CREATIVO_SCENARIO, COMIDA_MEXICANA_VICKYS_SCENARIO } from './constants';

const formatCurrency = (value: any, decimals = 2) => {
    if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
};

const ExportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: any) => void;
    title: string;
    exportButtonText: string;
    includeAssumptions?: boolean;
    includeIncomeStatement?: boolean;
}> = ({ isOpen, onClose, onExport, title, exportButtonText, includeAssumptions = false, includeIncomeStatement = false }) => {
    const [options, setOptions] = useState({
        detail: 'annual',
        includeInvestment: true,
        includePayroll: true,
        includeBom: true,
        includeFinancing: true,
        includeIncomeStatement: true,
        incomeStatementDetail: 'annual',
    });
    if (!isOpen) return null;
    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const checked = e.target.checked;
        setOptions(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold">Detalle de Reportes (Flujos, P.E.)</label>
                        <div className="flex gap-4 mt-1">
                            <label><input type="radio" name="detail" value="annual" checked={options.detail === 'annual'} onChange={handleOptionChange} /> Anual</label>
                            <label><input type="radio" name="detail" value="monthly" checked={options.detail === 'monthly'} onChange={handleOptionChange} /> Mensual</label>
                        </div>
                    </div>
                    {includeAssumptions && (
                        <div>
                            <label className="font-semibold">Incluir Tablas de Supuestos</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <label><input type="checkbox" name="includeInvestment" checked={options.includeInvestment} onChange={handleOptionChange} /> Inversión</label>
                                <label><input type="checkbox" name="includePayroll" checked={options.includePayroll} onChange={handleOptionChange} /> Nómina</label>
                                <label><input type="checkbox" name="includeBom" checked={options.includeBom} onChange={handleOptionChange} /> Costos Unitarios</label>
                                <label><input type="checkbox" name="includeFinancing" checked={options.includeFinancing} onChange={handleOptionChange} /> Financiamiento</label>
                            </div>
                        </div>
                    )}
                    {includeIncomeStatement && (
                        <div>
                             <label className="font-semibold block">Incluir Estado de Resultados</label>
                            <label className="flex items-center mt-1">
                                <input type="checkbox" name="includeIncomeStatement" checked={options.includeIncomeStatement} onChange={handleOptionChange} />
                                <span className="ml-2 text-sm">Añadir tabla detallada</span>
                            </label>
                            {options.includeIncomeStatement && (
                                <div className="flex gap-4 mt-2 pl-6">
                                    <label><input type="radio" name="incomeStatementDetail" value="annual" checked={options.incomeStatementDetail === 'annual'} onChange={handleOptionChange} /> Anual</label>
                                    <label><input type="radio" name="incomeStatementDetail" value="monthly" checked={options.incomeStatementDetail === 'monthly'} onChange={handleOptionChange} /> Mensual</label>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded border dark:border-gray-600">Cancelar</button>
                    <button onClick={() => onExport(options)} className="px-4 py-2 rounded bg-blue-600 text-white">{exportButtonText}</button>
                </div>
            </div>
        </div>
    );
};

const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const InfoIcon: React.FC<{ tooltip: string }> = ({ tooltip }) => (
    <div className="relative flex items-center group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        <div className="tooltip-content absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 z-10">
            {tooltip}
        </div>
    </div>
);

const MetricCard: React.FC<{ title: string, value: string, color: string, tooltipText: string }> = ({ title, value, color, tooltipText }) => {
    const isPayback = value.includes('|');
    
    // Using a smaller font size and tight leading for multiline values to prevent layout issues.
    const valueClassName = `font-bold mt-1 ${isPayback ? 'text-lg leading-tight' : 'text-2xl truncate'}`;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-1 min-w-[160px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{title}</span>
                <InfoIcon tooltip={tooltipText} />
            </div>
            {isPayback ? (
                <div className={valueClassName} style={{ color }}>
                    {value.split('|').map((part, index) => <div key={index}>{part}</div>)}
                </div>
            ) : (
                <p className={valueClassName} style={{ color }}>{value}</p>
            )}
        </div>
    );
};


const FinancialMetricsHeader: React.FC<{ metrics: any, theme: Theme, projectData: ProjectData }> = ({ metrics, theme, projectData }) => (
    <div className="flex flex-wrap gap-4 mb-4">
        <MetricCard
            title="VPN"
            value={formatCurrency(metrics.npv)}
            color={metrics.npv >= 0 ? theme.colors.positive : theme.colors.negative}
            tooltipText="Valor Presente Neto: Mide la rentabilidad de la inversión en pesos de hoy. Un VPN positivo indica que el proyecto genera más valor que la tasa de descuento mínima esperada."
        />
        <MetricCard
            title="TIR"
            value={metrics.irr !== null ? `${metrics.irr.toFixed(2)}%` : 'N/A'}
            color={metrics.irr !== null ? (metrics.irr >= projectData.minimumAcceptableIRR ? theme.colors.positive : theme.colors.negative) : theme.colors.metrics.irr}
            tooltipText="Tasa Interna de Retorno: Es la tasa de rendimiento anual del proyecto. Se vuelve verde si es mayor o igual a tu TIR Mínima Aceptable."
        />
        <MetricCard
            title="Payback (días)"
            value={metrics.paybackPeriod}
            color={theme.colors.metrics.payback}
            tooltipText="Periodo de Recuperación: Indica el tiempo necesario para que los flujos de efectivo recuperen la inversión inicial. Un payback más corto es generalmente mejor."
        />
        <MetricCard
            title="B/C"
            value={metrics.cbr.toFixed(2)}
            color={theme.colors.metrics.cbr}
            tooltipText="Relación Beneficio-Costo: Compara los beneficios totales contra los costos totales, ambos traídos a valor presente. Un valor > 1.0 significa que los beneficios superan los costos."
        />
        <MetricCard
            title="ROI"
            value={metrics.roi !== null ? `${metrics.roi.toFixed(2)}%` : 'N/A'}
            color={theme.colors.metrics.roi}
            tooltipText="Retorno sobre la Inversión: Mide la ganancia neta en relación con el costo de la inversión inicial. Es un porcentaje que muestra la eficiencia de la inversión."
        />
    </div>
);

const SaveScenarioModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (name: string) => void }> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Guardar Escenario</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del escenario..."
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                />
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded border dark:border-gray-600">Cancelar</button>
                    <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const ManageScenariosModal: React.FC<{ isOpen: boolean, onClose: () => void, savedProjects: SavedProject[], onDelete: (name: string) => void }> = ({ isOpen, onClose, savedProjects, onDelete }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Gestionar Escenarios Guardados</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {savedProjects.length > 0 ? savedProjects.map(p => (
                        <div key={p.name} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Guardado: {new Date(p.lastSaved).toLocaleString()}</p>
                            </div>
                            <button onClick={() => onDelete(p.name)} className="px-3 py-1 text-sm rounded bg-red-600 text-white">Eliminar</button>
                        </div>
                    )) : <p>No hay escenarios guardados.</p>}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded border dark:border-gray-600">Cerrar</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [projectData, setProjectData] = useState<ProjectData>(() => {
        try {
            const autoSavedData = localStorage.getItem('financial_planner_autosave');
            if (autoSavedData) {
                console.log("Cargando datos autoguardados.");
                return JSON.parse(autoSavedData);
            }
        } catch (error) {
            console.error("Error al cargar datos autoguardados:", error);
        }
        return BLANK_SCENARIO;
    });

    const [durationUnit, setDurationUnit] = useState<'years' | 'months'>('years');
    const [theme, setTheme] = useState<Theme>(THEMES[0]);
    const [customChartColors, setCustomChartColors] = useState<string[] | null>(null);
    const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
    
    const [incrementalAnalysisConfig, setIncrementalAnalysisConfig] = useState<{
        investmentId: string | null;
        loanId: string | null;
        impactPercentage: number;
    }>({ investmentId: null, loanId: null, impactPercentage: 25 });

    // Undo/Redo and Auto-save State
    const [history, setHistory] = useState<ProjectData[]>([projectData]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string>('');
    const projectDataRef = useRef(projectData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        projectDataRef.current = projectData;
    }, [projectData]);

    // Auto-save effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (isDirty) {
                setSaveStatus('Guardando...');
                localStorage.setItem('financial_planner_autosave', JSON.stringify(projectDataRef.current));
                setIsDirty(false);
                setTimeout(() => setSaveStatus(`Guardado ${new Date().toLocaleTimeString()}`), 500);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [isDirty]);


    useEffect(() => {
        try {
            const stored = localStorage.getItem('financial_planner_saved_scenarios');
            if (stored) {
                setSavedProjects(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading saved scenarios:", error);
        }
    }, []);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (localStorage.getItem('financial_planner_theme_mode') === 'dark') return true;
        if (!('financial_planner_theme_mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('financial_planner_theme_mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('financial_planner_theme_mode', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);
    
    const projections = useMemo(() => calculateFinancialProjections(projectData, durationUnit, incrementalAnalysisConfig), [projectData, durationUnit, incrementalAnalysisConfig]);

    const updateProjectData = (newProjectData: ProjectData, fromHistory = false) => {
        if (!fromHistory) {
            const currentDataString = JSON.stringify(projectData);
            const newDataString = JSON.stringify(newProjectData);

            if (currentDataString !== newDataString) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(newProjectData);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
                setIsDirty(true);
            }
        }
        setProjectData(newProjectData);
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            updateProjectData(history[newIndex], true);
            setIsDirty(true);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            updateProjectData(history[newIndex], true);
            setIsDirty(true);
        }
    };

    const loadScenario = (data: ProjectData) => {
        setProjectData(data);
        setHistory([data]);
        setHistoryIndex(0);
        setIsDirty(false);
        setSaveStatus('');
        setCustomChartColors(null); // Reset colors on scenario change
    };

    const handleThemeChange = (themeName: string) => {
        setTheme(THEMES.find(t => t.name === themeName) || THEMES[0]);
        setCustomChartColors(null); // Reset colors on theme change
    };

    const handleSaveProject = (name: string) => {
        const existingIndex = savedProjects.findIndex(p => p.name === name);
        if (existingIndex !== -1 && !window.confirm(`Ya existe un escenario con el nombre "${name}". ¿Desea sobrescribirlo?`)) {
            return;
        }

        const newSavedProject = { name, lastSaved: new Date().toISOString(), data: projectData };
        const updatedProjects = produce(savedProjects, draft => {
            if (existingIndex !== -1) {
                draft[existingIndex] = newSavedProject;
            } else {
                draft.push(newSavedProject);
            }
        });

        setSavedProjects(updatedProjects);
        localStorage.setItem('financial_planner_saved_scenarios', JSON.stringify(updatedProjects));
    };
    
    const handleDeleteProject = (name: string) => {
        if (window.confirm(`¿Está seguro de que desea eliminar el escenario "${name}"? Esta acción no se puede deshacer.`)) {
            const updatedProjects = savedProjects.filter(p => p.name !== name);
            setSavedProjects(updatedProjects);
            localStorage.setItem('financial_planner_saved_scenarios', JSON.stringify(updatedProjects));
        }
    };

    const handleExportPdf = async (options: any) => {
        try {
            // @ts-ignore
            if (!window.jspdf || !window.html2canvas) {
                alert("Librerías de PDF no cargadas. Revise la conexión.");
                return;
            }
            // @ts-ignore
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let yPos = 20;

            doc.setFontSize(18);
            doc.text("Reporte de Proyección Financiera", 14, yPos);
            yPos += 15;

            const metrics = projections.financialMetrics;
            doc.setFontSize(10);
            doc.text(`VPN: ${formatCurrency(metrics.npv)}`, 14, yPos);
            doc.text(`TIR: ${metrics.irr !== null ? `${metrics.irr.toFixed(2)}%` : 'N/A'}`, 70, yPos);
            doc.text(`Payback: ${metrics.paybackPeriod.replace(/\|/g, ', ')}`, 120, yPos);
            yPos += 7;
            doc.text(`B/C Ratio: ${metrics.cbr.toFixed(2)}`, 14, yPos);
            doc.text(`ROI: ${metrics.roi !== null ? `${metrics.roi.toFixed(2)}%` : 'N/A'}`, 70, yPos);
            yPos += 15;

            // --- Charts ---
            doc.setFontSize(14);
            doc.text("Gráficos Anuales", 14, yPos);
            yPos += 10;
            
            // @ts-ignore
            const canvasCashflow = await window.html2canvas(document.getElementById('annual-cashflow-chart'), { scale: 2 });
            doc.addImage(canvasCashflow.toDataURL('image/png'), 'PNG', 14, yPos, 180, 90);
            yPos += 100;
            // @ts-ignore
            const canvasComposition = await window.html2canvas(document.getElementById('composition-chart'), { scale: 2 });
            doc.addImage(canvasComposition.toDataURL('image/png'), 'PNG', 14, yPos, 180, 90);

            // --- Tables ---
            const addTable = (title: string, head: any[], body: any[], color: [number, number, number]) => {
                doc.addPage();
                doc.setFontSize(14);
                doc.text(title, 14, 22);
                // @ts-ignore
                doc.autoTable({
                    startY: 30, head, body, theme: 'grid',
                    headStyles: { fillColor: color, textColor: [255, 255, 255] },
                    styles: { fontSize: 8 },
                });
            };

            const formatBep = (bep: any) => isFinite(bep) ? formatCurrency(bep) : 'N/A';
            const formatBepPerc = (bep: any) => isFinite(bep) ? `${bep.toFixed(1)}%` : 'N/A';

            if (options.detail === 'annual') {
                const body = projections.annualCashFlowData.map(d => [ d.year, formatCurrency(projections.annualSummaries.find(s=>s.year===d.year)?.cashFlow.netIncome || (d.year === 0 ? 0 : '')), formatCurrency(d.netCashFlow), formatCurrency(d.cumulativeCashFlow) ]);
                addTable("Flujo de Efectivo Anual", [['Año', 'Utilidad Neta', 'Flujo Neto', 'Flujo Acumulado']], body, theme.colors.pdfHeaders.cashflow);
            } else {
                const body = projections.monthlyCashFlowData.map(d => [ d.year, d.month, formatCurrency(d.netCashFlow), formatCurrency(d.cumulativeCashFlow) ]);
                addTable("Flujo de Efectivo Mensual", [['Año', 'Mes', 'Flujo Neto', 'Flujo Acumulado']], body, theme.colors.pdfHeaders.cashflow);
            }
             if (options.detail === 'annual') {
                const body = projections.annualSummaries.map(s => [s.year, formatCurrency(s.breakEven.sales), formatCurrency(s.breakEven.fixedCosts), formatBep(s.breakEven.bepAmount), formatBepPerc(s.breakEven.bepPercentage)]);
                addTable("Punto de Equilibrio Anual", [['Año', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']], body, theme.colors.pdfHeaders.breakeven);
            } else {
                const body = projections.monthlyBreakEvenData.map(m => [m.year, m.month, formatCurrency(m.sales), formatCurrency(m.fixedCosts), formatBep(m.bepAmount), formatBepPerc(m.bepPercentage)]);
                addTable("Punto de Equilibrio Mensual", [['Año', 'Mes', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']], body, theme.colors.pdfHeaders.breakeven);
            }
            
            if (options.includeIncomeStatement) {
                if (options.incomeStatementDetail === 'annual') {
                    const body = projections.annualSummaries.map((s: any) => [ s.year, formatCurrency(s.incomeStatement.sales), formatCurrency(s.incomeStatement.fixedCosts), formatCurrency(s.incomeStatement.variableCosts), formatCurrency(s.incomeStatement.grossProfit), formatCurrency(s.incomeStatement.annualDepreciation), formatCurrency(s.incomeStatement.annualInterest), formatCurrency(s.incomeStatement.ebt), formatCurrency(s.incomeStatement.taxes), formatCurrency(s.incomeStatement.netIncome) ]);
                    addTable("Estado de Resultados Proyectado (Anual)", ['Año', 'Ventas', 'C. Fijos', 'C. Variables', 'U. Bruta', 'Deprec.', 'G. Finan.', 'U. A. Imp.', 'Impuestos', 'U. Neta'], body, theme.colors.pdfHeaders.breakeven);
                } else { // monthly
                    const body = projections.monthlyBreakdown.map((m: any) => [ m.year, m.month, formatCurrency(m.sales), formatCurrency(m.fixedCosts), formatCurrency(m.variableCosts), formatCurrency(m.grossProfit), formatCurrency(m.monthlyDepreciation), formatCurrency(m.monthlyInterest), formatCurrency(m.ebt), formatCurrency(m.taxes), formatCurrency(m.netIncome) ]);
                    addTable("Estado de Resultados Proyectado (Mensual)", ['Año', 'Mes', 'Ventas', 'C. Fijos', 'C. Variables', 'U. Bruta', 'Deprec.', 'Intereses', 'U. A. Imp.', 'Imp.', 'U. Neta'], body, theme.colors.pdfHeaders.breakeven);
                }
            }

            if(options.includeInvestment) addTable("Inversión Inicial", [['Nombre', 'Tipo', 'Monto']], projectData.investmentItems.map(i => [i.name, i.type, formatCurrency(i.amount)]), [100,100,100]);
            if(options.includePayroll) addTable("Nómina (Puestos Fijos)", [['Puesto', 'Salario Mensual']], projectData.payrollConfig.positions.map(p => [p.name, formatCurrency(p.monthlySalary)]), [100,100,100]);
            if(options.includeFinancing) addTable("Financiamiento", [['Nombre', 'Monto', 'Interés Anual', 'Plazo (Meses)']], projectData.loans.map(l => [l.name, formatCurrency(l.principal), `${l.annualInterestRate}%`, l.termMonths]), [100,100,100]);
            if(options.includeBom) {
                projectData.advancedConfig.products.forEach(p => {
                    const body = p.bomItems.map(item => [item.componentName, item.costType, formatCurrency(projections.derivedData.bomItemCosts[item.id], 4)]);
                    const totalCost = p.bomItems.reduce((sum, item) => sum + projections.derivedData.bomItemCosts[item.id], 0);
                    const price = totalCost * (1 + p.markupPercentage / 100);
                    body.push(['', 'COSTO TOTAL', formatCurrency(totalCost, 2)]);
                    body.push(['', 'PRECIO VENTA', formatCurrency(price, 2)]);
                    addTable(`Costos Unitarios: ${p.name}`, [['Componente', 'Tipo', 'Costo']], body, [100,100,100]);
                });
            }

            doc.save('reporte_financiero.pdf');
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Ocurrió un error al generar el PDF. Por favor, revise la consola para más detalles.");
        } finally {
            setIsPdfModalOpen(false);
        }
    };

     const handleExportCsv = (options: { detail: 'annual' | 'monthly' }) => {
        let csvContent = '';
        const { detail } = options;

        const escapeCsvCell = (cell: any): string => {
            const cellStr = cell === null || cell === undefined || (typeof cell === 'number' && !isFinite(cell)) ? '' : String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        };

        const arrayToCsvRow = (arr: any[]): string => arr.map(escapeCsvCell).join(',') + '\n';
        const addSection = (title: string) => { csvContent += `\n${title.toUpperCase()}\n`; };
        const { financialMetrics: metrics, annualSummaries, monthlyBreakdown, annualCashFlowData, monthlyCashFlowData } = projections;
        
        addSection("Métricas Clave");
        csvContent += arrayToCsvRow(['Métrica', 'Valor']);
        csvContent += arrayToCsvRow(['VPN', formatCurrency(metrics.npv)]);
        csvContent += arrayToCsvRow(['TIR', metrics.irr !== null ? `${metrics.irr.toFixed(2)}%` : 'N/A']);
        csvContent += arrayToCsvRow(['Payback', metrics.paybackPeriod.replace(/\|/g, ', ')]);
        csvContent += arrayToCsvRow(['B/C Ratio', metrics.cbr.toFixed(2)]);
        csvContent += arrayToCsvRow(['ROI', metrics.roi !== null ? `${metrics.roi.toFixed(2)}%` : 'N/A']);
        
        if (detail === 'annual') {
            addSection(`Estado de Resultados (Anual)`);
            csvContent += arrayToCsvRow(['Año', 'Ventas', 'C. Fijos', 'C. Variables', 'U. Bruta', 'Deprec.', 'G. Finan.', 'U. A. Imp.', 'Impuestos', 'U. Neta']);
            annualSummaries.forEach((s: any) => csvContent += arrayToCsvRow([s.year, s.incomeStatement.sales, s.incomeStatement.fixedCosts, s.incomeStatement.variableCosts, s.incomeStatement.grossProfit, s.incomeStatement.annualDepreciation, s.incomeStatement.annualInterest, s.incomeStatement.ebt, s.incomeStatement.taxes, s.incomeStatement.netIncome]));

            addSection(`Flujo de Efectivo (Anual)`);
            csvContent += arrayToCsvRow(['Año', 'U. Neta', '+ Deprec.', '- Amortización', '+ V. Rescate', 'Flujo Neto', 'Flujo Acum.']);
            annualCashFlowData.forEach((d: any) => csvContent += arrayToCsvRow([d.year, annualSummaries.find(s=>s.year===d.year)?.cashFlow.netIncome, annualSummaries.find(s=>s.year===d.year)?.cashFlow.annualDepreciation, annualSummaries.find(s=>s.year===d.year)?.cashFlow.annualPrincipalRepayment, annualSummaries.find(s=>s.year===d.year)?.cashFlow.salvageValue, d.netCashFlow, d.cumulativeCashFlow]));
            
            addSection(`Punto de Equilibrio (Anual)`);
            csvContent += arrayToCsvRow(['Año', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']);
            annualSummaries.forEach((s: any) => csvContent += arrayToCsvRow([s.year, s.breakEven.sales, s.breakEven.fixedCosts, isFinite(s.breakEven.bepAmount) ? s.breakEven.bepAmount : 'N/A', isFinite(s.breakEven.bepPercentage) ? s.breakEven.bepPercentage : 'N/A' ]));

        } else { // Monthly detail
            addSection(`Estado de Resultados (Mensual)`);
            csvContent += arrayToCsvRow(['Año', 'Mes', 'Ventas', 'C. Fijos', 'C. Variables', 'U. Bruta', 'Deprec.', 'Intereses', 'U. A. Imp.', 'Imp.', 'U. Neta']);
            monthlyBreakdown.forEach((m: any) => csvContent += arrayToCsvRow([m.year, m.month, m.sales, m.fixedCosts, m.variableCosts, m.grossProfit, m.monthlyDepreciation, m.monthlyInterest, m.ebt, m.taxes, m.netIncome]));

            addSection(`Flujo de Efectivo (Mensual)`);
            csvContent += arrayToCsvRow(['Año', 'Mes', 'Flujo Neto Mensual', 'Flujo Acumulado']);
            monthlyCashFlowData.forEach((m: any) => csvContent += arrayToCsvRow([m.year, m.month, m.netCashFlow, m.cumulativeCashFlow]));
            
            addSection(`Punto de Equilibrio (Mensual)`);
            csvContent += arrayToCsvRow(['Año', 'Mes', 'Ventas', 'C. Fijos', 'P. Eq. ($)', 'P. Eq. (%)']);
            monthlyBreakdown.forEach((m: any) => csvContent += arrayToCsvRow([m.year, m.month, m.sales, m.fixedCosts, isFinite(m.bepAmount) ? m.bepAmount : 'N/A', isFinite(m.bepPercentage) ? m.bepPercentage : 'N/A']));
        }

        addSection("Inversión Inicial");
        csvContent += arrayToCsvRow(['Nombre', 'Tipo', 'Monto']);
        projectData.investmentItems.forEach(i => csvContent += arrayToCsvRow([i.name, i.type, i.amount]));
        
        addSection("Financiamiento");
        csvContent += arrayToCsvRow(['Nombre', 'Monto', 'Interés Anual (%)', 'Plazo (Meses)']);
        projectData.loans.forEach(l => csvContent += arrayToCsvRow([l.name, l.principal, l.annualInterestRate, l.termMonths]));
        
        addSection("Nómina (Puestos Fijos)");
        csvContent += arrayToCsvRow(['Puesto', 'Salario Mensual Bruto']);
        projectData.payrollConfig.positions.forEach(p => csvContent += arrayToCsvRow([p.name, p.monthlySalary]));

        projectData.advancedConfig.products.forEach(p => {
            addSection(`Costos Unitarios: ${p.name}`);
            csvContent += arrayToCsvRow(['Componente', 'Tipo', 'Valor Ingresado', 'Costo Calculado']);
            p.bomItems.forEach(item => {
                 let enteredValue = '';
                 if (item.costType === 'Mano de Obra') enteredValue = `${item.minutesPerUnit} min`;
                 if (item.costType === 'Materia Prima') enteredValue = `${item.batchCost}/${item.batchYield}u`;
                 csvContent += arrayToCsvRow([item.componentName, item.costType, enteredValue, projections.derivedData.bomItemCosts[item.id]]);
            });
        });

        downloadCSV(csvContent, `reporte_financiero_${detail}.csv`);
        setIsCsvModalOpen(false);
    };

    const handleExportScenario = () => {
        try {
            const jsonString = JSON.stringify(projectData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const filename = `corrida-financiera-${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}.json`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al exportar el escenario:", error);
            alert("Ocurrió un error al exportar el escenario.");
        }
    };

    const handleImportScenario = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("El archivo no contiene texto válido.");
                const importedData = JSON.parse(text);
                
                if (typeof importedData.projectDuration !== 'number' || !Array.isArray(importedData.investmentItems)) {
                     throw new Error("El archivo no parece ser un escenario válido.");
                }
                
                loadScenario(importedData as ProjectData);
                alert("Escenario importado con éxito.");

            } catch (error) {
                console.error("Error al importar el escenario:", error);
                alert(`Error al importar el archivo: ${error instanceof Error ? error.message : 'Formato de archivo inválido.'}`);
            } finally {
                if(event.target) event.target.value = '';
            }
        };
        reader.onerror = () => {
            alert("Error al leer el archivo.");
            if(event.target) event.target.value = '';
        }
        reader.readAsText(file);
    };

    const createHandler = useCallback((updater: (draft: ProjectData, ...args: any[]) => void) => {
        return (...args: any[]) => {
            const newData = produce(projectData, draft => { updater(draft, ...args); });
            updateProjectData(newData);
        };
    }, [projectData, history, historyIndex]);
    
    const handlers: Handlers = useMemo(() => ({
        addInvestmentItem: createHandler((draft, item) => { draft.investmentItems.push({ ...item, id: Date.now() }); }),
        updateInvestmentItem: createHandler((draft, item) => { const index = draft.investmentItems.findIndex(i => i.id === item.id); if (index !== -1) draft.investmentItems[index] = item; }),
        deleteInvestmentItem: createHandler((draft, id) => { draft.investmentItems = draft.investmentItems.filter(i => i.id !== id); }),
        addDepreciableAsset: createHandler((draft, asset) => { draft.depreciableAssets.push({ ...asset, id: Date.now() }); }),
        updateDepreciableAsset: createHandler((draft, asset) => { const index = draft.depreciableAssets.findIndex(a => a.id === asset.id); if (index !== -1) draft.depreciableAssets[index] = asset; }),
        deleteDepreciableAsset: createHandler((draft, id) => { draft.depreciableAssets = draft.depreciableAssets.filter(a => a.id !== id); }),
        addRecurringRevenue: createHandler((draft, rev) => { draft.recurringRevenues.push({ ...rev, id: Date.now() }); }),
        updateRecurringRevenue: createHandler((draft, rev) => { const index = draft.recurringRevenues.findIndex(r => r.id === rev.id); if (index !== -1) draft.recurringRevenues[index] = rev; }),
        deleteRecurringRevenue: createHandler((draft, id) => { draft.recurringRevenues = draft.recurringRevenues.filter(r => r.id !== id); }),
        addRecurringExpense: createHandler((draft, exp) => { draft.recurringExpenses.push({ ...exp, id: Date.now() }); }),
        updateRecurringExpense: createHandler((draft, exp) => { const index = draft.recurringExpenses.findIndex(e => e.id === exp.id); if (index !== -1) draft.recurringExpenses[index] = exp; }),
        deleteRecurringExpense: createHandler((draft, id) => { draft.recurringExpenses = draft.recurringExpenses.filter(e => e.id !== id); }),
        addLoan: createHandler((draft, loan) => { draft.loans.push({ ...loan, id: Date.now() }); }),
        updateLoan: createHandler((draft, loan) => { const index = draft.loans.findIndex(l => l.id === loan.id); if (index !== -1) draft.loans[index] = loan; }),
        deleteLoan: createHandler((draft, id) => { draft.loans = draft.loans.filter(l => l.id !== id); }),
        updatePayrollConfig: createHandler((draft, config) => { draft.payrollConfig = { ...draft.payrollConfig, ...config }; }),
        addPosition: createHandler((draft, position) => { draft.payrollConfig.positions.push({ ...position, id: Date.now() }); }),
        updatePosition: createHandler((draft, position) => { const index = draft.payrollConfig.positions.findIndex(p => p.id === position.id); if (index !== -1) draft.payrollConfig.positions[index] = position; }),
        deletePosition: createHandler((draft, id) => { draft.payrollConfig.positions = draft.payrollConfig.positions.filter(p => p.id !== id); }),
        updateWorkingCapitalConfig: createHandler((draft, config) => { draft.workingCapitalConfig = { ...draft.workingCapitalConfig, ...config }; }),
        updateAdvancedConfig: createHandler((draft, config) => { draft.advancedConfig = { ...draft.advancedConfig, ...config }; }),
        addProduct: createHandler((draft, product) => { draft.advancedConfig.products.push({ ...product, id: Date.now(), bomItems: [] }); }),
        updateProduct: createHandler((draft, product) => { const index = draft.advancedConfig.products.findIndex(p => p.id === product.id); if (index !== -1) draft.advancedConfig.products[index] = product; }),
        deleteProduct: createHandler((draft, id) => { draft.advancedConfig.products = draft.advancedConfig.products.filter(p => p.id !== id); }),
        addBOMItem: createHandler((draft, productId, item) => { const product = draft.advancedConfig.products.find(p => p.id === productId); if (product) product.bomItems.push({ ...item, id: Date.now() }); }),
        updateBOMItem: createHandler((draft, productId, item) => { const product = draft.advancedConfig.products.find(p => p.id === productId); if (product) { const index = product.bomItems.findIndex(b => b.id === item.id); if (index !== -1) product.bomItems[index] = item; } }),
        deleteBOMItem: createHandler((draft, productId, id) => { const product = draft.advancedConfig.products.find(p => p.id === productId); if (product) product.bomItems = product.bomItems.filter(b => b.id !== id); }),
    }), [createHandler]);

    const scenarios = { 
        "Proyecto Tech (Cositas)": PROYECCION_ANUAL_SCENARIO, 
        "Comida Mexicana (Vickys)": COMIDA_MEXICANA_VICKYS_SCENARIO,
        "Restaurante (10 Productos)": RESTAURANTE_EL_BUEN_SABOR_SCENARIO,
        "Consultoría (Servicios)": CONSULTORIA_IMPULSO_CREATIVO_SCENARIO,
        "Taquería (Tacos)": TAQUERIA_TACOS_SCENARIO,
        "Sabores Caseros (Tamales)": SABORES_CASEROS_SCENARIO,
        "Alitas y Boneless": ALITAS_BONELESS_SCENARIO,
        "Velas (Mary)": MARYS_VELAS_SCENARIO, 
        "Velas (Elan)": VELAS_AROMATICAS_ELAN_SCENARIO, 
        "En Blanco": BLANK_SCENARIO 
    };

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 ${!tooltipsEnabled ? 'tooltips-disabled' : ''}`}>
            <ExportModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} onExport={handleExportPdf} title="Opciones de Exportación PDF" exportButtonText="Generar PDF" includeAssumptions={true} includeIncomeStatement={true}/>
            <ExportModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} onExport={handleExportCsv} title="Opciones de Exportación CSV" exportButtonText="Generar CSV" />
            <SaveScenarioModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveProject} />
            <ManageScenariosModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} savedProjects={savedProjects} onDelete={handleDeleteProject} />
            <input type="file" ref={fileInputRef} onChange={handleImportScenario} style={{ display: 'none' }} accept="application/json,.json" />

            <header className="max-w-screen-2xl mx-auto mb-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proyección Financiera</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Derecho y Desarrollo, Propiedad de Fondo Thoth AC | Desarrollado por Roberto Eduardo Celis Robles</p>
                </div>
                <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-4 my-4">
                    <select 
                        onChange={(e) => {
                            const value = e.target.value;
                            if (scenarios[value as keyof typeof scenarios]) {
                                loadScenario(scenarios[value as keyof typeof scenarios]);
                            } else {
                                const saved = savedProjects.find(p => p.name === value);
                                if (saved) loadScenario(saved.data);
                            }
                            setDurationUnit('years');
                        }} 
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
                    >
                        <option>Cargar Escenario...</option>
                        <optgroup label="Ejemplos">
                            {Object.keys(scenarios).map(name => <option key={name} value={name}>{name}</option>)}
                        </optgroup>
                        {savedProjects.length > 0 && <optgroup label="Guardados">
                            {savedProjects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </optgroup>}
                    </select>
                     <select onChange={(e) => handleThemeChange(e.target.value)} value={theme.name} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm">
                        {THEMES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                    <div className="flex items-center gap-1">
                        <button onClick={handleUndo} disabled={historyIndex === 0} title="Deshacer (Ctrl+Z)" className="p-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                        <button onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Rehacer (Ctrl+Y)" className="p-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a7 7 0 107 7v-2a1 1 0 112 0v2a9 9 0 11-9-9h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                    </div>
                    <button onClick={() => setIsSaveModalOpen(true)} className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
                    <button onClick={() => setIsManageModalOpen(true)} className="px-3 py-2 text-sm font-medium rounded-md bg-gray-500 text-white hover:bg-gray-600">Gestionar</button>
                    <button onClick={handleExportScenario} title="Exportar Escenario a Archivo" className="px-3 py-2 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700">Exportar</button>
                    <button onClick={() => fileInputRef.current?.click()} title="Importar Escenario desde Archivo" className="px-3 py-2 text-sm font-medium rounded-md bg-teal-600 text-white hover:bg-teal-700">Importar</button>
                    <button onClick={() => setIsCsvModalOpen(true)} className="px-3 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700">CSV</button>
                    <button onClick={() => setIsPdfModalOpen(true)} className="px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700">PDF</button>
                    <button onClick={() => setTooltipsEnabled(prev => !prev)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title={tooltipsEnabled ? "Desactivar ayudas" : "Activar ayudas"} aria-label="Toggle tooltips">
                        {tooltipsEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                <path d="M4.929 4.929l10.142 10.142" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle theme">
                        {isDarkMode ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 011.414 0l.707-.707a1 1 0 11-1.414-1.414l-.707.707zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
                        }
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[120px] text-center transition-opacity duration-500">{saveStatus}</span>
                </div>
                <FinancialMetricsHeader metrics={projections.financialMetrics} theme={theme} projectData={projectData} />
            </header>

            <main className="max-w-screen-2xl mx-auto flex gap-6 relative">
                <div className={`transition-all duration-300 flex-shrink-0 ${isControlPanelCollapsed ? 'w-0' : 'w-[450px]'}`}>
                    <div className="w-[450px] h-full overflow-hidden">
                        <ControlPanel
                            projectData={projectData}
                            derivedData={projections.derivedData}
                            setProjectDuration={value => updateProjectData(produce(projectData, d => { d.projectDuration = value; }))}
                            durationUnit={durationUnit}
                            setDurationUnit={setDurationUnit}
                            setDiscountRate={value => updateProjectData(produce(projectData, d => { d.discountRate = value; }))}
                            setTaxRate={value => updateProjectData(produce(projectData, d => { d.taxRate = value; }))}
                            setMinimumAcceptableIRR={value => updateProjectData(produce(projectData, d => { d.minimumAcceptableIRR = value; }))}
                            setInflationRate={value => updateProjectData(produce(projectData, d => { d.inflationRate = value; }))}
                            setNotes={value => updateProjectData(produce(projectData, d => { d.notes = value; }))}
                            financialMetrics={projections.financialMetrics}
                            handlers={handlers}
                            theme={theme}
                            customChartColors={customChartColors}
                            setCustomChartColors={setCustomChartColors}
                            incrementalAnalysisConfig={incrementalAnalysisConfig}
                            setIncrementalAnalysisConfig={setIncrementalAnalysisConfig}
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-6 min-w-0">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                        <FinancialChart data={projections.annualCashFlowData} theme={theme} customChartColors={customChartColors} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                       <FinancialReports 
                            projections={projections} 
                            netInitialInvestment={projections.netInitialInvestment} 
                            theme={theme} 
                            loans={projectData.loans}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg" id="composition-chart">
                            <h3 className="font-semibold text-lg mb-2">Composición Anual</h3>
                            <CompositionChart data={projections.compositionData} theme={theme} customChartColors={customChartColors} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                             <h3 className="font-semibold text-lg mb-2">Punto de Equilibrio</h3>
                             <BreakEvenAnalysisTable data={{ annualSummaries: projections.annualSummaries, monthlyBreakEvenData: projections.monthlyBreakEvenData }} theme={theme} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg md:col-span-2">
                            <h3 className="font-semibold text-lg mb-2">Recuperación de la Inversión (Payback)</h3>
                            <PaybackPeriodChart data={projections.annualCashFlowData} theme={theme} customChartColors={customChartColors} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg md:col-span-2">
                            <h3 className="font-semibold text-lg mb-2">Contribución Anual al VPN</h3>
                            <AnnualNPVChart data={projections.annualNPVContributions} theme={theme} customChartColors={customChartColors} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsControlPanelCollapsed(!isControlPanelCollapsed)}
                    title={isControlPanelCollapsed ? "Mostrar panel" : "Ocultar panel"}
                    className="absolute top-24 z-20 p-1.5 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-600 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    style={{
                        left: isControlPanelCollapsed ? '1rem' : '450px',
                        transform: isControlPanelCollapsed ? 'translateX(0)' : 'translateX(-50%)',
                        transition: 'left 0.3s ease-in-out, transform 0.3s ease-in-out'
                    }}
                >
                    {isControlPanelCollapsed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    )}
                </button>
            </main>
        </div>
    );
}

export default App;