<template>
   <div class="flex h-screen">
    <div class="flex mt-4 mx-4 gap-2 w-full h-fit">
      <div><ColorModeButton /></div>
      <USeparator label="داشبورد ایزی مد" />
    </div>
    <div class="border-l p-4" style="border-color: var(--ui-border);">
      <UNavigationMenu :ui="{item:'rtl'}" orientation="vertical" :items="items" class="data-[orientation=vertical]:w-48" />
    </div>
   </div>
   
</template>

<script setup lang="ts">
import ColorModeButton from '@/components/base/ColorModeButton.vue';
import type { NavigationMenuItem } from '@nuxt/ui';

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'منو دسترسی',
      type: 'label',
    },
    {
      label: 'اپ پزشک',
      icon: 'i-lucide-book-open',
    },
    {
      label: 'بیماران خارج از کشور',
      icon: 'i-lucide-box',
      to: '/components',
      active: true,
      defaultOpen: true,
    },
     {
      label: 'آزمایش در منزل',
      icon: 'i-lucide-database',
    },
  ],
  [
    {
      label: 'خروج از حساب کاربری',
      icon: 'i-lucide-user',
      to: '/',
    },
  ]
])
</script>