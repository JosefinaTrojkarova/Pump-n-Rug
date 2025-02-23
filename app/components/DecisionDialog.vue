<script setup lang="ts">
defineProps({
  type: String,
  open: Boolean
})

const emit = defineEmits(['close'])

const closeDialog = () => {
  emit('close')
}
</script>

<template>
  <dialog :open="open">
    <p class="title">Instagram Shoutout from Sister</p>
    <p>Leverage your sister's 2000 followers to boost $CTHL visibility</p>
    <section class="dialog-content">
      <p class="title">Base Success Chance: 70%</p>
      <ul>
        <li>Cost: 20 Prestige</li>
        <li>Potential Gain: +15% price increase</li>
        <li>Risk: 10% chance sister loses followers</li>
      </ul>
      <h4>Improvements:</h4>
      <ul>
        <li>
          <input type="checkbox" id="sister-gift">
          <label for="sister-gift">Send gift (Cost: $50, +15% success)</label>
        </li>
        <li>
          <input type="checkbox" id="sister-pitch">
          <label for="sister-pitch">Prepare pitch (Cost: 10 Prestige, +10% success)</label>
        </li>
      </ul>
    </section>
    <button @click="closeDialog">Close</button>
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
  width: 300px;
  z-index: 10;

  .title {
    font-weight: bold;
  }

  p {
    margin: 0 0 1rem;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h4 {
      margin: 0;
    }

    ul {
      margin: 0;
      padding-left: 1rem;
    }

    input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    label {
      cursor: pointer;
    }
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #000;
    border-radius: 0.5rem;
    background-color: #fff;
    cursor: pointer;
  }
}
</style>