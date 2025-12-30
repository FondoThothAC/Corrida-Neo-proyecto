// constants.ts
import type { RecurringRevenue, RecurringExpense, InvestmentItem, DepreciableAsset, Loan, PayrollConfig, WorkingCapitalConfig, AdvancedConfig, Theme } from './types';

export const BLANK_SCENARIO = {
    projectDuration: 5,
    taxRate: 0,
    discountRate: 10,
    inflationRate: 0,
    minimumAcceptableIRR: 10,
    investmentItems: [] as InvestmentItem[],
    depreciableAssets: [] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [] as RecurringExpense[],
    loans: [] as Loan[],
    payrollConfig: {
        positions: [],
        vacationDaysPerYear: 0,
        vacationBonusRate: 0,
        temporaryEmployees: 0,
        temporaryEmployeeSalary: 0,
        socialChargesRate: 0,
        annualSalaryGrowthRate: 0,
        dailyMinimumWage: 0,
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 0,
        accountsPayableDays: 0,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [],
    } as AdvancedConfig,
    notes: '',
};

export const COMIDA_MEXICANA_VICKYS_SCENARIO = {
    projectDuration: 3,
    taxRate: 0,
    discountRate: 18,
    inflationRate: 0,
    minimumAcceptableIRR: 18,
    investmentItems: [
        { id: 1, name: 'Inversión Inicial Total', type: 'Capital de Trabajo', amount: 10638.50, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
        { id: 1, name: 'Activos Fijos (agregado)', initialCost: 14379, salvageValue: 1437.9, usefulLifeYears: 5, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Costos Indirectos (Fijos)', type: 'Fijo', initialMonthlyAmount: 930.00, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [6, 5] },
    ] as RecurringExpense[],
    loans: [
        { id: 1, name: 'Financiamiento para Inversión Inicial', principal: 10638.50, annualInterestRate: 25, termMonths: 12 }
    ] as Loan[],
    payrollConfig: {
        positions: [],
        vacationDaysPerYear: 0,
        vacationBonusRate: 0,
        temporaryEmployees: 0,
        temporaryEmployeeSalary: 0,
        socialChargesRate: 0,
        annualSalaryGrowthRate: 0,
        dailyMinimumWage: 320, // 40/hr * 8 hours
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 0,
        accountsPayableDays: 0,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            {
                id: 1, name: 'Tamal de carne (250 gr)', unitsSoldPerMonth: 600, markupPercentage: 75.1,
                annualSalesGrowthRates: [10, 10], annualVariableCostGrowthRates: [6, 5], annualPriceIncreaseRates: [0, 0],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos carne', costType: 'Materia Prima', batchCost: 13.79, batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 1.56 },
                ],
            },
            {
                id: 2, name: 'Tamal de elote (250gr)', unitsSoldPerMonth: 600, markupPercentage: 76.8,
                annualSalesGrowthRates: [10, 10], annualVariableCostGrowthRates: [6, 5], annualPriceIncreaseRates: [0, 0],
                bomItems: [
                    { id: 3, componentName: 'Insumos Directos elote', costType: 'Materia Prima', batchCost: 11.44, batchYield: 1 },
                    { id: 4, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 1.56 },
                ],
            },
            {
                id: 3, name: 'Carne con chile platillo', unitsSoldPerMonth: 40, markupPercentage: 68.8,
                annualSalesGrowthRates: [10, 10], annualVariableCostGrowthRates: [6, 5], annualPriceIncreaseRates: [0, 0],
                bomItems: [
                    { id: 5, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 58.33, batchYield: 1 },
                    { id: 6, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 1.56 },
                ],
            }
        ],
    } as AdvancedConfig,
    notes: 'Escenario basado en el modelo financiero de "Comida Mexicana Vickys". Proyección a 3 años con crecimiento anual específico para ventas y costos. Los costos fijos mensuales de $930 corresponden a costos indirectos.',
};


