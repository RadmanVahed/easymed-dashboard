<template>
  <div class="space-y-6">
    <!-- Header with Search -->
    <div class="flex rtl flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div class="flex gap-3 w-full md:w-auto">
        <UInput 
          v-model="searchTerm"
          icon="i-heroicons-magnifying-glass"
          placeholder="جستجو با نام، کد ملی یا کد نظام پزشکی..."
          class="flex-1 md:w-80"
        />
        <UButton 
          icon="i-heroicons-plus-circle"
          color="success"
          @click="showBulkIncreaseModal = true"
        >
          افزایش گروهی
        </UButton>
      </div>
    </div>

    <!-- Doctors Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">لیست برندگان ({{ filteredDoctors.length }})</h3>
          <UBadge color="info" variant="subtle">
            کل شانس‌های باقیمانده: {{ totalRemainingChances }}
          </UBadge>
        </div>
      </template>

      <div class="overflow-x-auto">
        <UTable dir="rtl" :data="props.winners" :columns="columns" class="flex-1" />
        <!-- Empty State -->
        <div 
          v-if="filteredDoctors.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <UIcon name="i-heroicons-user-group" class="text-4xl mb-2" />
          <p>برنده یافت نشد</p>
        </div>
      </div>
    </UCard>

    <!-- Increase Chances Modal -->
    <UModal v-model="showIncreaseChancesModal">
      <template #body>
         <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">افزایش شانس چرخش</h3>
        </template>
        
        <div class="space-y-4">
          <div v-if="selectedDoctor" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p class="font-medium">{{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              کد ملی: {{ selectedDoctor.nationalCode }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              شانس فعلی: <strong>{{ selectedDoctor.prizes.chances }}</strong>
            </p>
          </div>
          
          <UFormField label="مقدار افزایش" name="amount">
            <UInput 
              v-model.number="increaseAmount" 
              type="number"
              min="1"
              placeholder="تعداد شانس برای افزودن"
            />
          </UFormField>

          <div class="flex gap-3 pt-4">
            <UButton 
              color="primary"
              @click="increaseChances"
              :disabled="!increaseAmount || increaseAmount < 1"
            >
              افزایش شانس
            </UButton>
            <UButton 
              color="neutral" 
              variant="ghost"
              @click="showIncreaseChancesModal = false"
            >
              انصراف
            </UButton>
          </div>
        </div>
      </UCard>
      </template>
    </UModal>

    <!-- Bulk Increase Modal -->
    <UModal v-model="showBulkIncreaseModal">
      <template #body>
        <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">افزایش گروهی شانس</h3>
        </template>
        
        <div class="space-y-4">
          <UFormField label="انتخاب پزشکان" name="selectedDoctors">
            <USelectMenu
              v-model="bulkSelectedDoctors"
              :options="doctorOptions"
              multiple
              placeholder="انتخاب پزشکان..."
              by="value"
              searchable
            />
          </UFormField>
          
          <UFormField label="مقدار افزایش برای هر پزشک" name="bulkAmount">
            <UInput 
              v-model.number="bulkIncreaseAmount" 
              type="number"
              min="1"
              placeholder="تعداد شانس برای افزودن"
            />
          </UFormField>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p class="text-sm">
              <strong>خلاصه:</strong> 
              {{ bulkSelectedDoctors.length }} پزشک انتخاب شده، 
              هر کدام {{ bulkIncreaseAmount || 0 }} شانس دریافت خواهند کرد.
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <UButton 
              color="primary"
              @click="bulkIncreaseChances"
              :disabled="bulkSelectedDoctors.length === 0 || !bulkIncreaseAmount || bulkIncreaseAmount < 1"
            >
              افزایش گروهی
            </UButton>
            <UButton 
              color="neutral" 
              variant="ghost"
              @click="showBulkIncreaseModal = false"
            >
              انصراف
            </UButton>
          </div>
        </div>
      </UCard>
      </template>
    </UModal>

    <!-- Doctor Details Modal -->
    <UModal v-model="showDetailsModal" >
      <template #body>
        <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">جزئیات پزشک</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="showDetailsModal = false"
            />
          </div>
        </template>
        
        <div v-if="selectedDoctor" class="space-y-6">
          <!-- Doctor Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-lg font-medium mb-3">اطلاعات پایه</h4>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">نام:</span> {{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}</div>
                <div><span class="font-medium">کد ملی:</span> {{ selectedDoctor.nationalCode }}</div>
                <div><span class="font-medium">کد نظام پزشکی:</span> {{ selectedDoctor.medicalNumber }}</div>
                <div><span class="font-medium">شانس باقیمانده:</span> {{ selectedDoctor.prizes.chances }}</div>
              </div>
            </div>
            <div>
              <h4 class="text-lg font-medium mb-3">آمار جوایز</h4>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">کل جوایز:</span> {{ selectedDoctor.prizes.histories?.length || 0 }}</div>
                <div><span class="font-medium">آخرین جایزه:</span> {{ getLastPrizeDate(selectedDoctor) }}</div>
              </div>
            </div>
          </div>

          <!-- Prize History -->
          <div>
            <h4 class="text-lg font-medium mb-3">تاریخچه جوایز</h4>
            <div class="max-h-60 overflow-y-auto">
              <div 
                v-for="(history, index) in selectedDoctor.prizes.histories" 
                :key="index"
                class="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-b-0"
              >
                <div class="flex items-center space-x-3 space-x-reverse">
                  <span class="text-lg">🎁</span>
                  <div>
                    <div class="font-medium">جایزه {{ index + 1 }}</div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(history.requestDate) }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!selectedDoctor.prizes.histories?.length" class="text-center py-4 text-gray-500">
                هیچ جایزه‌ای دریافت نشده
              </div>
            </div>
          </div>
        </div>
      </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import moment from 'jalali-moment'
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')

const props = defineProps({
  winners: {
    type: Array as PropType<WinnerType[]>,
    default: () => []
  }
})

type WinnerType = {
  _id: string
  prizeId: string
  fullName: string
  nationalCode: string
  phone: string
  prizeName: string
  requestDate: string
  receiveDate?: string
  status?: string
}

// تعریف دقیق‌تر نوع ستون‌ها
const columns = [
  {
    accessorKey: 'fullName',
    header: 'نام و نام خانوادگی'
  },
  {
    accessorKey: 'nationalCode',
    header: 'کد ملی'
  },
  {
    accessorKey: 'phone',
    header: 'شماره تماس'
  },
  {
    accessorKey: 'prizeName',
    header: 'جایزه',
  },
  {
    accessorKey: 'status',
    header: 'وضعیت',
    cell: ({ row }: { row: Row<WinnerType> }) => {
      const status = row.original.receiveDate ? 'success' : 'warning'
      return h(UBadge, {
        class: 'capitalize',
        variant: 'subtle',
        color:status
      }, () => status === 'success' ? 'انجام شده' : 'در انتظار')
    }
  },
  {
    accessorKey: 'requestDate',
    header: 'تاریخ ثبت',
    cell: ({ row }: { row: Row<WinnerType> }) => 
      h('div', { class: 'text-sm' }, moment(row.original.requestDate).locale('fa').format('YYYY/MM/DD HH:mm'))
  },
  {
    accessorKey: 'receiveDate',
    header: 'تاریخ دریافت',
    cell: ({ row }: { row: Row<WinnerType> }) => 
      h('div', { class: 'text-sm' }, row.original.receiveDate ? moment(row.original.receiveDate).locale('fa').format('YYYY/MM/DD HH:mm') : '-')
  },
  {
    id: 'actions',
    header: 'عملیات',
    cell: ({ row }: { row: Row<WinnerType> }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown'
            })
        )
      )
    }
  }
] as const satisfies TableColumn<WinnerType>[]

