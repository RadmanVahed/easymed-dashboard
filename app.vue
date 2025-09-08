<script setup lang="ts">
useAuthStore().initializeStore()
</script>

<template>
   <UApp>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </UApp>
</template>