export const PROYECCION_ANUAL_SCENARIO = {
    projectDuration: 5,
    taxRate: 10,
    discountRate: 10,
    inflationRate: 1.0,
    minimumAcceptableIRR: 10,
    investmentItems: [
        { id: 1, name: 'Equipo de Cómputo (Dev/Test)', type: 'Activo Fijo', amount: 60000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 2, name: 'Mobiliario Básico Of.*', type: 'Activo Fijo', amount: 10000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Constitución y Permisos', type: 'Activo Diferido', amount: 28628, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 4, name: 'Validación de Mercado', type: 'Activo Diferido', amount: 20000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 5, name: 'Tecnología y Licencias', type: 'Activo Diferido', amount: 25800, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 6, name: 'Desarrollo MVP***', type: 'Activo Diferido', amount: 1748000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 7, name: 'Contingencia (10%)', type: 'Activo Diferido', amount: 214264, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 8, name: 'Capital de Trabajo', type: 'Capital de Trabajo', amount: 1200000, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
        { id: 1, name: 'Activos Fijos', initialCost: 70000, salvageValue: 30000, usefulLifeYears: 7, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [
        { 
            id: 1, 
            name: 'Ingresos Totales', 
            // This is the average monthly income for year 2 and beyond, based on 5% growth from Y1 total.
            initialMonthlyAmount: 5217461.25, 
            annualGrowthRates: [5, 5, 5, 5],
            // Specific, non-linear monthly income for the first year as per the user's document.
            monthlyOverrides: [14950, 74750, 224250, 598000, 1196000, 2242500, 3737500, 5681000, 7475000, 10539625, 12795060, 15049500],
        },
    ] as RecurringRevenue[],
    recurringExpenses: [
        // Costs are based on the annual totals from the user's document for Year 1, averaged per month.
        { id: 101, name: 'Costos Fijos Mensuales (Promedio Año 1)', type: 'Fijo', initialMonthlyAmount: 430000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [1.0, 1.0, 1.0, 1.0] },
        { id: 201, name: 'Costos Variables Mensuales (Promedio Año 1)', type: 'Variable', initialMonthlyAmount: 366483, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [1.0, 1.0, 1.0, 1.0] },
    ] as RecurringExpense[],
    loans: [] as Loan[],
    payrollConfig: {
        positions: [],
        vacationDaysPerYear: 15,
        vacationBonusRate: 25,
        temporaryEmployees: 2,
        temporaryEmployeeSalary: 22000,
        socialChargesRate: 35,
        annualSalaryGrowthRate: 5.0,
        dailyMinimumWage: 248.93,
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 30,
        accountsPayableDays: 15,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [],
    } as AdvancedConfig,
    notes: 'Escenario para un proyecto de tecnología a 5 años, alineado con el documento "Cositas" proporcionado. Utiliza valores mensuales específicos para los ingresos del primer año para reflejar un crecimiento no lineal. Los costos del primer año son un promedio mensual del total anual del documento.',
};

// FIX: Renamed scenario to SABORES_CASEROS_SCENARIO to match usage and fix import error in App.tsx.
export const SABORES_CASEROS_SCENARIO = {
    projectDuration: 3,
    taxRate: 30,
    discountRate: 18,
    inflationRate: 6.0,
    minimumAcceptableIRR: 18,
    investmentItems: [
        { id: 1, name: 'Activos Fijos', type: 'Activo Fijo', amount: 53874.29, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 2, name: 'Gastos Preoperativos', type: 'Activo Diferido', amount: 6300, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Capital de Trabajo', type: 'Capital de Trabajo', amount: 6414.36, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
      { id: 1, name: 'Equipo de Cocina y Mobiliario', initialCost: 53874.29, salvageValue: 5387.43, usefulLifeYears: 4, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Costos Fijos Asignados a Producción', type: 'Fijo', initialMonthlyAmount: 2630.80, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5.0] },
    ] as RecurringExpense[],
    loans: [] as Loan[],
    payrollConfig: {
        positions: [], vacationDaysPerYear: 0, vacationBonusRate: 0, temporaryEmployees: 0, temporaryEmployeeSalary: 0, socialChargesRate: 0, annualSalaryGrowthRate: 8.0,
        dailyMinimumWage: 280,
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 0,
        accountsPayableDays: 0,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            {
                id: 1,
                name: 'Tamales',
                unitsSoldPerMonth: 1576,
                markupPercentage: 90.1,
                annualSalesGrowthRates: [435],
                annualVariableCostGrowthRates: [15],
                annualPriceIncreaseRates: [15],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 10.11, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 2.5 },
                ],
            },
            {
                id: 2,
                name: 'Frijol',
                unitsSoldPerMonth: 234,
                markupPercentage: 172.1,
                annualSalesGrowthRates: [435],
                annualVariableCostGrowthRates: [15],
                annualPriceIncreaseRates: [15],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 9.66, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 3.6 },
                ],
            },
            {
                id: 3,
                name: 'Carne con chile',
                unitsSoldPerMonth: 22,
                markupPercentage: 27.2,
                annualSalesGrowthRates: [435],
                annualVariableCostGrowthRates: [15],
                annualPriceIncreaseRates: [15],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 68.52, batchQuantity: 1, batchUnit: 'platillo', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 24 },
                ],
            }
        ]
    } as AdvancedConfig,
    notes: 'Proyecto de comida "Sabores Caseros" con 3 productos. Usa un crecimiento mensual del 15% para ventas y costos.',
};

