<template>
  <UCard>
    <!-- Header with Create Button -->
    <template #header>
      <div class="flex rtl justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          مدیریت جوایز
        </h2>
        <UButton icon="i-heroicons-plus" color="primary" @click="showCreateModal = true">
          افزودن جایزه جدید
        </UButton>
      </div>
    </template>

    <!-- Prizes Grid -->
    <div class="grid grid-cols-1 rtl md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="prize in prizes" :key="prize._id" class="hover:shadow-lg transition-all duration-300">
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

          <!-- Progress Bar -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs text-gray-500">
              <span>پیشرفت فروش</span>
              <span>{{ Math.round((prize.sold.count / prize.Inventory.count) * 100) }}%</span>
            </div>
            <UProgress :value="(prize.sold.count / prize.Inventory.count) * 100"
              :color="getProgressColor(prize.sold.count / prize.Inventory.count)" />
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 pt-4 border-t dark:border-gray-700">
            <UButton icon="i-heroicons-plus-circle" size="sm" color="success" variant="soft"
              @click="showIncreaseInventoryModal(prize)">
              افزایش موجودی
            </UButton>
            <UButton icon="i-heroicons-pencil-square" size="sm" color="info" variant="ghost"
              @click="showEditModal(prize)">
              ویرایش
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create Prize Modal -->
    <UModal :open="showCreateModal" :close="{ onClick: () => { showCreateModal = false } }" class="rtl"
      title="افزودن جایزه جدید" :ui="{ header: 'rtl', footer: 'justify-end' }">
      <template #body>

        <UForm :schema="prizeSchema" :state="newPrize" @submit="createPrize" class="flex flex-col gap-2">
          <UFormField label="کلید جایزه" name="key" required>
            <UInput class="w-full" v-model="newPrize.key" placeholder="مثال: gold_coin" />
          </UFormField>

          <UFormField label="نام جایزه" name="name" required>
            <UInput class="w-full" v-model="newPrize.name" placeholder="مثال: سکه طلا" />
          </UFormField>

          <UFormField label="برچسب نمایشی" name="label" required>
            <UInput class="w-full" v-model="newPrize.label" placeholder="مثال: 100 سکه طلا" />
          </UFormField>

          <div class="flex gap-1 w-full">
            <UFormField class="w-full" label="نوع جایزه" name="type" required>
              <USelect class="w-full" v-model="newPrize.type" :items="prizeTypeOptions" />
            </UFormField>

            <UFormField class="w-full" label="تعداد موجودی" name="inventoryCount" required>
              <UInput class="w-full" v-model.number="newPrize.inventoryCount" type="number" min="0" />
            </UFormField>
          </div>

          <div class="flex gap-1 w-full">
            <UFormField class="w-full" label="درصد احتمال" name="probability" required>
              <UInput class="w-full" v-model.number="newPrize.probability" type="number" min="0" max="100" />
            </UFormField>

            <UFormField class="w-full" label="حد مجاز دریافت" name="available" required>
              <UInput class="w-full" v-model.number="newPrize.available" type="number" min="1" />
            </UFormField>
          </div>

          <div class="flex gap-3 pt-4">
            <UButton type="submit" color="primary">
              ایجاد جایزه
            </UButton>
            <UButton color="gray" variant="ghost" @click="showCreateModal = false">
              انصراف
            </UButton>
          </div>
        </UForm>

      </template>

    </UModal>

    <!-- Edit Prize Modal -->
    <UModal :open="editModal" :close="{ onClick: () => { editModal = false } }" class="rtl"
      title="ویرایش جایزه" :ui="{ header: 'rtl', footer: 'justify-end' }">
      <template #body>

        <UForm :schema="prizeSchema" :state="selectedPrize" @submit="editPrize" class="flex flex-col gap-2">
          <UFormField label="کلید جایزه" name="key" required>
            <UInput class="w-full" v-model="selectedPrize.key" placeholder="مثال: gold_coin" />
          </UFormField>

          <UFormField label="نام جایزه" name="name" required>
            <UInput class="w-full" v-model="selectedPrize.name" placeholder="مثال: سکه طلا" />
          </UFormField>

          <UFormField label="برچسب نمایشی" name="label" required>
            <UInput class="w-full" v-model="selectedPrize.label" placeholder="مثال: 100 سکه طلا" />
          </UFormField>

          <div class="flex gap-1 w-full">
            <UFormField class="w-full" label="نوع جایزه" name="type" required>
              <USelect class="w-full" v-model="selectedPrize.type" :items="prizeTypeOptions" />
            </UFormField>

            <UFormField class="w-full" label="تعداد موجودی" name="inventoryCount" required>
              <UInput class="w-full" v-model.number="selectedPrize.Inventory.count" type="number" min="0" />
            </UFormField>
          </div>

          <div class="flex gap-1 w-full">
            <UFormField class="w-full" label="درصد احتمال" name="probability" required>
              <UInput class="w-full" v-model.number="selectedPrize.probability" type="number" min="0" max="100" />
            </UFormField>

            <UFormField class="w-full" label="حد مجاز دریافت" name="available" required>
              <UInput class="w-full" v-model.number="selectedPrize.available" type="number" min="1" />
            </UFormField>
          </div>

          <div class="flex gap-3 pt-4">
            <UButton type="submit" color="primary">
              ویرایش 
            </UButton>
            <UButton color="gray" variant="ghost" @click="editModal = false">
              انصراف
            </UButton>
          </div>
        </UForm>

      </template>

    </UModal>

    <!-- Increase Inventory Modal -->
    <UModal :open="showInventoryModal"
      :close="{ onClick: () => { showInventoryModal = false; inventoryHistory = false } }" class="rtl"
      title="افزایش موجودی جایزه" :ui="{ header: 'rtl', footer: 'justify-end' }">
      <template #body>
        <div v-if="!inventoryHistory" class="flex justify-between">
          <div class="space-y-4">
            <p class="text-gray-600">
              جایزه: <strong>{{ selectedPrize?.name }}</strong>
            </p>
            <p class="text-gray-600">
              موجودی فعلی: <strong>{{ selectedPrize?.Inventory.count }}</strong>
            </p>

            <UFormField label="مقدار افزایش" name="amount">
              <UInput v-model.number="inventoryAmount" type="number" min="1" placeholder="تعداد افزایش موجودی" />
            </UFormField>

            <div class="flex gap-3 pt-4">
              <UButton color="primary" @click="increaseInventory" :disabled="!inventoryAmount || inventoryAmount < 1">
                افزایش موجودی
              </UButton>
              <UButton color="gray" variant="ghost" @click="{showInventoryModal = false; inventoryHistory= false}">
                انصراف
              </UButton>
            </div>
          </div>
          <div>
            <UButton @click="inventoryHistory = true" color="warning" variant="subtle" icon="i-lucide-history">تاریخچه
            </UButton>
          </div>
        </div>
        <div v-else>
          <div v-for="value in selectedPrize.Inventory.updates">
            <div class="flex gap-1">
              <div>از {{ value.from }}</div>
              <div>به {{ value.to }}</div>
              <div>در تاریخ {{ value.date }}</div>
            </div>
          </div>
          <div class="mt-4">
            <UButton color="neutral" variant="solid" @click="inventoryHistory = false">
              بازگشت
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup>
import { z } from 'zod'

