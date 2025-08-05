<template>
  <div class="flex w-full justify-end h-screen">
    <div class="w-full">
      <div class="flex w-full h-fit my-8">
        <div class="flex gap-2 w-full">
          <div class="ml-4">
            <ColorModeButton />
          </div>
          <USeparator icon="i-lucide-layout-dashboard" label="داشبورد ایزی مد" />
        </div>
      </div>
      <MenuDashboardPanel v-if="selected == 'dashboard'" />
      <MenuDoctorAppPanel v-if="selected == 'doctor-app'" />
      <MenuPatientAppPanel v-if="selected == 'patient-app'" />
      <MenuForeignPanel v-if="selected == 'foreign'" />
    </div>
    <div>
      <div class="border-l p-4 py-20 h-screen" style="border-color: var(--ui-border);">
        <UNavigationMenu :ui="{ item: 'rtl' }" orientation="vertical" :items="items"
          class="data-[orientation=vertical]:w-48" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorModeButton from '@/components/base/ColorModeButton.vue';
import type { NavigationMenuItem } from '@nuxt/ui';
const selected = ref('dashboard')
const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'منو دسترسی',
      type: 'label',
    },
    {
      label: 'داشبورد',
      icon: 'i-lucide-layout-dashboard',
      active: selected.value === 'dashboard',
      onSelect() {
        selected.value = 'dashboard'
      },
    },
    {
      label: 'اپلیکیشن پزشک',
      icon: 'i-lucide-syringe',
      active: selected.value === 'doctor-app',
      onSelect() {
        selected.value = 'doctor-app'
      },
    },
    {
      label: 'اپلیکیشن بیمار',
      icon: 'i-lucide-activity',
      active: selected.value === 'patient-app',
      onSelect() {
        selected.value = 'patient-app'
      },
    },
    {
      label: 'بیماران خارج از کشور',
      icon: 'i-lucide-earth',
      active: selected.value === 'foreign',
      onSelect() {
        selected.value = 'foreign'
      },
    },
    {
      label: 'آزمایش در منزل',
      icon: 'i-lucide-house-plus',
      active: selected.value === 'lab',
      onSelect() {
        selected.value = 'lab'
      },
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