export const TAQUERIA_TACOS_SCENARIO = {
    projectDuration: 3,
    taxRate: 16,
    discountRate: 18,
    inflationRate: 6.0,
    minimumAcceptableIRR: 18,
    investmentItems: [
        { id: 1, name: 'Activos Fijos', type: 'Activo Fijo', amount: 8235, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 2, name: 'Gastos Preoperativos', type: 'Activo Diferido', amount: 3949, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Capital de Trabajo', type: 'Capital de Trabajo', amount: 7711.26, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
      { id: 1, name: 'Equipo de Cocina y Mobiliario', initialCost: 8235, salvageValue: 823.5, usefulLifeYears: 4, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Costos Fijos Asignados a Producción', type: 'Fijo', initialMonthlyAmount: 612.00, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5.0] },
    ] as RecurringExpense[],
    loans: [] as Loan[],
    payrollConfig: {
        positions: [], vacationDaysPerYear: 0, vacationBonusRate: 0, temporaryEmployees: 0, temporaryEmployeeSalary: 0, socialChargesRate: 0, annualSalaryGrowthRate: 8.0,
        dailyMinimumWage: 280,
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 0,
        accountsPayableDays: 0,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            {
                id: 1,
                name: 'Paquete de Tacos de Mole',
                unitsSoldPerMonth: 240,
                markupPercentage: 61.1,
                annualSalesGrowthRates: [213.8],
                annualVariableCostGrowthRates: [10],
                annualPriceIncreaseRates: [10],
                bomItems: [
                    { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 34.61, batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 4.5 },
                ],
            },
            {
                id: 2,
                name: 'Paquete de Tacos de Cochinita',
                unitsSoldPerMonth: 240,
                markupPercentage: 56.1,
                annualSalesGrowthRates: [213.8],
                annualVariableCostGrowthRates: [10],
                annualPriceIncreaseRates: [10],
                bomItems: [
                    { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 29.40, batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 4.5 },
                ],
            },
            {
                id: 3,
                name: 'Paquete de Tacos de Bistec',
                unitsSoldPerMonth: 240,
                markupPercentage: 70.1,
                annualSalesGrowthRates: [213.8],
                annualVariableCostGrowthRates: [10],
                annualPriceIncreaseRates: [10],
                bomItems: [
                    { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 31.17, batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 2 },
                ],
            }
        ]
    } as AdvancedConfig,
    notes: 'Proyecto de taquería con 3 productos. Crecimiento mensual del 10%.',
};

export const ALITAS_BONELESS_SCENARIO = {
    projectDuration: 3,
    taxRate: 30,
    discountRate: 18,
    inflationRate: 6.0,
    minimumAcceptableIRR: 18,
    investmentItems: [
        { id: 1, name: 'Activos Fijos', type: 'Activo Fijo', amount: 36759.94, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 2, name: 'Gastos Preoperativos', type: 'Activo Diferido', amount: 10800, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Capital de Trabajo', type: 'Capital de Trabajo', amount: 12640.19, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
      { id: 1, name: 'Equipo de Cocina y Mobiliario', initialCost: 36759.94, salvageValue: 3676, usefulLifeYears: 6, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Costos Fijos Mensuales', type: 'Fijo', initialMonthlyAmount: 27192.00, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5.0] },
    ] as RecurringExpense[],
    loans: [] as Loan[],
    payrollConfig: {
        positions: [], vacationDaysPerYear: 0, vacationBonusRate: 0, temporaryEmployees: 0, temporaryEmployeeSalary: 0, socialChargesRate: 0, annualSalaryGrowthRate: 8.0,
        dailyMinimumWage: 280,
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 0,
        accountsPayableDays: 0,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            {
                id: 1, name: 'Boneless', unitsSoldPerMonth: 840, markupPercentage: 169.7, annualSalesGrowthRates: [213.8], annualVariableCostGrowthRates: [10], annualPriceIncreaseRates: [10],
                bomItems: [ { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 42.79, batchYield: 1 }, { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 15 } ],
            },
            {
                id: 2, name: 'Alitas', unitsSoldPerMonth: 280, markupPercentage: 208.9, annualSalesGrowthRates: [213.8], annualVariableCostGrowthRates: [10], annualPriceIncreaseRates: [10],
                bomItems: [ { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 42.73, batchYield: 1 }, { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 15 } ],
            },
            {
                id: 3, name: 'Ensalada', unitsSoldPerMonth: 140, markupPercentage: 170.1, annualSalesGrowthRates: [213.8], annualVariableCostGrowthRates: [10], annualPriceIncreaseRates: [10],
                bomItems: [ { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 50.09, batchYield: 1 }, { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 15 } ],
            },
            {
                id: 4, name: 'Papaboneless', unitsSoldPerMonth: 140, markupPercentage: 198.2, annualSalesGrowthRates: [213.8], annualVariableCostGrowthRates: [10], annualPriceIncreaseRates: [10],
                bomItems: [ { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 44.61, batchYield: 1 }, { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 15 } ],
            },
            {
                id: 5, name: 'Sazonadas', unitsSoldPerMonth: 140, markupPercentage: 108.2, annualSalesGrowthRates: [213.8], annualVariableCostGrowthRates: [10], annualPriceIncreaseRates: [10],
                bomItems: [ { id: 1, componentName: 'Costo Directo', costType: 'Materia Prima', batchCost: 32.58, batchYield: 1 }, { id: 2, componentName: 'Mano de Obra', costType: 'Mano de Obra', minutesPerUnit: 10 } ],
            },
        ]
    } as AdvancedConfig,
    notes: 'Proyecto de Alitas y Boneless con 5 productos. Crecimiento mensual del 10%.',
};

export const MARYS_VELAS_SCENARIO = {
    projectDuration: 3,
    taxRate: 0,
    discountRate: 18,
    inflationRate: 6.0,
    minimumAcceptableIRR: 18,
    investmentItems: [
        { id: 1, name: 'Inversión Inicial Requerida', type: 'Activo Fijo', amount: 11857.00, acquisitionSource: 'Financiamiento' },
    ] as InvestmentItem[],
    depreciableAssets: [] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Costos Fijos Asignados a Producción', type: 'Fijo', initialMonthlyAmount: 1110, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5.0] },
    ] as RecurringExpense[],
    loans: [
         { id: 1, name: 'Financiamiento Insumos y Equipo', principal: 11857.00, annualInterestRate: 0, termMonths: 6 }
    ] as Loan[],
    payrollConfig: {
        positions: [], vacationDaysPerYear: 0, vacationBonusRate: 0, temporaryEmployees: 0, temporaryEmployeeSalary: 0, socialChargesRate: 0, annualSalaryGrowthRate: 8.0,
        dailyMinimumWage: 480, // Based on 60/hr * 8 hrs
    } as PayrollConfig,
    workingCapitalConfig: { accountsReceivableDays: 0, accountsPayableDays: 0 } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            {
                id: 1,
                name: 'Velas de frasco (250gr)',
                unitsSoldPerMonth: 247,
                markupPercentage: 48.9,
                annualSalesGrowthRates: [10],
                annualVariableCostGrowthRates: [6],
                annualPriceIncreaseRates: [6],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 76.23, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 2.65 },
                ],
            },
            {
                id: 2,
                name: 'Velas de recuerdos pequenas (100gr)',
                unitsSoldPerMonth: 26,
                markupPercentage: 55.9,
                annualSalesGrowthRates: [10],
                annualVariableCostGrowthRates: [6],
                annualPriceIncreaseRates: [6],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 34.33, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 2.65 },
                ],
            },
            {
                id: 3,
                name: 'Jabón de avena (100gr)',
                unitsSoldPerMonth: 56,
                markupPercentage: 63.0,
                annualSalesGrowthRates: [10],
                annualVariableCostGrowthRates: [6],
                annualPriceIncreaseRates: [6],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 14.25, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 2.65 },
                ],
            }
        ]
    } as AdvancedConfig,
    notes: '',
};