// سایر قسمت‌های کد بدون تغییر
const emit = defineEmits(['increase-chances'])

// Reactive data
const searchTerm = ref('')
const showIncreaseChancesModal = ref(false)
const showBulkIncreaseModal = ref(false)
const showDetailsModal = ref(false)
const selectedDoctor: any = ref(null)
const increaseAmount = ref(1)
const bulkSelectedDoctors = ref([])
const bulkIncreaseAmount = ref(1)

// Computed
const filteredDoctors = computed(() => {
  if (!searchTerm.value) return props.winners
  
  const term = searchTerm.value.toLowerCase()
  return props.winners.filter((doctor: any) => 
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(term) ||
    doctor.nationalCode.includes(term) ||
    doctor.medicalNumber.includes(term)
  )
})

function getRowItems(row: Row<WinnerType>) {
  const request = row.original
  return [
    {
      label: 'تغییر وضعیت',
      onSelect() {
        // عملیات تغییر وضعیت
      }
    }
  ]
}

const totalRemainingChances = computed(() => {
  return filteredDoctors.value.reduce((sum, doctor: any) => sum + (doctor.prizes?.chances || 0), 0)
})

const doctorOptions = computed(() => {
  return props.winners.map((doctor: any) => ({
    label: `${doctor.firstName} ${doctor.lastName} (${doctor.nationalCode})`,
    value: doctor.nationalCode
  }))
})

// Helper functions
function getChancesColor(chances: any) {
  if (chances === 0) return 'error'
  if (chances <= 2) return 'warning'
  return 'success'
}
onMounted(() => {
  console.log(props.winners);
  
})
function getLastActivity(doctor: any) {
  if (!doctor.prizes?.histories?.length) return 'بدون فعالیت'
  
  const lastActivity = doctor.prizes.histories[doctor.prizes.histories.length - 1]
  return formatDate(lastActivity.requestDate)
}

function getLastPrizeDate(doctor: any) {
  if (!doctor.prizes?.histories?.length) return 'ندارد'
  
  const lastPrize = doctor.prizes.histories[doctor.prizes.histories.length - 1]
  return formatDate(lastPrize.requestDate)
}

function formatDate(dateString: any) {
  if (!dateString) return 'نامشخص'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Event handlers
function showIncreaseModal(doctor: any) {
  selectedDoctor.value = doctor
  increaseAmount.value = 1
  showIncreaseChancesModal.value = true
}

function showDoctorDetails(doctor: any) {
  selectedDoctor.value = doctor
  showDetailsModal.value = true
}

async function increaseChances() {
  if (selectedDoctor.value && increaseAmount.value > 0) {
    emit('increase-chances', selectedDoctor.value.nationalCode, increaseAmount.value)
    showIncreaseChancesModal.value = false
  }
}

async function bulkIncreaseChances() {
  if (bulkSelectedDoctors.value.length > 0 && bulkIncreaseAmount.value > 0) {
    // افزایش شانس برای همه پزشکان انتخاب شده
    for (const nationalCode of bulkSelectedDoctors.value) {
      emit('increase-chances', nationalCode, bulkIncreaseAmount.value)
    }
    
    showBulkIncreaseModal.value = false
    bulkSelectedDoctors.value = []
    bulkIncreaseAmount.value = 1
  }
}
</script>
