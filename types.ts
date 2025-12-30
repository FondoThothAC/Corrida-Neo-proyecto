// types.ts

export interface InvestmentItem {
  id: number;
  name: string;
  type: 'Activo Fijo' | 'Activo Diferido' | 'Capital de Trabajo';
  amount: number;
  acquisitionSource: 'Aportación (Existente)' | 'Aportación (Nuevo)' | 'Financiamiento' | 'Donación';
  isCalculated?: boolean;
}

export interface DepreciableAsset {
  id: number;
  name: string;
  initialCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: 'Línea Recta' | 'Saldo Decreciente';
}

export interface RecurringRevenue {
  id: number;
  name: string;
  initialMonthlyAmount: number;
  annualGrowthRates: number[];
  monthlyOverrides?: number[];
  isCalculated?: boolean;
}

export interface RecurringExpense {
  id: number;
  name: string;
  type: 'Fijo' | 'Variable';
  initialMonthlyAmount: number;
  growthType: 'annual' | 'monthly';
  monthlyGrowthRate: number;
  annualGrowthRates: number[];
  monthlyOverrides?: number[];
  isCalculated?: boolean;
}

export interface Loan {
  id: number;
  name: string;
  principal: number;
  annualInterestRate: number;
  termMonths: number;
}

export interface Position {
  id: number;
  name: string;
  monthlySalary: number;
}

export interface PayrollConfig {
  positions: Position[];
  vacationDaysPerYear: number;
  vacationBonusRate: number;
  temporaryEmployees: number;
  temporaryEmployeeSalary: number;
  socialChargesRate: number;
  annualSalaryGrowthRate: number;
  dailyMinimumWage: number;
}

export interface WorkingCapitalConfig {
  accountsReceivableDays: number;
  accountsPayableDays: number;
}

export interface BOMItem {
    id: number;
    componentName: string;
    costType: 'Materia Prima' | 'Mano de Obra';
    // For Materia Prima (Raw Materials)
    batchCost?: number;
    batchQuantity?: number;
    batchUnit?: string;
    batchYield?: number; // How many final products this batch produces
    // For Mano de Obra (Labor)
    minutesPerUnit?: number;
}

export interface Product {
    id: number;
    name: string;
    bomItems: BOMItem[];
    markupPercentage: number;
    unitsSoldPerMonth: number;
    annualSalesGrowthRates: number[];
    annualVariableCostGrowthRates: number[];
    annualPriceIncreaseRates: number[];
}

export interface AdvancedConfig {
    products: Product[];
}

export interface Handlers {
    addInvestmentItem: (item: Omit<InvestmentItem, 'id'>) => void;
    updateInvestmentItem: (item: InvestmentItem) => void;
    deleteInvestmentItem: (id: number) => void;
    addDepreciableAsset: (asset: Omit<DepreciableAsset, 'id'>) => void;
    updateDepreciableAsset: (asset: DepreciableAsset) => void;
    deleteDepreciableAsset: (id: number) => void;
    addRecurringRevenue: (rev: Omit<RecurringRevenue, 'id'>) => void;
    updateRecurringRevenue: (rev: RecurringRevenue) => void;
    deleteRecurringRevenue: (id: number) => void;
    addRecurringExpense: (exp: Omit<RecurringExpense, 'id'>) => void;
    updateRecurringExpense: (exp: RecurringExpense) => void;
    deleteRecurringExpense: (id: number) => void;
    addLoan: (loan: Omit<Loan, 'id'>) => void;
    updateLoan: (loan: Loan) => void;
    deleteLoan: (id: number) => void;
    updatePayrollConfig: (config: Partial<PayrollConfig>) => void;
    addPosition: (position: Omit<Position, 'id'>) => void;
    updatePosition: (position: Position) => void;
    deletePosition: (id: number) => void;
    updateWorkingCapitalConfig: (config: Partial<WorkingCapitalConfig>) => void;
    updateAdvancedConfig: (config: Partial<AdvancedConfig>) => void;
    addProduct: (product: Omit<Product, 'id' | 'bomItems'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: number) => void;
    addBOMItem: (productId: number, item: Omit<BOMItem, 'id'>) => void;
    updateBOMItem: (productId: number, item: BOMItem) => void;
    deleteBOMItem: (productId: number, id: number) => void;
}


// --- Project Save/Load Types ---
export interface ProjectData {
  projectDuration: number;
  discountRate: number;
  taxRate: number;
  inflationRate: number;
  minimumAcceptableIRR: number;
  investmentItems: InvestmentItem[];
  depreciableAssets: DepreciableAsset[];
  recurringRevenues: RecurringRevenue[];
  recurringExpenses: RecurringExpense[];
  loans: Loan[];
  payrollConfig: PayrollConfig;
  workingCapitalConfig: WorkingCapitalConfig;
  advancedConfig: AdvancedConfig;
  notes?: string;
}

export interface SavedProject {
  name: string;
  lastSaved: string;
  data: ProjectData;
}

// --- Theming ---
export interface Theme {
  name: string;
  colors: {
    chart: string[];
    positive: string;
    negative: string;
    metrics: {
      npv: string;
      irr: string;
      payback: string;
      cbr: string;
      roi: string;
    };
    pdfHeaders: {
      main: [number, number, number];
      cashflow: [number, number, number];
      breakeven: [number, number, number];
    };
  };
}