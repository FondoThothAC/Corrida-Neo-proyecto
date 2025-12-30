import React, { useState, useMemo, useEffect } from 'react';
import type { Handlers, InvestmentItem, DepreciableAsset, RecurringRevenue, RecurringExpense, Loan, PayrollConfig, WorkingCapitalConfig, AdvancedConfig, Position, BOMItem, Product, Theme, ProjectData } from '../types';

// --- Reusable UI Components ---

const EditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const DeleteIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const PlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const CalculatorIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1H7zM6 12a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1zM7 15a1 1 0 00-1 1v.01a1 1 0 102 0V16a1 1 0 00-1-1zm4 1a1 1 0 01-1-1V15a1 1 0 112 0v.01a1 1 0 01-1 1z" clipRule="evenodd" /></svg>;
const InfoIcon: React.FC<{ tooltip: string }> = ({ tooltip }) => (
    <div className="relative flex items-center group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        <div className="tooltip-content absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 z-10">
            {tooltip}
        </div>
    </div>
);

const formatCurrency = (value: number, decimals = 2) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, tooltip?: string, error?: boolean }> = ({ label, tooltip, error, ...props }) => (
    <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span>{label}</span>
            {tooltip && <InfoIcon tooltip={tooltip} />}
        </label>
        <input {...props} className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`} />
    </div>
);


const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; tooltip?: string }> = ({ label, children, tooltip, ...props }) => (
    <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span>{label}</span>
            {tooltip && <InfoIcon tooltip={tooltip} />}
        </label>
        <select {...props} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {children}
        </select>
    </div>
);

const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; className?: string, type?: 'button' | 'submit' | 'reset', disabled?: boolean }> = ({ children, onClick, variant = 'primary', className, type = 'button', disabled }) => {
    const baseClasses = "inline-flex items-center justify-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600 focus:ring-blue-500',
        danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
        ghost: 'border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
    };
    return <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

const CollapsibleSection: React.FC<{ title: React.ReactNode; children: React.ReactNode; initiallyOpen?: boolean; actions?: React.ReactNode }> = ({ title, children, initiallyOpen = false, actions }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center p-4">
                <button className="flex-grow flex items-center text-left font-semibold text-gray-900 dark:text-white" onClick={() => setIsOpen(!isOpen)}>
                     <svg className={`w-5 h-5 transition-transform mr-2 ${isOpen ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    {title}
                </button>
                {actions}
            </div>
            {isOpen && <div className="p-4 border-t border-gray-200 dark:border-gray-700">{children}</div>}
        </div>
    );
};

const FormContainer: React.FC<{ onSubmit: (e: React.FormEvent) => void; onCancel: () => void; children: React.ReactNode }> = ({ onSubmit, onCancel, children }) => (
    <form onSubmit={onSubmit} className="p-4 my-2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 space-y-3">
        {children}
        <div className="flex justify-end space-x-2 pt-2">
            <Button onClick={onCancel} variant="secondary">Cancelar</Button>
            <Button type="submit">Guardar</Button>
        </div>
    </form>
);

