<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
  },
  color: {
    type: String,
    default: 'primary', // primary, white
  },
})
</script>

<template>
  <div class="spinner" :class="[size, color]"></div>
</template>

<style scoped>
.spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.small {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
}

.spinner.medium {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
}

.spinner.large {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
}

.spinner.white {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
