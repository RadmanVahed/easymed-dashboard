<template>
    <UCard>
        <template #header>
            <div class="flex rtl justify-between items-center">
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست ورود های امروز</h1>
                </div>
                <!-- <UButton icon="i-lucide-refresh-cw" variant="outline" @click="loadRequests(filters.skip)"
                    :loading="loading">
                    بروزرسانی
                </UButton> -->
            </div>
        </template>

        <template #default>
            <!-- Table Section -->
            <div class="rtl">
                <UTable :data="data" :loading="loading" :columns="columns" class="flex-1 rtl" />
            </div>

            <!-- Pagination Section -->
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
type userType = {
    id: string
    username: string
    firstName: string
    lastName: string
    createdAt: string
}
const UBadge = resolveComponent('UBadge')

const API_BASE = 'https://easymed-doctor-app.radmanvahed.workers.dev'

const data = ref<userType[]>([])
const loading = ref(false)

const fetchData = async () => {
    loading.value = true
    const response = await fetch(`${API_BASE}/daily-logins-list`, {
        method: 'GET',
    });

    const result = await response.json();
    loading.value = false
    console.log(result);
    data.value = result.data

}
onMounted(() => {
    fetchData()
})
const columns: TableColumn<userType>[] = [
    {
        accessorKey: 'userInfo.firstName',
        header: 'نام'
    },
    {
        accessorKey: 'userInfo.lastName',
        header: 'نام خانوادگی'
    },
    {
        accessorKey: 'userInfo.username',
        header: 'نام کاربری'
    },
    {
        accessorKey: 'userInfo.createdAt',
        header: 'تاریخ ثبت ورود',
    },
]
</script>