export const VELAS_AROMATICAS_ELAN_SCENARIO = {
    projectDuration: 3,
    taxRate: 0,
    discountRate: 18,
    inflationRate: 6.0, 
    minimumAcceptableIRR: 18,
    investmentItems: [
        { id: 1, name: 'Activos Fijos (Maquinaria, Equipo, etc.)', type: 'Activo Fijo', amount: 14379, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 2, name: 'Gastos Preoperativos', type: 'Activo Diferido', amount: 4900, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Capital de Trabajo Inicial (Manual)', type: 'Capital de Trabajo', amount: 6957, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
        { id: 1, name: 'Activos Fijos Totales', initialCost: 14379, salvageValue: 1437.9, usefulLifeYears: 4, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Costos Fijos Asignados a Producción', type: 'Fijo', initialMonthlyAmount: 982.20, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5.0] },
    ] as RecurringExpense[],
    loans: [
        { id: 1, name: 'Financiamiento Insumos y Capital de Trabajo', principal: 11857.00, annualInterestRate: 0, termMonths: 6 }
    ] as Loan[],
    payrollConfig: {
        positions: [],
        vacationDaysPerYear: 0,
        vacationBonusRate: 0,
        temporaryEmployees: 0,
        temporaryEmployeeSalary: 0,
        socialChargesRate: 0,
        annualSalaryGrowthRate: 6.0,
        dailyMinimumWage: 320, // 40/hr * 8 hrs
    } as PayrollConfig,
    workingCapitalConfig: {
        accountsReceivableDays: 0,
        accountsPayableDays: 0,
    } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            {
                id: 1,
                name: 'Vela de frasco (250gr)',
                unitsSoldPerMonth: 23,
                markupPercentage: 75.33,
                annualSalesGrowthRates: [10],
                annualVariableCostGrowthRates: [6],
                annualPriceIncreaseRates: [6],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 76.23, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 4.65 },
                ],
            },
            {
                id: 2,
                name: 'Vela de recuerdo pequenas (100gr)',
                unitsSoldPerMonth: 215,
                markupPercentage: 85.01,
                annualSalesGrowthRates: [10],
                annualVariableCostGrowthRates: [6],
                annualPriceIncreaseRates: [6],
                bomItems: [
                    { id: 1, componentName: 'Insumos Directos', costType: 'Materia Prima', batchCost: 34.33, batchQuantity: 1, batchUnit: 'unidad', batchYield: 1 },
                    { id: 2, componentName: 'Mano de Obra Directa', costType: 'Mano de Obra', minutesPerUnit: 4.65 },
                ],
            }
        ]
    } as AdvancedConfig,
    notes: '',
};

