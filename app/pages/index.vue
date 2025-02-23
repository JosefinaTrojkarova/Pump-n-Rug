<script setup lang="ts">
import {CandlestickSeries, createChart} from 'lightweight-charts';
import DecisionDialog from "~/components/DecisionDialog.vue";

const dialogs = ref({
  sister: false,
  influencer: false,
  memes: false,
  insider: false
});

const openDialog = (dialogName: keyof typeof dialogs.value) => {
  dialogs.value[dialogName] = true;
};

const closeDialog = (dialogName: keyof typeof dialogs.value) => {
  dialogs.value[dialogName] = false;
};

onMounted(() => {
  const chart = createChart('chart');
  const lineSeries = chart.addSeries(CandlestickSeries);
  lineSeries.setData([
    {time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72},
    {time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09},
    {time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29},
    {time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50},
    {time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04},
    {time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40},
    {time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25},
    {time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43},
    {time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10},
    {time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26},
  ]);

  chart.timeScale().fitContent();
})
</script>

<template>
  <main>
    <aside class="decisions">
      <h2>Available decisions</h2>
      <ul>
        <li>
          <p @click="openDialog('sister')">
            Ask your "famous" sister for an Instagram shoutout
          </p>
          <DecisionDialog :open="dialogs.sister" @close="closeDialog('sister')"/>
        </li>
        <li>
          <p @click="openDialog('influencer')">
            Buy a shoutout from a popular influencer
          </p>
          <DecisionDialog :open="dialogs.influencer" @close="closeDialog('influencer')"/>
        </li>
        <li>
          <p @click="openDialog('memes')">
            Post memes about $CTHL on reddit
          </p>
          <DecisionDialog :open="dialogs.memes" @close="closeDialog('memes')"/>
        </li>
        <li>
          <p @click="openDialog('insider')">
            Get insider on board
          </p>
          <DecisionDialog :open="dialogs.insider" @close="closeDialog('insider')"/>
        </li>
      </ul>
    </aside>
    <section class="coin">
      <section class="chart-wrapper">
        <header>
          <section class="info">
            <h2>Cajthaml coin</h2>
            <h1>$111.26</h1>
          </section>
          <p class="change">
            +65.54 (243.35%) <span>last week</span>
          </p>
        </header>
        <menu class="trade">
          <li>
            <button>Buy</button>
          </li>
          <li>
            <button>Sell</button>
          </li>
        </menu>
        <div id="chart"></div>
        <menu class="timescales">
          <li>
            <button>1D</button>
          </li>
          <li>
            <button>1W</button>
          </li>
          <li>
            <button>1M</button>
          </li>
          <li>
            <button>3M</button>
          </li>
          <li>
            <button>1Y</button>
          </li>
          <li>
            <button>MAX</button>
          </li>
        </menu>
      </section>
      <section class="holdings">
        <section class="amount">
          <h2>You own</h2>
          <p>134 $CTHL</p>
        </section>
        <section class="value">
          <h2>$14,908.84</h2>
          <p class="change">+12,471.35 (511.67%)</p>
        </section>
      </section>
      <section class="distribution">
        <h2>Distribution</h2>
        <ul>
          <li style="width: 23%">You</li>
          <li style="width: 45%">Insiders</li>
          <li style="width: 32%">Public</li>
        </ul>
        <div class="bar-chart">
          <div style="width: 23%" class="you">23%</div>
          <div style="width: 45%" class="insiders">45%</div>
          <div style="width: 32%" class="public">32%</div>
        </div>
      </section>
    </section>
    <aside class="status">
      <header>
        <h2 class="cash">💵 100</h2>
        <h2 class="prestige">🏆 50</h2>
      </header>
      <section class="effects">
        <h2>Effects</h2>
        <section class="table-heading">
          <p>Price growth chance:</p>
          <p>78%</p>
        </section>
        <ul class="good">
          <li><span class="number">+145%</span><span>Elon Musk tweets about $CTHL</span></li>
          <li><span class="number">+5%</span><span>Sister's shoutout is recieved well</span></li>
        </ul>
        <ul class="bad">
          <li>
            <span class="number">-45%</span><span>Whale sells large amount</span>
          </li>
          <li>
            <span class="number">-100%</span><span>CoffeeZilla exposes $CTHL as scam</span>
          </li>
          <li>
            <span class="number">-30%</span><span>Insiders lost trust</span>
          </li>
        </ul>
      </section>
    </aside>
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

  aside {
    width: 300px;
  }

  .decisions {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    ul {
      display: flex;
      flex-direction: column;
      list-style: none;
      gap: .5rem;

      li {
        position: relative;

        p {
          cursor: pointer;
        }

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

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
        }

        .change {
          color: #008300;

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

        li {
          flex-grow: 1;

          button {
            padding: 0.5rem 1.5rem;
            border: 1px solid #000;
            border-radius: 0.5rem;
            background-color: #fff;
            width: 100%;
            cursor: pointer;
          }
        }
      }

      #chart {
        width: 100%;
        flex-grow: 1;
      }

      .timescales {
        display: flex;
        justify-content: space-between;
        align-items: center;
        list-style: none;
        gap: 1rem;

        li {
          flex-grow: 1;

          button {
            padding: 0.5rem 1.5rem;
            border: 1px solid #000;
            border-radius: 0.5rem;
            background-color: #fff;
            width: 100%;
            cursor: pointer;
          }
        }
      }
    }

    .holdings {
      display: flex;
      justify-content: space-between;

      .value {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .change {
          color: #008300;
        }
      }
    }

    .distribution {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      ul {
        list-style: none;
        display: flex;
      }

      .bar-chart {
        display: flex;
        color: white;
        border-radius: 0.5rem;
        overflow: hidden;

        .you {
          background-color: #27A69A;
          padding: .5rem;
        }

        .insiders {
          background-color: #F05351;
          padding: .5rem;
        }

        .public {
          background-color: #5b5bfd;
          padding: .5rem;
        }
      }
    }
  }

  .status {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    header {
      display: flex;
      gap: 1rem;
    }

    .effects {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .table-heading {
        display: flex;
        justify-content: space-between;
      }

      .number {
        font-weight: bold;
        width: 2rem;
      }

      ul {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        list-style: none;

        li {
          display: flex;
          gap: 2rem;
        }
      }

      .good .number {
        color: #008300;
      }

      .bad .number {
        color: #ff0000;
      }
    }
  }
}
</style>