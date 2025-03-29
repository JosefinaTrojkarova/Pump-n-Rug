<script setup lang="ts">
import { useDecisionStore } from '~/stores/decisionStore';
import { useGameStore } from '~/stores/gameStore';
import { formatCurrency } from '~/utils/marketUtils';

const props = defineProps({
  decisionId: {
    type: String,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'decision-outcome']);

const decisionStore = useDecisionStore();
const gameStore = useGameStore();

const decision = computed(() => decisionStore.getDecision(props.decisionId));
const successChance = computed(() => decisionStore.calculateSuccessChance(decision.value!));

// Calculate total cost including selected improvements
const totalCost = computed(() => {
  if (!decision.value) return { cash: 0, prestige: 0 };
  
  let cash = decision.value.costCash;
  let prestige = decision.value.costPrestige;
  
  decision.value.improvements.forEach(imp => {
    if (imp.selected) {
      cash += imp.costCash;
      prestige += imp.costPrestige;
    }
  });
  
  return { cash, prestige };
});

// Check if player has enough resources
const canAfford = computed(() => {
  return gameStore.cash >= totalCost.value.cash && 
         gameStore.prestige >= totalCost.value.prestige;
});

// Toggle improvement selection
function toggleImprovement(improvementId: string) {
  decisionStore.toggleImprovement(props.decisionId, improvementId);
}

// Execute the decision
function executeDecision() {
  if (!decision.value || !canAfford.value) return;
  
  const result = decisionStore.executeDecision(props.decisionId);
  emit('decision-outcome', result);
  emit('close');
}

function closeDialog() {
  // Reset improvements when dialog closes
  if (decision.value) {
    decision.value.improvements.forEach(imp => {
      if (imp.selected) {
        toggleImprovement(imp.id);
      }
    });
  }
  
  emit('close');
}
</script>

<template>
  <dialog :open="open" v-if="decision">
    <header>
      <h3 class="title">{{ decision.name }}</h3>
      <p>{{ decision.description }}</p>
    </header>
    
    <section class="dialog-content">
      <p class="success-chance">Success Chance: {{ successChance }}%</p>
      
      <div class="costs">
        <p class="cost" :class="{ 'cannot-afford': gameStore.cash < totalCost.cash }">
          Cost: {{ formatCurrency(totalCost.cash) }}
        </p>
        <p class="cost" :class="{ 'cannot-afford': gameStore.prestige < totalCost.prestige }">
          Prestige Cost: {{ totalCost.prestige }}
        </p>
      </div>
      
      <div class="effects">
        <div class="success-effects">
          <h4>Success:</h4>
          <p>{{ decision.successEffects.description }}</p>
          <ul>
            <li v-if="decision.successEffects.priceEffect !== 0">
              Price Effect: 
              <span :class="decision.successEffects.priceEffect > 0 ? 'positive' : 'negative'">
                {{ decision.successEffects.priceEffect > 0 ? '+' : '' }}{{ decision.successEffects.priceEffect }}%
              </span>
            </li>
            <li v-if="decision.successEffects.prestigeEffect !== 0">
              Prestige: 
              <span :class="decision.successEffects.prestigeEffect > 0 ? 'positive' : 'negative'">
                {{ decision.successEffects.prestigeEffect > 0 ? '+' : '' }}{{ decision.successEffects.prestigeEffect }}
              </span>
            </li>
            <li v-if="decision.successEffects.cashEffect !== 0">
              Cash: 
              <span :class="decision.successEffects.cashEffect > 0 ? 'positive' : 'negative'">
                {{ decision.successEffects.cashEffect > 0 ? '+' : '' }}{{ formatCurrency(decision.successEffects.cashEffect) }}
              </span>
            </li>
          </ul>
        </div>
        
        <div class="failure-effects">
          <h4>Failure:</h4>
          <p>{{ decision.failureEffects.description }}</p>
          <ul>
            <li v-if="decision.failureEffects.priceEffect !== 0">
              Price Effect: 
              <span :class="decision.failureEffects.priceEffect > 0 ? 'positive' : 'negative'">
                {{ decision.failureEffects.priceEffect > 0 ? '+' : '' }}{{ decision.failureEffects.priceEffect }}%
              </span>
            </li>
            <li v-if="decision.failureEffects.prestigeEffect !== 0">
              Prestige: 
              <span :class="decision.failureEffects.prestigeEffect > 0 ? 'positive' : 'negative'">
                {{ decision.failureEffects.prestigeEffect > 0 ? '+' : '' }}{{ decision.failureEffects.prestigeEffect }}
              </span>
            </li>
            <li v-if="decision.failureEffects.cashEffect !== 0">
              Cash: 
              <span :class="decision.failureEffects.cashEffect > 0 ? 'positive' : 'negative'">
                {{ decision.failureEffects.cashEffect > 0 ? '+' : '' }}{{ formatCurrency(decision.failureEffects.cashEffect) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="improvements" v-if="decision.improvements.length > 0">
        <h4>Improvements:</h4>
        <ul>
          <li v-for="improvement in decision.improvements" :key="improvement.id">
            <div class="improvement">
              <div class="improvement-header">
                <input 
                  type="checkbox" 
                  :id="improvement.id" 
                  :checked="improvement.selected"
                  @change="toggleImprovement(improvement.id)"
                >
                <label :for="improvement.id">{{ improvement.name }}</label>
              </div>
              <p class="improvement-description">{{ improvement.description }}</p>
              <div class="improvement-details">
                <p v-if="improvement.costCash > 0">Cost: {{ formatCurrency(improvement.costCash) }}</p>
                <p v-if="improvement.costPrestige !== 0">
                  Prestige: 
                  <span :class="improvement.costPrestige < 0 ? 'negative' : ''">
                    {{ improvement.costPrestige > 0 ? '-' + improvement.costPrestige : improvement.costPrestige }}
                  </span>
                </p>
                <p>Success: +{{ improvement.successChanceBoost }}%</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
    
    <div class="actions">
      <button 
        @click="executeDecision" 
        class="execute-btn"
        :disabled="!canAfford"
        :class="{ 'cannot-afford': !canAfford }"
      >
        Execute
      </button>
      <button @click="closeDialog" class="cancel-btn">Cancel</button>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
dialog {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 1rem;
  padding: 1rem;
  border: 1px solid #000;
  border-radius: 0.5rem;
  background-color: white;
  width: 350px;
  max-width: 90vw;
  z-index: 10;
  
  header {
    margin-bottom: 1rem;
    
    .title {
      font-weight: bold;
      font-size: 1.2rem;
      margin: 0 0 0.5rem;
    }
    
    p {
      margin: 0;
    }
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .success-chance {
      font-weight: bold;
      font-size: 1.1rem;
      margin: 0;
    }
    
    .costs {
      display: flex;
      gap: 1rem;
      
      .cost {
        margin: 0;
        
        &.cannot-afford {
          color: red;
        }
      }
    }
    
    .effects {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      
      h4 {
        margin: 0 0 0.5rem;
      }
      
      p {
        margin: 0 0 0.5rem;
      }
      
      ul {
        margin: 0;
        padding-left: 1rem;
      }
      
      .positive {
        color: green;
      }
      
      .negative {
        color: red;
      }
    }
    
    .improvements {
      h4 {
        margin: 0 0 0.5rem;
      }
      
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      
      .improvement {
        margin-bottom: 0.75rem;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
        
        .improvement-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          
          label {
            font-weight: bold;
            cursor: pointer;
          }
        }
        
        .improvement-description {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
        }
        
        .improvement-details {
          display: flex;
          gap: 0.75rem;
          font-size: 0.8rem;
          
          p {
            margin: 0;
          }
          
          .negative {
            color: red;
          }
        }
      }
    }
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    
    button {
      padding: 0.5rem 1rem;
      border: 1px solid #000;
      border-radius: 0.25rem;
      background-color: #fff;
      cursor: pointer;
      min-width: 6rem;
      
      &.execute-btn {
        background-color: #0066cc;
        color: white;
        border-color: #0055aa;
      }
      
      &.cannot-afford {
        background-color: #999;
        cursor: not-allowed;
      }
    }
  }
}
</style>