export const RESTAURANTE_EL_BUEN_SABOR_SCENARIO = {
    projectDuration: 5,
    taxRate: 30,
    discountRate: 20,
    inflationRate: 5.0,
    minimumAcceptableIRR: 20,
    investmentItems: [
        { id: 1, name: 'Equipo de Cocina', type: 'Activo Fijo', amount: 250000, acquisitionSource: 'Financiamiento' },
        { id: 2, name: 'Mobiliario y Decoración', type: 'Activo Fijo', amount: 150000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Permisos y Licencias', type: 'Activo Diferido', amount: 50000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 4, name: 'Capital de Trabajo Inicial', type: 'Capital de Trabajo', amount: 100000, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
        { id: 1, name: 'Activos Fijos Totales', initialCost: 400000, salvageValue: 40000, usefulLifeYears: 5, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Renta del Local', type: 'Fijo', initialMonthlyAmount: 25000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5] },
        { id: 2, name: 'Servicios (Luz, Agua, Gas)', type: 'Fijo', initialMonthlyAmount: 8000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5] },
        { id: 3, name: 'Marketing y Publicidad', type: 'Fijo', initialMonthlyAmount: 7000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [10] },
    ] as RecurringExpense[],
    loans: [
        { id: 1, name: 'Crédito para Equipo', principal: 200000, annualInterestRate: 15, termMonths: 36 }
    ] as Loan[],
    payrollConfig: {
        positions: [
            {id: 1, name: 'Gerente', monthlySalary: 16000},
            {id: 2, name: 'Cocinero Jefe', monthlySalary: 13000},
            {id: 3, name: 'Ayudante de Cocina', monthlySalary: 8500},
            {id: 4, name: 'Mesero', monthlySalary: 8000},
            {id: 6, name: 'Host / Cajero', monthlySalary: 8000},
            {id: 7, name: 'Personal de Limpieza', monthlySalary: 7000},
        ],
        vacationDaysPerYear: 12, vacationBonusRate: 25, temporaryEmployees: 0, temporaryEmployeeSalary: 0, socialChargesRate: 35, annualSalaryGrowthRate: 5,
        dailyMinimumWage: 300,
    } as PayrollConfig,
    workingCapitalConfig: { accountsReceivableDays: 5, accountsPayableDays: 20 } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            { id: 1, name: 'Tacos al Pastor (Orden)', unitsSoldPerMonth: 880, markupPercentage: 250, annualSalesGrowthRates: [15], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 20, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 3 }]},
            { id: 2, name: 'Enchiladas Suizas', unitsSoldPerMonth: 440, markupPercentage: 300, annualSalesGrowthRates: [10], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 35, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 8 }]},
            { id: 3, name: 'Sopa de Tortilla', unitsSoldPerMonth: 330, markupPercentage: 400, annualSalesGrowthRates: [10], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 18, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 5 }]},
            { id: 4, name: 'Guacamole y Totopos', unitsSoldPerMonth: 550, markupPercentage: 350, annualSalesGrowthRates: [12], annualVariableCostGrowthRates: [7], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 25, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 4 }]},
            { id: 5, name: 'Cochinita Pibil (Orden)', unitsSoldPerMonth: 385, markupPercentage: 280, annualSalesGrowthRates: [10], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 45, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 6 }]},
            { id: 6, name: 'Agua de Horchata (Vaso)', unitsSoldPerMonth: 1320, markupPercentage: 500, annualSalesGrowthRates: [15], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [5], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 5, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 1 }]},
            { id: 7, name: 'Margarita', unitsSoldPerMonth: 660, markupPercentage: 450, annualSalesGrowthRates: [20], annualVariableCostGrowthRates: [6], annualPriceIncreaseRates: [10], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 22, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 2 }]},
            { id: 8, name: 'Flan Napolitano', unitsSoldPerMonth: 275, markupPercentage: 380, annualSalesGrowthRates: [8], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [7], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 15, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 3 }]},
            { id: 9, name: 'Queso Fundido', unitsSoldPerMonth: 495, markupPercentage: 320, annualSalesGrowthRates: [12], annualVariableCostGrowthRates: [6], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 30, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 5 }]},
            { id: 10, name: 'Café de Olla', unitsSoldPerMonth: 440, markupPercentage: 600, annualSalesGrowthRates: [5], annualVariableCostGrowthRates: [5], annualPriceIncreaseRates: [5], bomItems: [ { id: 1, componentName: 'Insumos', costType: 'Materia Prima', batchCost: 4, batchYield: 1 }, { id: 2, componentName: 'Preparación', costType: 'Mano de Obra', minutesPerUnit: 1 }]},
        ]
    } as AdvancedConfig,
    notes: 'Escenario completo para un restaurante con 10 productos, costos fijos, personal, depreciación y financiamiento.',
};

