<template>
    <UCard>
        <template #header>
            <div class="flex rtl justify-between items-center">
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست گزارشات پایش سلامت</h1>
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
    <UModal :open="modal" :close="{ onClick: () => { modal = false } }" class="rtl"
        title="نتیجه پایش" :ui="{ header: 'rtl', footer: 'justify-end' }">
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
const modal = ref(false)
const modalText = ref('')
const toast = useToast()
type dataType = {
    id: string
    score: scoreType
    firstName: string
    lastName: string
    phone: string
    type:string
    createdAt:string
}

type scoreType = {
    result:string,
    status:string
}

const API_BASE = 'https://easyemed-score.radmanvahed.workers.dev'

const data = ref<dataType[]>([])
const loading = ref(false)

const fetchData = async () => {
    loading.value = true
    const response = await fetch(`${API_BASE}/api/scores`, {
        method: 'GET',
    });

    const result = await response.json();
    loading.value = false
    console.log(result);
    data.value = result.data

}
const deleteRecord = async (id:string) => {
    loading.value = true
    const response = await fetch(`${API_BASE}/api/scores/${id}`, {
        method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
         toast.add({
            title:result.message,
            color:'success',
            duration:1000
        })
        data.value = data.value.filter((i) => i.id != result.deletedId)
    }
    loading.value = false

}
onMounted(() => {
    fetchData()
})
const columns: TableColumn<dataType>[] = [
    {
        accessorKey: 'firstName',
        header: 'نام و نام خانوادگی',
        cell:({ row }) => {
            return (row.original.firstName && row.original.firstName != '') && (row.original.lastName && row.original.lastName) ? row.original.firstName + " "  + row.original.lastName : 'بیمار ناشناس'
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
            const score:scoreType = JSON.parse(row.getValue('score') as string)
            let color:ButtonProps['color'] = 'info'
            if (score.status.match('متوسط')) {
                color = 'warning'
            }
            return h(UButton, {
                class: 'capitalize',
                variant: 'subtle',
                color,
                onClick:() => {
                    modal.value = true
                    modalText.value = score.status
                }
                
                
            }, () =>"امتیاز: " + score.result )
        },
    },
    {
        accessorKey:'type',
        header:'تایپ'
    },
    {
        accessorKey: 'createdAt',
        header: 'تاریخ ثبت امتیاز',
        cell: ({ row }) => {
            return moment(row.original.createdAt).locale('fa').format('YYYY/MM/DD')
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
            icon:'i-lucide-trash text-red-500',
            onSelect() {
                deleteRecord(request.id)
            }
        },
    ]
}
</script>