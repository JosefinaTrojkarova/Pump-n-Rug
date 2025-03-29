<template>
  <aside class="decisions">
    <h2>Available decisions</h2>
    <ul>
      <li v-for="decision in decisionStore.availableDecisions" :key="decision.id">
        <p @click="openDialog(decision.id)">
          {{ decision.name }}
        </p>
        <DecisionDialog 
          :decision-id="decision.id" 
          :open="activeDecisionId === decision.id" 
          @close="closeDialog"
          @decision-outcome="onDecisionOutcome"
        />
      </li>
      <li v-if="decisionStore.availableDecisions.length === 0">
        <p class="no-decisions">No decisions available right now.</p>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDecisionStore } from '~/stores/decisionStore';
import DecisionDialog from '~/components/DecisionDialog.vue';

const props = defineProps<{
  // No props needed
}>();

const emit = defineEmits<{
  (e: 'decision-outcome', result: { success: boolean; effect: string }): void
}>();

const decisionStore = useDecisionStore();
const activeDecisionId = ref('');

// Open a decision dialog
const openDialog = (decisionId: string) => {
  activeDecisionId.value = decisionId;
};

// Close the decision dialog
const closeDialog = () => {
  activeDecisionId.value = '';
};

// Handle decision outcome
const onDecisionOutcome = (result: { success: boolean; effect: string }) => {
  emit('decision-outcome', result);
  closeDialog();
};
</script>

<style scoped lang="scss">
.decisions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;

  ul {
    display: flex;
    flex-direction: column;
    list-style: none;
    gap: .5rem;
    padding: 0;
    margin: 0;

    li {
      position: relative;

      p {
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
        margin: 0;
        
        &:hover {
          background-color: #f0f0f0;
          text-decoration: underline;
        }
      }
      
      .no-decisions {
        color: #777;
        font-style: italic;
        cursor: default;
        
        &:hover {
          background-color: transparent;
          text-decoration: none;
        }
      }
    }
  }
}
</style>