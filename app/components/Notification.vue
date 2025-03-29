<template>
  <div v-if="message" class="notification" :class="type">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
  type: 'info' | 'success' | 'error';
}>();
</script>

<style scoped lang="scss">
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 90;
  max-width: 300px;
  animation: slideIn 0.3s ease-out;
  
  &.info {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
  }
  
  &.success {
    background-color: #e8f5e9;
    border-left: 4px solid #4caf50;
  }
  
  &.error {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
}
</style>