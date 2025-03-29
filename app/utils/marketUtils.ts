import type { CandlestickData, Time } from 'lightweight-charts';

// Function to generate a random price change based on the growth chance
export function generatePriceChange(
  currentPrice: number, 
  growthChance: number, 
  volatility: number = 1.0
): number {
  // Base range for price changes (-10% to +10%)
  const baseChangeRange = 0.1 * volatility;
  
  // Adjust the midpoint based on growth chance (50 is neutral)
  // At 50% chance, the midpoint is 0 (equal chance of going up or down)
  // At 100% chance, the midpoint is baseChangeRange (guarantee of going up)
  // At 0% chance, the midpoint is -baseChangeRange (guarantee of going down)
  const offset = ((growthChance - 50) / 50) * baseChangeRange;
  
  // Generate a random change with the adjusted midpoint
  // Using normal distribution for more realistic market behavior
  const randomFactor = (Math.random() + Math.random() + Math.random()) / 3; // Approximate normal distribution
  const normalizedRandom = (randomFactor - 0.5) * 2; // Normalize to -1 to 1
  
  const change = normalizedRandom * baseChangeRange + offset;
  
  // Apply the change to the current price
  const newPrice = currentPrice * (1 + change);
  
  // Ensure price doesn't go below a minimum threshold
  return Math.max(newPrice, 0.01);
}

// Function to generate OHLC data for a given day
export function generateOHLCData(
  date: string, 
  prevClose: number, 
  growthChance: number, 
  volatility: number = 1.0
): CandlestickData<Time> {
  const open = prevClose;
  
  // Generate high, low, and close based on open and volatility
  const dayVolatility = volatility * (0.8 + Math.random() * 0.4); // Add some randomness to volatility
  
  // Generate 4 price points for the day (representing price movements during the day)
  const pricePoints = [open];
  
  for (let i = 0; i < 3; i++) {
    const lastPrice = pricePoints[pricePoints.length - 1] ?? 0;
    pricePoints.push(generatePriceChange(lastPrice, growthChance, dayVolatility));
  }
  
  // Get high, low, and close from the price points
  const high = Math.max(...pricePoints);
  const low = Math.min(...pricePoints);
  const close = pricePoints[pricePoints.length - 1] ?? open;
  
  return {
    time: date as Time,
    open,
    high,
    low,
    close
  };
}

// Format a number as currency
export function formatCurrency(value: number): string {
  return value < 1000
    ? '$' + value.toFixed(2)
    : '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Function to format a percentage change
export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Generate a random date for a given day offset
export function generateDateString(dayOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Convert a float number to a fixed precision display
export function toFixedPrecision(value: number | undefined, precision: number = 2): string {
  if (value === undefined) return "0.00";
  return value.toFixed(precision);
}

// Calculate percentage change between two values
export function calculatePercentChange(newValue: number, oldValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

// Utility function to save game state to local storage
export function saveGameState(gameState: any): void {
  localStorage.setItem('pumpnrug_gamestate', JSON.stringify(gameState));
}

// Utility function to load game state from local storage
export function loadGameState(): any {
  const savedState = localStorage.getItem('pumpnrug_gamestate');
  return savedState ? JSON.parse(savedState) : null;
}