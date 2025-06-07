<template>
    <div dir="rtl" class="flex justify-center items-center h-screen">
        
            <UCard class="w-1/3 h-fit">
                <template #header>
                    <h1 class="text-lg text-center">ورود به پنل گزارشات ایزی مد</h1>
                </template>
                <UForm :state="state" class="space-y-4">
                    <UFormField label="ایمیل" name="email">
                        <UInput class="w-full" v-model="state.email" />
                    </UFormField>

                    <UFormField label="کلمه عبور" name="password">
                        <UInput class="w-full" v-model="state.password" type="password" />
                    </UFormField>
                </UForm>
                <template #footer>
                    <UButton @click="Submit()" block>
                        ورود
                    </UButton>
                </template>
            </UCard>
        
    </div>


</template>

<script setup lang="ts">
const state = reactive({
    email: undefined,
    password: undefined
})

async function Submit() {

}
</script>