const UnitSwitch: React.FC<{ unit: 'years' | 'months'; onChange: (unit: 'years' | 'months') => void; }> = ({ unit, onChange }) => (
    <div className="flex rounded-md bg-gray-200 dark:bg-gray-600 p-0.5">
        <button
            type="button"
            onClick={() => onChange('years')}
            className={`px-3 py-1 text-sm rounded-md ${unit === 'years' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}
        >
            Años
        </button>
        <button
            type="button"
            onClick={() => onChange('months')}
            className={`px-3 py-1 text-sm rounded-md ${unit === 'months' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-600 dark:text-gray-300'}`}
        >
            Meses
        </button>
    </div>
);


// --- Form Components ---
const InvestmentForm: React.FC<{ item?: InvestmentItem; onSave: (data: any) => void; onCancel: () => void }> = ({ item, onSave, onCancel }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSave({ id: item?.id, name: fd.get('name'), type: fd.get('type'), amount: Number(fd.get('amount')), acquisitionSource: fd.get('acquisitionSource') }); };
    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre" name="name" defaultValue={item?.name} required placeholder="Ej: Equipo de Oficina" tooltip="Nombre descriptivo para este item de inversión. Ej: 'Equipo de Cómputo'." />
            <Select label="Tipo" name="type" defaultValue={item?.type || 'Activo Fijo'} tooltip="Clasifica la inversión. 'Activo Fijo' (bienes físicos), 'Activo Diferido' (gastos pre-operativos), 'Capital de Trabajo' (operaciones diarias).">
                <option value="Activo Fijo">Activo Fijo</option><option value="Activo Diferido">Activo Diferido</option><option value="Capital de Trabajo">Capital de Trabajo</option>
            </Select>
            <Input label="Monto" name="amount" type="number" step="any" defaultValue={item?.amount} required placeholder="Ej: 50000" tooltip="Monto total de la inversión en pesos mexicanos." />
            <Select label="Fuente de Adquisición" name="acquisitionSource" defaultValue={item?.acquisitionSource || 'Aportación (Nuevo)'} tooltip="Cómo se obtuvo/financió este item. Afecta el flujo de caja inicial.">
                <option value="Aportación (Nuevo)">Aportación (Nuevo)</option>
                <option value="Aportación (Existente)">Aportación (Existente)</option>
                <option value="Financiamiento">Financiamiento</option>
                <option value="Donación">Donación</option>
            </Select>
        </FormContainer>
    );
};
const DepreciableAssetForm: React.FC<{ asset?: DepreciableAsset; onSave: (data: any) => void; onCancel: () => void }> = ({ asset, onSave, onCancel }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
            id: asset?.id,
            name: fd.get('name'),
            initialCost: Number(fd.get('initialCost')),
            salvageValue: Number(fd.get('salvageValue')),
            usefulLifeYears: Number(fd.get('usefulLifeYears')),
            depreciationMethod: fd.get('depreciationMethod')
        });
    };
    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre" name="name" defaultValue={asset?.name} required placeholder="Ej: Vehículo de reparto" tooltip="Nombre del activo que perderá valor con el tiempo. Ej: 'Vehículo de reparto'."/>
            <Input label="Costo Inicial" name="initialCost" type="number" step="any" defaultValue={asset?.initialCost} required placeholder="Ej: 300000" tooltip="Costo total de adquisición del activo."/>
            <Input label="Valor de Rescate" name="salvageValue" type="number" step="any" defaultValue={asset?.salvageValue} required placeholder="Ej: 50000" tooltip="Valor estimado del activo al final de su vida útil."/>
            <Input label="Vida Útil (años)" name="usefulLifeYears" type="number" step="any" defaultValue={asset?.usefulLifeYears} required placeholder="Ej: 5" tooltip="Años durante los cuales se espera que el activo sea productivo."/>
            <Select label="Método de Depreciación" name="depreciationMethod" defaultValue={asset?.depreciationMethod || 'Línea Recta'} tooltip="'Línea Recta' es una depreciación constante. 'Saldo Decreciente' deprecia más al principio.">
                <option value="Línea Recta">Línea Recta</option>
                <option value="Saldo Decreciente">Saldo Decreciente</option>
            </Select>
        </FormContainer>
    );
};
const RecurringRevenueForm: React.FC<{ rev?: RecurringRevenue; onSave: (data: any) => void; onCancel: () => void; projectDuration: number; }> = ({ rev, onSave, onCancel, projectDuration }) => {
    const [rates, setRates] = useState(() => Array.from({ length: Math.ceil(projectDuration) }, (_, i) => rev?.annualGrowthRates?.[i] ?? rev?.annualGrowthRates?.[rev.annualGrowthRates.length - 1] ?? 0));
    const handleRateChange = (index: number, value: number) => { const newRates = [...rates]; newRates[index] = value; setRates(newRates); };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSave({ id: rev?.id, name: fd.get('name'), initialMonthlyAmount: Number(fd.get('initialMonthlyAmount')), annualGrowthRates: rates }); };
    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre" name="name" defaultValue={rev?.name} required placeholder="Ej: Suscripciones Mensuales" tooltip="Nombre de la fuente de ingreso. Principalmente para ventas, pero también puede ser para servicios, intereses de préstamos otorgados, rendimientos de inversiones, etc. Ej: 'Ventas de Producto A'."/>
            <Input label="Monto Mensual Inicial" name="initialMonthlyAmount" type="number" step="any" defaultValue={rev?.initialMonthlyAmount} required placeholder="Ej: 15000" tooltip="Ingreso mensual esperado para esta fuente al inicio del proyecto."/>
            <div>
                 <GrowthRatesInputs title="Crecimiento Anual por Fases (%)" rates={rates} onRateChange={handleRateChange} tooltip="Tasa de crecimiento anual para este ingreso. Es independiente de la inflación."/>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">La última tasa se usará para los años siguientes.</p>
            </div>
        </FormContainer>
    );
};
const RecurringExpenseForm: React.FC<{ exp?: RecurringExpense; onSave: (data: any) => void; onCancel: () => void; projectDuration: number; }> = ({ exp, onSave, onCancel, projectDuration }) => {
    const [growthType, setGrowthType] = useState(exp?.growthType || 'annual');
    const [rates, setRates] = useState(() => Array.from({ length: Math.ceil(projectDuration) }, (_, i) => exp?.annualGrowthRates?.[i] ?? exp?.annualGrowthRates?.[exp.annualGrowthRates.length - 1] ?? 0));
    const handleRateChange = (index: number, value: number) => { const newRates = [...rates]; newRates[index] = value; setRates(newRates); };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
            id: exp?.id,
            name: fd.get('name'),
            type: fd.get('type'),
            initialMonthlyAmount: Number(fd.get('initialMonthlyAmount')),
            growthType: fd.get('growthType'),
            monthlyGrowthRate: growthType === 'monthly' ? Number(fd.get('monthlyGrowthRate')) : 0,
            annualGrowthRates: growthType === 'annual' ? rates : []
        });
    };

    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre" name="name" defaultValue={exp?.name} required placeholder="Ej: Renta de Oficina" tooltip="Nombre del costo o gasto. Ej: 'Renta de Oficina'."/>
            <Select label="Tipo" name="type" defaultValue={exp?.type || 'Fijo'} tooltip="'Fijo' no cambia con las ventas (ej. renta). 'Variable' sí cambia (ej. comisiones)."><option value="Fijo">Fijo</option><option value="Variable">Variable</option></Select>
            <Input label="Monto Mensual Inicial" name="initialMonthlyAmount" type="number" step="any" defaultValue={exp?.initialMonthlyAmount} required placeholder="Ej: 20000" tooltip="Gasto mensual esperado al inicio del proyecto."/>
            <Select label="Tipo de Crecimiento" name="growthType" value={growthType} onChange={e => setGrowthType(e.target.value as any)}>
                <option value="annual">Anual por Fases</option>
                <option value="monthly">Mensual Compuesto</option>
            </Select>

            {growthType === 'annual' ? (
                <div>
                    <GrowthRatesInputs 
                        title="Crecimiento Anual por Fases (%)" 
                        rates={rates} 
                        onRateChange={handleRateChange} 
                        tooltip="Define una tasa de crecimiento específica para cada año. Este crecimiento se aplica ANTES de la inflación general del proyecto."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">La última tasa se usará para los años siguientes.</p>
                </div>
            ) : (
                <Input 
                    label="Crecimiento Mensual (%)" 
                    name="monthlyGrowthRate" 
                    type="number" 
                    step="any" 
                    defaultValue={exp?.monthlyGrowthRate || 0} 
                    required 
                    tooltip="Tasa de crecimiento que se aplica y compone cada mes. Este crecimiento se aplica ANTES de la inflación general del proyecto."
                />
            )}
        </FormContainer>
    );
};
const LoanForm: React.FC<{ loan?: Loan; onSave: (data: any) => void; onCancel: () => void }> = ({ loan, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: loan?.name || '',
        principal: loan?.principal || 0,
        annualInterestRate: loan?.annualInterestRate || 0,
        termMonths: loan?.termMonths || 1,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
    };

    const monthlyPayment = useMemo(() => {
        const { principal, annualInterestRate, termMonths } = formData;
        if (principal <= 0 || annualInterestRate < 0 || termMonths <= 0) return 0;
        if (annualInterestRate === 0) return principal / termMonths;
        
        const monthlyRate = annualInterestRate / 100 / 12;
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
        return payment;
    }, [formData]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ id: loan?.id, ...formData });
    };

    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required placeholder="Ej: Crédito PyME" tooltip="Nombre del préstamo o financiamiento. Ej: 'Crédito PyME Banorte'." />
            <Input label="Monto Principal" name="principal" type="number" step="any" value={formData.principal} onChange={handleChange} required placeholder="Ej: 500000" tooltip="Monto total del préstamo recibido." />
            <Input label="Tasa Interés Anual (%)" name="annualInterestRate" type="number" step="any" value={formData.annualInterestRate} onChange={handleChange} required placeholder="Ej: 15" tooltip="Tasa de interés anual en porcentaje. Ej: 15 para 15%." />
            <Input label="Plazo (Meses)" name="termMonths" type="number" step="1" min="1" value={formData.termMonths} onChange={handleChange} required placeholder="Ej: 60" tooltip="Número total de meses para pagar el préstamo." />
            <div className="p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Pago Mensual Fijo (calculado):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{isFinite(monthlyPayment) ? formatCurrency(monthlyPayment) : 'N/A'}</span>
                </div>
            </div>
        </FormContainer>
    );
};

