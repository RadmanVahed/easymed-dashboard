<template>
   <UCard>
    <template #header>
        <div dir="rtl" class="flex justify-between">
            <h1>آخرین تیکت های دریافتی اپ پزشک</h1>
            <UButton>مشاهده بیشتر</UButton>
        </div>
    </template>
     <UTable dir="rtl" :data="data" class="flex-1" />
   </UCard>
</template>


<script setup lang="ts">
const data = ref([
  {
    username: 'dr.ashrafi',
    date: '2024-03-11T15:30:00',
    status: 'خوانده نشده',
    phone: '09130000000',
  },
  {
    username: 'dr.matinfar',
    date: '2024-03-11T10:10:00',
    status: 'خوانده نشده',
    phone: '09130000000',
  }
])
</script>