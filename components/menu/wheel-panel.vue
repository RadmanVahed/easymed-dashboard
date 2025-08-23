<template>
    <UContainer class="py-8">
      <UCard>
     <template #header>
       <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white py-2">
           مدیریت سیستم گردونه شانس
        </h1>
      </div>
     </template>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UCard class="hover:shadow-lg transition-all duration-300">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">کل جوایز</h3>
              <UIcon name="i-heroicons-gift" class="text-2xl text-purple-500" />
            </div>
          </template>
          <div class="text-3xl font-bold text-purple-600">{{ prizes.length }}</div>
          <p class="text-sm text-gray-500 mt-2">جایزه فعال</p>
        </UCard>

        <UCard class="hover:shadow-lg transition-all duration-300">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">گردونه‌های فعال</h3>
              <UIcon name="i-heroicons-cog-6-tooth" class="text-2xl text-green-500" />
            </div>
          </template>
          <div class="text-3xl font-bold text-green-600">{{ wheels.length }}</div>
          <p class="text-sm text-gray-500 mt-2">در حال اجرا</p>
        </UCard>

        <UCard class="hover:shadow-lg transition-all duration-300">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">برندگان</h3>
              <UIcon name="i-heroicons-user-group" class="text-2xl text-blue-500" />
            </div>
          </template>
          <div class="text-3xl font-bold text-blue-600">{{ stats.activeDoctors }}</div>
          <p class="text-sm text-gray-500 mt-2">در انتظار جایزه</p>
        </UCard>
      </div>

      <!-- Main Navigation Tabs -->
      <UTabs v-model="selectedTab" :items="tabs" class="w-full">
        <!-- Prizes Tab -->
        <template #prizes>
          <WheelPrizeTab 
            :prizes="prizes" 
            @create="handleCreatePrize"
            @update="handleUpdatePrize"
            @increase-inventory="handleIncreaseInventory"
          />
        </template>

        <!-- Wheels Tab -->
        <template #wheels>
          <WheelWheelsTab 
            :wheels="wheels"
            :prizes="prizes"
            @create="handleCreateWheel"
            @update="handleUpdateWheel"
          />
        </template>

        <!-- Doctors Tab -->
        <template #doctors>
          <WheelDoctorsTab 
            :winners="doctors"
            @increase-chances="handleIncreaseChances"
          />
        </template>
      </UTabs>
      </UCard>
    </UContainer>
</template>

<script setup>
const selectedTab = ref(0)

const tabs = [
  {
    key: 'prizes',
    label: 'مدیریت جوایز',
    icon: 'i-heroicons-gift',
    slot: 'prizes'
  },
  {
    key: 'wheels', 
    label: 'مدیریت گردونه‌ها',
    icon: 'i-heroicons-cog-6-tooth',
    slot: 'wheels'
  },
  {
    key: 'doctors',
    label: 'مدیریت برندگان', 
    icon: 'i-heroicons-user-group',
     slot: 'doctors'
  }
]

// Reactive data
const stats = ref({
  totalPrizes: 0,
  activeWheels: 0,
  activeDoctors: 0
})

const prizes = ref([])
const wheels = ref([])
const doctors = ref([])

// Load data on mount
onMounted(async () => {
  await Promise.all([
    loadPrizes(),
    loadWheels(),
    loadDoctors(),
    loadStats()
  ])
})

// API calls
async function loadPrizes() {
  try {
    const { data } = await $fetch('https://intelligent-colden-d2cajkshs.liara.run/api/wheel/prizes')
    prizes.value = data.prizes || []
    
  } catch (error) {
    console.error('Error loading prizes:', error)
  }
}

async function loadWheels() {
  try {
    const { data } = await $fetch('https://intelligent-colden-d2cajkshs.liara.run/api/wheel/wheels')
    wheels.value = data.wheels || []
  } catch (error) {
    console.error('Error loading wheels:', error)
  }
}

async function loadDoctors() {
  try {
    const { data } = await $fetch('https://intelligent-colden-d2cajkshs.liara.run/api/wheel/winners' , {
      method:'POST',
      body:{}
    })
    doctors.value = data.winners
     console.log(doctors.value);
  } catch (error) {
    console.error('Error loading doctors:', error)
  }
}

async function loadStats() {
  // محاسبه آمار از داده‌های موجود
  stats.value = {
    totalPrizes: prizes.value.length,
    activeWheels: wheels.value.filter(w => w.available).length,
    activeDoctors: doctors.value.length
  }
}

// Event handlers
async function handleCreatePrize(prizeData) {
  try {
    await $fetch('https://intelligent-colden-d2cajkshs.liara.run/api/wheel/prizes', {
      method: 'POST',
      body: prizeData
    })
    await loadPrizes()
    await loadStats()
  } catch (error) {
    console.error('Error creating prize:', error)
  }
}

async function handleUpdatePrize(prizeId, updateData) {
  try {
    await $fetch(`https://intelligent-colden-d2cajkshs.liara.run/api/wheel/prizes/${prizeId}`, {
      method: 'PATCH',
      body: updateData
    })
    await loadPrizes()
  } catch (error) {
    console.error('Error updating prize:', error)
  }
}

async function handleIncreaseInventory(prizeId, amount) {
  try {
    await $fetch(`https://intelligent-colden-d2cajkshs.liara.run/api/wheel/prizes/${prizeId}/increase-inventory`, {
      method: 'PATCH',
      body: { amount }
    })
    await loadPrizes()
  } catch (error) {
    console.error('Error increasing inventory:', error)
  }
}

async function handleCreateWheel(wheelData) {
  try {
    await $fetch('https://intelligent-colden-d2cajkshs.liara.run/api/wheel/wheels', {
      method: 'POST',
      body: wheelData
    })
    await loadWheels()
    await loadStats()
  } catch (error) {
    console.error('Error creating wheel:', error)
  }
}

async function handleUpdateWheel(wheelId, updateData) {
  try {
    await $fetch(`https://intelligent-colden-d2cajkshs.liara.run/api/wheel/wheels/${wheelId}`, {
      method: 'PATCH', 
      body: updateData
    })
    await loadWheels()
  } catch (error) {
    console.error('Error updating wheel:', error)
  }
}

async function handleIncreaseChances(nationalCode, amount) {
  try {
    await $fetch(`https://intelligent-colden-d2cajkshs.liara.run/api/wheel/doctors/${nationalCode}/increase-chances`, {
      method: 'PATCH',
      body: { amount }
    })
    await loadDoctors()
    await loadStats()
  } catch (error) {
    console.error('Error increasing chances:', error)
  }
}
</script>
