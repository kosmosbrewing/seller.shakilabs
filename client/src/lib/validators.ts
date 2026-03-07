import { z } from "zod";
import type {
  CategoryKey,
  SmartStoreTier,
  SmartStoreSource,
  CoupangMode,
  FulfillmentSize,
} from "@/data/marketFees";
import {
  DEFAULT_PRICE,
  DEFAULT_SHIPPING_FEE,
  DEFAULT_MONTHLY_QTY,
} from "@/data/pricePresets";

export const PRICE_MIN = 100;
export const PRICE_MAX = 100_000_000;
export const SHIPPING_FEE_MIN = 0;
export const SHIPPING_FEE_MAX = 10_000_000;
export const MONTHLY_QTY_MIN = 1;
export const MONTHLY_QTY_MAX = 99_999;

const CATEGORY_VALUES = ["clothing", "food", "electronics", "living", "beauty"] as const;
const SMARTSTORE_TIER_VALUES = ["micro", "small1", "small2", "small3", "normal"] as const;
const SMARTSTORE_SOURCE_VALUES = ["naverShopping", "marketingLink"] as const;
const COUPANG_MODE_VALUES = ["marketplace", "rocketGrowth"] as const;
const FULFILLMENT_SIZE_VALUES = ["xs", "small", "medium", "large", "xl", "xxl"] as const;

export const DEFAULT_CATEGORY: CategoryKey = "clothing";
export const DEFAULT_SMARTSTORE_TIER: SmartStoreTier = "micro";
export const DEFAULT_SMARTSTORE_SOURCE: SmartStoreSource = "naverShopping";
export const DEFAULT_COUPANG_MODE: CoupangMode = "marketplace";
export const DEFAULT_FULFILLMENT_SIZE: FulfillmentSize = "small";

export const priceSchema = z.number().int().min(PRICE_MIN).max(PRICE_MAX);
const calcPriceSchema = z.number().int().min(0).max(PRICE_MAX);
export const shippingFeeSchema = z.number().int().min(SHIPPING_FEE_MIN).max(SHIPPING_FEE_MAX);
export const monthlyQtySchema = z.number().int().min(MONTHLY_QTY_MIN).max(MONTHLY_QTY_MAX);
export const categorySchema = z.enum(CATEGORY_VALUES);
export const smartStoreTierSchema = z.enum(SMARTSTORE_TIER_VALUES);
export const smartStoreSourceSchema = z.enum(SMARTSTORE_SOURCE_VALUES);
export const coupangModeSchema = z.enum(COUPANG_MODE_VALUES);
export const fulfillmentSizeSchema = z.enum(FULFILLMENT_SIZE_VALUES);

export const compareInputSchema = z.object({
  price: priceSchema,
  shippingFee: shippingFeeSchema,
  category: categorySchema,
  smartstoreTier: smartStoreTierSchema,
  smartstoreSource: smartStoreSourceSchema,
  coupangMode: coupangModeSchema,
  fulfillmentSize: fulfillmentSizeSchema,
});

const calcCompareInputSchema = z.object({
  price: calcPriceSchema,
  shippingFee: shippingFeeSchema,
  category: categorySchema,
  smartstoreTier: smartStoreTierSchema,
  smartstoreSource: smartStoreSourceSchema,
  coupangMode: coupangModeSchema,
  fulfillmentSize: fulfillmentSizeSchema,
});

interface CompareValidationInput {
  price: number;
  shippingFee: number;
  category: CategoryKey;
  smartstoreTier: SmartStoreTier;
  smartstoreSource: SmartStoreSource;
  coupangMode: CoupangMode;
  fulfillmentSize: FulfillmentSize;
}

interface SmartStoreValidationInput {
  price: number;
  shippingFee: number;
  tier: SmartStoreTier;
  source: SmartStoreSource;
}

interface CoupangValidationInput {
  price: number;
  shippingFee: number;
  category: CategoryKey;
  mode: CoupangMode;
  fulfillmentSize: FulfillmentSize;
}

interface SimpleMarketValidationInput {
  price: number;
  shippingFee: number;
  category: CategoryKey;
}

function parseBySchema<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseCalcPrice(value: unknown): number | null {
  return parseBySchema(calcPriceSchema, value);
}

export function parsePrice(value: unknown): number | null {
  return parseBySchema(priceSchema, value);
}

export function parseShippingFee(value: unknown): number | null {
  return parseBySchema(shippingFeeSchema, value);
}

