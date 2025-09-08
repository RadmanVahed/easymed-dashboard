<template>
  <div class="flex w-full justify-end h-screen">
    <div class="w-full">
      <div class="flex w-full h-fit my-8">
        <div class="flex gap-2 w-full mx-4">
          <div>
            <ColorModeButton />
          </div>
          <USeparator icon="i-lucide-layout-dashboard" label="پنل ایزی مد" />
          <USlideover description="سرویس مورد نظر را انتخاب کنید" :open="openMenu" title="منوی پنل" :close="{ onClick: () => { openMenu = false } }"
            close-icon="i-lucide-x" class="lg:hidden">
            <UButton icon="i-lucide-align-justify" @click="openMenu = true" color="neutral" variant="outline" />

            <template #body>
              <div class="p-4">
                <UNavigationMenu :ui="{ item: 'rtl' }" orientation="vertical" :items="items" />
              </div>

            </template>
          </USlideover>
        </div>

      </div>
      <UContainer>
        <MenuDashboardPanel v-if="selected == 'dashboard'" />
        <MenuDoctorAppPanel v-if="selected == 'doctor-app'" />
        <MenuPatientAppPanel v-if="selected == 'patient-app'" />
        <MenuForeignPanel v-if="selected == 'foreign'" />
        <MenuWheelPanel v-if="selected == 'wheel'" />
      </UContainer>
    </div>
    <div class="max-lg:hidden">
      <div class="border-l p-4 py-20 h-screen" style="border-color: var(--ui-border);">
        <UNavigationMenu :ui="{ item: 'rtl' }" orientation="vertical" :items="items" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorModeButton from '@/components/base/ColorModeButton.vue';
import type { NavigationMenuItem } from '@nuxt/ui';
const selected = ref('dashboard')
const openMenu = ref(false)
const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'داشبورد',
      icon: 'i-lucide-layout-dashboard',
      active: selected.value === 'dashboard',
      onSelect() {
        selected.value = 'dashboard'
        openMenu.value = false
      },
    },
    {
      label: 'اپلیکیشن پزشک',
      icon: 'i-lucide-syringe',
      active: selected.value === 'doctor-app',
      onSelect() {
        selected.value = 'doctor-app'
        openMenu.value = false
      },
    },
    {
      label: 'اپلیکیشن بیمار',
      icon: 'i-lucide-activity',
      active: selected.value === 'patient-app',
      onSelect() {
        selected.value = 'patient-app'
        openMenu.value = false
      },
    },
    {
      label: 'بیماران خارج از کشور',
      icon: 'i-lucide-earth',
      active: selected.value === 'foreign',
      onSelect() {
        selected.value = 'foreign'
        openMenu.value = false
      },
    },
    {
      label: 'آزمایش در منزل',
      icon: 'i-lucide-house-plus',
      active: selected.value === 'lab',
      onSelect() {
        selected.value = 'lab'
        openMenu.value = false
      },
    },
    {
      label:'گردونه شانس',
      icon:'i-lucide-ferris-wheel',
      active: selected.value === 'wheel',
      onSelect() {
        selected.value = 'wheel',
        openMenu.value = false
      }
    }
  ],
  [
    {
      label: 'خروج از حساب کاربری',
      icon: 'i-lucide-user',
      onSelect() {
        useAuthStore().logout()
      },
      to: '/',
    },
  ]
])
</script>