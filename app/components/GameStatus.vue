<template>
  <aside class="status">
    <header>
      <h2 class="cash">💵 {{ formatCurrency(gameStore.cash) }}</h2>
      <h2 class="prestige">🏆 {{ gameStore.prestige }}</h2>
    </header>
    
    <section class="effects">
      <h2>Effects</h2>
      <section class="table-heading">
        <p>Price growth chance:</p>
        <p>{{ Math.round(gameStore.priceGrowthChance) }}%</p>
      </section>
      
      <template v-if="gameStore.priceGrowthFactors.length > 0">
        <ul class="good">
          <li v-for="factor in gameStore.priceGrowthFactors.filter(f => f.effect > 0)" :key="factor.id">
            <span class="number">+{{ factor.effect }}%</span>
            <span>{{ factor.name }}</span>
          </li>
        </ul>
        
        <ul class="bad">
          <li v-for="factor in gameStore.priceGrowthFactors.filter(f => f.effect < 0)" :key="factor.id">
            <span class="number">{{ factor.effect }}%</span>
            <span>{{ factor.name }}</span>
          </li>
        </ul>
      </template>
      
      <p v-else class="no-effects">No active effects</p>
    </section>
    
    <section class="game-info">
      <p>Day: {{ gameStore.gameTimeInDays }}</p>
      <p>Hour: {{ gameStore.hoursInCurrentDay }}</p>
      <p>Coin age: {{ gameStore.currentCoin.lifetimeInDays }} days</p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { useGameStore } from '~/stores/gameStore';
import { formatCurrency } from '~/utils/marketUtils';

const gameStore = useGameStore();
</script>

<style scoped lang="scss">
.status {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 300px;

  header {
    display: flex;
    gap: 1rem;
    
    h2 {
      margin: 0;
    }
  }

  .effects {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    h2 {
      margin: 0 0 0.5rem;
    }

    .table-heading {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      
      p {
        margin: 0;
      }
    }
    
    .no-effects {
      font-style: italic;
      color: #777;
    }

    .number {
      font-weight: bold;
      display: inline-block;
      width: 3rem;
    }

    ul {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        gap: 0.5rem;
      }
    }

    .good .number {
      color: #008300;
    }

    .bad .number {
      color: #cc0000;
    }
  }
  
  .game-info {
    margin-top: auto;
    font-size: 0.9rem;
    color: #666;
    
    p {
      margin: 0 0 0.5rem;
    }
  }
}
</style>