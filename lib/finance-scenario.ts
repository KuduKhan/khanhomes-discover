/** Transparent, user-supplied Kenyan shilling scenarios. Not lending advice or a bank quote. */
export type FinanceInput={price:number;depositPercent:number;annualRatePercent:number;years:number;monthlyIncome:number;monthlyOtherDebt:number;monthlyFees:number;upfrontFees:number;monthlyRent:number;rentDepositMonths:number;movingAllowance:number};
export type FinanceResult={principal:number;deposit:number;monthlyPayment:number;totalInterest:number;totalRepayment:number;initialCash:number;monthlyHousingCost:number;incomeSharePercent:number;remainingAfterHousing:number;rentInitialCash:number;rentMonthlyCost:number;rentYearOneCash:number;buyYearOneCash:number};
export const DEFAULT_FINANCE:FinanceInput={price:12000000,depositPercent:20,annualRatePercent:13,years:20,monthlyIncome:280000,monthlyOtherDebt:0,monthlyFees:12000,upfrontFees:0,monthlyRent:65000,rentDepositMonths:1,movingAllowance:25000};
export function finiteRange(n:number,min:number,max:number){return Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;}
export function monthlyLoanPayment(principal:number,annualRatePercent:number,years:number):number{
 const p=finiteRange(principal,0,1e12),rate=finiteRange(annualRatePercent,0,100)/1200,n=finiteRange(years,1,50)*12;
 if(p===0)return 0;
 if(rate===0)return p/n;
 const factor=Math.pow(1+rate,-n);
 return p*rate/(1-factor);
}
export function estimateHousingScenario(raw:FinanceInput):FinanceResult{
 const price=finiteRange(raw.price,0,1e12),depositPercent=finiteRange(raw.depositPercent,0,100);
 const annualRatePercent=finiteRange(raw.annualRatePercent,0,100),years=finiteRange(raw.years,1,50);
 const income=finiteRange(raw.monthlyIncome,0,1e10),debt=finiteRange(raw.monthlyOtherDebt,0,1e10);
 const fees=finiteRange(raw.monthlyFees,0,1e10),upfrontFees=finiteRange(raw.upfrontFees,0,1e11);
 const rent=finiteRange(raw.monthlyRent,0,1e10),rentDepositMonths=finiteRange(raw.rentDepositMonths,0,6);
 const moving=finiteRange(raw.movingAllowance,0,1e10);
 const deposit=price*depositPercent/100,principal=price-deposit;
 const monthlyPayment=monthlyLoanPayment(principal,annualRatePercent,years);
 const totalRepayment=monthlyPayment*years*12,totalInterest=Math.max(0,totalRepayment-principal);
 const monthlyHousingCost=monthlyPayment+fees,initialCash=deposit+upfrontFees+moving;
 const incomeSharePercent=income>0?(monthlyHousingCost+debt)/income*100:0;
 return {principal,deposit,monthlyPayment,totalInterest,totalRepayment,initialCash,
 monthlyHousingCost,incomeSharePercent,remainingAfterHousing:income-monthlyHousingCost-debt,
 rentInitialCash:rent*(1+rentDepositMonths)+moving,
 rentMonthlyCost:rent,rentYearOneCash:rent*(12+rentDepositMonths)+moving,
 buyYearOneCash:initialCash+monthlyHousingCost*12};
}
