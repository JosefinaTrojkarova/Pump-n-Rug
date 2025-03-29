<template>
  <section class="coin">
    <section class="chart-wrapper">
      <header>
        <section class="info">
          <h2>{{ gameStore.currentCoin.name || 'Coin' }}</h2>
          <h1>{{ formatCurrency(gameStore.currentCoin.price) }}</h1>
        </section>
        <p class="change" :class="priceChange.value >= 0 ? 'positive' : 'negative'">
          {{ priceChange.value >= 0 ? '+' : '' }}{{ formatCurrency(priceChange.value) }}
          ({{ formatPercentChange(priceChange.percent) }})
          <span>last week</span>
        </p>
      </header>
      
      <menu class="trade">
        <li>
          <div class="transaction">
            <input type="number" v-model="transactionAmount" placeholder="Amount">
            <button @click="buy">Buy</button>
          </div>
        </li>
        <li>
          <div class="transaction">
            <input type="number" v-model="transactionAmount" placeholder="Amount">
            <button @click="sell">Sell</button>
          </div>
        </li>
      </menu>
      
      <CandlestickChart ref="chartRef" />
      
      <menu class="timescales">
        <li v-for="(days, scale) in timeframes" :key="scale">
          <button 
            @click="setTimeframe(scale)" 
            :class="{ active: currentTimeScale === scale }"
          >
            {{ scale }}
          </button>
        </li>
      </menu>
    </section>
    
    <section class="holdings">
      <section class="amount">
        <h2>You own</h2>
        <p>{{ gameStore.holdings.amount }} ${{ gameStore.currentCoin.symbol }}</p>
      </section>
      <section class="value">
        <h2>{{ formatCurrency(gameStore.holdings.value) }}</h2>
        <p class="change" :class="gameStore.holdings.percentChange >= 0 ? 'positive' : 'negative'">
          {{ gameStore.holdings.percentChange >= 0 ? '+' : '' }}{{ formatCurrency(gameStore.holdings.valueChange) }}
          ({{ formatPercentChange(gameStore.holdings.percentChange) }})
        </p>
      </section>
    </section>
    
    <section class="distribution">
      <h2>Distribution</h2>
      <ul>
        <li :style="{ width: gameStore.distribution.player + '%' }">You</li>
        <li :style="{ width: gameStore.distribution.insiders + '%' }">Insiders</li>
        <li :style="{ width: gameStore.distribution.public + '%' }">Public</li>
      </ul>
      <div class="bar-chart">
        <div :style="{ width: gameStore.distribution.player + '%' }" class="you">
          {{ Math.round(gameStore.distribution.player) }}%
        </div>
        <div :style="{ width: gameStore.distribution.insiders + '%' }" class="insiders">
          {{ Math.round(gameStore.distribution.insiders) }}%
        </div>
        <div :style="{ width: gameStore.distribution.public + '%' }" class="public">
          {{ Math.round(gameStore.distribution.public) }}%
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency, formatPercentChange, calculatePercentChange } from '~/utils/marketUtils';
import CandlestickChart from '~/components/CandlestickChart.vue';

const emit = defineEmits<{
  (e: 'transaction', result: { success: boolean, message: string, type: string }): void,
  (e: 'update-chart'): void
}>();

const gameStore = useGameStore();
const { transactionAmount, buyCoin, sellCoin } = useTransactions();

// Chart references
const chartRef = ref<InstanceType<typeof CandlestickChart> | null>(null);
const currentTimeScale = ref<keyof typeof timeframes>('1D'); // Default time scale

// Timeframe data - how many days to show in each view
const timeframes = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  'MAX': 9999,
};

// Initialize chart
const initChart = () => {
  chartRef.value?.init();
};

// Update chart with the current data based on selected timeframe
const updateChartData = () => {
  chartRef.value?.updateData();
  emit('update-chart');
};

// Set the active timeframe
const setTimeframe = (timeframe: keyof typeof timeframes) => {
  currentTimeScale.value = timeframe;
  updateChartData();
};

// Handlers for buy/sell
const buy = () => {
  const result = buyCoin();
  emit('transaction', result);
};

const sell = () => {
  const result = sellCoin();
  emit('transaction', result);
};

// Get price change for display
const priceChange = computed(() => {
  const history = gameStore.currentCoin.priceHistory;
  if (history.length < 2) return { value: 0, percent: 0 };
  
  const currentPrice = history[history.length - 1].close;
  
  // Get price from 7 days ago (or the oldest available)
  const comparisonIndex = Math.max(0, history.length - 8);
  const oldPrice = history[comparisonIndex].close;
  
  const change = currentPrice - oldPrice;
  const percentChange = calculatePercentChange(currentPrice, oldPrice);
  
  return {
    value: change,
    percent: percentChange,
  };
});

// Expose some methods for the parent component
defineExpose({
  initChart,
  updateChartData
});
</script>

<style scoped lang="scss">
.coin {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex-grow: 1;

  .chart-wrapper {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    flex-grow: 1;

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;

      .info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        h2 {
          margin: 0;
        }
        
        h1 {
          margin: 0;
        }
      }

      .change {
        &.positive {
          color: #008300;
        }
        
        &.negative {
          color: #cc0000;
        }

        span {
          color: #000;
        }
      }
    }

    .trade {
      display: flex;
      justify-content: space-between;
      list-style: none;
      gap: 1rem;
      padding: 0;
      margin: 0;

      li {
        flex-grow: 1;
        
        .transaction {
          display: flex;
          gap: 0.5rem;
          
          input {
            flex-grow: 1;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 0.25rem;
          }

          button {
            padding: 0.5rem 1.5rem;
            border: 1px solid #000;
            border-radius: 0.5rem;
            background-color: #fff;
            cursor: pointer;
            
            &:hover {
              background-color: #f0f0f0;
            }
          }
        }
      }
    }

    .timescales {
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      gap: 0.5rem;
      padding: 0;
      margin: 0;

      li {
        flex-grow: 1;

        button {
          padding: 0.5rem 0;
          border: 1px solid #000;
          border-radius: 0.5rem;
          background-color: #fff;
          width: 100%;
          cursor: pointer;
          
          &:hover {
            background-color: #f0f0f0;
          }
          
          &.active {
            background-color: #000;
            color: #fff;
          }
        }
      }
    }
  }

  .holdings {
    display: flex;
    justify-content: space-between;
    
    h2 {
      margin: 0 0 0.5rem;
    }
    
    p {
      margin: 0;
    }

    .value {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .change {
        &.positive {
          color: #008300;
        }
        
        &.negative {
          color: #cc0000;
        }
      }
    }
  }

  .distribution {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    h2 {
      margin: 0 0 0.5rem;
    }

    ul {
      list-style: none;
      display: flex;
      padding: 0;
      margin: 0;
    }

    .bar-chart {
      display: flex;
      color: white;
      border-radius: 0.5rem;
      overflow: hidden;
      height: 30px;
      text-align: center;
      line-height: 30px;

      .you {
        background-color: #27A69A;
        padding: 0 0.5rem;
      }

      .insiders {
        background-color: #F05351;
        padding: 0 0.5rem;
      }

      .public {
        background-color: #5b5bfd;
        padding: 0 0.5rem;
      }
    }
  }
}
</style>