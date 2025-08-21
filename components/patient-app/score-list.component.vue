<template>
    <UCard>
        <template #header>
            <div class="md:flex rtl justify-between items-center">
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست گزارشات پایش سلامت</h1>
                </div>
                <div class="flex max-md:justify-end max-md:mt-4 gap-2">
                    <UButton v-if="showMore" icon="i-lucide-refresh-cw" variant="outline" @click="fetchData()"
                        :loading="loading">
                        بروزرسانی
                    </UButton>
                    <UButton variant="outline" @click="showMore = !showMore">
                        نمایش بیشتر
                    </UButton>
                </div>
            </div>
        </template>

        <template #default>
            <!-- Type Statistics -->
            <div v-if="typeStats && typeStats.length" class="mb-6 rtl">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div v-for="stat in typeStats" class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">{{ stat.count }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">{{ stat.type }}</div>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                     <USkeleton v-for="item in [1,2,3,4,5]" class="h-[76px]" />
                </div>
            </div>

            <!-- Filters Section -->
            <UCard v-if="showMore" class="mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rtl">
                    <!-- <UInput 
                        v-model="filters.firstName" 
                        placeholder="جستجو بر اساس نام"
                        icon="i-lucide-search"
                        @input="debouncedSearch"
                    />
                    <UInput 
                        v-model="filters.lastName" 
                        placeholder="جستجو بر اساس نام خانوادگی"
                        icon="i-lucide-search"
                        @input="debouncedSearch"
                    /> -->
                    <UInput v-model="filters.phone" placeholder="جستجو بر اساس شماره تماس" icon="i-lucide-phone"
                        @input="debouncedSearch" />
                    <USelect v-model="filters.type" :items="typeOptions" placeholder="انتخاب نوع" @change="fetchData" />
                </div>
                <div class="flex justify-end mt-4 gap-2">
                    <UButton variant="outline" @click="clearFilters">
                        پاک کردن فیلترها
                    </UButton>
                </div>
            </UCard>

            <!-- Table Section -->
            <div v-if="showMore" class="rtl">
                <UTable :data="data" :loading="loading" :columns="columns" class="flex-1 rtl" />
            </div>

            <!-- Pagination Section -->
            <div v-if="pagination && pagination.totalPages > 1 && showMore" class="flex justify-center mt-6">
                <UPagination v-model="currentPage" :page-count="pageSize" :total="pagination.total" :max="5"
                    @update:model-value="onPageChange" />
            </div>

            <!-- Load More Button (Alternative to pagination) -->
            <div v-if="pagination && pagination.hasMore && !showPagination && showMore"
                class="flex justify-center mt-6">
                <UButton @click="loadMore" :loading="loading" variant="outline">
                    بارگذاری بیشتر
                </UButton>
            </div>
        </template>
    </UCard>

    <UModal :open="modal" :close="{ onClick: () => { modal = false } }" class="rtl"
        :ui="{ header: 'rtl', footer: 'justify-end' }" title="نتیجه پایش">
        <template #body>
            <p>{{ modalText }}</p>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { h, resolveComponent, type DefineComponent } from 'vue'