export const CONSULTORIA_IMPULSO_CREATIVO_SCENARIO = {
    projectDuration: 5,
    taxRate: 30,
    discountRate: 15,
    inflationRate: 4.0,
    minimumAcceptableIRR: 15,
    investmentItems: [
        { id: 1, name: 'Equipo de Cómputo (3 Laptops)', type: 'Activo Fijo', amount: 75000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 2, name: 'Licencias de Software (Anual)', type: 'Activo Diferido', amount: 25000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 3, name: 'Creación de Marca y Web', type: 'Activo Diferido', amount: 30000, acquisitionSource: 'Aportación (Nuevo)' },
        { id: 4, name: 'Capital de Trabajo', type: 'Capital de Trabajo', amount: 150000, acquisitionSource: 'Aportación (Nuevo)' },
    ] as InvestmentItem[],
    depreciableAssets: [
        { id: 1, name: 'Equipo de Cómputo', initialCost: 75000, salvageValue: 7500, usefulLifeYears: 3, depreciationMethod: 'Línea Recta' }
    ] as DepreciableAsset[],
    recurringRevenues: [] as RecurringRevenue[],
    recurringExpenses: [
        { id: 1, name: 'Renta Co-working', type: 'Fijo', initialMonthlyAmount: 7000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [5] },
        { id: 2, name: 'Suscripciones a Software (SaaS)', type: 'Fijo', initialMonthlyAmount: 5000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [10] },
        { id: 3, name: 'Publicidad en Línea', type: 'Fijo', initialMonthlyAmount: 12000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [15] },
        { id: 4, name: 'Gastos Administrativos', type: 'Fijo', initialMonthlyAmount: 3000, growthType: 'annual', monthlyGrowthRate: 0, annualGrowthRates: [4] },
    ] as RecurringExpense[],
    loans: [] as Loan[],
    payrollConfig: {
        positions: [
            { id: 1, name: 'Consultor Senior', monthlySalary: 38000 },
            { id: 2, name: 'Diseñador Gráfico', monthlySalary: 24000 },
            { id: 3, name: 'Especialista en Marketing', monthlySalary: 28000 },
        ],
        vacationDaysPerYear: 14, vacationBonusRate: 25, temporaryEmployees: 0, temporaryEmployeeSalary: 0, socialChargesRate: 35, annualSalaryGrowthRate: 6,
        dailyMinimumWage: 400,
    } as PayrollConfig,
    workingCapitalConfig: { accountsReceivableDays: 30, accountsPayableDays: 15 } as WorkingCapitalConfig,
    advancedConfig: {
        products: [
            { id: 1, name: 'Diseño de Sitio Web Básico', unitsSoldPerMonth: 2, markupPercentage: 150, annualSalesGrowthRates: [10], annualVariableCostGrowthRates: [0], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Horas de Diseño y Desarrollo', costType: 'Mano de Obra', minutesPerUnit: 1800 }]}, // 30 horas
            { id: 2, name: 'Campaña de Marketing (Retainer)', unitsSoldPerMonth: 4, markupPercentage: 120, annualSalesGrowthRates: [20], annualVariableCostGrowthRates: [0], annualPriceIncreaseRates: [10], bomItems: [ { id: 1, componentName: 'Horas de Estrategia y Ejecución', costType: 'Mano de Obra', minutesPerUnit: 1200 }]}, // 20 horas
            { id: 3, name: 'Consultoría SEO (Paquete)', unitsSoldPerMonth: 3, markupPercentage: 200, annualSalesGrowthRates: [15], annualVariableCostGrowthRates: [0], annualPriceIncreaseRates: [10], bomItems: [ { id: 1, componentName: 'Horas de Análisis y Reportes', costType: 'Mano de Obra', minutesPerUnit: 600 }]}, // 10 horas
            { id: 4, name: 'Branding y Logo', unitsSoldPerMonth: 1, markupPercentage: 180, annualSalesGrowthRates: [5], annualVariableCostGrowthRates: [0], annualPriceIncreaseRates: [8], bomItems: [ { id: 1, componentName: 'Horas de Diseño', costType: 'Mano de Obra', minutesPerUnit: 1500 }]}, // 25 horas
        ]
    } as AdvancedConfig,
    notes: 'Escenario para una consultoría de servicios digitales. Los costos de los "productos" son 100% mano de obra, demostrando un modelo de negocio basado en servicios.',
};


export const THEMES: Theme[] = [
    {
        name: 'Defecto',
        colors: {
            chart: ['#82ca9d', '#8884d8', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'],
            positive: '#10B981', // green-600
            negative: '#EF4444', // red-500
            metrics: {
      npv: '#10B981',
      irr: '#3B82F6',
      payback: '#8B5CF6',
      cbr: '#F59E0B',
      roi: '#14B8A6'
    },
            pdfHeaders: {
      main: [22, 160, 133],
      cashflow: [41, 128, 185],
      breakeven: [142, 68, 173]
    },
        },
    },
    {
        name: 'Océano',
        colors: {
            chart: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#03045e', '#ade8f4'],
            positive: '#00b4d8',
            negative: '#f77f00',
            metrics: {
      npv: '#0077b6',
      irr: '#00b4d8',
      payback: '#90e0ef',
      cbr: '#03045e',
      roi: '#0096C7'
    },
            pdfHeaders: {
      main: [0, 119, 182],
      cashflow: [0, 180, 216],
      breakeven: [144, 224, 239]
    },
        },
    },
    {
        name: 'Atardecer',
        colors: {
            chart: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b'],
            positive: '#90be6d',
            negative: '#f94144',
            metrics: {
      npv: '#f3722c',
      irr: '#f8961e',
      payback: '#f9c74f',
      cbr: '#43aa8b',
      roi: '#F9844A'
    },
            pdfHeaders: {
      main: [249, 65, 68],
      cashflow: [243, 114, 44],
      breakeven: [248, 150, 30]
    },
        },
    },
    {
        name: 'Bosque',
        colors: {
            chart: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'],
            positive: '#40916c',
            negative: '#c9184a',
            metrics: {
      npv: '#2d6a4f',
      irr: '#52b788',
      payback: '#95d5b2',
      cbr: '#74c69d',
      roi: '#2D6A4F'
    },
            pdfHeaders: {
      main: [45, 106, 79],
      cashflow: [82, 183, 136],
      breakeven: [116, 198, 157]
    },
        },
    },
    {
        name: 'Monocromático',
        colors: {
            chart: ['#212529', '#495057', '#6c757d', '#adb5bd', '#dee2e6', '#f8f9fa'],
            positive: '#495057',
            negative: '#d90429',
            metrics: {
      npv: '#212529',
      irr: '#6c757d',
      payback: '#adb5bd',
      cbr: '#495057',
      roi: '#343A40'
    },
            pdfHeaders: {
      main: [33, 37, 41],
      cashflow: [108, 117, 125],
      breakeven: [173, 181, 189]
    },
        },
    },
    {
        name: 'Cítrico',
        colors: {
            chart: ['#ffc300', '#ffd60a', '#f48c06', '#faa307', '#9ef01a', '#70e000'],
            positive: '#70e000',
            negative: '#f48c06',
            metrics: {
                npv: '#ffc300',
                irr: '#ffd60a',
                payback: '#f48c06',
                cbr: '#9ef01a',
                roi: '#faa307',
            },
            pdfHeaders: {
                main: [255, 195, 0],
                cashflow: [244, 140, 6],
                breakeven: [112, 224, 0],
            },
        },
    },
    {
        name: 'Neón',
        colors: {
            chart: ['#ff00ff', '#00ffff', '#d900ff', '#ff00aa', '#00ffaa', '#aaff00'],
            positive: '#00ffff',
            negative: '#ff00ff',
            metrics: {
                npv: '#d900ff',
                irr: '#00ffff',
                payback: '#ff00aa',
                cbr: '#aaff00',
                roi: '#ff00ff',
            },
            pdfHeaders: {
                main: [255, 0, 255],
                cashflow: [0, 255, 255],
                breakeven: [217, 0, 255],
            },
        },
    },
    {
        name: 'Tierra',
        colors: {
            chart: ['#a68a64', '#936639', '#7f5539', '#b08968', '#ddb892', '#e6ccb2'],
            positive: '#7f5539',
            negative: '#c97b63',
            metrics: {
                npv: '#a68a64',
                irr: '#936639',
                payback: '#b08968',
                cbr: '#ddb892',
                roi: '#7f5539',
            },
            pdfHeaders: {
                main: [166, 138, 100],
                cashflow: [147, 102, 57],
                breakeven: [176, 137, 104],
            },
        },
    },
    {
        name: 'Medianoche',
        colors: {
            chart: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd', '#bfc0c0'],
            positive: '#778da9',
            negative: '#b56576',
            metrics: {
                npv: '#415a77',
                irr: '#778da9',
                payback: '#1b263b',
                cbr: '#e0e1dd',
                roi: '#0d1b2a',
            },
            pdfHeaders: {
                main: [65, 90, 119],
                cashflow: [27, 38, 59],
                breakeven: [119, 141, 169],
            },
        },
    },
    {
        name: 'Pastel',
        colors: {
            chart: ['#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4', '#d8e2dc'],
            positive: '#d4e09b',
            negative: '#fec5bb',
            metrics: {
                npv: '#fcd5ce',
                irr: '#fae1dd',
                payback: '#e8e8e4',
                cbr: '#d8e2dc',
                roi: '#fec5bb',
            },
            pdfHeaders: {
                main: [254, 197, 187],
                cashflow: [250, 225, 221],
                breakeven: [216, 226, 220],
            },
        },
    },
];