import {describe,expect,it} from "vitest";
import {DEFAULT_FINANCE,estimateHousingScenario,monthlyLoanPayment} from "./finance-scenario";
describe("finance scenario arithmetic",()=>{
 it("calculates a zero-interest amortizing payment",()=>{expect(monthlyLoanPayment(120000,0,10)).toBe(1000);});
 it("matches standard amortization to within one shilling",()=>{expect(monthlyLoanPayment(1000000,12,20)).toBeCloseTo(11010.86,0);});
 it("handles full deposits, nonfinite inputs and empty incomes without NaN",()=>{
  const a=estimateHousingScenario({...DEFAULT_FINANCE,depositPercent:100,monthlyIncome:0,annualRatePercent:0});
  expect(a.principal).toBe(0);expect(a.monthlyPayment).toBe(0);expect(a.incomeSharePercent).toBe(0);
  const b=estimateHousingScenario({...DEFAULT_FINANCE,price:Number.POSITIVE_INFINITY,annualRatePercent:Number.NaN});
  expect(Number.isFinite(b.monthlyHousingCost)).toBe(true);
 });
 it("counts recurring service fees, cash-to-close and refundable rental deposit distinctly",()=>{
  const a=estimateHousingScenario({...DEFAULT_FINANCE,price:10000000,depositPercent:20,upfrontFees:100000,monthlyFees:5000,monthlyRent:50000,rentDepositMonths:2,movingAllowance:20000});
  expect(a.principal).toBe(8000000);expect(a.initialCash).toBe(2120000);
  expect(a.rentInitialCash).toBe(170000);expect(a.rentYearOneCash).toBe(720000);
  expect(a.monthlyHousingCost).toBeCloseTo(a.monthlyPayment+5000,6);
 });
});
