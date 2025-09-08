    <template>
        <div class="flex">
            <UCard class="w-full">
                <template #header>
                    <div class="rtl flex justify-between">
                        <h1 class="text-2xl font-bold">سرویس بنر</h1>
                        <UButton @click="isNewBannerModal = true" label="افزودن بنر" />
                    </div>
                </template>

                <template #default>
                    <USkeleton v-if="pending" class="h-[267px] w-full rounded-md" />

                    <div v-else-if="error" class="rtl text-center text-red-500">
                        <p>خطا در دریافت بنرها. لطفا دوباره تلاش کنید.</p>
                        <UButton icon="i-heroicons-arrow-path" class="mt-4" @click="refreshBanners()">
                            تلاش مجدد
                        </UButton>
                    </div>

                    <div v-else class="flex max-md:flex-wrap justify-between">
                        <UCarousel v-slot="{ item }" dots :items="banners" :ui="{ item: 'basis-full' }"
                            class="w-full max-w-xs my-4">
                            <div class="flex rtl justify-between">
                                <div>
                                    <h1 class="font-bold text-lg">{{ item.name }}</h1>
                                    <div>{{ useFormatDate(item.createdAt , 'mix') }}</div>
                                    <div class="text-sm text-gray-500">{{ item.key }}</div>
                                </div>
                                <div>
                                    <UButton color="error" size="sm" @click="openDeleteModal(item._id)" class="mt-2">
                                        حذف
                                    </UButton>
                                </div>
                            </div>
                            <img :src="`${apiBaseUrl.replace('api/', '')}${item.path}`" :loading="'lazy'" width="600" height="400"
                                class="rounded-lg mt-2">
                        </UCarousel>

                        <div class="rtl max-md:w-full md:ml-4">

                        </div>
                    </div>
                </template>
            </UCard>
            <UModal v-model:open="isNewBannerModal" description="اطلاعات بنر را وارد کنید" title="افزودن بنر جدید"
                class="rtl" :ui="{ header: 'rtl', footer: 'justify-end' }">
                <template #body>
                    <div class="grid w-full gap-4">
                        <UFormField class="w-full" label="انتخاب بنر" 
                            name="image" required>
                            <UFileUpload 
                                v-model="selectedFile" 
                                :multiple="false"
                                accept="image/*"
                                :max-size="2 * 1024 * 1024"
                                label="تصویر را اینجا بکشید یا کلیک کنید"
                                description="فرمت‌های مجاز: SVG, PNG, JPG"
                                class="w-full"
                            />
                        </UFormField>
                        <UFormField class="w-full" label="نام بنر" name="name" required>
                            <UInput class="w-full" v-model="form.name" placeholder="نام بنر" />
                        </UFormField>
                    </div>
                    <div class="grid grid-cols-2 w-full gap-2 mt-4">
                        <UFormField label="نوع عمل" name="action" class="w-full">
                            <USelect class="w-full" v-model="form.action" :items="actionOptions" option-attribute="label"
                                value-attribute="value" />
                        </UFormField>

                        <UFormField class="w-full" label="پلتفرم" name="platform">
                            <USelect class="w-full" v-model="form.platform" :items="platformOptions"
                                option-attribute="label" value-attribute="value" />
                        </UFormField>
                    </div>
                    <UFormField class="w-full mt-4" label="کلید بنر" name="key" required>
                        <UInput class="w-full" v-model="form.key" placeholder="کلید منحصر به فرد" />
                    </UFormField>
                    <UButton class="mt-4" :loading="isSubmitting" @click="submitBanner" block>
                        ذخیره بنر
                    </UButton>
                </template>
            </UModal>
            <UModal v-model:open="isDeleteModalOpen" description="آیا از حذف بنر اطمینان دارید؟" title="حذف بنر" class="rtl"
                :ui="{ header: 'rtl', footer: 'justify-end' }">
                <template #body>
                    <div class="flex gap-2">
                        <UButton label="لغو" color="neutral" variant="outline" @click="isDeleteModalOpen = false" />
                        <UButton color="error" :loading="isDeleting" @click="confirmDeleteBanner">تایید و حذف</UButton>
                    </div>
                </template>
            </UModal>
        </div>
    </template>

    <script setup lang="ts">
    import { useApiFetch } from '@/composables/useApiFetch';
    import type { UInput } from '#build/components';
    import { useFormatDate } from '~/composables/useFormatDate';

    interface Banner {
        _id: string;
        name: string;
        key: string;
        action: string;
        path: string;
        platform: string;
        createdAt: string;
    }

    interface BannerForm {
        name: string;
        key: string;
        action: string;
        platform: string;
    }
    const toast = useToast();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.apiBaseUrl;

    const { data: banners, pending, error, refresh: refreshBanners } = useAsyncData<Banner[]>(
        'fetchBanners',
        async () => {
            const response:any = await useApiFetch(apiBaseUrl + 'banner/banners/doctor');
            return response.data.value.banners || [];
        }, {
        default: () => [],
    }
    );
    const initialFormState: BannerForm = { name: '', key: '', action: 'image', platform: 'doctor' };
    const form = reactive({ ...initialFormState });
    const selectedFile = ref<File | null>(null);
    const imageInputRef = ref<any | null>(null);
    const isSubmitting = ref(false);
    const isNewBannerModal = ref(false);

    const platformOptions = [
        { label: 'اپ پزشک', value: 'doctor' },
        { label: 'اپ بیمار', value: 'patient' },
        { label: 'داشبورد', value: 'dashboard' },
        { label: 'سامانه ایزی مد', value: 'easymed' }
    ];
    const actionOptions = [
        { label: 'تصویر', value: 'image' },
        { label: 'لینک', value: 'url' },
        { label: 'مسیر', value: 'path' },
        { label: 'گردونه شانس', value: 'wheel' }
    ];

    const resetForm = () => {
        Object.assign(form, initialFormState);
          selectedFile.value = null; 
    };

    const submitBanner = async () => {
     const fileToUpload = selectedFile.value;
        
        if (!fileToUpload || !form.name || !form.key) {
            toast.add({ title: 'لطفا تمام فیلدهای الزامی را پر کنید', color: 'warning', icon: 'i-heroicons-exclamation-triangle' });
            return;
        }

        isSubmitting.value = true;
        const formData = new FormData();
        formData.append('path', fileToUpload);
        formData.append('name', form.name);
        formData.append('key', form.key);
        formData.append('action', form.action);
        formData.append('platform', form.platform);

        try {
            await useApiFetch('banner/banners', {
                method: 'POST',
                body: formData,
            });

            toast.add({ title: 'بنر با موفقیت ذخیره شد', color: 'success' });
            isNewBannerModal.value = false;
            resetForm();
            await refreshBanners();
        } catch (err: any) {
            console.error('Submit banner error:', err);
        } finally {
            isSubmitting.value = false;
        }
    };

    const isDeleteModalOpen = ref(false);
    const isDeleting = ref(false);
    const selectedBannerId = ref<string | null>(null);

    const openDeleteModal = (id: string) => {
        selectedBannerId.value = id;
        isDeleteModalOpen.value = true;
    };

    const confirmDeleteBanner = async () => {
        if (!selectedBannerId.value) return;

        isDeleting.value = true;
        try {
            await useApiFetch(`banner/banners/${selectedBannerId.value}`, {
                method: 'DELETE',
            });
            toast.add({ title: 'بنر با موفقیت حذف شد', color: 'success' });
            isDeleteModalOpen.value = false;
            await refreshBanners();
        } catch (err: any) {
            console.error('Delete error:', err);
        } finally {
            isDeleting.value = false;
            selectedBannerId.value = null;
        }
    };

    </script>
