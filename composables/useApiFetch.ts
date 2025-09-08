// composables/useApiFetch.ts

// ✨ 1. این تایپ را از ofetch ایمپورت کنید
import type { FetchOptions } from 'ofetch';
import { defu } from 'defu';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

export function useApiFetch<T>(
  url: string,
  // ✨ 2. اینجا از FetchOptions به جای UseFetchOptions استفاده کنید
  options: FetchOptions = {}
) {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const router = useRouter();
  const config = useRuntimeConfig();

  const apiBaseUrl = config.public.apiBaseUrl;

  // ✨ 3. نوع defaults را هم به FetchOptions تغییر دهید
  const defaults: FetchOptions = {
    baseURL: apiBaseUrl,

    onRequest({ options }) {
      console.log(authStore.token);
      
      if (authStore.token) {
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', `Bearer ${authStore.token}`);
      }
    },

    onRequestError({ error }) {
      notificationStore.PushNotification(`خطای شبکه: ${error.message}`, 'error');
    },

    onResponseError({ response }) {
      const status = response.status;
      const data = response._data;

      if (status === 422) {
        notificationStore.PushNotification(data?.message || 'اطلاعات وارد شده معتبر نیست.', 'error');
        return;
      }

      if (status === 401 || status === 403) {
        notificationStore.PushNotification(data?.message || 'شما دسترسی لازم برای این عملیات را ندارید.', 'error');
     
        authStore.logout();
        router.push('/');
        return;
      }

      const errorMessage = data?.message || 'مشکلی در سمت سرور رخ داده است.';
      notificationStore.PushNotification(errorMessage, 'error');
    },
  };

  const params = defu(options, defaults);

  return $fetch<T>(url, params as unknown as Record<string, unknown>);

}
