<template>
  <UCard>
    <template #header>
      <div class="flex rtl justify-between items-center w-full">
        <div class="rtl">
          <h1 class="text-2xl font-bold">لیست ثبت نام پزشکان</h1>
        </div>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="outline"
          @click="fetchData()"
          :loading="loading"
        >
          بروزرسانی
        </UButton>
      </div>
    </template>

    <!-- فیلترها -->

    <template #default>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 rtl mt-4">
        <div class="flex gap-1">
            <UInput v-model="filters.firstName" placeholder="نام" class="w-full" />
        <UInput
          v-model="filters.lastName"
          placeholder="نام خانوادگی"
          class="w-full"
        />
        </div>
        <div class="flex gap-1">
            <UInput
          v-model="filters.phoneNumber"
          placeholder="شماره تماس"
          class="w-full"
        />
        <UInput
          v-model="filters.referralCode"
          placeholder="کد معرف"
          class="w-full"
        />
        <USelect
          v-model="filters.status"
          :items="['ثبت شده', 'تایید شده', 'رد شده']"
          placeholder="وضعیت"
          class="w-full"
        />
        </div>
        <div class="flex gap-1">
            <UButton
          label="اعمال فیلتر"
          block
          @click="fetchData"
          :loading="loading"
        />
        <UButton
          label="بازنشانی"
          block
          variant="outline"
          @click="clear"
          :loading="loading"
        />
        </div>
      </div>
      <div class="rtl mt-4">
        <UTable
          :data="data"
          :loading="loading"
          :columns="columns"
          class="flex-1 rtl"
        />
      </div>
    </template>
  </UCard>

  <!-- Modal تغییر وضعیت -->
  <UModal
    :open="modal"
    :close="{
      onClick: () => {
        modal = false;
      },
    }"
    class="rtl"
    :ui="{ header: 'rtl', footer: 'justify-end' }"
    :title="modalText"
  >
    <template #body>
      <USelect
        class="w-full mb-4"
        v-model="newStatus"
        :items="['ثبت شده', 'تایید شده', 'رد شده']"
      />
      <UButton
        label="ذخیره"
        block
        @click="changeStatus(selectedData?.id, newStatus)"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { h, resolveComponent, type DefineComponent } from "vue";
import type { ButtonProps, TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import moment from "jalali-moment";

type userType = {
  id: string;
  birthDate: string;
  status: string;
  firstName: string;
  lastName: string;
  medicalSystemNumber: string;
  nationalId: string;
  phoneNumber: string;
  registrationDate: string;
  referralCode: string;
};

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton") as DefineComponent<ButtonProps>;
const UDropdownMenu = resolveComponent("UDropdownMenu");
const toast = useToast();
const API_BASE = "https://easymed-doctor-app.radmanvahed.workers.dev";

const data = ref<userType[]>([]);
const loading = ref(false);
const modal = ref(false);
const modalText = ref("");
const selectedData = ref<userType>();
const newStatus = ref();

// فیلترها
const filters = ref({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  referralCode: "",
  status: "",
});
function clear() {
    filters.value = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  referralCode: "",
  status: "",
}
fetchData()
}
const fetchData = async () => {
  loading.value = true;
  const response = await fetch(`${API_BASE}/registrations`, {
    method: "POST",
    body: JSON.stringify({
      phoneNumber: filters.value.phoneNumber || undefined,
      firstName: filters.value.firstName || undefined,
      lastName: filters.value.lastName || undefined,
      referralCode: filters.value.referralCode || undefined,
      status: filters.value.status || undefined,
    }),
  });

  const result = await response.json();
  loading.value = false;
  data.value = result.data;
  console.log(data.value);
};

const changeStatus = async (id: any, status: any) => {
  loading.value = true;
  const response = await fetch(`${API_BASE}/update-registration-status`, {
    method: "POST",
    body: JSON.stringify({
      doctorId: id,
      newStatus: status,
    }),
  });

  const result = await response.json();
  loading.value = false;
  if (result.success) {
    toast.add({
      title: result.message,
      color: "success",
      duration: 3000,
    });
    modal.value = false;
    fetchData();
  } else {
    toast.add({
      title: "خطا در پردازش داده‌ها",
      color: "error",
      duration: 3000,
    });
  }
};

onMounted(() => {
  fetchData();
});

const columns: TableColumn<userType>[] = [
  { accessorKey: "firstName", header: "نام" },
  { accessorKey: "lastName", header: "نام خانوادگی" },
  { accessorKey: "nationalId", header: "کد ملی" },
  { accessorKey: "phoneNumber", header: "شماره تماس" },
  { accessorKey: "birthDate", header: "تاریخ تولد" },
  {
    accessorKey: "registrationDate",
    header: "تاریخ ثبت درخواست",
    cell: ({ row }) =>
      moment(row.original.registrationDate)
        .locale("fa")
        .format("YYYY/MM/DD HH:mm"),
  },
  {
    accessorKey: "referralCode",
    header: "کد معرف",
    cell: ({ row }) =>
      !row.original.referralCode ? "ندارد" : row.original.referralCode,
  },
  {
    accessorKey: "status",
    header: "وضعیت",
    cell: ({ row }) => {
      const color = {
        "انجام شده": "success" as const,
        "رد شده": "error" as const,
        "ثبت شده": "info" as const,
        "تایید شده": "success" as const,
      }[row.getValue("status") as string];
      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("status")
      );
    },
  },
  {
    id: "actions",
    header: "عملیات",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            })
        )
      ),
  },
];

function getRowItems(row: Row<any>) {
  const request = row.original;
  return [
    {
      label: "تغییر وضعیت",
      icon: "i-lucide-pen",
      onSelect() {
        modal.value = true;
        modalText.value = "تغییر وضعیت ثبت نام";
        selectedData.value = request;
        newStatus.value = request.status;
      },
    },
  ];
}
</script>