export function parseMonthlyQty(value: unknown): number | null {
  return parseBySchema(monthlyQtySchema, value);
}

export function parseCategory(value: unknown): CategoryKey | null {
  return parseBySchema(categorySchema, value);
}

export function parseSmartStoreTier(value: unknown): SmartStoreTier | null {
  return parseBySchema(smartStoreTierSchema, value);
}

export function parseSmartStoreSource(value: unknown): SmartStoreSource | null {
  return parseBySchema(smartStoreSourceSchema, value);
}

export function parseCoupangMode(value: unknown): CoupangMode | null {
  return parseBySchema(coupangModeSchema, value);
}

export function parseFulfillmentSize(value: unknown): FulfillmentSize | null {
  return parseBySchema(fulfillmentSizeSchema, value);
}

export function sanitizeMonthlyQty(value: unknown, fallback = DEFAULT_MONTHLY_QTY): number {
  return parseMonthlyQty(value) ?? fallback;
}

export function sanitizeCompareInput(input: CompareValidationInput): CompareValidationInput {
  const parsed = compareInputSchema.safeParse(input);
  if (parsed.success) return parsed.data;

  return {
    price: parsePrice(input.price) ?? DEFAULT_PRICE,
    shippingFee: parseShippingFee(input.shippingFee) ?? DEFAULT_SHIPPING_FEE,
    category: parseCategory(input.category) ?? DEFAULT_CATEGORY,
    smartstoreTier: parseSmartStoreTier(input.smartstoreTier) ?? DEFAULT_SMARTSTORE_TIER,
    smartstoreSource: parseSmartStoreSource(input.smartstoreSource) ?? DEFAULT_SMARTSTORE_SOURCE,
    coupangMode: parseCoupangMode(input.coupangMode) ?? DEFAULT_COUPANG_MODE,
    fulfillmentSize: parseFulfillmentSize(input.fulfillmentSize) ?? DEFAULT_FULFILLMENT_SIZE,
  };
}

export function sanitizeCompareCalcInput(input: CompareValidationInput): CompareValidationInput {
  const parsed = calcCompareInputSchema.safeParse(input);
  if (parsed.success) return parsed.data;

  return {
    price: parseCalcPrice(input.price) ?? 0,
    shippingFee: parseShippingFee(input.shippingFee) ?? DEFAULT_SHIPPING_FEE,
    category: parseCategory(input.category) ?? DEFAULT_CATEGORY,
    smartstoreTier: parseSmartStoreTier(input.smartstoreTier) ?? DEFAULT_SMARTSTORE_TIER,
    smartstoreSource: parseSmartStoreSource(input.smartstoreSource) ?? DEFAULT_SMARTSTORE_SOURCE,
    coupangMode: parseCoupangMode(input.coupangMode) ?? DEFAULT_COUPANG_MODE,
    fulfillmentSize: parseFulfillmentSize(input.fulfillmentSize) ?? DEFAULT_FULFILLMENT_SIZE,
  };
}

export function sanitizeSmartStoreInput(
  input: SmartStoreValidationInput
): SmartStoreValidationInput {
  return {
    price: parseCalcPrice(input.price) ?? 0,
    shippingFee: parseShippingFee(input.shippingFee) ?? DEFAULT_SHIPPING_FEE,
    tier: parseSmartStoreTier(input.tier) ?? DEFAULT_SMARTSTORE_TIER,
    source: parseSmartStoreSource(input.source) ?? DEFAULT_SMARTSTORE_SOURCE,
  };
}

export function sanitizeCoupangInput(input: CoupangValidationInput): CoupangValidationInput {
  return {
    price: parseCalcPrice(input.price) ?? 0,
    shippingFee: parseShippingFee(input.shippingFee) ?? DEFAULT_SHIPPING_FEE,
    category: parseCategory(input.category) ?? DEFAULT_CATEGORY,
    mode: parseCoupangMode(input.mode) ?? DEFAULT_COUPANG_MODE,
    fulfillmentSize: parseFulfillmentSize(input.fulfillmentSize) ?? DEFAULT_FULFILLMENT_SIZE,
  };
}

export function sanitizeSimpleMarketInput(
  input: SimpleMarketValidationInput
): SimpleMarketValidationInput {
  return {
    price: parseCalcPrice(input.price) ?? 0,
    shippingFee: parseShippingFee(input.shippingFee) ?? DEFAULT_SHIPPING_FEE,
    category: parseCategory(input.category) ?? DEFAULT_CATEGORY,
  };
}
