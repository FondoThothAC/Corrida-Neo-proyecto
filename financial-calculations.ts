// financial-calculations.ts
import type { ProjectData, BOMItem, RecurringRevenue, RecurringExpense, InvestmentItem, Loan } from './types';

const calculateSingleBomItemCost = (item: BOMItem, dailyMinimumWage: number): number => {
    if (item.costType === 'Mano de Obra' && dailyMinimumWage > 0) {
        const hourlyRate = dailyMinimumWage / 8; // Assume 8-hour workday
        const minuteRate = hourlyRate / 60;
        return (item.minutesPerUnit || 0) * minuteRate;
    }
    if (item.costType === 'Materia Prima' && item.batchYield && item.batchYield > 0) {
        return (item.batchCost || 0) / item.batchYield;
    }
    return 0;
};

const calculateIRR = (cashflows: number[], maxIterations = 200, tolerance = 1e-7): number | null => {
    if (cashflows.length === 0 || cashflows[0] >= 0) return null;
    let lowerBound = -0.99, upperBound = 5.0;
    const npv = (rate: number) => cashflows.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i), 0);
    
    // Check if a solution might exist in the bounds
    let npvAtLower, npvAtUpper;
    try {
        npvAtLower = npv(lowerBound);
        npvAtUpper = npv(upperBound);
    } catch (e) {
        return null; // Function might fail for extreme rates
    }

    if (npvAtLower * npvAtUpper > 0) return null; // No single root in this range

    let midRate = 0;
    for (let i = 0; i < maxIterations; i++) {
        midRate = (lowerBound + upperBound) / 2;
        if (Math.abs(upperBound - lowerBound) < tolerance) {
            return midRate * 100;
        }
        const npvAtMid = npv(midRate);
        if (Math.abs(npvAtMid) < tolerance) {
            return midRate * 100;
        }
        if (npvAtLower * npvAtMid < 0) {
            upperBound = midRate;
        } else {
            lowerBound = midRate;
        }
    }
    return null; // Failed to converge
};

const calculateAmortizationSchedule = (loan: Loan) => {
    const { principal, annualInterestRate, termMonths } = loan;
    const schedule = [];
    
    if (principal <= 0 || termMonths <= 0) return [];

    const monthlyRate = annualInterestRate / 100 / 12;
    let remainingBalance = principal;

    const monthlyPayment = (annualInterestRate === 0)
        ? principal / termMonths
        : principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    if (!isFinite(monthlyPayment)) return [];

    for (let month = 1; month <= termMonths; month++) {
        const interest = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        remainingBalance -= principalPayment;

        schedule.push({
            month,
            payment: monthlyPayment,
            interest: interest,
            principal: principalPayment,
            remainingBalance: remainingBalance > 0 ? remainingBalance : 0,
        });
    }
    return schedule;
};


