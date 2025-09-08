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
            :loading="loading"
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
import type { FetchOptions } from 'ofetch';

interface LoginRes {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    _id?: string;
    name?: string;
    role?: string;
  };
}

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const config = useRuntimeConfig();

const loginSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد.'),
  password: z.string().min(6, 'کلمه عبور باید حداقل ۶ کاراکتر باشد.'),
});
type Schema = z.output<typeof loginSchema>;

const state = reactive<Schema>({ username: '', password: '' });
const loading = ref(false);

async function handleLogin(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    const options: FetchOptions = {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      body: state,
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
    };

    // useApiFetch فعلی شما فرض شده که Promise<LoginRes> برمی‌گرداند
    const res = await useApiFetch<LoginRes>('/auth/login', options);

    // اگر useApiFetch همان‌طور که گفتم فقط body را برمی‌گرداند:
    if (res?.success && res.token) {
      // فرض: authStore.setLoginData(token, user)
      authStore.setLoginData(res.token, res.user ?? { role: 'user' });

      toast.add({
        title: 'ورود موفق',
        description: res.message || 'شما با موفقیت وارد شدید.',
        color: 'success',
        icon: 'i-heroicons-check-circle',
      });

      // هدایت
      await router.push('/dashboard');
    } else {
      // پاسخ موفق نبود یا فرمت متفاوت است
      toast.add({
        title: 'خطا',
        description: res?.message || 'خطا در ورود — لطفاً دوباره تلاش کنید.',
        color: 'error',
      });
    }
  } catch (err: any) {
    // ofetch/FetchError معمولاً status را روی خطا دارد، اما برای ایمن بودن چند حالت را بررسی می‌کنیم
    const status = err?.status ?? err?.response?.status;
    if (status === 401) {
     
    } else {
      toast.add({
        title: 'خطای شبکه یا سرور',
        description: err?.data?.message || err?.message || 'خطایی رخ داد.',
        color: 'error',
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>
