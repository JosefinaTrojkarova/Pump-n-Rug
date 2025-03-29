import { generateOHLCData, generateDateString, saveGameState } from '~/utils/marketUtils';

export function useGameMechanics() {
  const gameStore = useGameStore();
  const eventStore = useEventStore();
  
  // Game timers
  let gameInterval: NodeJS.Timeout | null = null;
  let chartUpdateInterval: NodeJS.Timeout | null = null;
  
  // Start game loop - updates the game state at regular intervals
  const startGameLoop = (updateChartCallback: () => void) => {
    // Clear any existing intervals
    if (gameInterval) clearInterval(gameInterval);
    if (chartUpdateInterval) clearInterval(chartUpdateInterval);
    
    // Run main game update every second (1 second = 1 hour in game)
    gameInterval = setInterval(() => {
      updateGame();
    }, 1000);
    
    // Update chart more frequently for smoother display
    chartUpdateInterval = setInterval(() => {
      updateChartCallback();
    }, 500);
    
    return { gameInterval, chartUpdateInterval };
  };
  
  // Main game update function
  const updateGame = () => {
    const gameState = gameStore;
    
    // Increment game time (each unit is one hour)
    gameState.gameTime++;
    
    // Track the previous price for updating the chart data
    const previousPrice = gameState.currentCoin.price;
    
    // Only increment days when 24 hours have passed
    if (gameState.hoursInCurrentDay === 0) {
      gameState.currentCoin.lifetimeInDays++;
      
      // Generate new price data at the start of each day
      const date = generateDateString(gameState.gameTimeInDays);
      const currentPrice = gameState.currentCoin.price;
      const growthChance = gameState.priceGrowthChance;
      
      const newData = generateOHLCData(date, currentPrice, growthChance);
      
      // Update coin price and history
      gameState.currentCoin.price = newData.close;
      gameState.currentCoin.priceHistory.push(newData);
      
      // Keep only the last 365 days of data to prevent memory issues
      if (gameState.currentCoin.priceHistory.length > 365) {
        gameState.currentCoin.priceHistory = gameState.currentCoin.priceHistory.slice(-365);
      }
    } else {
      // For hours that aren't the start of a day, make small adjustments to price
      // to create intraday fluctuations
      const hourlyFluctuation = (Math.random() - 0.5) * 0.005; // Small random fluctuation ±0.25%
      const currentPrice = gameState.currentCoin.price;
      gameState.currentCoin.price = currentPrice * (1 + hourlyFluctuation);
      
      // Update the current day's OHLC data with the hourly price
      if (gameState.currentCoin.priceHistory.length > 0) {
        const latestDay = gameState.currentCoin.priceHistory[gameState.currentCoin.priceHistory.length - 1];
        
        // Update high/low if needed
        if (gameState.currentCoin.price > latestDay.high) {
          latestDay.high = gameState.currentCoin.price;
        }
        if (gameState.currentCoin.price < latestDay.low) {
          latestDay.low = gameState.currentCoin.price;
        }
        
        // Update close price
        latestDay.close = gameState.currentCoin.price;
      }
    }
    
    // Update holdings value for price changes
    const newValue = gameState.holdings.amount * gameState.currentCoin.price;
    const oldValue = gameStore.holdings.value;
    gameState.holdings.value = newValue;
    gameState.holdings.valueChange = newValue - oldValue;
    gameState.holdings.percentChange = calculatePercentChange(newValue, oldValue);
    
    // Update price growth factors (remove expired ones)
    gameState.updatePriceGrowthFactors();
    
    // Check for random events (roughly 10% chance per day, so ~0.4% per hour)
    const eventTriggerChance = 0.004;
    const eventTriggered = Math.random() < eventTriggerChance;
    
    const triggeredEvent = eventTriggered ? 
      eventStore.checkEventTriggers(gameState.gameTime) : null;
    
    // Save game state
    saveGameState({
      gameTime: gameState.gameTime,
      cash: gameState.cash,
      prestige: gameState.prestige,
      currentCoin: gameState.currentCoin,
      holdings: gameState.holdings,
      distribution: gameState.distribution,
      priceGrowthFactors: gameState.priceGrowthFactors,
    });
    
    return { triggeredEvent };
  };
  
  // Helper function for calculating percentage change
  const calculatePercentChange = (newValue: number, oldValue: number): number => {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };
  
  // Cleanup function to stop intervals
  const cleanupGameLoops = () => {
    if (gameInterval) clearInterval(gameInterval);
    if (chartUpdateInterval) clearInterval(chartUpdateInterval);
  };
  
  // Start a new game
  const initializeGame = (coinName: string, coinSymbol: string) => {
    gameStore.startGame(coinName, coinSymbol.toUpperCase());
  };
  
  return {
    startGameLoop,
    updateGame,
    cleanupGameLoops,
    initializeGame,
    calculatePercentChange
  };
}