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
     <UModal :open="openModal.open" :close="{ onClick: () => { openModal.open = false } }" class="rtl"
        :title="openModal.title" :ui="{ header: 'rtl', footer: 'justify-end' }">
        <template #body>
            <div v-if="openModal.key == 'change-status'">
                <UFormField label="وضعیت جدید را انتخاب کنید">
                    <USelect class="w-full" v-model="selectedStatus" :items="statusOptionsChange"></USelect>
                    <UButton :loading="loading" class="my-2" block
                        @click="changeStatus(openModal.data ? openModal.data._id : '', selectedStatus)">ذخیره
                    </UButton>
                </UFormField>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
type userType = {
    _id: string
    birthDate: string
    status: string
    firstName: string
    lastName: string
    fullname: string
    medicalNumber: string
    nationalCode: string
    phone: string
    createdAt: string,
    referralCode: string
}
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')

const API_BASE = 'https://intelligent-colden-d2cajkshs.liara.run/api/auth'

const data = ref<userType[]>([])
const loading = ref(false)
const toast = useToast()
const openModal = ref({
    open: false,
    title: '',
    key: '',
    data: {} as userType | null
})
const statusOptionsChange = ref([
    { label: 'ثبت شده', value: 'pending' },
    { label: 'انجام شده', value: 'done' },
    { label: 'لغو شده', value: 'reject' }
])
const selectedStatus = ref<any>(null)
const selectedId = ref<any>(null)
const fetchData = async () => {
    loading.value = true
    const response: any = await $fetch(`${API_BASE}/registers`, {
        method: 'POST',
        body: {
            page: 1,
            limit: 10,
            filters: {}
        }
    });

    const result = response;
    loading.value = false
    console.log(result);
    data.value = result.data.registers

}
const changeStatus = async (id:string, status:string) => {
    loading.value = true
    const response: any = await $fetch(`${API_BASE}/register/${id}/${status}`, {
        method: 'PUT'
    });
    loading.value = false
    if (response.statusCode == 200) {
        toast.add({
            color:'success',
            title:response.message
        })
    }
    fetchData()
    openModal.value.open = false


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
        accessorKey: 'referralCode',
        header: 'کد معرفی',
        cell: ({ row }) => {
            return row.original.referralCode && row.original.referralCode != '' ? row.original.referralCode : 'ندارد'
        }
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
        header: 'وضعیت',
        cell: ({ row }) => {
            const color = {
                'done': 'success' as const,
                'reject': 'error' as const,
                'pending': 'warning' as const
            }[row.getValue('status') as string]
            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
                row.getValue('status') == 'done' ? 'انجام شده' : row.getValue('status') == 'pending' ? 'ثبت شده' : 'رد شده'
            )
        }
    },
    {
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => {
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
]
function getRowItems(row: Row<userType>) {
    const request = row.original
    return [
        {
            label: 'تغییر وضعیت',
            onSelect() {
                selectedId.value = request._id
                openModal.value = {
                    open: true,
                    title: 'تغییر وضعیت درخواست',
                    key: 'change-status',
                    data: request
                }
            }
        }
    ]
}
</script>