const PositionForm: React.FC<{ position?: Position; onSave: (data: any) => void; onCancel: () => void; }> = ({ position, onSave, onCancel }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSave({ id: position?.id, name: fd.get('name'), monthlySalary: Number(fd.get('monthlySalary')) }); };
    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre del Puesto" name="name" defaultValue={position?.name} required placeholder="Ej: Desarrollador Backend" tooltip="Nombre del puesto de trabajo. Ej: 'Gerente de Ventas'." />
            <Input label="Salario Mensual Bruto" name="monthlySalary" type="number" step="any" defaultValue={position?.monthlySalary} required placeholder="Ej: 50000" tooltip="Salario mensual bruto (antes de impuestos y deducciones)." />
        </FormContainer>
    )
};
const BOMItemForm: React.FC<{ item?: BOMItem; onSave: (data: any) => void; onCancel: () => void; bomItemCost: number; dailyMinimumWage: number }> = ({ item, onSave, onCancel, bomItemCost, dailyMinimumWage }) => {
    const [costType, setCostType] = useState(item?.costType || 'Materia Prima');
    const [minutes, setMinutes] = useState(item?.minutesPerUnit || 0);

    const costPerMinute = useMemo(() => {
        if (dailyMinimumWage > 0) {
            const hourlyRate = dailyMinimumWage / 8; // Assume 8-hour workday
            return hourlyRate / 60;
        }
        return 0;
    }, [dailyMinimumWage]);

    const calculatedLaborCost = useMemo(() => {
        if (costType === 'Mano de Obra') {
            return (minutes || 0) * costPerMinute;
        }
        return 0;
    }, [costType, minutes, costPerMinute]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const commonData = {
            id: item?.id,
            componentName: fd.get('componentName') as string,
            costType: fd.get('costType') as 'Materia Prima' | 'Mano de Obra',
        };
        if (commonData.costType === 'Materia Prima') {
            onSave({ 
                ...commonData, 
                batchCost: Number(fd.get('batchCost')),
                batchQuantity: Number(fd.get('batchQuantity')),
                batchUnit: fd.get('batchUnit'),
                batchYield: Number(fd.get('batchYield')),
            });
        } else {
            onSave({ ...commonData, minutesPerUnit: Number(fd.get('minutesPerUnit')) });
        }
    };
    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre del Componente" name="componentName" defaultValue={item?.componentName} required placeholder="Ej: Harina de Maíz" tooltip="Nombre del insumo o paso del proceso. Ej: 'Harina de Trigo'." />
            <Select label="Tipo de Costo" name="costType" value={costType} onChange={e => setCostType(e.target.value as any)} tooltip="'Materia Prima' para insumos físicos. 'Mano de Obra' para tiempo de trabajo.">
                <option value="Materia Prima">Materia Prima</option>
                <option value="Mano de Obra">Mano de Obra</option>
            </Select>
            {costType === 'Materia Prima' ? (
                <div className="space-y-3 p-3 border rounded-md bg-white dark:bg-gray-800">
                     <Input label="Costo del Lote ($)" name="batchCost" type="number" step="any" defaultValue={item?.batchCost} required placeholder="Ej: 500" tooltip="Costo total de comprar un lote de materia prima. Ej: costo de un saco de 50kg." />
                     <div className="grid grid-cols-2 gap-2">
                        <Input label="Cantidad Lote" name="batchQuantity" type="number" step="any" defaultValue={item?.batchQuantity} required placeholder="Ej: 5" tooltip="La cantidad que contiene el lote. Ej: 50." />
                        <Input label="Unidad" name="batchUnit" defaultValue={item?.batchUnit} required placeholder="Ej: Kilos, Litros" tooltip="La unidad de medida del lote. Ej: 'Kg', 'Litros'." />
                     </div>
                     <Input label="Rendimiento del Lote" name="batchYield" type="number" step="any" defaultValue={item?.batchYield} required placeholder="Ej: 300 (unidades)" tooltip="¿Cuántas unidades de tu producto final se pueden hacer con este lote?"/>
                </div>
            ) : (
                <div>
                    <Input label="Minutos por Unidad" name="minutesPerUnit" type="number" step="any" value={minutes} onChange={e => setMinutes(Number(e.target.value))} required placeholder="Ej: 10" tooltip="Minutos de trabajo directo necesarios para producir UNA unidad del producto final." />
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-1">
                        <p className="flex justify-between">
                            <span>Costo por Minuto (calculado):</span>
                            <span className="font-mono">{formatCurrency(costPerMinute, 4)}</span>
                        </p>
                        <p className="flex justify-between font-bold text-gray-700 dark:text-gray-200">
                            <span>Costo Total Mano de Obra:</span>
                            <span className="font-mono">{formatCurrency(calculatedLaborCost)}</span>
                        </p>
                    </div>
                </div>
            )}
        </FormContainer>
    );
};

const GrowthRatesInputs: React.FC<{
    title: string;
    rates: number[];
    onRateChange: (index: number, value: number) => void;
    tooltip?: string;
}> = ({ title, rates, onRateChange, tooltip }) => (
    <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>{title}</span>
            {tooltip && <InfoIcon tooltip={tooltip} />}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md bg-white dark:bg-gray-800">
            {rates.map((rate, i) => <Input key={i} label={`Año ${i + 1}`} type="number" step="any" value={rate} onChange={e => onRateChange(i, Number(e.target.value))} />)}
        </div>
    </div>
);

