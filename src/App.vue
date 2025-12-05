<script setup>
import { RouterView } from 'vue-router'
import NotificationToast from '@/components/common/NotificationToast.vue'
</script>

<template>
  <NotificationToast />
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>
