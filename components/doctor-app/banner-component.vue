<template>
    <div class="flex">
        <UCard class="w-full">
            <template #header>
                <div class="rtl">
                    <h1>لیست بنر های اپ پزشک</h1>
                </div>
            </template>
            <template #default>
                <USkeleton v-if="loadingBanners" class="h-[267px] w-full rounded-md" />
                <div v-else class="flex justify-between">
                    <UCarousel v-slot="{ item }" dots :items="banners" class="w-full max-w-xs my-4 ml-8">
                        <div class="flex rtl justify-between">
                            <div>
                                <h1 class="font-bold text-lg">{{ item.title }}</h1>
                                <div>{{ formatDate(item.createdAt) }}</div>
                            </div>
                            <div>
                                <UModal v-model:open="first" class="rtl" title="آیا از حذف بنر اطمینان دارید؟"
                                    :ui="{ header: 'rtl', footer: 'justify-end' }">
                                    <UButton color="error" label="حذف" />

                                    <template #footer>
                                        <UButton label="لغو" color="neutral" variant="outline" @click="first = false" />
                                        <UButton color="error" @click="deleteBanner(item.id)">تایید</UButton>
                                    </template>
                                </UModal>
                            </div>
                        </div>
                        <img :src="item.base64Data" :loading="'lazy'" width="600" height="400" class="rounded-lg">
                    </UCarousel>
                    <div class="rtl w-3/5">
                        <div>
                            <h1>افزودن بنر جدید</h1>
                            <div class="flex mt-8 w-full gap-1">
                                <UFormField class="w-full" label="انتخاب بنر">
                                    <input class="w-full border p-[5px] border-[var(--ui-border)] rounded-md" id="image"
                                        type="file" accept="image/*" @change="handleImageChange" ref="imageInput" />
                                </UFormField>
                                <UFormField class="w-full" label="عنوان بنر">
                                    <UInput class="w-full" v-model="form.title" />
                                </UFormField>
                            </div>
                            <UFormField label="توضیحات بنر">
                                <UTextarea v-model="form.description" class="w-full"></UTextarea>
                            </UFormField>
                            <UButton class="mt-2" :disabled="loading" :loading="loading" @click="submitBanner()" block>
                                ذخیره بنر</UButton>
                        </div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
interface Banner {
    id: string
    base64Data: string
    title: string
    description: string
    createdAt: string
}

interface ApiResponse {
    success: boolean
    banners?: Banner[]
    error?: string
}
const API_BASE = 'https://easymed-banner.radmanvahed.workers.dev'

// Reactive data
const form = reactive({
    title: '',
    description: ''
})

const previewSrc = ref('')
const loading = ref(false)
const deleteLoading = ref(false)
const loadingBanners = ref(false)
const banners = ref<Banner[]>([])
const first = ref(false)
const message = reactive({
    show: false,
    text: '',
    isError: false
})
const toast = useToast()
const imageInput: any = ref(null)

// پیش‌نمایش تصویر
const handleImageChange = (event: any) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (ev: any) => {
            previewSrc.value = ev.target.result
        }
        reader.readAsDataURL(file)
    } else {
        previewSrc.value = ''
    }
}

// ارسال فرم
const submitBanner = async () => {
    const file = imageInput.value?.files[0]
    if (!file) {
        toast.add({
            title:'لطفا فایل تصویر رو انتخاب کنید',
            color:'warning'
        })
        return
    }

    loading.value = true

    try {
        const reader = new FileReader()
        reader.onload = async (evt: any) => {
            try {
                const base64Data = evt.target.result

                const response: any = await $fetch(`${API_BASE}/banners`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        base64Data,
                        title: form.title,
                        description: form.description
                    })
                })

                if (response.success) {
                    toast.add({
                        title: 'بنر با موفقیت ذخیره شد',
                        color: 'success'
                    })
                    resetForm()
                    await fetchBanners()
                } else {
                    toast.add({
                        title: 'خطا در ذخیره بنر',
                        color: 'error'
                    })
                }
            } catch (error) {
                toast.add({
                        title: 'خطا در ذخیره بنر',
                        color: 'error'
                    })
            } finally {
                loading.value = false
            }
        }
        reader.readAsDataURL(file)
    } catch (error) {
        toast.add({
                        title: 'خطا در پردازش تصویر بنر',
                        color: 'error'
                    })
        loading.value = false
    }
}

// نمایش پیام
const showMessage = (text: any, isError = false) => {
    message.text = text
    message.isError = isError
    message.show = true

    setTimeout(() => {
        message.show = false
    }, 4000)
}

// ریست کردن فرم
const resetForm = () => {
    form.title = ''
    form.description = ''
    previewSrc.value = ''
    if (imageInput.value) {
        imageInput.value.value = ''
    }
}

// دریافت لیست بنرها
const fetchBanners = async () => {
    loadingBanners.value = true

    try {
        const response = await $fetch<ApiResponse>(`${API_BASE}/banners`)
        banners.value = response.banners || []
    } catch (error) {
        toast.add({
                        title: 'خطا در دریافت بنر ها',
                        color: 'error'
                    })
        banners.value = []
    } finally {
        loadingBanners.value = false
    }
}

// حذف بنر
const deleteBanner = async (id: any) => {
    deleteLoading.value = true
    try {
        const response: any = await $fetch(`${API_BASE}/banners/${id}`, {
            method: 'DELETE'
        })

        if (response.success) {
            first.value = false
            toast.add({
                title: 'بنر با موفقیت حذف شد',
                color: 'success'
            })
            await fetchBanners()
        } else {
            toast.add({
                title: 'خطا در حذف بنر',
                color: 'error'
            })
        }
    } catch (error) {
        toast.add({
            title: 'خطا در حذف بنر',
            color: 'error'
        })
    } finally {
        deleteLoading.value = false
    }
}

// فرمت کردن تاریخ
const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleString('fa-IR')
}

onMounted(() => {
    fetchBanners()
})
</script>