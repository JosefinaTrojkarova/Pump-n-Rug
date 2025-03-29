<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '~/stores/gameStore';
import { loadGameState } from '~/utils/marketUtils';
import { useGameMechanics } from '~/composables/useGameMechanics';
import { useNotifications } from '~/composables/useNotifications';

// Import components
import CreateCoinDialog from '~/components/CreateCoinDialog.vue';
import Notification from '~/components/Notification.vue';
import DecisionsList from '~/components/DecisionsList.vue';
import CoinInfoAndTrading from '~/components/CoinInfoAndTrading.vue';
import GameStatus from '~/components/GameStatus.vue';

// Initialize stores
const gameStore = useGameStore();

// Game mechanics
const { startGameLoop, initializeGame, cleanupGameLoops } = useGameMechanics();

// Notifications
const { notification, notificationType, showNotification } = useNotifications();

// UI state
const dialogs = ref({
  createCoin: false,
});

// Component references
const coinInfoRef = ref<InstanceType<typeof CoinInfoAndTrading> | null>(null);

// Start the game
const startGame = (coinData: { name: string, symbol: string }) => {
  if (!coinData.name || !coinData.symbol) {
    showNotification('Please enter a name and symbol for your coin', 'error');
    return;
  }
  
  // Initialize the game
  initializeGame(coinData.name, coinData.symbol);
  
  // Close the create coin dialog
  dialogs.value.createCoin = false;
  
  // Initialize the chart and start game loop
  coinInfoRef.value?.initChart();
  startGameLoop(() => coinInfoRef.value?.updateChartData());
};

// Handle decision outcome
const onDecisionOutcome = (result: { success: boolean; effect: string }) => {
  showNotification(result.effect, result.success ? 'success' : 'error', 5000);
};

// Handle transaction results
const onTransaction = (result: { success: boolean, message: string, type: string }) => {
  showNotification(result.message, result.type as 'success' | 'error', 3000);
};

// Check if the start a new coin or continue an existing game
onMounted(() => {
  // Try to load saved game
  const savedState = loadGameState();
  
  if (savedState) {
    // Ask if player wants to continue
    const continueGame = window.confirm('Continue existing game?');
    
    if (continueGame) {
      // Restore game state
      gameStore.cash = savedState.cash;
      gameStore.prestige = savedState.prestige;
      gameStore.gameTime = savedState.gameTime;
      gameStore.currentCoin = savedState.currentCoin;
      gameStore.holdings = savedState.holdings;
      gameStore.distribution = savedState.distribution;
      gameStore.priceGrowthFactors = savedState.priceGrowthFactors;
      gameStore.isGameStarted = true;
      
      // Initialize chart and start game loop
      coinInfoRef.value?.initChart();
      startGameLoop(() => coinInfoRef.value?.updateChartData());
    } else {
      // Show the create coin dialog
      dialogs.value.createCoin = true;
    }
  } else {
    // No saved game, show the create coin dialog
    dialogs.value.createCoin = true;
  }
});

// Clean up intervals on component unmount
onUnmounted(() => {
  cleanupGameLoops();
});
</script>

<template>
  <main>
    <!-- Create Coin Dialog (Modal) -->
    <CreateCoinDialog 
      :is-open="dialogs.createCoin"
      @create="startGame"
    />
    
    <!-- Notification toast -->
    <Notification 
      :message="notification" 
      :type="notificationType"
    />
    
    <!-- Left sidebar - Available decisions -->
    <DecisionsList @decision-outcome="onDecisionOutcome" />
    
    <!-- Main content - Coin chart and information -->
    <CoinInfoAndTrading 
      ref="coinInfoRef"
      @transaction="onTransaction"
    />
    
    <!-- Right sidebar - Game status -->
    <GameStatus />
  </main>
</template>

<style scoped lang="scss">
main {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  width: 1280px;
  height: 100vh;
  overflow: hidden;
  padding: 4rem 0;
  gap: 2rem;
  margin: 0 auto;

  // Responsive adjustments
  @media (max-width: 1300px) {
    width: 100%;
    padding: 2rem;
  }

  @media (max-width: 992px) {
    flex-direction: column;
    height: auto;
    overflow: auto;
  }
}
</style>