<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex rtl justify-between items-center flex-wrap gap-3">
        <h2 class="text-2xl font-bold">مدیریت گردونه‌ها</h2>
        <UButton icon="i-heroicons-plus" color="primary" @click="openModal()">
          گردونه جدید
        </UButton>
      </div>
    </template>

    <!-- Wheel List -->
    <div v-if="wheels.length" class="grid rtl gap-4 md:grid-cols-1">
      <UCard v-for="wheel in wheels" :key="wheel._id" class="hover:shadow-lg transition">
        <template #header>
          <div class="flex rtl justify-between items-center">
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
            <UDropdownMenu :items="getWheelActions(wheel)">
              <UButton icon="i-heroicons-ellipsis-vertical" color="gray" variant="ghost" />
            </UDropdownMenu>
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
            <div class="grid grid-cols-2 gap-2">
              <UCard v-for="prize in wheel.prizes" :key="prize._id" class="hover:shadow-lg transition-all duration-300">
                <template #header>
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3 space-x-reverse">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                          {{ prize.label }}
                        </h3>
                        <p class="text-sm text-gray-500">{{ prize.name }}</p>
                      </div>
                    </div>
                  </div>
                </template>

                <div class="space-y-4">
                  <!-- Prize Stats -->
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">موجودی:</span>
                      <span class="font-medium mr-2">{{ prize.Inventory.count }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">فروخته شده:</span>
                      <span class="font-medium mr-2">{{ prize.sold.count }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">احتمال:</span>
                      <span class="font-medium mr-2">{{ prize.probability }}%</span>
                    </div>
                    <div>
                      <span class="text-gray-500">حد مجاز:</span>
                      <span class="font-medium mr-2">{{ prize.available }}</span>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-10 text-gray-500">
      گردونه‌ای یافت نشد
    </div>


  </UCard>
  <!-- Create/Edit Modal -->
  <UModal :open="isModalOpen" :close="{ onClick: () => { isModalOpen = false } }" class="rtl"
    :title="editId ? 'ویرایش گردونه' : 'ایجاد گردونه'" :ui="{ header: 'rtl', footer: 'justify-end' }">
    <template #body>
      <UForm :schema="wheelSchema" :state="form" @submit.prevent="handleSubmit()" class="space-y-4">
        <UFormField label="نام گردونه" name="name" required>
          <UInput class="w-full" v-model="form.name" />
        </UFormField>

        <UFormField label="نوع مشتری" name="costumer" required>
          <USelect class="w-full" v-model="form.costumer" :items="customerOptions" />
        </UFormField>

        <UFormField label="جوایز" name="prizes" required>
          <USelectMenu dir="rtl" v-model="form.prizes" :items="availablePrizes" multiple option-attribute="name"
            value-attribute="_id" class="w-full">
          </USelectMenu>
        </UFormField>

        <UFormField>
          <UCheckbox v-model="form.available" label="فعال باشد" />
        </UFormField>

        <div class="flex justify-end gap-3">
          <UButton @click="handleSubmit()" type="submit" color="primary">{{ editId ? 'ذخیره تغییرات' : 'ایجاد' }}
          </UButton>
          <UButton color="neutral" variant="ghost" @click="isModalOpen = false">انصراف</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup>
import { z } from 'zod'
function getProgressColor(ratio) {
  if (ratio < 0.5) return 'success'
  if (ratio < 0.8) return 'warning'
  return 'error'
}

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
