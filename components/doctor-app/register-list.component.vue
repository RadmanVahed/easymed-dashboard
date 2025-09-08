<template>
    <UCard>
        <template #header>
            <div class="flex rtl justify-between items-center">
                <h1 class="text-2xl font-bold">لیست ثبت نام پزشکان</h1>
                <!-- دکمه رفرش به status و تابع refresh از useAsyncData متصل است -->
                <UButton 
                    icon="i-heroicons-arrow-path" 
                    variant="outline" 
                    @click="refresh()"
                    :loading="status === 'pending'">
                    بروزرسانی
                </UButton>
            </div>
        </template>
        <!-- بخش جدول -->
        <!-- :rows به data.registers و loading به status متصل است -->
        <UTable 
            :data="data.registers" 
            :loading="status === 'pending'" 
            :columns="columns" 
            class="rtl"
        >   
            <!-- نمایش پیام مناسب وقتی داده‌ای وجود ندارد -->
            <template #empty>
                <div class="flex flex-col items-center justify-center py-6 gap-3">
                    <UIcon name="i-heroicons-circle-stack-20-solid" class="w-10 h-10 mx-auto text-gray-400" />
                    <span class="text-sm">هیچ ثبت‌نامی یافت نشد.</span>
                </div>
            </template>
        </UTable>

        <!-- بخش صفحه‌بندی -->
        <template #footer>
            <div class="flex justify-between items-center rtl">
                <div>
                    <span class="text-sm text-gray-500">
                        نمایش {{ (filters.page - 1) * filters.take + 1 }} تا {{ Math.min(filters.page * filters.take, data?.pagination.totalCount || 0) }} از {{ data?.pagination.totalCount }} مورد
                    </span>
                </div>
                {{ data.pagination.totalPages }}
                <!-- اتصال UPagination به state و total از API -->
                <UPagination
                    :page-count="filters.take"
                    :total="data.pagination.totalCount || 0"
                    v-model:page="filters.page"
                    show-edges :sibling-count="1" 
                >
            </UPagination>
            </div>
        </template>
    </UCard>

    <!-- مدال برای تغییر وضعیت -->
    <UModal title="تغییر وضعیت" description="وضعیت جدید را انتخاب کنید" v-model:open="isModalOpen" >
      <template #body>
                <USelect class="w-full mb-4" v-model="selectedStatus" :items="statusOptionsChange" option-attribute="label" value-attribute="value" />
            <UButton 
                :loading="isSubmitting" 
                @click="handleChangeStatus" 
                block
            >
                ذخیره تغییرات
            </UButton>
      </template>
    </UModal>
</template>

<script setup lang="ts">
import type { TableColumn } from '#ui/types';
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
// --- تعریف تایپ‌ها ---
// تعریف تایپ دقیق برای پاسخ API
interface Register {
    _id: string;
    birthDate: string;
    status: 'pending' | 'done' | 'reject';
    firstName: string;
    lastName:string;
    fullName: string;
    medicalNumber: string;
    nationalCode: string;
    phone: string;
    createdAt: string;
    referralCode?: string;
}
interface Pagination {
    currentPage?:number,
    totalPages?:number,
    totalCount?:number,
    limit?:number,
    skip?:number,
    hasNextPage?:boolean,
    hasPrevPage?:boolean,
    nextPage?:number | null,
    prevPage?:number | null;
}

interface ApiResponse {
    pagination:Pagination;
    registers: Register[];
    // سایر فیلدهای پاسخ API
}

// --- Composables ---
const toast = useToast();

// --- State مدیریتی ---
const filters = reactive({
    page: 1,
    take: 10,
    // سایر فیلترها را می‌توان اینجا اضافه کرد
    // search: ''
});
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
// --- واکشی داده با useAsyncData ---
// این هوک به صورت خودکار داده‌ها را واکشی و مدیریت می‌کند
const { data, status, refresh } = await useAsyncData<ApiResponse>(
    'registers-list', // یک کلید منحصر به فرد برای کش کردن
    () => $fetch(apiBaseUrl + 'auth/registers', { // استفاده از $fetch در useAsyncData
        method: 'POST',
        body: {
            page: filters.page,
            take: filters.take,
            filters: {} // سایر فیلترها
        }
    }),
    {
        watch: [() => filters.page, () => filters.take], // با تغییر صفحه یا تعداد، داده‌ها مجدد واکشی می‌شوند
        default: () => ({ registers: [], pagination : {} }) // مقدار پیش‌فرض برای جلوگیری از خطا
    }
);

const columns: TableColumn<Register>[]  = [
    { accessorKey: 'fullName', header: 'نام و نام خانوادگی' },
    { accessorKey: 'nationalCode', header: 'کد ملی' },
    { accessorKey: 'phone', header: 'شماره تماس' },
    { accessorKey:'birthDate' , header: 'تولد', 
        cell: ({row}) => {
            return useFormatDate(row.original.birthDate , 'date')
        }
    },
    { accessorKey: 'medicalNumber', header: 'نظام پزشکی' },
    { accessorKey:'createdAt' , header: 'تاریخ ثبت نام', 
        cell: ({row}) => {
            return useFormatDate(row.original.createdAt , 'mix')
        }
    },
   {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            const color = {
                pending: 'warning' as const,
                done: 'success' as const,
                reject: 'error' as const
            }[status] || 'neutral' as const

            return h(UBadge, {
                class: 'capitalize',
                variant: 'subtle',
                color
            }, () => statusMap[row.original.status].label)
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
                        items: getRowItems(row.original),
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
];

const statusMap = {
    pending: { label: 'ثبت شده', color: 'info' as const },
    done: { label: 'انجام شده', color: 'success' as const },
    reject: { label: 'رد شده', color: 'error' as const },
};

const isModalOpen = ref(false);
const isSubmitting = ref(false);
const selectedRegister = ref<Register | null>(null);
const selectedStatus = ref<'pending' | 'done' | 'reject'>('pending');

const statusOptionsChange = [
    { label: 'ثبت شده', value: 'pending' },
    { label: 'انجام شده', value: 'done' },
    { label: 'لغو شده', value: 'reject' }
];

function openStatusModal(register: Register) {
    selectedRegister.value = register;
    selectedStatus.value = register.status;
    isModalOpen.value = true;
}

async function handleChangeStatus() {
    if (!selectedRegister.value) return;
    
    isSubmitting.value = true;
    try {
        const response: any = await useApiFetch(`auth/register/${selectedRegister.value._id}/${selectedStatus.value}`, {
            method: 'PUT'
        });

        if (response.data.value?.success || response.data.value?.statusCode === 200) {
            toast.add({
                title: 'موفقیت',
                description: response.data.value.message || 'وضعیت با موفقیت تغییر کرد.',
                color: 'success'
            });
            isModalOpen.value = false;
            await refresh();
        }
    } finally {
        isSubmitting.value = false;
    }
}

// --- آیتم‌های دراپ‌داون عملیات ---
function getRowItems(row: Register) {
    return [
        [
            {
                label: 'تغییر وضعیت',
                icon: 'i-heroicons-pencil-square-20-solid',
                onSelect: () => {
                    openStatusModal(row)
                }
            },
            // آیتم‌های دیگر را می‌توان اینجا اضافه کرد
            // {
            //     label: 'حذف',
            //     icon: 'i-heroicons-trash-20-solid',
            //     click: () => {}
            // }
        ]
    ]
}

</script>