const props = defineProps({
  prizes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['create', 'update', 'delete', 'increase-inventory'])

// Modal states
const showCreateModal = ref(false)
const showInventoryModal = ref(false)
const editModal = ref(false)
const selectedPrize = ref(null)
const inventoryAmount = ref(1)
const inventoryHistory = ref(false)

// Form data
const newPrize = ref({
  key: '',
  name: '',
  label: '',
  type: 'physical',
  inventoryCount: 1,
  probability: 10,
  available: 1
})

// Form schema
const prizeSchema = z.object({
  key: z.string().min(1, 'کلید جایزه الزامی است'),
  name: z.string().min(1, 'نام جایزه الزامی است'),
  label: z.string().min(1, 'برچسب الزامی است'),
  type: z.string().min(1, 'نوع جایزه الزامی است'),
  inventoryCount: z.number().min(1, 'موجودی باید حداقل 1 باشد'),
  probability: z.number().min(0).max(100, 'احتمال باید بین 0 تا 100 باشد'),
  available: z.number().min(1, 'حد مجاز باید حداقل 1 باشد')
})

const prizeTypeOptions = ref([
  { value: 'lottery', label: 'قرعه کشی' },
  { value: 'discount', label: 'تخفیف' },
  { value: 'empty', label: 'پوچ' }
])

// Helper functions
function getPrizeIcon(type) {
  const icons = {
    physical: '🎁',
    digital: '💎',
    discount: '🎟️',
    empty: '😔'
  }
  return icons[type] || '🎁'
}
function editPrize() {

}
function getPrizeTypeLabel(type) {
  const labels = {
    physical: 'فیزیکی',
    digital: 'دیجیتال',
    discount: 'تخفیف',
    empty: 'پوچ'
  }
  return labels[type] || type
}

function getProgressColor(ratio) {
  if (ratio < 0.5) return 'green'
  if (ratio < 0.8) return 'yellow'
  return 'red'
}

function showIncreaseInventoryModal(prize) {
  selectedPrize.value = prize
  inventoryAmount.value = 1
  showInventoryModal.value = true
}

function showEditModal(prize) {
   selectedPrize.value = prize
   editModal.value = true
}

// Event handlers
async function createPrize() {
  emit('create', newPrize.value)
  showCreateModal.value = false

  // Reset form
  newPrize.value = {
    key: '',
    name: '',
    label: '',
    type: 'physical',
    inventoryCount: 1,
    probability: 10,
    available: 1
  }
}

async function increaseInventory() {
  if (selectedPrize.value && inventoryAmount.value > 0) {
    emit('increase-inventory', selectedPrize.value._id, inventoryAmount.value)
    showInventoryModal.value = false
  }
}
</script>
