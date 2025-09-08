import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<any | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name);

  function setLoginData(newToken: string, newUser: any) {
    user.value = newUser;
    token.value = newToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', newToken);
      localStorage.setItem('auth-user', JSON.stringify(newUser));
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
    }
  }

  function initializeStore() {
    token.value = localStorage.getItem('auth-token')
  }


  function tryToLoadAuthDataFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth-token');
      const savedUser = localStorage.getItem('auth-user');

      if (savedToken) {
        token.value = savedToken;
      }
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser);
        } catch (e) {
          console.error('Failed to parse user data from localStorage', e);
          user.value = null;
        }
      }
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userName,
    setLoginData,
    logout,
    tryToLoadAuthDataFromLocalStorage,
    initializeStore
  };
});
