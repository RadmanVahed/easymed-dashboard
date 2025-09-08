import type { UseFetchOptions } from 'nuxt/app';
import { defu } from 'defu';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

export function useApiFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const router = useRouter();
  const config = useRuntimeConfig();

  const apiBaseUrl = config.public.apiBaseUrl;

  const defaults: UseFetchOptions<T> = {
    baseURL: apiBaseUrl,
    key: options.method === 'GET' || !options.method ? url : undefined,

    onRequest({ options }) {
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

  return useFetch(url, params)
}
