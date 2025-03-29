<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineExpose } from 'vue';
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, ColorType } from 'lightweight-charts';
import { useGameStore } from '~/stores/gameStore';

const props = defineProps({
  width: {
    type: Number,
    default: 600
  },
  height: {
    type: Number,
    default: 300
  },
  chartOptions: {
    type: Object,
    default: () => ({
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })
  },
  seriesOptions: {
    type: Object,
    default: () => ({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })
  }
});

// Reference to the chart container
const chartContainer = ref<HTMLElement | null>(null);

// Chart and series instances (plain JS variables, not refs)
let chart: IChartApi | null = null;
let series: any = null;

// Get the game store to access the price history
const gameStore = useGameStore();

// Initialize chart
const init = () => {
  if (!chartContainer.value || chart) return;
  
  // Create chart instance with merged options
  const mergedOptions = {
    width: props.width,
    height: props.height,
    ...props.chartOptions
  };
  
  chart = createChart(chartContainer.value, mergedOptions);
  
  // Add candlestick series using v5 API
  series = chart.addSeries(CandlestickSeries, props.seriesOptions);
  
  // Set initial data
  updateData();

  // Set up window resize handler
  const handleResize = () => {
    if (chart) {
      chart.applyOptions({
        width: chartContainer.value?.clientWidth || props.width,
        height: props.height
      });
    }
  };

  window.addEventListener('resize', handleResize);
  
  // Store the event listener so we can remove it later
  (chartContainer.value as any)._handleResize = handleResize;
};

// Update chart data based on the current timeframe
const updateData = () => {
  if (!series || !chart) return;
  
  const history = gameStore.currentCoin.priceHistory;
  if (history && history.length > 0) {
    // Set the data to the series
    series.setData(history);
    chart.timeScale().fitContent();
  }
};

// Initialize chart on mount if not already done through init()
onMounted(() => {
  if (gameStore.isGameStarted && !chart) {
    init();
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (chartContainer.value && (chartContainer.value as any)._handleResize) {
    window.removeEventListener('resize', (chartContainer.value as any)._handleResize);
  }
  
  if (chart) {
    chart.remove();
    chart = null;
    series = null;
  }
});

// Watch for chart option changes
watch(() => props.chartOptions, (newOptions) => {
  if (chart) {
    chart.applyOptions(newOptions);
  }
}, { deep: true });

// Watch for series option changes
watch(() => props.seriesOptions, (newOptions) => {
  if (series) {
    series.applyOptions(newOptions);
  }
}, { deep: true });

// Methods to expose
const fitContent = () => {
  if (chart) {
    chart.timeScale().fitContent();
  }
};

const getChart = () => chart;
const getSeries = () => series;

// Expose methods for parent component to use
defineExpose({
  init,
  updateData,
  fitContent,
  getChart,
  getSeries
});
</script>

<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}
</style>