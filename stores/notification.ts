import type { ToastProps } from '@nuxt/ui';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    function PushNotification(message: string, status:string) {
    const toast = useToast();
    
    toast.add({
      title: message,
      color: status == 'success' ? 'success' : 'error',
      duration: 3000,
    });
  }
  function CatchNotification() {
    const toast = useToast();
    toast.add({
      title: "مشکلی در درخواست پیش آمده",
      color: "success",
      duration: 3000,
    });
  }
  return { PushNotification , CatchNotification };
});