const ProductForm: React.FC<{ product?: Product; onSave: (data: any) => void; onCancel: () => void; projectDuration: number; }> = ({ product, onSave, onCancel, projectDuration }) => {
    const [salesRates, setSalesRates] = useState(() => Array.from({ length: Math.ceil(projectDuration) }, (_, i) => product?.annualSalesGrowthRates?.[i] ?? product?.annualSalesGrowthRates?.[product.annualSalesGrowthRates.length - 1] ?? 0));
    const [costRates, setCostRates] = useState(() => Array.from({ length: Math.ceil(projectDuration) }, (_, i) => product?.annualVariableCostGrowthRates?.[i] ?? product?.annualVariableCostGrowthRates?.[product.annualVariableCostGrowthRates.length - 1] ?? 0));
    const [priceRates, setPriceRates] = useState(() => Array.from({ length: Math.ceil(projectDuration) }, (_, i) => product?.annualPriceIncreaseRates?.[i] ?? product?.annualPriceIncreaseRates?.[product.annualPriceIncreaseRates.length - 1] ?? 0));
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
            id: product?.id,
            name: fd.get('name'),
            markupPercentage: Number(fd.get('markupPercentage')),
            unitsSoldPerMonth: Number(fd.get('unitsSoldPerMonth')),
            annualSalesGrowthRates: salesRates,
            annualVariableCostGrowthRates: costRates,
            annualPriceIncreaseRates: priceRates,
            bomItems: product?.bomItems || []
        });
    };
    return (
        <FormContainer onSubmit={handleSubmit} onCancel={onCancel}>
            <Input label="Nombre del Producto/Servicio" name="name" defaultValue={product?.name} required placeholder="Ej: Suscripción Premium" tooltip="Nombre del producto o servicio que vendes. Ej: 'Consultoría Estratégica'." />
            <Input label="Unidades Vendidas/Mes" name="unitsSoldPerMonth" type="number" defaultValue={product?.unitsSoldPerMonth} required placeholder="Ej: 100" tooltip="Cantidad de unidades que esperas vender cada mes al inicio del proyecto." />
            <Input label="Margen de Ganancia (%)" name="markupPercentage" type="number" defaultValue={product?.markupPercentage} required placeholder="Ej: 200" tooltip="Porcentaje que se añade al costo unitario para determinar el precio de venta. 100% significa duplicar el costo." />
            
            <GrowthRatesInputs title="Crec. Ventas Anual (%)" rates={salesRates} onRateChange={(i, v) => setSalesRates(prev => { const next = [...prev]; next[i] = v; return next; })} tooltip="Tasa de crecimiento anual para las ventas de ESTE producto."/>
            <GrowthRatesInputs title="Crec. Costos Var. Anual (%)" rates={costRates} onRateChange={(i, v) => setCostRates(prev => { const next = [...prev]; next[i] = v; return next; })} tooltip="Tasa de crecimiento anual para los costos (BOM) de ESTE producto. Se suma a la inflación general."/>
            <GrowthRatesInputs title="Aumento Anual de Precio (%)" rates={priceRates} onRateChange={(i, v) => setPriceRates(prev => { const next = [...prev]; next[i] = v; return next; })} tooltip="Tu estrategia de aumento de precios anual. Puede ser diferente a la inflación."/>
        </FormContainer>
    );
};

const ColorCustomizer: React.FC<{ colors: string[], onColorChange: (index: number, color: string) => void }> = ({ colors, onColorChange }) => {
    const labels = ["U. Bruta / Flujo Neto", "C. Fijos / Flujo Acum.", "C. Variables", "Serie 4", "Serie 5", "Serie 6"];
    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Personaliza los colores de las series en los gráficos. Los cambios se aplicarán al instante.</p>
            <div className="grid grid-cols-2 gap-4">
                {colors.map((color, index) => (
                    <div key={index} className="flex items-center">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => onColorChange(index, e.target.value)}
                            className="w-8 h-8 p-0 border-none rounded-md cursor-pointer"
                            style={{ backgroundColor: color }}
                        />
                        <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">{labels[index] || `Serie ${index + 1}`}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NotesEditor: React.FC<{ notes: string | undefined; setNotes: (value: string) => void }> = ({ notes, setNotes }) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const parseMarkdown = (text: string): string => {
        if (!text) return '<p class="text-gray-400 italic">Nada que previsualizar.</p>';
        
        let html = text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        html = html
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Process lists
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\s*<li>/g, '</li><li>'); // clean up spacing
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/g, '');

        return html.replace(/\n/g, '<br />');
    };
    
    const renderedHtml = useMemo(() => parseMarkdown(notes || ''), [notes]);

    return (
        <div>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-2">
                <button onClick={() => setActiveTab('edit')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'edit' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Editar</button>
                <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'preview' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Vista Previa</button>
            </div>
            {activeTab === 'edit' ? (
                <>
                    <textarea
                        value={notes || ''}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={8}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                        placeholder="Escribe aquí. Usa **negritas**, *cursivas*, y - para listas."
                    />
                    <p className="text-right text-xs mt-1 text-gray-500 dark:text-gray-400">{notes?.length || 0} caracteres</p>
                </>
            ) : (
                <div 
                    className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm min-h-[202px] max-h-[202px] overflow-y-auto notes-preview"
                    dangerouslySetInnerHTML={{ __html: renderedHtml.replace(/<strong>/g, '<strong class="font-bold">').replace(/<em>/g, '<em class="italic">').replace(/<ul>/g, '<ul class="list-disc pl-5 space-y-1">') }}
                />
            )}
        </div>
    );
};


