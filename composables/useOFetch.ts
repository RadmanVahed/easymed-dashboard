import { ofetch } from 'ofetch'
import type { UseFetchOptions } from 'nuxt/app';
import { useRuntimeConfig, useState } from '#imports'

export function useOFetch<T>(url: string,
    options: UseFetchOptions<T> = {}) {
    const config = useRuntimeConfig()
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();
    const router = useRouter();
    const customFetch = ofetch.create({
        baseURL: config.public.apiBaseUrl || 'http://localhost:3000/api',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
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
    })

    return customFetch
}
