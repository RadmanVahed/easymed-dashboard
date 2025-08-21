<template>
    <div class="flex">
        <UCard class="w-full">
            <template #header>
                <div class="rtl">
                    <h1 class="text-2xl font-bold">لیست بنر های اپ پزشک</h1>
                </div>
            </template>
            <template #default>
                <USkeleton v-if="loadingBanners" class="h-[267px] w-full rounded-md" />
                <div v-else class="flex max-md:flex-wrap justify-between">
                    <UCarousel v-slot="{ item }" dots :items="banners" class="w-full max-w-xs my-4">
                        <div class="flex rtl justify-between">
                            <div>
                                <h1 class="font-bold text-lg">{{ item.name }}</h1>
                                <div>{{ formatDate(item.createdAt) }}</div>
                                <div class="text-sm text-gray-500">{{ item.key }}</div>
                            </div>
                            <div>
                                <UModal v-model:open="showDeleteModal" class="rtl" title="آیا از حذف بنر اطمینان دارید؟"
                                    :ui="{ header: 'rtl', footer: 'justify-end' }">
                                    <template #footer>
                                        <UButton label="لغو" color="neutral" variant="outline" @click="showDeleteModal = false" />
                                        <UButton color="error" @click="deleteBanner(selectedBannerId)">تایید</UButton>
                                    </template>
                                </UModal>
                                <UButton 
                                    color="error" 
                                    size="sm" 
                                    @click="openDeleteModal(item._id)"
                                    class="mt-2"
                                >
                                    حذف
                                </UButton>
                            </div>
                        </div>
                        <img :src="`${API_BASE}/${item.path}`" :loading="'lazy'" width="600" height="400" class="rounded-lg">
                    </UCarousel>
                    <div class="rtl max-md:w-full md:ml-4">
                        <div>
                            <h1>افزودن بنر جدید</h1>
                            <div class="md:flex grid mt-8 w-full gap-1">
                                <UFormField class="w-full" label="انتخاب بنر">
                                    <input 
                                        class="w-full border p-[5px] border-[var(--ui-border)] rounded-md" 
                                        id="image"
                                        type="file" 
                                        accept="image/*" 
                                        @change="handleImageChange" 
                                        ref="imageInput" 
                                    />
                                </UFormField>
                                <UFormField class="w-full" label="نام بنر">
                                    <UInput class="w-full" v-model="form.name" placeholder="نام بنر" />
                                </UFormField>
                            </div>
                            <div class="grid grid-cols-2 gap-2 mt-4">
                                <UFormField label="کلید بنر">
                                    <UInput class="w-full" v-model="form.key" placeholder="کلید منحصر به فرد" />
                                </UFormField>
                                <UFormField label="پلتفرم">
                                    <USelect 
                                        v-model="form.platform" 
                                        :items="platformOptions"
                                        option-attribute="label"
                                        value-attribute="value"
                                    />
                                </UFormField>
                            </div>
                            <UFormField label="نوع عمل" class="mt-4">
                                <USelect 
                                    v-model="form.action" 
                                    :items="actionOptions"
                                    option-attribute="label"
                                    value-attribute="value"
                                />
                            </UFormField>
                            <UButton class="mt-4" :disabled="loading" :loading="loading" @click="submitBanner()" block>
                                ذخیره بنر
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
interface Banner {
    _id: string
    name: string
    key: string
    action: string
    path: string
    platform: string
    createdAt: string
}

interface BannerForm {
    name: string
    key: string
    action: string
    platform: string
}

const API_BASE = 'https://intelligent-colden-d2cajkshs.liara.run'

// Reactive data
const form = reactive<BannerForm>({
    name: '',
    key: '',
    action: 'image',
    platform: 'doctor'
})

const loading = ref(false)
const loadingBanners = ref(false)
const banners = ref<Banner[]>([])
const showDeleteModal = ref(false)
const selectedBannerId = ref('')
const toast = useToast()
const imageInput: any = ref(null)
const selectedFile = ref<File | null>(null)

// گزینه‌های پلتفرم و اکشن
const platformOptions = ref([
    { label: 'اپ پزشک', value: 'doctor' },
    { label: 'اپ بیمار', value: 'patient' },
    { label: 'دشبورد', value: 'dashboard' },
    { label: 'اپ ایزیمد', value: 'easymed' }
])

const actionOptions = ref([
    { label: 'تصویر', value: 'image' },
    { label: 'لینک', value: 'url' },
    { label: 'مسیر', value: 'path' },
    { label: 'چرخ ویل', value: 'wheel' }
])

// مدیریت تغییر فایل
const handleImageChange = (event: any) => {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
    } else {
        selectedFile.value = null
    }
}

// ارسال فرم با FormData
const submitBanner = async () => {
    if (!selectedFile.value) {
        toast.add({
            title: 'لطفا فایل تصویر رو انتخاب کنید',
            color: 'warning'
        })
        return
    }

    if (!form.name || !form.key) {
        toast.add({
            title: 'لطفا تمام فیلدهای اجباری را پر کنید',
            color: 'warning'
        })
        return
    }

    loading.value = true

    try {
        const formData = new FormData()
        formData.append('path', selectedFile.value)
        formData.append('name', form.name)
        formData.append('key', form.key)
        formData.append('action', form.action)
        formData.append('platform', form.platform)

        const response: any = await $fetch(`${API_BASE}/api/banner/banners`, {
            method: 'POST',
            body: formData,
        })

        toast.add({
            title: 'بنر با موفقیت ذخیره شد',
            color: 'success'
        })
        resetForm()
        await fetchBanners()
    } catch (error: any) {
        console.error('Error:', error)
        toast.add({
            title: error.data?.message || 'خطا در ذخیره بنر',
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    form.name = ''
    form.key = ''
    form.action = 'image'
    form.platform = 'doctor'
    selectedFile.value = null
    if (imageInput.value) {
        imageInput.value.value = ''
    }
}

const fetchBanners = async () => {
    loadingBanners.value = true

    try {
        const response: any = await $fetch(`${API_BASE}/api/banner/banners/doctor`)
        banners.value = response.banners || []
    } catch (error: any) {
        console.error('Fetch banners error:', error)
        toast.add({
            title: 'خطا در دریافت بنر ها',
            color: 'error'
        })
        banners.value = []
    } finally {
        loadingBanners.value = false
    }
}

const openDeleteModal = (id: string) => {
    selectedBannerId.value = id
    showDeleteModal.value = true
}

const deleteBanner = async (id: string) => {
    try {
        await $fetch(`${API_BASE}/api/banner/banners/${id}`, {
            method: 'DELETE'
        })

        showDeleteModal.value = false
        toast.add({
            title: 'بنر با موفقیت حذف شد',
            color: 'success'
        })
        await fetchBanners()
    } catch (error: any) {
        console.error('Delete error:', error)
        toast.add({
            title: error.data?.message || 'خطا در حذف بنر',
            color: 'error'
        })
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR')
}

onMounted(() => {
    fetchBanners()
})
</script>
