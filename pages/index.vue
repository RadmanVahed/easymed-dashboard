<template>
    <UContainer>
        <div dir="rtl" class="flex justify-center items-center min-h-screen">
            <UCard class="w-full max-w-sm">
                <template #header>
                    <h1 class="text-xl font-bold text-center">ورود به پنل ایزی مد</h1>
                </template>

                <UForm :schema="loginSchema" :state="state" class="space-y-4" @submit="handleLogin">
                    <UFormField class="w-full" label="نام کاربری" name="username" required>
                        <UInput 
                            class="w-full"
                            v-model="state.username" 
                            placeholder="نام کاربری خود را وارد کنید"
                            icon="i-heroicons-user"
                            size="lg"
                            autocomplete="username"
                        />
                    </UFormField>

                    <UFormField class="w-full" label="کلمه عبور" name="password" required>
                        <UInput 
                            class="w-full"
                            v-model="state.password" 
                            type="password"
                            placeholder="کلمه عبور خود را وارد کنید"
                            icon="i-heroicons-lock-closed"
                            size="lg"
                            autocomplete="current-password"
                        />
                    </UFormField>
                    
                    <UButton 
                        type="submit" 
                        :loading="status === 'pending'" 
                        block 
                        label="ورود"
                        size="lg"
                    />
                </UForm>
            </UCard>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { LoginRes } from "~/models/login";


const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const loginSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد.'),
  password: z.string().min(6, 'کلمه عبور باید حداقل ۶ کاراکتر باشد.'),
});

type Schema = z.output<typeof loginSchema>;

const state = reactive<Schema>({
    username: '',
    password: ''
});

// --- ✨ تغییر کلیدی اینجاست ✨ ---
// ۱. متد POST را در تعریف اولیه useApiFetch مشخص می‌کنیم.
// ۲. body را به state فرم متصل می‌کنیم. Nuxt به صورت خودکار تغییرات state را دنبال می‌کند.
const { execute, status, data, error } = useApiFetch<LoginRes>('/auth/login', {
    method: 'POST',
    body: state, // اتصال مستقیم body به state فرم
    
    immediate: false,
    watch: false, // watch را false می‌گذاریم تا فقط با execute اجرا شود

    // ۳. (اختیاری ولی به شدت توصیه شده) منطق موفقیت را به onResponse منتقل می‌کنیم
    onResponse({ response }) {
        // این هوک فقط در پاسخ‌های موفق (2xx) اجرا می‌شود
        if (response._data?.success && response._data.token) {
            const loginData = response._data;
            
            // ذخیره توکن
            authStore.setLoginData(loginData.token, 'admin');

            // نمایش پیغام موفقیت
            toast.add({
                title: 'ورود موفق',
                description: loginData.message || 'شما با موفقیت وارد شدید.',
                color: 'success',
                icon: 'i-heroicons-check-circle',
            });

            // هدایت کاربر
            // نکته: ریدایرکت در onResponse بهتر است با nextTick انجام شود
            // تا از اجرای آن در حین رندر کامپوننت جلوگیری شود.
            nextTick(() => {
                router.push('/dashboard');
            });
        }
    },
    // منطق خطا همچنان در onResponseError کامپوزبل شما مدیریت می‌شود
});

// --- تابع لاگین بسیار ساده‌تر می‌شود ---
async function handleLogin(event: FormSubmitEvent<Schema>) {
    // `state` ما از قبل با داده‌های فرم از طریق `v-model` به‌روز شده است.
    // و `useApiFetch` از قبل به `state` متصل است.
    // پس فقط کافی است execute را بدون هیچ پارامتری فراخوانی کنیم!
    await execute();

    // تمام منطق موفقیت و خطا در هوک‌های onResponse و onResponseError مدیریت می‌شود.
    // این تابع اکنون فقط یک وظیفه دارد: شروع کردن درخواست.
}
</script>
