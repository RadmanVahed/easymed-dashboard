<template>
    <UCard>
        <template #header>
            <div class="flex rtl justify-between items-center">
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست ثبت نام پزشکان</h1>
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
    birthDate: string
    status: string
    firstName: string
    lastName: string
    medicalSystemNumber: string
    nationalId: string
    phoneNumber: string
    registrationDate: string
}
const UBadge = resolveComponent('UBadge')

const API_BASE = 'https://intelligent-colden-d2cajkshs.liara.run/api/auth'

const data = ref<userType[]>([])
const loading = ref(false)

const fetchData = async () => {
    loading.value = true
    const response:any = await $fetch(`${API_BASE}/registers`, {
        method: 'POST',
        body:{
            page:1,
            limit:10,
            filters:{}
        }
    });

    const result = response;
    loading.value = false
    console.log(result);
    data.value = result.data.registers

}
onMounted(() => {
    fetchData()
})
const columns: TableColumn<userType>[] = [
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
        accessorKey: 'medicalNumber',
        header: 'نظام پزشکی'
    },
    {
        accessorKey: 'birthDate',
        header: 'تاریخ تولد',
    },
    {
        accessorKey: 'createdAt',
        header: 'تاریخ ثبت'
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const color = {
                'انجام شده': 'success' as const,
                'رد شده': 'error' as const,
                'ثبت شده': 'info' as const
            }[row.getValue('status') as string]

            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
                row.getValue('status')
            )
        }
    },
]
</script>