import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Define the PriceGrowthFactor interface
interface PriceGrowthFactor {
  id: number;
  name: string;
  effect: number;
  duration: number; // In hours
  addedAt: number; // In hours
}

export const useGameStore = defineStore('game', () => {
  // Player resources
  const cash = ref(100);
  const prestige = ref(50);
  
  // Game state
  const isGameStarted = ref(false);
  const gameTime = ref(0); // Time in hours since the game started
  const gameSpeed = ref(1); // Time multiplier for game speed
  
  // Current coin being pumped
  const currentCoin = ref({
    name: '',
    symbol: '',
    price: 0,
    priceHistory: [] as any[],
    launchTime: 0, // When the coin was launched (in game time)
    lifetimeInDays: 0, // How many days the coin has existed
  });
  
  // Player holdings
  const holdings = ref({
    amount: 0,
    averagePurchasePrice: 0,
    value: 0,
    percentChange: 0,
    valueChange: 0,
  });
  
  // Distribution of the coin
  const distribution = ref({
    player: 0, // Percentage owned by player
    insiders: 0, // Percentage owned by insiders
    public: 0, // Percentage owned by the public
  });
  
  // Price growth factors
  const priceGrowthFactors = ref<PriceGrowthFactor[]>([]);
  
  // Computed properties
  const priceGrowthChance = computed(() => {
    if (priceGrowthFactors.value.length === 0) return 50; // Default 50% chance
    
    const totalEffect = priceGrowthFactors.value.reduce((total, factor) => {
      return total + factor.effect;
    }, 0);
    
    return Math.min(Math.max(50 + totalEffect, 0), 100); // Clamp between 0 and 100
  });
  
  const holdingsValue = computed(() => {
    return holdings.value.amount * currentCoin.value.price;
  });
  
  // Computed properties to convert between hours and days
  const gameTimeInDays = computed(() => Math.floor(gameTime.value / 24));
  const hoursInCurrentDay = computed(() => gameTime.value % 24);

  // Actions
  function startGame(coinName: string, coinSymbol: string) {
    isGameStarted.value = true;
    gameTime.value = 0;
    cash.value = 100;
    prestige.value = 50;
    
    currentCoin.value = {
      name: coinName,
      symbol: coinSymbol,
      price: 1.0, // Starting price is $1
      priceHistory: [{ time: '2023-01-01', open: 1.0, high: 1.0, low: 1.0, close: 1.0 }],
      launchTime: gameTime.value,
      lifetimeInDays: 0,
    };
    
    holdings.value = {
      amount: 100, // Start with 100 coins
      averagePurchasePrice: 1.0,
      value: 100,
      percentChange: 0,
      valueChange: 0,
    };
    
    distribution.value = {
      player: 20, // Start with 20% ownership
      insiders: 50,
      public: 30,
    };
    
    // Reset price growth factors
    priceGrowthFactors.value = [];
  }
  
  function addPriceGrowthFactor(name: string, effect: number, duration: number = -1) {
    // Convert duration from days to hours if it's not permanent
    const durationInHours = duration === -1 ? -1 : duration * 24;
    
    const factor = {
      id: Date.now(), // Unique identifier
      name,
      effect,
      duration: durationInHours, // In hours, -1 means permanent
      addedAt: gameTime.value, // When this factor was added (in hours)
    };
    
    priceGrowthFactors.value.push(factor);
  }
  
  function removePriceGrowthFactor(id: number) {
    const index = priceGrowthFactors.value.findIndex(factor => factor.id === id);
    if (index !== -1) {
      priceGrowthFactors.value.splice(index, 1);
    }
  }
  
  function updatePriceGrowthFactors() {
    // Remove expired factors
    priceGrowthFactors.value = priceGrowthFactors.value.filter(factor => {
      if (factor.duration === -1) return true; // Permanent factor
      return (gameTime.value - factor.addedAt) < factor.duration;
    });
  }
  
  function addCash(amount: number) {
    cash.value += amount;
  }
  
  function removeCash(amount: number) {
    if (cash.value >= amount) {
      cash.value -= amount;
      return true;
    }
    return false;
  }
  
  function addPrestige(amount: number) {
    prestige.value += amount;
  }
  
  function removePrestige(amount: number) {
    if (prestige.value >= amount) {
      prestige.value -= amount;
      return true;
    }
    return false;
  }
  
  function buyCoin(amount: number, price: number) {
    const cost = amount * price;
    
    if (cash.value >= cost) {
      cash.value -= cost;
      
      // Update holdings
      const totalValue = holdings.value.amount * holdings.value.averagePurchasePrice + amount * price;
      const newAmount = holdings.value.amount + amount;
      
      holdings.value.averagePurchasePrice = totalValue / newAmount;
      holdings.value.amount = newAmount;
      holdings.value.value = holdings.value.amount * currentCoin.value.price;
      
      // Update distribution
      updateDistribution();
      
      return true;
    }
    
    return false;
  }
  
  function sellCoin(amount: number, price: number) {
    if (holdings.value.amount >= amount) {
      const revenue = amount * price;
      cash.value += revenue;
      
      holdings.value.amount -= amount;
      holdings.value.value = holdings.value.amount * currentCoin.value.price;
      
      // Update distribution
      updateDistribution();
      
      return true;
    }
    
    return false;
  }
  
  function updateDistribution() {
    const totalCoins = 1000000; // Assume 1 million total coins
    distribution.value.player = (holdings.value.amount / totalCoins) * 100;
    
    // Adjust public and insider distribution based on price and other factors
    // This is a simplified model, can be made more complex later
    const highPrice = currentCoin.value.price > 50;
    const longLifetime = currentCoin.value.lifetimeInDays > 30;
    
    if (highPrice && longLifetime) {
      // More public interest in stable, high-priced coins
      distribution.value.public = Math.min(100 - distribution.value.player, 60);
    } else if (highPrice) {
      // High price attracts public, but insiders still hold a lot
      distribution.value.public = Math.min(100 - distribution.value.player, 45);
    } else if (longLifetime) {
      // Old coins have more public distribution
      distribution.value.public = Math.min(100 - distribution.value.player, 40);
    } else {
      // New, low price coins are mostly held by insiders
      distribution.value.public = Math.min(100 - distribution.value.player, 30);
    }
    
    // The rest is held by insiders
    distribution.value.insiders = 100 - distribution.value.player - distribution.value.public;
  }
  
  return {
    // State
    cash,
    prestige,
    isGameStarted,
    gameTime,
    gameSpeed,
    currentCoin,
    holdings,
    distribution,
    priceGrowthFactors,
    
    // Computed
    priceGrowthChance,
    holdingsValue,
    gameTimeInDays,
    hoursInCurrentDay,
    
    // Actions
    startGame,
    addPriceGrowthFactor,
    removePriceGrowthFactor,
    updatePriceGrowthFactors,
    addCash,
    removeCash,
    addPrestige,
    removePrestige,
    buyCoin,
    sellCoin,
    updateDistribution,
  };
});