// --- Main Control Panel Component ---
interface ControlPanelProps {
    projectData: ProjectData;
    derivedData: {
        investmentItems: InvestmentItem[];
        recurringRevenues: RecurringRevenue[];
        recurringExpenses: RecurringExpense[];
        bomItemCosts: { [key: number]: number };
        netInitialInvestment: number;
    };
    setProjectDuration: (value: number) => void;
    durationUnit: 'years' | 'months';
    setDurationUnit: (unit: 'years' | 'months') => void;
    setDiscountRate: (value: number) => void;
    setTaxRate: (value: number) => void;
    setMinimumAcceptableIRR: (value: number) => void;
    setInflationRate: (value: number) => void;
    setNotes: (value: string) => void;
    financialMetrics: { 
      npv: number; paybackPeriod: string; irr: number | null; cbr: number; roi: number | null;
      incrementalIRR?: number | null;
      incrementalNPV?: number;
    };
    handlers: Handlers;
    theme: Theme;
    customChartColors: string[] | null;
    setCustomChartColors: (colors: string[]) => void;
    incrementalAnalysisConfig: { investmentId: string | null; loanId: string | null; impactPercentage: number };
    setIncrementalAnalysisConfig: (config: { investmentId: string | null; loanId: string | null; impactPercentage: number }) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    projectData,
    derivedData,
    setProjectDuration, durationUnit, setDurationUnit,
    setDiscountRate, setTaxRate, setMinimumAcceptableIRR, setInflationRate, setNotes,
    financialMetrics,
    handlers,
    theme,
    customChartColors,
    setCustomChartColors,
    incrementalAnalysisConfig,
    setIncrementalAnalysisConfig
}) => {
    const { projectDuration, discountRate, taxRate, inflationRate, minimumAcceptableIRR, notes, depreciableAssets, loans, payrollConfig, workingCapitalConfig, advancedConfig } = projectData;
    const { investmentItems, recurringRevenues, recurringExpenses } = derivedData;
    
    const projectDurationInYears = durationUnit === 'years' ? projectDuration : projectDuration / 12;

    const [editingState, setEditingState] = useState<{ type: string, id: number | 'new' | null, parentId?: number }>({ type: '', id: null });
    const handleEdit = (type: string, id: number | 'new', parentId?: number) => setEditingState({ type, id, parentId });
    const handleCancel = () => setEditingState({ type: '', id: null });
    
    const [tirInput, setTirInput] = useState<string>(`${minimumAcceptableIRR || discountRate || 0}%`);
    const [isTirValid, setIsTirValid] = useState<boolean>(true);

    useEffect(() => {
        setTirInput(`${projectData.minimumAcceptableIRR || projectData.discountRate || 0}%`);
        setIsTirValid(true);
    }, [projectData.minimumAcceptableIRR, projectData.discountRate]);
    
    const handleTirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTirInput(value);
        const numericValue = parseFloat(value.replace(/%/g, '').trim());
        setIsTirValid(value.trim() === '' || (!isNaN(numericValue) && isFinite(numericValue)));
    };

    const handleTirBlur = () => {
        const numericValue = parseFloat(tirInput.replace(/%/g, '').trim());
        if (isTirValid && !isNaN(numericValue) && isFinite(numericValue)) {
            setMinimumAcceptableIRR(numericValue);
            setTirInput(`${numericValue}%`);
        } else {
            setTirInput(`${projectData.minimumAcceptableIRR || projectData.discountRate || 0}%`);
            setIsTirValid(true);
        }
    };
    
    const handleConfigChange = (handler: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
        handler({ [e.target.name]: Number(e.target.value) });
    }

    const handleColorChange = (index: number, color: string) => {
        const currentColors = customChartColors || theme.colors.chart;
        const newColors = [...currentColors];
        newColors[index] = color;
        setCustomChartColors(newColors);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-lg space-y-4 h-full overflow-y-auto">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Panel de Control</h3>
            </div>

            <CollapsibleSection title="Configuración General" initiallyOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-end gap-2">
                        <Input
                            label={`Duración (${durationUnit === 'years' ? 'Años' : 'Meses'})`}
                            type="number"
                            value={projectDuration}
                            onChange={e => setProjectDuration(Number(e.target.value))}
                            className="flex-grow"
                        />
                        <UnitSwitch unit={durationUnit} onChange={setDurationUnit} />
                    </div>
                    <Input label="Tasa Impuestos (%)" type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} tooltip="Tasa de impuestos sobre las utilidades (ISR en México es ~30%)." />
                    <Input label="Tasa Descuento (%)" type="number" value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} tooltip="Tasa de rendimiento mínima que esperas de la inversión. Se usa para calcular el VPN."/>
                    <Input 
                        label="TIR Mínima Aceptable (%)"
                        type="text"
                        value={tirInput}
                        onChange={handleTirChange}
                        onBlur={handleTirBlur}
                        error={!isTirValid}
                        tooltip="Tasa Mínima Aceptable de Rendimiento (TMAR). Es tu 'tasa de corte' para decidir si un proyecto es viable. Se compara con la TIR calculada." />
                    <Input label="Inflación Anual (%)" type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} tooltip="Tasa de inflación promedio esperada. Afectará principalmente el crecimiento de los costos de materias primas y gastos recurrentes."/>
                </div>
                <CollapsibleSection title="Personalizar Colores de Gráficos">
                    <ColorCustomizer
                        colors={customChartColors || theme.colors.chart}
                        onColorChange={handleColorChange}
                    />
                </CollapsibleSection>
            </CollapsibleSection>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Métricas Financieras</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">VPN</p>
                        <div className="flex items-center justify-center h-7">
                            <p className="text-lg font-bold" style={{color: financialMetrics.npv >= 0 ? theme.colors.positive : theme.colors.negative}}>{formatCurrency(financialMetrics.npv)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">TIR</p>
                        <div className="flex items-center justify-center gap-1 h-7">
                            <p className="text-lg font-bold" style={{color: financialMetrics.irr !== null ? (financialMetrics.irr >= minimumAcceptableIRR ? theme.colors.positive : theme.colors.negative) : theme.colors.metrics.irr}}>
                                {financialMetrics.irr !== null ? `${financialMetrics.irr.toFixed(2)}%` : 'N/A'}
                            </p>
                            {financialMetrics.irr === null && (
                                <InfoIcon tooltip="La TIR no se puede calcular, usualmente porque no hay una inversión inicial (flujo negativo en año 0) o porque el proyecto nunca genera flujos positivos." />
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Payback</p>
                        <div className="flex items-center justify-center h-7">
                            <p className="text-sm font-bold" style={{color: theme.colors.metrics.payback}}>{financialMetrics.paybackPeriod}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">B/C</p>
                        <div className="flex items-center justify-center h-7">
                            <p className="text-lg font-bold" style={{color: theme.colors.metrics.cbr}} title="Relación Beneficio-Costo (descontado)">{financialMetrics.cbr.toFixed(2)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
                        <div className="flex items-center justify-center gap-1 h-7">
                            <p className="text-lg font-bold" style={{color: theme.colors.metrics.roi}}>{financialMetrics.roi !== null ? `${financialMetrics.roi.toFixed(2)}%` : 'N/A'}</p>
                            {financialMetrics.roi === null && (
                                <InfoIcon tooltip="El ROI no se puede calcular porque no hay una inversión inicial neta mayor a cero." />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CollapsibleSection title="Análisis de Inversión Incremental (TIR Marginal)">
                 <IncrementalAnalysisCalculator
                    projectData={projectData}
                    financialMetrics={financialMetrics}
                    theme={theme}
                    config={incrementalAnalysisConfig}
                    setConfig={setIncrementalAnalysisConfig}
                />
            </CollapsibleSection>

            <CollapsibleSection title="Notas del Proyecto">
                <NotesEditor notes={notes} setNotes={setNotes} />
            </CollapsibleSection>

            <CollapsibleSection title="Productos y Servicios" initiallyOpen={true}>
                {advancedConfig.products.map(product => {
                     const totalBomCost = product.bomItems.reduce((sum, item) => sum + (derivedData.bomItemCosts[item.id] || 0), 0);
                     const sellingPrice = totalBomCost * (1 + product.markupPercentage / 100);
                    return editingState.type === 'product' && editingState.id === product.id ? (
                         <ProductForm key={product.id} product={product} onSave={data => { handlers.updateProduct(data); handleCancel(); }} onCancel={handleCancel} projectDuration={projectDurationInYears} />
                    ) : (
                        <CollapsibleSection 
                            key={product.id}
                            title={<span>{product.name} <span className="text-xs font-normal text-gray-500">({product.unitsSoldPerMonth} unidades/mes)</span></span>}
                            actions={<div className="flex"><Button onClick={() => handleEdit('product', product.id)} variant="ghost" className="p-1"><EditIcon /></Button><Button onClick={() => handlers.deleteProduct(product.id)} variant="ghost" className="p-1 text-red-500"><DeleteIcon /></Button></div>}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md">
                                    <div className="font-bold text-gray-800 dark:text-gray-100 border-t pt-2 mt-1">Costo Unitario TOTAL:</div><div className="text-right font-bold font-mono border-t pt-2 mt-1">{formatCurrency(totalBomCost, 2)}</div>
                                    <div className="font-medium text-gray-600 dark:text-gray-300">Margen de Ganancia:</div><div className="text-right font-mono">{product.markupPercentage.toFixed(1)}%</div>
                                    <div className="font-bold text-blue-600 dark:text-blue-400">Precio de Venta Sugerido:</div><div className="text-right font-bold font-mono text-blue-600 dark:text-blue-400">{formatCurrency(sellingPrice, 2)}</div>
                                </div>
                                 <div>
                                    <h5 className="font-medium mb-2 text-sm">Desglose de Costos (BOM)</h5>
                                    {product.bomItems.map(item => editingState.type === 'bom' && editingState.id === item.id ? (
                                        <BOMItemForm key={item.id} item={item} onSave={data => { handlers.updateBOMItem(product.id, data); handleCancel(); }} onCancel={handleCancel} bomItemCost={derivedData.bomItemCosts[item.id]} dailyMinimumWage={payrollConfig.dailyMinimumWage} />
                                    ) : (
                                        <div key={item.id} className="flex justify-between items-center p-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                            <span>{item.componentName} <span className="text-xs text-gray-400">({item.costType})</span></span>
                                            <span className="font-mono">{formatCurrency(derivedData.bomItemCosts[item.id], 4)}</span>
                                            <div className="flex"><Button onClick={() => handleEdit('bom', item.id, product.id)} variant="ghost" className="p-1"><EditIcon /></Button><Button onClick={() => handlers.deleteBOMItem(product.id, item.id)} variant="ghost" className="p-1 text-red-500"><DeleteIcon /></Button></div>
                                        </div>
                                    ))}
                                    {editingState.type === 'bom' && editingState.parentId === product.id && editingState.id === 'new' ? <BOMItemForm onSave={data => { handlers.addBOMItem(product.id, data); handleCancel(); }} onCancel={handleCancel} bomItemCost={0} dailyMinimumWage={payrollConfig.dailyMinimumWage}/> : <Button onClick={() => handleEdit('bom', 'new', product.id)} variant="secondary" className="w-full mt-2 text-xs"><PlusIcon /> Agregar Componente</Button>}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )
                })}
                 {editingState.type === 'product' && editingState.id === 'new' ? (
                    <ProductForm onSave={data => { handlers.addProduct(data); handleCancel(); }} onCancel={handleCancel} projectDuration={projectDurationInYears} />
                ) : (
                    <Button onClick={() => handleEdit('product', 'new')} variant="secondary" className="w-full mt-2"><PlusIcon /> Agregar Producto o Servicio</Button>
                )}
            </CollapsibleSection>

            <CollapsibleSection title="Calculadoras Automáticas" initiallyOpen={false}>
                <div className="space-y-4">
                    {/* --- PAYROLL CALCULATOR --- */}
                    <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><CalculatorIcon /> <span className="ml-2">Nómina</span></h4>
                        <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900/50 space-y-4">
                            <div>
                                <h5 className="font-medium mb-2">Puestos Fijos</h5>
                                {payrollConfig.positions.map(pos => editingState.type === 'position' && editingState.id === pos.id ? (
                                    <PositionForm key={pos.id} position={pos} onSave={data => { handlers.updatePosition(data); handleCancel(); }} onCancel={handleCancel} />
                                ) : (
                                    <div key={pos.id} className="flex justify-between items-center p-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                        <span>{pos.name}</span><span className="font-mono">{formatCurrency(pos.monthlySalary)}</span>
                                        <div className="flex"><Button onClick={() => handleEdit('position', pos.id)} variant="ghost" className="p-1"><EditIcon /></Button><Button onClick={() => handlers.deletePosition(pos.id)} variant="ghost" className="p-1 text-red-500"><DeleteIcon /></Button></div>
                                    </div>
                                ))}
                                {editingState.type === 'position' && editingState.id === 'new' ? <PositionForm onSave={data => { handlers.addPosition(data); handleCancel(); }} onCancel={handleCancel} /> : <Button onClick={() => handleEdit('position', 'new')} variant="secondary" className="w-full mt-2 text-xs"><PlusIcon /> Agregar Puesto</Button>}
                            </div>
                            <div>
                                <h5 className="font-medium mb-2">Prestaciones</h5>
                                 <div className="grid grid-cols-2 gap-3">
                                    <Input label="Días Vacaciones/Año" name="vacationDaysPerYear" type="number" value={payrollConfig.vacationDaysPerYear} onChange={handleConfigChange(handlers.updatePayrollConfig)} tooltip="Promedio de días de vacaciones anuales por empleado." />
                                    <Input label="Prima Vacacional (%)" name="vacationBonusRate" type="number" value={payrollConfig.vacationBonusRate} onChange={handleConfigChange(handlers.updatePayrollConfig)} tooltip="Porcentaje del salario diario que se paga como bono en vacaciones (en México es 25% mínimo)." />
                                </div>
                            </div>
                        </div>
                        {/* Common payroll fields */}
                        <div className="grid grid-cols-2 gap-3 p-3 mt-2 border rounded-md bg-gray-50 dark:bg-gray-900/50">
                            <Input label="Nº Empleados Temp." name="temporaryEmployees" type="number" value={payrollConfig.temporaryEmployees} onChange={handleConfigChange(handlers.updatePayrollConfig)} />
                            <Input label="Salario Mensual Temp." name="temporaryEmployeeSalary" type="number" value={payrollConfig.temporaryEmployeeSalary} onChange={handleConfigChange(handlers.updatePayrollConfig)} />
                            <Input label="Carga Social (%)" name="socialChargesRate" type="number" value={payrollConfig.socialChargesRate} onChange={handleConfigChange(handlers.updatePayrollConfig)} tooltip="Porcentaje adicional al salario por impuestos y prestaciones (ej. IMSS, Infonavit). Suele ser entre 30% y 40% en México."/>
                            <Input label="Salario Mínimo Diario" name="dailyMinimumWage" type="number" value={payrollConfig.dailyMinimumWage} onChange={handleConfigChange(handlers.updatePayrollConfig)} tooltip="Salario mínimo diario. Se usa para calcular costos de mano de obra por minuto (asume jornada de 8 hrs)." />
                            <Input label="Crec. Salarial Anual (%)" name="annualSalaryGrowthRate" type="number" value={payrollConfig.annualSalaryGrowthRate} onChange={handleConfigChange(handlers.updatePayrollConfig)} tooltip="Aumento salarial anual esperado por mérito. La inflación se suma aparte."/>
                        </div>
                    </div>
                     {/* --- WORKING CAPITAL --- */}
                     <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center"><CalculatorIcon /> <span className="ml-2">Capital de Trabajo</span></h4>
                        <div className="grid grid-cols-2 gap-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-900/50">
                           <Input label="Días Cuentas por Cobrar" name="accountsReceivableDays" type="number" value={workingCapitalConfig.accountsReceivableDays} onChange={handleConfigChange(handlers.updateWorkingCapitalConfig)} tooltip="Número de días promedio que tardas en recibir el pago de tus clientes." />
                           <Input label="Días Cuentas por Pagar" name="accountsPayableDays" type="number" value={workingCapitalConfig.accountsPayableDays} onChange={handleConfigChange(handlers.updateWorkingCapitalConfig)} tooltip="Número de días promedio que tardas en pagar a tus proveedores." />
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* --- MANUAL DATA ENTRY SECTIONS --- */}
            <CollapsibleSection title={`Inversión Inicial (${investmentItems.length})`}>
                {investmentItems.map(item => editingState.type === 'investment' && editingState.id === item.id ? <InvestmentForm key={item.id} item={item} onSave={data => { handlers.updateInvestmentItem(data); handleCancel(); }} onCancel={handleCancel} /> : <div key={item.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"><div><p className="font-medium">{item.name} <span className="text-xs text-gray-500 ml-2">({item.type})</span>{item.isCalculated && <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/50 rounded-full px-2 py-0.5 ml-2">Calculado</span>}</p><p className="text-sm" style={{color: theme.colors.positive}}>{formatCurrency(item.amount)}</p></div><div className="flex space-x-2"><Button onClick={() => handleEdit('investment', item.id)} variant="ghost" className="p-2" disabled={item.isCalculated}><EditIcon /></Button><Button onClick={() => handlers.deleteInvestmentItem(item.id)} variant="ghost" className="p-2 text-red-500" disabled={item.isCalculated}><DeleteIcon /></Button></div></div>)}
                {editingState.type === 'investment' && editingState.id === 'new' ? <InvestmentForm onSave={data => { handlers.addInvestmentItem(data); handleCancel(); }} onCancel={handleCancel} /> : <Button onClick={() => handleEdit('investment', 'new')} variant="secondary" className="w-full mt-2"><PlusIcon /> Agregar Inversión Manual</Button>}
            </CollapsibleSection>
            <CollapsibleSection title={`Activos Depreciables (${depreciableAssets.length})`}>
                {depreciableAssets.map(asset => editingState.type === 'asset' && editingState.id === asset.id ? <DepreciableAssetForm key={asset.id} asset={asset} onSave={data => { handlers.updateDepreciableAsset(data); handleCancel(); }} onCancel={handleCancel} /> : <div key={asset.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"><div><p className="font-medium">{asset.name}</p><p className="text-sm text-gray-500">Costo: {formatCurrency(asset.initialCost)}</p></div><div className="flex space-x-2"><Button onClick={() => handleEdit('asset', asset.id)} variant="ghost" className="p-2"><EditIcon /></Button><Button onClick={() => handlers.deleteDepreciableAsset(asset.id)} variant="ghost" className="p-2 text-red-500"><DeleteIcon /></Button></div></div>)}
                {editingState.type === 'asset' && editingState.id === 'new' ? <DepreciableAssetForm onSave={data => { handlers.addDepreciableAsset(data); handleCancel(); }} onCancel={handleCancel} /> : <Button onClick={() => handleEdit('asset', 'new')} variant="secondary" className="w-full mt-2"><PlusIcon /> Agregar Activo</Button>}
            </CollapsibleSection>
            <CollapsibleSection title={`Ingresos Recurrentes (${recurringRevenues.length})`}>
                {recurringRevenues.map(rev => editingState.type === 'revenue' && editingState.id === rev.id ? <RecurringRevenueForm key={rev.id} rev={rev} onSave={data => { handlers.updateRecurringRevenue(data); handleCancel(); }} onCancel={handleCancel} projectDuration={projectDurationInYears}/> : <div key={rev.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"><div><p className="font-medium">{rev.name}{rev.isCalculated && <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/50 rounded-full px-2 py-0.5 ml-2">Calculado</span>}</p><p className="text-sm text-gray-500">{formatCurrency(rev.initialMonthlyAmount)}/mes</p></div><div className="flex space-x-2"><Button onClick={() => handleEdit('revenue', rev.id)} variant="ghost" className="p-2" disabled={rev.isCalculated}><EditIcon /></Button><Button onClick={() => handlers.deleteRecurringRevenue(rev.id)} variant="ghost" className="p-2 text-red-500" disabled={rev.isCalculated}><DeleteIcon /></Button></div></div>)}
                 {editingState.type === 'revenue' && editingState.id === 'new' ? <RecurringRevenueForm onSave={data => { handlers.addRecurringRevenue(data); handleCancel(); }} onCancel={handleCancel} projectDuration={projectDurationInYears} /> : <Button onClick={() => handleEdit('revenue', 'new')} variant="secondary" className="w-full mt-2"><PlusIcon /> Agregar Ingreso Manual</Button>}
            </CollapsibleSection>
            <CollapsibleSection title={`Costos Recurrentes (${recurringExpenses.length})`}>
                 {recurringExpenses.map(exp => editingState.type === 'expense' && editingState.id === exp.id ? <RecurringExpenseForm key={exp.id} exp={exp} onSave={data => { handlers.updateRecurringExpense(data); handleCancel(); }} onCancel={handleCancel} projectDuration={projectDurationInYears} /> : <div key={exp.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"><div><p className="font-medium">{exp.name} <span className="text-xs text-gray-500 ml-2">({exp.type})</span>{exp.isCalculated && <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/50 rounded-full px-2 py-0.5 ml-2">Calculado</span>}</p><p className="text-sm" style={{color: theme.colors.negative}}>{formatCurrency(exp.initialMonthlyAmount)}/mes</p></div><div className="flex space-x-2"><Button onClick={() => handleEdit('expense', exp.id)} variant="ghost" className="p-2" disabled={exp.isCalculated}><EditIcon /></Button><Button onClick={() => handlers.deleteRecurringExpense(exp.id)} variant="ghost" className="p-2 text-red-500" disabled={exp.isCalculated}><DeleteIcon /></Button></div></div>)}
                {editingState.type === 'expense' && editingState.id === 'new' ? <RecurringExpenseForm onSave={data => { handlers.addRecurringExpense(data); handleCancel(); }} onCancel={handleCancel} projectDuration={projectDurationInYears} /> : <Button onClick={() => handleEdit('expense', 'new')} variant="secondary" className="w-full mt-2"><PlusIcon /> Agregar Costo Manual</Button>}
            </CollapsibleSection>
            <CollapsibleSection title={`Financiamiento (${loans.length})`}>
                {loans.map(loan => editingState.type === 'loan' && editingState.id === loan.id ? <LoanForm key={loan.id} loan={loan} onSave={data => { handlers.updateLoan(data); handleCancel(); }} onCancel={handleCancel} /> : <div key={loan.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"><div><p className="font-medium">{loan.name}</p><p className="text-sm text-gray-500">{formatCurrency(loan.principal)} @ {loan.annualInterestRate}%</p></div><div className="flex space-x-2"><Button onClick={() => handleEdit('loan', loan.id)} variant="ghost" className="p-2"><EditIcon /></Button><Button onClick={() => handlers.deleteLoan(loan.id)} variant="ghost" className="p-2 text-red-500"><DeleteIcon /></Button></div></div>)}
                {editingState.type === 'loan' && editingState.id === 'new' ? <LoanForm onSave={data => { handlers.addLoan(data); handleCancel(); }} onCancel={handleCancel} /> : <Button onClick={() => handleEdit('loan', 'new')} variant="secondary" className="w-full mt-2"><PlusIcon /> Agregar Préstamo</Button>}
            </CollapsibleSection>
        </div>
    );
};

const IncrementalAnalysisCalculator: React.FC<{
    projectData: ProjectData;
    financialMetrics: { incrementalIRR?: number | null; incrementalNPV?: number };
    theme: Theme;
    config: { investmentId: string | null; loanId: string | null; impactPercentage: number };
    setConfig: (config: { investmentId: string | null; loanId: string | null; impactPercentage: number }) => void;
}> = ({ projectData, financialMetrics, theme, config, setConfig }) => {
    
    const newInvestments = useMemo(() => {
        // @ts-ignore
        return projectData.investmentItems.filter(item =>
            item.acquisitionSource === 'Aportación (Nuevo)' || item.acquisitionSource === 'Financiamiento'
        );
    }, [projectData.investmentItems]);

    const { incrementalIRR, incrementalNPV } = financialMetrics;

    return (
        <div className="space-y-4 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
                Evalúa la rentabilidad de una sola inversión nueva (ej. comprar una máquina adicional) en lugar del proyecto completo.
            </p>
            <Select 
                label="1. Selecciona la Inversión a Analizar"
                value={config.investmentId || ''}
                onChange={e => setConfig({ ...config, investmentId: e.target.value || null, loanId: null })}
                tooltip="Elige un activo que hayas marcado como 'Nuevo' o 'Financiamiento' para analizar su impacto individual."
            >
                <option value="">-- Elige un activo --</option>
                {newInvestments.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({formatCurrency(item.amount)})</option>
                ))}
            </Select>

            <Select
                label="2. Asocia un Financiamiento (Opcional)"
                value={config.loanId || ''}
                onChange={e => setConfig({ ...config, loanId: e.target.value || null })}
                disabled={!config.investmentId}
                tooltip="Si esta inversión fue financiada, selecciona el crédito correspondiente para incluirlo en el análisis."
            >
                <option value="">-- Sin financiamiento asociado --</option>
                {projectData.loans.map(loan => (
                    <option key={loan.id} value={loan.id}>{loan.name} ({formatCurrency(loan.principal)})</option>
                ))}
            </Select>
            
            <Input
                label="3. Aumento % en Flujo Neto por esta Inversión"
                type="number"
                value={config.impactPercentage}
                onChange={e => setConfig({ ...config, impactPercentage: Number(e.target.value) })}
                disabled={!config.investmentId}
                tooltip="Estima qué porcentaje del flujo de caja neto total del proyecto es generado directamente por esta nueva inversión."
            />
            
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Resultados del Análisis Incremental</h4>
                {config.investmentId ? (
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">TIR Incremental</p>
                            <p className="text-lg font-bold" style={{color: theme.colors.metrics.irr}}>
                                {incrementalIRR !== undefined && incrementalIRR !== null ? `${incrementalIRR.toFixed(2)}%` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">VPN Incremental</p>
                             <p className="text-lg font-bold" style={{color: (incrementalNPV ?? 0) >= 0 ? theme.colors.positive : theme.colors.negative}}>
                                {incrementalNPV !== undefined ? formatCurrency(incrementalNPV) : 'N/A'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">Selecciona una inversión para ver los resultados.</p>
                )}
            </div>
        </div>
    );
};