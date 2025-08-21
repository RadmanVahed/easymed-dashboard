<template>
  <div class="space-y-6" dir="rtl" lang="fa">
    <!-- Header -->
    <div class="flex justify-between items-center flex-wrap gap-3">
      <h2 class="text-2xl font-bold">مدیریت گردونه‌ها</h2>
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        @click="openModal()"
      >
        گردونه جدید
      </UButton>
    </div>

    <!-- Wheel List -->
    <div v-if="wheels.length" class="grid gap-4 md:grid-cols-2">
      <UCard
        v-for="wheel in wheels"
        :key="wheel._id"
        class="hover:shadow-lg transition"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🎰</span>
              <div>
                <h3 class="font-semibold">{{ wheel.name }}</h3>
                <div class="flex gap-2 mt-1">
                  <UBadge :color="wheel.available ? 'green' : 'gray'" variant="subtle">
                    {{ wheel.available ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                  <UBadge color="blue" variant="subtle">
                    {{ getCustomerLabel(wheel.costumer) }}
                  </UBadge>
                </div>
              </div>
            </div>
            <UDropdown :items="getWheelActions(wheel)">
              <UButton icon="i-heroicons-ellipsis-vertical" color="gray" variant="ghost" />
            </UDropdown>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Details -->
          <div class="grid grid-cols-1 md:grid-cols-3 text-sm gap-4">
            <div><span class="text-gray-500">تعداد جوایز:</span> {{ wheel.prizes?.length || 0 }}</div>
            <div><span class="text-gray-500">وضعیت:</span> {{ wheel.available ? 'در حال اجرا' : 'متوقف' }}</div>
            <div><span class="text-gray-500">مشتریان:</span> {{ getCustomerLabel(wheel.costumer) }}</div>
          </div>

          <!-- Prizes -->
          <div v-if="wheel.prizes?.length">
            <h4 class="text-sm font-medium mb-2">جوایز:</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                v-for="prizeId in wheel.prizes"
                :key="prizeId"
                class="bg-gray-50 rounded-lg p-2 text-center dark:bg-gray-800"
              >
                <div>{{ getPrizeInfo(prizeId)?.icon }}</div>
                <div class="text-xs">{{ getPrizeInfo(prizeId)?.name }}</div>
                <div class="text-xs text-gray-500">{{ getPrizeInfo(prizeId)?.probability }}%</div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-10 text-gray-500">
      گردونه‌ای یافت نشد
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="isModalOpen" :ui="{ width: 'max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ editId ? 'ویرایش گردونه' : 'ایجاد گردونه' }}</h3>
        </template>

        <UForm :schema="wheelSchema" :state="form" @submit="handleSubmit" class="space-y-4">
          <UFormGroup label="نام گردونه" name="name" required>
            <UInput v-model="form.name" />
          </UFormGroup>

          <UFormGroup label="نوع مشتری" name="costumer" required>
            <USelect v-model="form.costumer" :options="customerOptions" />
          </UFormGroup>

          <UFormGroup label="جوایز" name="prizes" required>
            <div class="max-h-56 overflow-y-auto border rounded-lg p-2 space-y-2">
              <div
                v-for="prize in availablePrizes"
                :key="prize._id"
                class="flex gap-3 items-center p-2 hover:bg-gray-50 rounded"
              >
                <UCheckbox
                  :model-value="form.prizes.includes(prize._id)"
                  @update:model-value="togglePrizeSelection(prize._id)"
                />
                <span>{{ getPrizeIcon(prize.type) }} {{ prize.name }} ({{ prize.probability }}%)</span>
              </div>
            </div>
          </UFormGroup>

          <UFormGroup>
            <UCheckbox v-model="form.available" label="فعال باشد" />
          </UFormGroup>

          <div class="flex justify-end gap-3">
            <UButton type="submit" color="primary">{{ editId ? 'ذخیره تغییرات' : 'ایجاد' }}</UButton>
            <UButton color="gray" variant="ghost" @click="isModalOpen = false">انصراف</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { z } from 'zod'

const props = defineProps({
  wheels: { type: Array, default: () => [] },
  prizes: { type: Array, default: () => [] }
})
const emit = defineEmits(['create', 'update', 'delete'])

const isModalOpen = ref(false)
const editId = ref(null)
const form = ref({ name: '', costumer: 'doctor', prizes: [], available: true })

const wheelSchema = z.object({
  name: z.string().min(1, 'نام را وارد کنید'),
  costumer: z.string(),
  prizes: z.array(z.string()).min(1, 'حداقل یک جایزه انتخاب کنید')
})

const customerOptions = [
  { value: 'doctor', label: 'پزشکان' },
  { value: 'patient', label: 'بیماران' }
]

const availablePrizes = computed(() =>
  props.prizes.filter(p => p.type !== 'empty' || p.probability > 0)
)

function getCustomerLabel(c) {
  return c === 'doctor' ? 'پزشکان' : 'بیماران'
}

function getPrizeInfo(id) {
  const p = props.prizes.find(pr => pr._id === id)
  return p ? { name: p.name, icon: getPrizeIcon(p.type), probability: p.probability } : null
}

function getPrizeIcon(type) {
  return { physical: '🎁', digital: '💎', discount: '🎟️', empty: '😔' }[type] || '🎁'
}

function getWheelActions(wheel) {
  return [
    [
      { label: wheel.available ? 'متوقف کردن' : 'فعال کردن', icon: wheel.available ? 'i-heroicons-pause' : 'i-heroicons-play', click: () => emit('update', wheel._id, { available: !wheel.available }) }
    ],
    [
      { label: 'ویرایش', icon: 'i-heroicons-pencil-square', click: () => openModal(wheel) }
    ],
    [
      { label: 'حذف', icon: 'i-heroicons-trash', click: () => emit('delete', wheel) }
    ]
  ]
}

function togglePrizeSelection(id) {
  const idx = form.value.prizes.indexOf(id)
  idx >= 0 ? form.value.prizes.splice(idx, 1) : form.value.prizes.push(id)
}

function openModal(wheel = null) {
  if (wheel) {
    editId.value = wheel._id
    form.value = { name: wheel.name, costumer: wheel.costumer, prizes: [...wheel.prizes], available: wheel.available }
  } else {
    editId.value = null
    form.value = { name: '', costumer: 'doctor', prizes: [], available: true }
  }
  isModalOpen.value = true
}

function handleSubmit() {
  if (editId.value) {
    emit('update', editId.value, form.value)
  } else {
    emit('create', form.value)
  }
  isModalOpen.value = false
}
</script>
