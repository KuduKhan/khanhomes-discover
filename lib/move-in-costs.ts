/** User-adjustable estimates only; never claim fees are publisher-confirmed. */
export type MoveInInput={
 monthlyRent:number;depositMonths:number;
 serviceCharge:number;utilitySetup:number;movingBudget:number;
};
export type MoveInEstimate={
 firstMonthRent:number;deposit:number;serviceCharge:number;utilitySetup:number;
 movingBudget:number;total:number;ongoingMonthly:number;
};
export const defaultMoveInInput=(monthlyRent:number):MoveInInput=>({
 monthlyRent,depositMonths:1,serviceCharge:0,utilitySetup:0,movingBudget:0
});
const whole=(n:number,max:number)=>Number.isFinite(n)?Math.min(max,Math.max(0,Math.floor(n))):0;
export function estimateMoveInCost(input:MoveInInput):MoveInEstimate{
 const firstMonthRent=whole(input.monthlyRent,1000000000000);
 const depositMonths=whole(input.depositMonths,6);
 const serviceCharge=whole(input.serviceCharge,10000000000);
 const utilitySetup=whole(input.utilitySetup,10000000000);
 const movingBudget=whole(input.movingBudget,10000000000);
 const deposit=firstMonthRent*depositMonths;
 return {firstMonthRent,deposit,serviceCharge,utilitySetup,movingBudget,
  total:firstMonthRent+deposit+serviceCharge+utilitySetup+movingBudget,
  ongoingMonthly:firstMonthRent+serviceCharge};
}
