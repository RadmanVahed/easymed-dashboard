<template>
  <div class="space-y-6">
    <!-- Header with Search -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        مدیریت پزشکان
      </h2>
      <div class="flex gap-3 w-full md:w-auto">
        <UInput 
          v-model="searchTerm"
          icon="i-heroicons-magnifying-glass"
          placeholder="جستجو با نام، کد ملی یا کد نظام پزشکی..."
          class="flex-1 md:w-80"
        />
        <UButton 
          icon="i-heroicons-plus-circle"
          color="green"
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
          <h3 class="text-lg font-semibold">لیست پزشکان ({{ filteredDoctors.length }})</h3>
          <UBadge color="blue" variant="subtle">
            کل شانس‌های باقیمانده: {{ totalRemainingChances }}
          </UBadge>
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                اطلاعات پزشک
              </th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                شانس‌های باقیمانده
              </th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                تعداد جوایز
              </th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                آخرین فعالیت
              </th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="doctor in filteredDoctors" 
              :key="doctor._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <!-- Doctor Info -->
              <td class="px-4 py-4">
                <div class="flex items-center space-x-3 space-x-reverse">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <UIcon name="i-heroicons-user" class="text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ doctor.firstName }} {{ doctor.lastName }}
                    </div>
                    <div class="text-sm text-gray-500 space-y-1">
                      <div>کد ملی: {{ doctor.nationalCode }}</div>
                      <div>کد نظام: {{ doctor.medicalNumber }}</div>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Remaining Chances -->
              <td class="px-4 py-4 text-center">
                <UBadge 
                  :color="getChancesColor(doctor.prizes.chances)"
                  variant="subtle"
                  size="lg"
                >
                  {{ doctor.prizes.chances }}
                </UBadge>
              </td>

              <!-- Prize Count -->
              <td class="px-4 py-4 text-center">
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ doctor.prizes.histories?.length || 0 }}
                  </div>
                  <div class="text-xs text-gray-500">جایزه کسب شده</div>
                </div>
              </td>

              <!-- Last Activity -->
              <td class="px-4 py-4 text-center">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getLastActivity(doctor) }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-4 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <UButton
                    icon="i-heroicons-plus-circle"
                    size="sm"
                    color="green"
                    variant="ghost"
                    @click="showIncreaseModal(doctor)"
                  >
                    افزایش شانس
                  </UButton>
                  <UButton
                    icon="i-heroicons-eye"
                    size="sm"
                    color="blue"
                    variant="ghost"
                    @click="showDoctorDetails(doctor)"
                  >
                    جزئیات
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div 
          v-if="filteredDoctors.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <UIcon name="i-heroicons-user-group" class="text-4xl mb-2" />
          <p>پزشکی با این شرایط یافت نشد</p>
        </div>
      </div>
    </UCard>

    <!-- Increase Chances Modal -->
    <UModal v-model="showIncreaseChancesModal">
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
          
          <UFormGroup label="مقدار افزایش" name="amount">
            <UInput 
              v-model.number="increaseAmount" 
              type="number"
              min="1"
              placeholder="تعداد شانس برای افزودن"
            />
          </UFormGroup>

          <div class="flex gap-3 pt-4">
            <UButton 
              color="primary"
              @click="increaseChances"
              :disabled="!increaseAmount || increaseAmount < 1"
            >
              افزایش شانس
            </UButton>
            <UButton 
              color="gray" 
              variant="ghost"
              @click="showIncreaseChancesModal = false"
            >
              انصراف
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Bulk Increase Modal -->
    <UModal v-model="showBulkIncreaseModal">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">افزایش گروهی شانس</h3>
        </template>
        
        <div class="space-y-4">
          <UFormGroup label="انتخاب پزشکان" name="selectedDoctors">
            <USelectMenu
              v-model="bulkSelectedDoctors"
              :options="doctorOptions"
              multiple
              placeholder="انتخاب پزشکان..."
              by="value"
              searchable
            />
          </UFormGroup>
          
          <UFormGroup label="مقدار افزایش برای هر پزشک" name="bulkAmount">
            <UInput 
              v-model.number="bulkIncreaseAmount" 
              type="number"
              min="1"
              placeholder="تعداد شانس برای افزودن"
            />
          </UFormGroup>

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
              color="gray" 
              variant="ghost"
              @click="showBulkIncreaseModal = false"
            >
              انصراف
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Doctor Details Modal -->
    <UModal v-model="showDetailsModal" :ui="{ width: 'max-w-4xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">جزئیات پزشک</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
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
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps({
  doctors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['increase-chances'])

// Reactive data
const searchTerm = ref('')
const showIncreaseChancesModal = ref(false)
const showBulkIncreaseModal = ref(false)
const showDetailsModal = ref(false)
const selectedDoctor = ref(null)
const increaseAmount = ref(1)
const bulkSelectedDoctors = ref([])
const bulkIncreaseAmount = ref(1)

// Computed
const filteredDoctors = computed(() => {
  if (!searchTerm.value) return props.doctors
  
  const term = searchTerm.value.toLowerCase()
  return props.doctors.filter(doctor => 
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(term) ||
    doctor.nationalCode.includes(term) ||
    doctor.medicalNumber.includes(term)
  )
})

const totalRemainingChances = computed(() => {
  return filteredDoctors.value.reduce((sum, doctor) => sum + (doctor.prizes.chances || 0), 0)
})

const doctorOptions = computed(() => {
  return props.doctors.map(doctor => ({
    label: `${doctor.firstName} ${doctor.lastName} (${doctor.nationalCode})`,
    value: doctor.nationalCode
  }))
})

// Helper functions
function getChancesColor(chances) {
  if (chances === 0) return 'red'
  if (chances <= 2) return 'yellow'
  return 'green'
}

function getLastActivity(doctor) {
  if (!doctor.prizes.histories?.length) return 'بدون فعالیت'
  
  const lastActivity = doctor.prizes.histories[doctor.prizes.histories.length - 1]
  return formatDate(lastActivity.requestDate)
}

function getLastPrizeDate(doctor) {
  if (!doctor.prizes.histories?.length) return 'ندارد'
  
  const lastPrize = doctor.prizes.histories[doctor.prizes.histories.length - 1]
  return formatDate(lastPrize.requestDate)
}

function formatDate(dateString) {
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
function showIncreaseModal(doctor) {
  selectedDoctor.value = doctor
  increaseAmount.value = 1
  showIncreaseChancesModal.value = true
}

function showDoctorDetails(doctor) {
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
