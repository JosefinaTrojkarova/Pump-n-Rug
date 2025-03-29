<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <h2>Create Your Meme Coin</h2>
      <p>Choose a name and ticker symbol for your new crypto coin.</p>
      
      <div class="form-group">
        <label for="coinName">Coin Name:</label>
        <input type="text" id="coinName" v-model="coinName" placeholder="e.g. Cajthaml Coin">
      </div>
      
      <div class="form-group">
        <label for="coinSymbol">Symbol (3-5 letters):</label>
        <input type="text" id="coinSymbol" v-model="coinSymbol" placeholder="e.g. CTHL" maxlength="5">
      </div>
      
      <div class="actions">
        <button @click="createCoin" class="primary-btn">Launch Coin</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  (e: 'create', data: { name: string, symbol: string }): void
}>();

const coinName = ref('');
const coinSymbol = ref('');

const createCoin = () => {
  if (!coinName.value || !coinSymbol.value) {
    return;
  }
  
  emit('create', {
    name: coinName.value,
    symbol: coinSymbol.value
  });
  
  // Reset form
  coinName.value = '';
  coinSymbol.value = '';
};
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .modal {
    background-color: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    width: 400px;
    max-width: 90vw;
    
    h2 {
      margin-top: 0;
    }
    
    .form-group {
      margin-bottom: 1rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      
      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
      }
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
      
      .primary-btn {
        background-color: #0066cc;
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        
        &:hover {
          background-color: #0055aa;
        }
      }
    }
  }
}
</style>