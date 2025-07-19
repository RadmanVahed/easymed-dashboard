<template>
    <UCard>
        <template #header>
            <div class="flex rtl justify-between items-center">
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست درخواست‌های درمانی</h1>
                </div>
                <UButton icon="i-lucide-refresh-cw" variant="outline" @click="loadRequests(filters.skip)"
                    :loading="loading">
                    بروزرسانی
                </UButton>
            </div>
        </template>

        <template #default>
            <!-- Filters Section -->
            <div class="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h3 class="text-lg font-semibold mb-4 rtl">فیلترها</h3>

                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <UInput v-model="filters.search" placeholder="جستجو در نام، شناسه، تلفن..."
                        icon="i-lucide-search" />

                    <USelect :default-value="statusOptions[0]" v-model="filters.status" :items="statusOptions"
                        placeholder="وضعیت" />

                    <USelect v-model="filters.sort" :items="sortOptions" placeholder="مرتب‌سازی بر اساس" />

                    <USelect v-model="filters.order" :items="orderOptions" placeholder="ترتیب" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <UInput v-model="filters.dateFrom" type="date" placeholder="از تاریخ" label="از تاریخ" />

                    <UInput v-model="filters.dateTo" type="date" placeholder="تا تاریخ" label="تا تاریخ" />

                    <USelect v-model="filters.take" :items="pageSizeOptions" placeholder="تعداد نمایش" />
                </div>

                <div class="flex gap-2">
                    <UButton @click="applyFilters" icon="i-lucide-filter" :loading="loading">
                        اعمال فیلتر
                    </UButton>

                    <UButton @click="clearFilters" variant="outline" icon="i-lucide-x">
                        پاک کردن فیلتر
                    </UButton>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ stats.global.total }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">کل درخواست‌ها</div>
                </div>

                <div class="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">{{ stats.filtered.pending }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">در انتظار</div>
                </div>

                <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ stats.filtered.accepted }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">تایید شده</div>
                </div>

                <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ stats.filtered.done }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">انجام شده</div>
                </div>

                <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div class="text-2xl font-bold text-red-600">{{ stats.filtered.canceled }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">لغو شده</div>
                </div>
            </div>

            <!-- Table Section -->
            <div class="rtl">
                <UTable dir="rtl" :data="data" :columns="columns" :loading="loading" class="flex-1" />
            </div>

            <!-- Pagination Section -->
            <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm text-gray-600 dark:text-gray-400 rtl">
                    نمایش {{ filters.skip + 1 }} تا {{ Math.min(filters.skip + filters.take, pagination.total) }} از {{
                        pagination.total }} درخواست
                </div>

                <div class="flex rtl gap-2">
                    <UButton @click="prevPage" :disabled="filters.skip === 0" variant="outline"
                        icon="i-lucide-chevron-right">
                    </UButton>

                    <div class="flex items-center px-3 py-2 text-sm">
                        صفحه {{ pagination.currentPage }} از {{ pagination.totalPages }}
                    </div>

                    <UButton @click="nextPage" :disabled="!pagination.hasMore" variant="outline"
                        icon="i-lucide-chevron-left">
                    </UButton>
                </div>
            </div>
        </template>
    </UCard>
    <UModal :open="openModal.open" :close="{ onClick: () => { openModal.open = false } }" class="rtl"
        :title="openModal.title" :ui="{ header: 'rtl', footer: 'justify-end' }">
        <template #body>
            <div v-if="openModal.key == 'change-status'">
                <UFormField label="وضعیت جدید را انتخاب کنید">
                    <USelect class="w-full" v-model="selectedStatus" :items="statusOptionsChange"></USelect>
                    <UButton :loading="loading" class="my-2" block
                        @click="changeStatus(openModal.data?.id, selectedStatus)">ذخیره
                    </UButton>
                </UFormField>
            </div>
            <div v-if="openModal.key == 'request-detail'">
                <div class="mb-4 flex flex-col gap-4">
                    <div>
                        <span>تاریخ ثبت: </span>
                        <UBadge color="neutral" class="rounded-full">{{
                        openModal.data?.createdAtPersian  }}</UBadge>
                    </div>
                   <div class="flex gap-4">
                     <div>
                        <span>وضعیت: </span>
                        <UBadge :color="defineColor(openModal.data?.status)" class="rounded-full">{{
                        openModal.data?.statusText }}</UBadge>
                    </div>
                    <div>
                        <span>پرداخت: </span>
                        <UBadge :color="openModal.data?.paymentId ? 'success': 'warning'" class="rounded-full">{{
                        openModal.data?.paymentId || 'پرداخت انجام نشده' }}</UBadge>
                    </div>
                    </div>
                </div>
                <div class="w-full flex flex-col gap-3">
                    <UFormField label="نام و نام خانوادگی">
                        <UInput class="w-full" :model-value="openModal.data?.name" />
                    </UFormField>
                    <div class="w-full flex gap-2">
                        <UFormField class="w-full" label="شماره تماس">
                        <UInput class="w-full" :model-value="openModal.data?.phone" />
                    </UFormField>
                    <UFormField class="w-full" label="شناسه پرداخت">
                        <UInput class="w-full" :model-value="openModal.data?.paymentId" />
                    </UFormField>
                    </div>
                    <UFormField label="ایمیل">
                        <UInput class="w-full" :model-value="openModal.data?.email" />
                    </UFormField>
                    <UFormField label="شهر">
                        <UInput class="w-full" :model-value="openModal.data?.city" />
                    </UFormField>
                    <UFormField label="پیام">
                        <UTextarea class="w-full" :model-value="openModal.data?.message" />
                    </UFormField>
                    <UButton block>ذخیره</UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>


<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { SelectItem, TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const openModal = ref({
    open: false,
    title: '',
    key: '',
    data: {} as MedicalRequest | null
})
const selectedStatus = ref<any>(null)
const selectedId = ref<any>(null)
const toast = useToast()
const { copy } = useClipboard()

const API_BASE = 'https://easymed-foreign-request.radmanvahed.workers.dev'


type MedicalRequest = {
    id: string
    name: string
    phone: string
    city: string
    email: string
    message: string
    status: 'pending' | 'accepted' | 'done' | 'canceled'
    statusText: string
    createdAt: string
    updatedAt: string
    createdAtPersian: string
    updatedAtPersian: string
    createdAtFormatted: string
    updatedAtFormatted: string
    supportUserId: string | null
    telegramUserId: number | null
    paymentId: string | null
}

type ApiResponse = {
    success: boolean
    data: MedicalRequest[]
    pagination: {
        total: number
        take: number
        skip: number
        hasMore: boolean
        nextSkip: number | null
        currentPage: number
        totalPages: number
    }
    stats: {
        total: number
        filtered: {
            pending: number
            accepted: number
            done: number
            canceled: number
        }
        global: {
            total: number
            pending: number
            accepted: number
            done: number
            canceled: number
        }
    }
    appliedFilters: any
}

// State Management
const data = ref<MedicalRequest[]>([])
const loading = ref(false)
const pagination = ref({
    total: 0,
    take: 5,
    skip: 0,
    hasMore: false,
    nextSkip: null as number | null,
    currentPage: 1,
    totalPages: 1
})
const stats = ref({
    total: 0,
    filtered: {
        pending: 0,
        accepted: 0,
        done: 0,
        canceled: 0
    },
    global: {
        total: 0,
        pending: 0,
        accepted: 0,
        done: 0,
        canceled: 0
    }
})

// Filters
const filters = ref({
    search: '',
    status: 'a',
    sort: 'createdAt',
    order: 'desc',
    dateFrom: '',
    dateTo: '',
    take: 5,
    skip: 0
})

// Options for selects
const statusOptions = ref<SelectItem[]>([
    { label: 'همه وضعیت‌ها', value: 'a' },
    { label: 'در انتظار بررسی', value: 'pending' },
    { label: 'تایید شده', value: 'accepted' },
    { label: 'انجام شده', value: 'done' },
    { label: 'لغو شده', value: 'canceled' }
])

const statusOptionsChange = ref([
    { label: 'در انتظار بررسی', value: 'pending' },
    { label: 'تایید شده', value: 'accepted' },
    { label: 'انجام شده', value: 'done' },
    { label: 'لغو شده', value: 'canceled' }
])

const sortOptions = ref([
    { label: 'تاریخ ثبت', value: 'createdAt' },
    { label: 'آخرین بروزرسانی', value: 'updatedAt' },
    { label: 'نام', value: 'name' }
])

const orderOptions = ref([
    { label: 'نزولی', value: 'desc' },
    { label: 'صعودی', value: 'asc' }
])

const pageSizeOptions = ref([
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 }
])




function restModal() {
    openModal.value = {
        open: false,
        title: '',
        key: '',
        data: null
    }
}

const defineColor = (status: string | undefined) => {
    switch (status) {
        case 'pending':
            return 'warning'
        case 'accepted':
            return 'info'
        case 'done':
            return 'success'
        case 'canceled':

            return 'error'

        default:
            return 'neutral'
    }

}

// API Change Status
const changeStatus = async (id: any, status: any) => {
    selectedStatus.value = null
    selectedId.value = null
    try {
        loading.value = true
        const response = await fetch(`${API_BASE}/api/update-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestId: id,
                newStatus: status,
            })
        });
        const result = await response.json();
        if (result.success) {
            restModal()
            toast.add({
                title: result.message,
                color: 'success'
            })
        } else {
            toast.add({
                title: result.error,
                color: 'error'
            })
        }
    } catch (error) {

    } finally {
        loading.value = false
    }

}

// API Call Function
const loadRequests = async (skip = 0) => {
    loading.value = true
    try {
        const requestData = {
            ...filters.value,
            skip
        }
        const response = await $fetch<ApiResponse>(`${API_BASE}/api/requests`, {
            method: 'POST',
            body: requestData
        })

        if (response.success) {
            data.value = response.data
            pagination.value = response.pagination
            stats.value = response.stats
        } else {
            toast.add({
                title: 'خطا در دریافت داده‌ها',
                color: 'error',
                icon: 'i-lucide-alert-circle'
            })
        }
    } catch (error) {
        console.error('Error loading requests:', error)
        toast.add({
            title: 'خطا در اتصال به سرور',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}

// Filter Functions
const applyFilters = () => {
    filters.value.skip = 0
    loadRequests(0)
}

const clearFilters = () => {
    filters.value = {
        search: '',
        status: 'a',
        sort: 'createdAt',
        order: 'desc',
        dateFrom: '',
        dateTo: '',
        take: 10,
        skip: 0
    }
    loadRequests(0)
}

const nextPage = () => {
    if (pagination.value.hasMore) {
        const skip = pagination.value.nextSkip || 0
        filters.value.skip = skip
        loadRequests(skip)
    }
}

const prevPage = () => {
    const skip = Math.max(0, filters.value.skip - filters.value.take)
    filters.value.skip = skip
    loadRequests(skip)
}

// Table Columns
const columns: TableColumn<MedicalRequest>[] = [
    {
        accessorKey: 'id',
        header: 'شناسه',
        cell: ({ row }) => h('code', { class: 'text-xs' }, row.getValue('id'))
    },
    {
        accessorKey: 'name',
        header: 'نام',
        cell: ({ row }) => row.getValue('name')
    },
    {
        accessorKey: 'phone',
        header: 'تلفن',
        cell: ({ row }) => h('code', { class: 'text-sm' }, row.getValue('phone'))
    },
    {
        accessorKey: 'city',
        header: 'شهر',
        cell: ({ row }) => row.getValue('city')
    },
    {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            const color = {
                pending: 'warning' as const,
                accepted: 'info' as const,
                done: 'success' as const,
                canceled: 'error' as const
            }[status] || 'neutral' as const

            return h(UBadge, {
                class: 'capitalize',
                variant: 'subtle',
                color
            }, () => row.original.statusText)
        }
    },
    {
        accessorKey: 'createdAtFormatted',
        header: 'تاریخ ثبت',
        cell: ({ row }) => h('div', { class: 'text-sm' }, row.getValue('createdAtFormatted'))
    },
    {
        accessorKey: 'updatedAtFormatted',
        header: 'تاریخ به روزرسانی',
        cell: ({ row }) => h('div', { class: 'text-sm' }, row.getValue('updatedAtFormatted'))

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

function getRowItems(row: Row<MedicalRequest>) {
    const request = row.original
    return [
        {
            label: 'کپی شناسه',
            onSelect() {
                copy(request.id)
                toast.add({
                    title: 'شناسه درخواست کپی شد!',
                    color: 'success',
                    icon: 'i-lucide-circle-check'
                })
            }
        },
        {
            label: 'کپی شماره تلفن',
            onSelect() {
                copy(request.phone)
                toast.add({
                    title: 'شماره تلفن کپی شد!',
                    color: 'success',
                    icon: 'i-lucide-circle-check'
                })
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'تغییر وضعیت',
            onSelect() {
                selectedId.value = request.id
                openModal.value = {
                    open: true,
                    title: 'تغییر وضعیت درخواست',
                    key: 'change-status',
                    data: request
                }
            }
        },
        {
            label: 'جزئیات درخواست',
            onSelect() {

                openModal.value = {
                    open: true,
                    title: 'مشاهده و ویرایش جزئیات درخواست',
                    key: 'request-detail',
                    data: request
                }
            }
        },
        {
            label: 'ارسال پیام',
            disabled: !request.telegramUserId,
            onSelect() {
                // TODO: Open message modal
                console.log('Send message to:', request.id)
            }
        }
    ]
}

// Load data on mount
onMounted(() => {
    loadRequests()
})
</script>