import type { ButtonProps, ButtonSlots, TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import moment from 'jalali-moment'

const UButton = resolveComponent('UButton') as DefineComponent<ButtonProps>
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UPagination = resolveComponent('UPagination')

// State
const modal = ref(false)
const modalText = ref('')
const showMore = ref(false)
const showPagination = ref(true) // true for pagination, false for load more
const toast = useToast()

// Types
type dataType = {
    id: string
    score: scoreType
    firstName: string
    lastName: string
    phone: string
    type: string
    createdAt: string
}

type scoreType = {
    result: string,
    status: string
}

type TypeStat = {
    type: string
    count: number
}

type PaginationInfo = {
    total: number
    skip: number
    take: number
    hasMore: boolean
    currentPage: number
    totalPages: number
}

// API Configuration
const API_BASE = 'https://easyemed-score.radmanvahed.workers.dev'

// Data
const data = ref<dataType[]>([])
const typeStats = ref<TypeStat[]>([])
const totalCount = ref(0)
const filteredCount = ref(0)
const pagination = ref<PaginationInfo | null>(null)
const loading = ref(false)

// Pagination & Filters
const currentPage = ref(1)
const pageSize = ref(10)
const filters = ref({
    firstName: '',
    lastName: '',
    phone: '',
    type: ''
})

// Computed
const typeOptions = computed(() => {
    const options = [{ label: 'همه', value: 'h' }]
    if (typeStats.value && typeStats.value.length > 0) {
        typeStats.value.forEach(stat => {
            options.push({
                label: stat.type,
                value: stat.type
            })
        })
    }
    return options
})

// Methods
const fetchData = async (reset = true) => {
    loading.value = true

    try {
        const params = new URLSearchParams()

        // Add filters
        if (filters.value.firstName) params.append('firstName', filters.value.firstName)
        if (filters.value.lastName) params.append('lastName', filters.value.lastName)
        if (filters.value.phone) params.append('phone', filters.value.phone)
        if (filters.value.type) params.append('type', filters.value.type != 'h' ? filters.value.type : '')

        // Add pagination
        const skip = reset ? 0 : (currentPage.value - 1) * pageSize.value
        params.append('skip', skip.toString())
        params.append('take', pageSize.value.toString())

        const response = await fetch(`${API_BASE}/api/scores?${params.toString()}`)
        const result = await response.json()
        if (result.success) {
            if (reset) {
                data.value = result.data
                currentPage.value = 1
            } else {
                data.value = [...data.value, ...result.data] // For load more
            }

            typeStats.value = result.typeStats || []
            totalCount.value = result.totalCount || 0
            filteredCount.value = result.filteredCount || 0
            pagination.value = result.pagination
        }
    } catch (error) {
        console.error('Error fetching data:', error)
        toast.add({
            title: 'خطا در دریافت داده‌ها',
            color: 'error',
            duration: 3000
        })
    } finally {
        loading.value = false
    }
}

const loadMore = async () => {
    if (pagination.value && pagination.value.hasMore) {
        await fetchData(false)
    }
}

const onPageChange = (page: number) => {
    currentPage.value = page
    fetchData()
}

const clearFilters = () => {
    filters.value = {
        firstName: '',
        lastName: '',
        phone: '',
        type: ''
    }
    fetchData()
}
const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Debounced search
const debouncedSearch = debounce(() => {
    fetchData()
}, 500)

const deleteRecord = async (id: string) => {
    loading.value = true

    try {
        const response = await fetch(`${API_BASE}/api/scores/${id}`, {
            method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
            toast.add({
                title: result.message,
                color: 'success',
                duration: 1000
            })
            data.value = data.value.filter((i) => i.id != result.deletedId)
            // Update counts
            filteredCount.value = Math.max(0, filteredCount.value - 1)
            totalCount.value = Math.max(0, totalCount.value - 1)
        }
    } catch (error) {
        console.error('Error deleting record:', error)
        toast.add({
            title: 'خطا در حذف رکورد',
            color: 'error',
            duration: 3000
        })
    } finally {
        loading.value = false
    }
}

// Lifecycle
onMounted(() => {
    fetchData()
})

// Table Columns
const columns: TableColumn<dataType>[] = [
    {
        accessorKey: 'firstName',
        header: 'نام و نام خانوادگی',
        cell: ({ row }) => {
            const firstName = row.original.firstName
            const lastName = row.original.lastName
            return (firstName && firstName !== '') && (lastName && lastName !== '')
                ? `${firstName} ${lastName}`
                : 'بیمار ناشناس'
        }
    },
    {
        accessorKey: 'phone',
        header: 'شماره تماس'
    },
    {
        accessorKey: 'score',
        header: 'وضعیت',
        cell: ({ row }) => {
            const score: scoreType = JSON.parse(row.getValue('score') as string)
            let color: ButtonProps['color'] = 'success'
            if (score.status.match('متوسط') || score.status.match('کمی بالا')) {
                color = 'warning'
            } else if (score.status.match('بالا') || score.status.match('بسیار بالا')) {
                color = 'error'
            }
            return h(UButton, {
                class: 'capitalize',
                variant: 'subtle',
                color,
                onClick: () => {
                    console.log('see');

                    modal.value = true
                    modalText.value = score.status
                }
            }, () => `امتیاز: ${score.result}`)
        },
    },
    {
        accessorKey: 'type',
        header: 'تایپ'
    },
    {
        accessorKey: 'createdAt',
        header: 'تاریخ ثبت امتیاز',
        cell: ({ row }) => {
            return moment(row.original.createdAt).locale('fa').format('YYYY/MM/DD HH:mm')
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

function getRowItems(row: Row<any>) {
    const request = row.original
    return [
        {
            label: 'حذف امتیاز',
            icon: 'i-lucide-trash text-red-500',
            onSelect() {
                deleteRecord(request.id)
            }
        },
    ]
}
</script>
