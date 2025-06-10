<script setup>
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
})
</script>

<template>
    <UButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      @click="isDark = !isDark"
      size="lg"
      variant="outline"
      color="neutral"
    />
</template>
