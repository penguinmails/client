import {
  getBillingInfo as getBillingInfoAction,
  updatePaymentMethod as updatePaymentMethodAction,
  changeBillingPlan as changeBillingPlanAction,
  getStorageOptions as getStorageOptionsAction,
  addStorage as addStorageAction,
  getBillingDataForSettings as getBillingDataForSettingsAction,
  updateBillingInfo as updateBillingInfoAction,
  getUsageWithCalculations as getUsageWithCalculationsAction,
} from "../../actions";

// Re-export actions for client consumption
export const getBillingInfo = getBillingInfoAction;
export const updatePaymentMethod = updatePaymentMethodAction;
export const changeBillingPlan = changeBillingPlanAction;
export const getStorageOptions = getStorageOptionsAction;
export const addStorage = addStorageAction;
export const getBillingDataForSettings = getBillingDataForSettingsAction;
export const updateBillingInfo = updateBillingInfoAction;
export const getUsageWithCalculations = getUsageWithCalculationsAction;
