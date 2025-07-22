<template>
    <UCard>
        <template #header>
            <div class="flex rtl justify-between items-center">
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست گزارش کلیک ها</h1>
                </div>
                <div class="flex gap-2">
                    <UButton v-if="showList" icon="i-lucide-refresh-cw" variant="outline" @click="fetchData()"
                        :loading="loading">
                        بروزرسانی
                    </UButton>
                    <UButton @click="showList = !showList">
                        {{ showList ? 'مخفی کردن' : 'نمایش لیست' }}
                    </UButton>
                </div>
            </div>
        </template>

        <template #default>

            <div v-if="Object.keys(clickData).length > 0 && !loading" class="grid grid-cols-4 rtl gap-4 mb-6">
                <UCard v-for="(value, key) in clickData" :key="key">
                    <template #header>
                        <h4 class="font-bold">{{ key }}</h4>
                    </template>
                    <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div class="text-center w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div class="text-2xl font-bold text-blue-600">{{ value.uniqueUsers }}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">تعداد کاربران</div>
                        </div>
                        <div class="text-center w-full p-3 bg-gray-50 dark:bg-green-900/20 rounded-lg">
                            <div class="text-2xl font-bold  text-green-600">{{ value.totalClicks }}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">کل کلیک ها</div>
                        </div>
                    </div>

                </UCard>
            </div>
            <div v-else class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <USkeleton v-for="item in [1, 2, 3, 4]" class="h-[181px]" />
            </div>

            <div v-if="showList" class="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h3 class="text-lg font-semibold mb-4 rtl">فیلترها</h3>

                <div class="grid rtl grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <UInput placeholder="جستجو با نام یا نام کاربری" icon="i-lucide-search" />
                    <USelect v-model="selectedKey" :items="selectOptions" placeholder="انتخاب نوع کلیک" />

                    <!--
                    <USelect :default-value="statusOptions[0]" v-model="filters.status" :items="statusOptions"
                        placeholder="وضعیت" />

                    <USelect v-model="filters.sort" :items="sortOptions" placeholder="مرتب‌سازی بر اساس" />

                    <USelect v-model="filters.order" :items="orderOptions" placeholder="ترتیب" /> -->
                </div>

                <div class="flex gap-2">
                    <UButton icon="i-lucide-filter" :loading="loading">
                        اعمال فیلتر
                    </UButton>

                    <UButton variant="outline" icon="i-lucide-x">
                        پاک کردن فیلتر
                    </UButton>
                </div>
            </div>


            <div v-if="showList" class="rtl">
                <UTable :data="processedData" :loading="loading" :columns="columns" class="flex-1 rtl" />
            </div>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type userType = {
    firstName: string
    lastName: string
    username: string
    buttonClicks: Record<string, number>
    totalClicks: number
    lastUpdated: string
    createdAt: string
}

type ProcessedUserType = {
    firstName: string
    lastName: string
    username: string
    buttonClicksDisplay: string
    totalClicks: number
    lastUpdatedDisplay: string
}

type ClickDataType = {
    [key: string]: {
        totalClicks: number
        uniqueUsers: number
    }
}


const API_BASE = 'https://easymed-doctor-app.radmanvahed.workers.dev'

const data = ref<userType[]>([])
const clickData = ref<ClickDataType>({})
const loading = ref(false)
const showList = ref(false)
const clicks = ref({
    totalClicks: 0,
    totalUsers: 0
})




// Process data for display
const processedData = computed<ProcessedUserType[]>(() => {
    return data.value.map(user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        buttonClicksDisplay: Object.entries(user.buttonClicks)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | '),
        totalClicks: user.totalClicks,
        lastUpdatedDisplay: new Date(user.lastUpdated).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }))
})

const fetchData = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/button-analytics-report`, {
            method: 'GET',
        });
        const result = await response.json();
        data.value = result.detailedReport
        console.log('response', result);
        clickData.value = result.summary.buttonSummary

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()

})
const selectedKey = ref<string>('')

// تبدیل keys به format مناسب برای USelect
const selectOptions = computed(() => {
    return Object.keys(clickData.value).map(key => ({
        label: key,
        value: key
    }))
})

// دریافت data مربوط به key انتخاب شده
const selectedData = computed(() => {
    return selectedKey.value ? clickData.value[selectedKey.value] : null
})

const columns: TableColumn<ProcessedUserType>[] = [
    {
        accessorKey: 'firstName',
        header: 'نام'
    },
    {
        accessorKey: 'lastName',
        header: 'نام خانوادگی'
    },
    {
        accessorKey: 'username',
        header: 'نام کاربری'
    },
    {
        accessorKey: 'buttonClicksDisplay',
        header: 'کلیک‌ها'
    },
    {
        accessorKey: 'totalClicks',
        header: 'کل کلیک‌ها'
    },
    {
        accessorKey: 'lastUpdatedDisplay',
        header: 'آخرین به‌روزرسانی'
    }
]

onMounted(async () => {
    await fetchData()
    await nextTick()
})
</script>
