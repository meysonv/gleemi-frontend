<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import NavbarAuth from '@/components/layout/NavbarAuth.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ChatList from '@/components/chat/ChatList.vue'

const chatStore = useChatStore()

onMounted(() => {
  chatStore.cargarConversaciones()
})
</script>

<template>
  <div class="chat-page">
    <NavbarAuth />

    <div class="chat-container">
      <ChatList />
      <ChatWindow />
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.chat-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  height: calc(100vh - 72px);
}

@media (max-width: 968px) {
  .chat-container {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>
