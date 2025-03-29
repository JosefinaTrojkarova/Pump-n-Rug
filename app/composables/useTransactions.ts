import { useGameStore } from '~/stores/gameStore';
import { formatCurrency } from '~/utils/marketUtils';
import { ref } from 'vue';

export function useTransactions() {
  const gameStore = useGameStore();
  
  // Transaction amount for buy/sell
  const transactionAmount = ref(0);
  
  // Buy some coins
  const buyCoin = () => {
    if (transactionAmount.value <= 0) {
      return {
        success: false,
        message: 'Please enter a valid amount',
        type: 'error'
      };
    }
    
    const amount = transactionAmount.value;
    const price = gameStore.currentCoin.price;
    
    const success = gameStore.buyCoin(amount, price);
    
    if (success) {
      // Reset transaction amount
      transactionAmount.value = 0;
      
      return {
        success: true,
        message: `Bought ${amount} ${gameStore.currentCoin.symbol} for ${formatCurrency(amount * price)}`,
        type: 'success'
      };
    } else {
      return {
        success: false,
        message: 'Not enough cash',
        type: 'error'
      };
    }
  };
  
  // Sell some coins
  const sellCoin = () => {
    if (transactionAmount.value <= 0) {
      return {
        success: false,
        message: 'Please enter a valid amount',
        type: 'error'
      };
    }
    
    const amount = transactionAmount.value;
    const price = gameStore.currentCoin.price;
    
    const success = gameStore.sellCoin(amount, price);
    
    if (success) {
      // Reset transaction amount
      transactionAmount.value = 0;
      
      return {
        success: true,
        message: `Sold ${amount} ${gameStore.currentCoin.symbol} for ${formatCurrency(amount * price)}`,
        type: 'success'
      };
    } else {
      return {
        success: false,
        message: 'Not enough coins to sell',
        type: 'error'
      };
    }
  };
  
  return {
    transactionAmount,
    buyCoin,
    sellCoin
  };
}