// --- Financial Calculation Logic ---
export const calculateFinancialProjections = (
    projectData: ProjectData, 
    durationUnit: 'years' | 'months', 
    incrementalAnalysisConfig?: { investmentId: string | null, loanId: string | null, impactPercentage: number }
) => {
    const { 
        projectDuration, taxRate, discountRate, inflationRate, investmentItems, depreciableAssets,
        recurringRevenues: manualRevenues, recurringExpenses: manualExpenses, loans, payrollConfig, workingCapitalConfig, advancedConfig 
    } = projectData;

    const totalMonths = durationUnit === 'years' ? projectDuration * 12 : projectDuration;
    const projectDurationInYears = totalMonths / 12;

    // --- Pre-calculation of derived/automatic data ---
    const bomItemCosts: { [key: number]: number } = {};
    advancedConfig.products.forEach(p => p.bomItems.forEach(item => {
        bomItemCosts[item.id] = calculateSingleBomItemCost(item, payrollConfig.dailyMinimumWage);
    }));

    const derivedRevenues: RecurringRevenue[] = [...manualRevenues];
    advancedConfig.products.forEach(product => {
        const initialBomCost = product.bomItems.reduce((sum, item) => sum + (bomItemCosts[item.id] || 0), 0);
        const initialSellingPrice = initialBomCost * (1 + product.markupPercentage / 100);
        derivedRevenues.push({
            id: product.id + 10000, // Avoid ID collision
            name: `Ventas de ${product.name}`,
            initialMonthlyAmount: product.unitsSoldPerMonth * initialSellingPrice,
            annualGrowthRates: product.annualSalesGrowthRates,
            isCalculated: true,
        });
    });

    const derivedExpenses: RecurringExpense[] = [...manualExpenses];
    const totalInitialMonthlyPayroll = payrollConfig.positions.reduce((sum, pos) => sum + pos.monthlySalary, 0) 
        + (payrollConfig.temporaryEmployees * payrollConfig.temporaryEmployeeSalary);
    
    if (totalInitialMonthlyPayroll > 0) {
        const vacationPay = (totalInitialMonthlyPayroll / 30) * payrollConfig.vacationDaysPerYear * (payrollConfig.vacationBonusRate / 100);
        const socialCharges = totalInitialMonthlyPayroll * (payrollConfig.socialChargesRate / 100);
        const totalPayrollCost = totalInitialMonthlyPayroll + (vacationPay / 12) + socialCharges;

        derivedExpenses.push({
            id: 9001,
            name: 'Costo de Nómina (Calculado)',
            type: 'Fijo',
            initialMonthlyAmount: totalPayrollCost,
            growthType: 'annual',
            monthlyGrowthRate: 0,
            annualGrowthRates: [payrollConfig.annualSalaryGrowthRate],
            isCalculated: true,
        });
    }

    const derivedInvestmentItems: InvestmentItem[] = [...investmentItems];
    const netInitialInvestment = derivedInvestmentItems.reduce((sum, i) => sum + i.amount, 0);

    // --- Pre-calculate annual depreciation for each asset ---
    const annualDepreciationSchedule: { [assetId: number]: number[] } = {};
    depreciableAssets.forEach(asset => {
        annualDepreciationSchedule[asset.id] = [];
        let bookValue = asset.initialCost;
        const depreciableAmount = asset.initialCost - asset.salvageValue;
        let accumulatedDepreciation = 0;

        for (let yearIndex = 0; yearIndex < Math.ceil(projectDurationInYears); yearIndex++) {
            let depreciationForYear = 0;
            
            if (yearIndex < asset.usefulLifeYears && accumulatedDepreciation < depreciableAmount) {
                if (asset.depreciationMethod === 'Línea Recta') {
                    depreciationForYear = depreciableAmount / asset.usefulLifeYears;
                } else if (asset.depreciationMethod === 'Saldo Decreciente') {
                    const rate = (1 / asset.usefulLifeYears) * 2; // Double declining
                    depreciationForYear = bookValue * rate;
                }
            }
            
            // Ensure we don't depreciate more than the depreciable amount
            if (accumulatedDepreciation + depreciationForYear > depreciableAmount) {
                depreciationForYear = depreciableAmount - accumulatedDepreciation;
            }

            accumulatedDepreciation += depreciationForYear;
            bookValue -= depreciationForYear;
            annualDepreciationSchedule[asset.id].push(depreciationForYear);
        }
    });
    
    // --- Pre-calculate loan amortization schedules ---
    const loanSchedules: { [key: number]: ReturnType<typeof calculateAmortizationSchedule> } = {};
    loans.forEach(loan => {
        loanSchedules[loan.id] = calculateAmortizationSchedule(loan);
    });

    // --- Monthly Loop for Projections ---
    const monthlyBreakdown: any[] = [];
    
    // Pre-calculate annual growth multipliers
    const calculateAnnualMultipliers = (rates: number[]): number[] => {
        const multipliers: number[] = [1];
        let cumulativeMultiplier = 1;
        for (let y = 1; y < Math.ceil(projectDurationInYears); y++) {
            const rate = (rates[y - 1] ?? rates[rates.length - 1] ?? 0) / 100;
            cumulativeMultiplier *= (1 + rate);
            multipliers.push(cumulativeMultiplier);
        }
        return multipliers;
    };
    
    const revenueMultipliers = Object.fromEntries(derivedRevenues.map(r => [r.id, calculateAnnualMultipliers(r.annualGrowthRates)]));
    const expenseMultipliers = Object.fromEntries(derivedExpenses.map(e => [e.id, calculateAnnualMultipliers(e.annualGrowthRates)]));
    const productSalesMultipliers = Object.fromEntries(advancedConfig.products.map(p => [p.id, calculateAnnualMultipliers(p.annualSalesGrowthRates)]));
    const productCostMultipliers = Object.fromEntries(advancedConfig.products.map(p => [p.id, calculateAnnualMultipliers(p.annualVariableCostGrowthRates)]));
    const productPriceMultipliers = Object.fromEntries(advancedConfig.products.map(p => [p.id, calculateAnnualMultipliers(p.annualPriceIncreaseRates)]));

    for (let i = 0; i < totalMonths; i++) {
        const year = Math.floor(i / 12) + 1;
        const yearIndex = year - 1;
        const monthIndex = i % 12;
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, yearIndex);
        
        const currentMonthData: any = { year, month: monthIndex + 1, sales: 0, variableCosts: 0, fixedCosts: 0 };

        // --- Revenues from derived list ---
        let monthlySales = 0;
        derivedRevenues.forEach(rev => {
            if (year === 1 && rev.monthlyOverrides && rev.monthlyOverrides.length === 12) {
                monthlySales += rev.monthlyOverrides[monthIndex];
            } else {
                let baseAmount = rev.initialMonthlyAmount;
                // If Y1 had overrides, subsequent years grow from the Y1 average.
                if (rev.monthlyOverrides && rev.monthlyOverrides.length === 12) {
                    baseAmount = rev.monthlyOverrides.reduce((a, b) => a + b, 0) / 12;
                }
                const annualGrowthMultiplier = revenueMultipliers[rev.id][yearIndex] || 1;
                monthlySales += baseAmount * annualGrowthMultiplier;
            }
        });
        currentMonthData.sales = monthlySales;
        
        // --- Costs ---
        derivedExpenses.forEach(exp => {
            let amount = 0;
            if (year === 1 && exp.monthlyOverrides && exp.monthlyOverrides.length === 12) {
                // For year 1 overrides, we assume the user has already factored in any growth/inflation.
                amount = exp.monthlyOverrides[monthIndex];
            } else {
                let baseAmount = exp.initialMonthlyAmount;
                // If Y1 had overrides, subsequent years grow from the Y1 average.
                if (exp.monthlyOverrides && exp.monthlyOverrides.length === 12) {
                    baseAmount = exp.monthlyOverrides.reduce((a, b) => a + b, 0) / 12;
                }
                
                let specificGrowthMultiplier = 1;
                if (exp.growthType === 'monthly') {
                    // `i` is the 0-based month index of the whole project
                    specificGrowthMultiplier = Math.pow(1 + (exp.monthlyGrowthRate || 0) / 100, i);
                } else { // 'annual' or undefined
                    specificGrowthMultiplier = expenseMultipliers[exp.id][yearIndex] || 1;
                }
    
                // Apply the item's specific growth, THEN apply general inflation.
                amount = baseAmount * specificGrowthMultiplier * inflationMultiplier;
            }
    
            if (exp.type === 'Fijo') {
                currentMonthData.fixedCosts += amount;
            } else { // 'Variable'
                currentMonthData.variableCosts += amount;
            }
        });

        // Variable costs from products
        advancedConfig.products.forEach(product => {
            const annualSalesGrowthMultiplier = productSalesMultipliers[product.id][yearIndex] || 1;
            const annualCostGrowthMultiplier = productCostMultipliers[product.id][yearIndex] || 1;
            
            const yearSpecificBomCost = product.bomItems.reduce((sum, item) => {
                const baseCost = bomItemCosts[item.id] || 0;
                return sum + (baseCost * annualCostGrowthMultiplier * inflationMultiplier);
            }, 0);

            currentMonthData.variableCosts += product.unitsSoldPerMonth * yearSpecificBomCost * annualSalesGrowthMultiplier;
        });

        // --- Income Statement Items ---
        currentMonthData.grossProfit = currentMonthData.sales - currentMonthData.variableCosts;
        currentMonthData.operatingExpenses = currentMonthData.fixedCosts;
        
        currentMonthData.monthlyDepreciation = depreciableAssets.reduce((sum, asset) => {
            const annualDep = annualDepreciationSchedule[asset.id][yearIndex] || 0;
            return sum + (annualDep / 12);
        }, 0);

        currentMonthData.ebitda = currentMonthData.grossProfit - currentMonthData.operatingExpenses;
        currentMonthData.ebit = currentMonthData.ebitda - currentMonthData.monthlyDepreciation;
        
        currentMonthData.monthlyInterest = loans.reduce((sum, loan) => {
            const schedule = loanSchedules[loan.id];
            return sum + (schedule[i]?.interest || 0);
        }, 0);

        currentMonthData.ebt = currentMonthData.ebit - currentMonthData.monthlyInterest;
        currentMonthData.taxes = Math.max(0, currentMonthData.ebt * (taxRate / 100));
        currentMonthData.netIncome = currentMonthData.ebt - currentMonthData.taxes;
        
        // Monthly Cash Flow
        const monthlyPrincipalRepayment = loans.reduce((sum, loan) => {
            const schedule = loanSchedules[loan.id];
            return sum + (schedule[i]?.principal || 0);
        }, 0);
        currentMonthData.netCashFlow = currentMonthData.netIncome + currentMonthData.monthlyDepreciation - monthlyPrincipalRepayment;

        // Monthly Break-Even
        const monthlyContributionMarginRatio = currentMonthData.sales > 0 ? (currentMonthData.sales - currentMonthData.variableCosts) / currentMonthData.sales : 0;
        currentMonthData.bepAmount = monthlyContributionMarginRatio > 0 ? currentMonthData.fixedCosts / monthlyContributionMarginRatio : Infinity;
        currentMonthData.bepPercentage = currentMonthData.sales > 0 ? (currentMonthData.bepAmount / currentMonthData.sales) * 100 : Infinity;

        // Monthly Cost-Benefit
        currentMonthData.benefits = currentMonthData.sales;
        currentMonthData.costs = currentMonthData.fixedCosts + currentMonthData.variableCosts;
        currentMonthData.netBenefit = currentMonthData.benefits - currentMonthData.costs;

        monthlyBreakdown.push(currentMonthData);
    }
    
    // --- Post-Loop Calculations (Cumulative & Annual) ---
    let cumulativeCashFlowMonthly = -netInitialInvestment;
    let cumulativeBenefitsMonthly = 0;
    let cumulativeCostsMonthly = netInitialInvestment;
    const monthlyCashFlowData = monthlyBreakdown.map(m => {
        cumulativeCashFlowMonthly += m.netCashFlow;
        return { year: m.year, month: m.month, name: `A${m.year}M${m.month}`, netCashFlow: m.netCashFlow, cumulativeCashFlow: cumulativeCashFlowMonthly };
    });
    const monthlyCostBenefitData = monthlyBreakdown.map(m => {
        cumulativeBenefitsMonthly += m.benefits;
        cumulativeCostsMonthly += m.costs;
        return { ...m, cumulativeBenefits: cumulativeBenefitsMonthly, cumulativeCosts: cumulativeCostsMonthly, cumulativeNetBenefit: cumulativeBenefitsMonthly - cumulativeCostsMonthly };
    });

    const annualSummaries = Array.from({ length: Math.ceil(projectDurationInYears) }, (_, yearIndex) => {
        const year = yearIndex + 1;
        const yearMonths = monthlyBreakdown.filter(m => m.year === year);
        const summary: any = { year };

        summary.incomeStatement = {
            year,
            sales: yearMonths.reduce((s, m) => s + m.sales, 0),
            fixedCosts: yearMonths.reduce((s, m) => s + m.operatingExpenses, 0),
            variableCosts: yearMonths.reduce((s, m) => s + m.variableCosts, 0),
            grossProfit: yearMonths.reduce((s, m) => s + m.grossProfit, 0),
            annualDepreciation: yearMonths.reduce((s, m) => s + m.monthlyDepreciation, 0),
            annualInterest: yearMonths.reduce((s, m) => s + m.monthlyInterest, 0),
            ebt: yearMonths.reduce((s, m) => s + m.ebt, 0),
            taxes: yearMonths.reduce((s, m) => s + m.taxes, 0),
            netIncome: yearMonths.reduce((s, m) => s + m.netIncome, 0),
        };

        const annualPrincipalRepayment = loans.reduce((sum, loan) => {
            const schedule = loanSchedules[loan.id];
            const startMonth = yearIndex * 12;
            const endMonth = startMonth + 12;
            return sum + schedule.slice(startMonth, endMonth).reduce((s, month) => s + month.principal, 0);
        }, 0);
        
        const salvageValue = (year === Math.ceil(projectDurationInYears)) ? depreciableAssets.reduce((s, a) => s + a.salvageValue, 0) : 0;
        
        summary.cashFlow = { ...summary.incomeStatement, annualPrincipalRepayment, salvageValue, netCashFlow: summary.incomeStatement.netIncome + summary.incomeStatement.annualDepreciation - annualPrincipalRepayment + salvageValue };
        
        summary.breakEven = { year, sales: summary.incomeStatement.sales, fixedCosts: summary.incomeStatement.fixedCosts, variableCosts: summary.incomeStatement.variableCosts };
        const contributionMarginRatio = summary.incomeStatement.sales > 0 ? (summary.incomeStatement.sales - summary.incomeStatement.variableCosts) / summary.incomeStatement.sales : 0;
        summary.breakEven.bepAmount = contributionMarginRatio > 0 ? summary.breakEven.fixedCosts / contributionMarginRatio : Infinity;
        summary.breakEven.bepPercentage = summary.incomeStatement.sales > 0 ? (summary.breakEven.bepAmount / summary.breakEven.sales) * 100 : Infinity;

        summary.costBenefit = { year, benefits: summary.incomeStatement.sales, costs: summary.incomeStatement.fixedCosts + summary.incomeStatement.variableCosts, netBenefit: summary.incomeStatement.sales - (summary.incomeStatement.fixedCosts + summary.incomeStatement.variableCosts) };
        
        return summary;
    });

    const annualCashFlows = [-netInitialInvestment, ...annualSummaries.map(s => s.cashFlow.netCashFlow)];
    
    let cumulativeCashFlow = -netInitialInvestment;
    const annualCashFlowData = [{ year: 0, netCashFlow: -netInitialInvestment, cumulativeCashFlow }].concat(annualSummaries.map(s => {
        cumulativeCashFlow += s.cashFlow.netCashFlow;
        return { year: s.year, netCashFlow: s.cashFlow.netCashFlow, cumulativeCashFlow };
    }));

    let cumulativeBenefits = 0;
    let cumulativeCosts = netInitialInvestment;
    const annualCostBenefitData = annualSummaries.map(s => {
        cumulativeBenefits += s.costBenefit.benefits;
        cumulativeCosts += s.costBenefit.costs;
        return { ...s.costBenefit, cumulativeBenefits, cumulativeCosts, cumulativeNetBenefit: cumulativeBenefits - cumulativeCosts };
    });

    const npv = annualCashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + discountRate / 100, i), 0);
    const irr = calculateIRR(annualCashFlows);

    let paybackPeriod = "Nunca";
    for(let i=1; i<annualCashFlowData.length; i++){ 
        if(annualCashFlowData[i].cumulativeCashFlow > 0){ 
            const year = i-1; 
            const fractionOfYear = -annualCashFlowData[i-1].cumulativeCashFlow/annualCashFlowData[i].netCashFlow; 
            const totalMonthsDecimal = fractionOfYear * 12;
            const months = Math.floor(totalMonthsDecimal);
            const days = Math.round((totalMonthsDecimal - months) * 30); // Assuming 30 days per month for simplicity
            paybackPeriod=`${year} año(s)|${months} mes(es)|${days} día(s)`;
            break;
        }
    }
    const discountedBenefits = annualSummaries.reduce((sum, s, i) => sum + s.incomeStatement.sales / Math.pow(1 + discountRate / 100, i + 1), 0);
    const discountedCosts = netInitialInvestment + annualSummaries.reduce((sum, s, i) => sum + (s.incomeStatement.fixedCosts + s.incomeStatement.variableCosts) / Math.pow(1 + discountRate / 100, i + 1), 0);
    const cbr = discountedCosts > 0 ? discountedBenefits / discountedCosts : 0;
    const roi = netInitialInvestment > 0 ? (annualSummaries.reduce((s, item) => s + item.incomeStatement.netIncome, 0) / netInitialInvestment) * 100 : null;

    const annualNPVContributions = annualCashFlows.map((cf, i) => ({
        year: i,
        discountedCashFlow: cf / Math.pow(1 + discountRate / 100, i)
    }));

    // --- Incremental Analysis Calculation ---
    let incrementalIRR: number | null = null;
    let incrementalNPV: number | undefined = undefined;

    if (incrementalAnalysisConfig && incrementalAnalysisConfig.investmentId) {
        const investmentIdNum = incrementalAnalysisConfig.investmentId ? Number(incrementalAnalysisConfig.investmentId) : null;
        const investment = investmentIdNum !== null ? investmentItems.find(i => i.id === investmentIdNum) : undefined;
        
        const loanIdNum = incrementalAnalysisConfig.loanId ? Number(incrementalAnalysisConfig.loanId) : null;
        const loan = loanIdNum !== null ? loans.find(l => l.id === loanIdNum) : undefined;

        if (investment) {
            const incrementalInvestmentCost = investment.amount;
            const loanPrincipal = loan ? loan.principal : 0;
            const impactRatio = incrementalAnalysisConfig.impactPercentage / 100;

            const initialIncrementalCashFlow = loanPrincipal - incrementalInvestmentCost;
            
            const incrementalAnnualCashFlows = annualSummaries.map((s, yearIndex) => {
                const incrementalBenefit = s.cashFlow.netCashFlow * impactRatio;
                
                let loanRepaymentForYear = 0;
                if (loan) {
                    let principalRepaymentForYear = 0;
                    let interestPaymentForYear = 0;
                    
                    for (let month = 0; month < 12; month++) {
                        const overallMonthIndex = yearIndex * 12 + month;
                        if (overallMonthIndex < loan.termMonths) {
                            principalRepaymentForYear += loan.principal / loan.termMonths;
                            const remainingBalance = loan.principal * (1 - Math.min(overallMonthIndex, loan.termMonths) / loan.termMonths);
                            interestPaymentForYear += (remainingBalance * (loan.annualInterestRate / 100)) / 12;
                        }
                    }
                    loanRepaymentForYear = principalRepaymentForYear + interestPaymentForYear;
                }
                
                return incrementalBenefit - loanRepaymentForYear;
            });
            
            const incrementalFlowsWithInvestment = [initialIncrementalCashFlow, ...incrementalAnnualCashFlows];

            incrementalIRR = calculateIRR(incrementalFlowsWithInvestment);
            incrementalNPV = incrementalFlowsWithInvestment.reduce((acc, val, i) => acc + val / Math.pow(1 + discountRate / 100, i), 0);
        }
    }


    const derivedData = {
        investmentItems: derivedInvestmentItems,
        recurringRevenues: derivedRevenues,
        recurringExpenses: derivedExpenses,
        bomItemCosts,
        netInitialInvestment,
    };

    return { 
        netInitialInvestment, 
        monthlyBreakdown, 
        annualSummaries, 
        annualCashFlowData, 
        monthlyCashFlowData, 
        annualCostBenefitData, 
        monthlyCostBenefitData, 
        financialMetrics: { npv, irr, paybackPeriod, cbr, roi, incrementalIRR, incrementalNPV }, 
        compositionData: annualSummaries.map(s => ({...s.incomeStatement})), 
        salesData: annualSummaries.map(s => ({ year: s.year, sales: s.incomeStatement.sales })), 
        monthlyBreakEvenData: monthlyBreakdown, 
        annualNPVContributions,
        loanSchedules,
        derivedData
    };
};