<template>
    <div dir="rtl" class="flex justify-center items-center h-screen">

        <UCard class="w-1/3 h-fit">
            <template #header>
                <h1 class="text-lg text-center">ورود به پنل گزارشات ایزی مد</h1>
            </template>
            <UForm :state="state" class="space-y-4">
                <UFormField label="ایمیل" name="email">
                    <UInput class="w-full" v-model="state.email" required />
                </UFormField>

                <UFormField label="کلمه عبور" name="password">
                    <UInput class="w-full" v-model="state.password" type="password" required />
                </UFormField>
            </UForm>
            <template #footer>
                <UButton :loading="loading" @click="Submit()" block>
                    ورود
                </UButton>
            </template>
        </UCard>

    </div>


</template>

<script setup lang="ts">
import { ofetch } from "ofetch";
const state = reactive({
    email: undefined,
    password: undefined
})
const loading = ref(false)
const toast = useToast()
const router = useRouter()
async function Submit() {
    loading.value = true
    const res = await ofetch('https://easymed-dashboard.radmanvahed.workers.dev/api/auth/login', {
        method: 'post',
        body: state
    })
    loading.value = false
    toast.add({
        title: res.message,
        color: res.success ? 'success' : 'error'
    })
    if (res.success) {
        router.push('/dashboard')
    }
}
</script>