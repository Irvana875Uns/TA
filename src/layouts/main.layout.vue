<script setup lang="ts">
import { h, type Component } from 'vue'
import { NIcon } from 'naive-ui'
import { PeopleOutline, HomeOutline, LayersOutline, DocumentOutline, Document } from '@vicons/ionicons5'
import { useHttp } from '@/composables/http/http'
import { type ProfileResponse } from '@/types/profile'
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const { data } = useHttp<ProfileResponse>('profile')

const { data: profile } = useHttp<ProfileResponse>('/profile')

const menuOptions = computed(() => [
  {
    label: 'Beranda',
    key: '/dashboard',
    show: ['admin', 'admin_unit', 'operator'].includes(profile.value?.data?.role as string),
    icon: renderIcon(HomeOutline)
  },
  {
    label: 'Manajement',
    key: '/management',
    show: ['admin', 'admin_unit', 'operator'].includes(profile.value?.data?.role as string),
    icon: renderIcon(PeopleOutline),
    children: [
      {
        label: 'Admin',
        show: ['admin'].includes(profile.value?.data?.role as string),
        key: '/management/admin'
      },
      {
        label: 'Operator',
        show: ['admin'].includes(profile.value?.data?.role as string),
        key: '/management/operator'
      },
      {
        label: 'Admin Unit',
        show: ['admin', 'operator'].includes(profile.value?.data?.role as string),
        key: '/management/admin-unit'
      },
      {
        label: 'Petugas',
        show: ['admin', 'admin_unit'].includes(profile.value?.data?.role as string),
        key: '/management/staff'
      },
      {
        label: 'User',
        show: ['admin'].includes(profile.value?.data?.role as string),
        key: '/management/user'
      }
    ]
  },
  {
    label: 'Laporan',
    icon: renderIcon(DocumentOutline),
    show: ['petugas'].includes(profile.value?.data?.role as string),
    key: '/report'
  },
  {
    label: 'Data',
    show: ['admin'].includes(profile.value?.data?.role as string),
    icon: renderIcon(LayersOutline),
    children: [
      {
        label: 'Fakultas',
        role: ['admin'],
        key: '/faculty'
      },
      {
        label: 'Jenis Pengaduan',
        role: ['admin'],
        key: '/report-types'
      },
      {
        label: 'Kelas Bahaya',
        role: ['admin'],
        key: '/danger-level'
      }
    ]
  },
  {
    label: 'Tambah Laporan',
    key: '/reports',
    show: ['admin_unit'].includes(profile.value?.data?.role as string),
    icon: renderIcon(DocumentOutline)
  }
])

const width = ref(240)

onMounted(() => {
  window.addEventListener('resize', () => {
    if (window.innerWidth > 540) {
      width.value = 240
    }
    if (window.innerWidth < 540) {
      width.value = 0
    }
  })
})

const options = [
  // {
  //   label: 'Profile',
  //   key: 'profile'
  // },
  {
    label: 'Logout',
    key: '/auth/logout'
  }
]

const showSidebar = ref(false)
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout has-sider>
        <n-layout-sider
          bordered
          collapse-mode="width"
          :collapsed="showSidebar"
          :collapsed-width="64"
          :width="240"
          :native-scrollbar="false"
          style="min-height: 100vh"
          class="bg-primary !w-full"
        >
          <div class="h-16 flex items-center bg-primary">
            <div class="mx-auto max-w-10 flex items-center gap-3 font-bold text-zinc-100">
              SIGAP
            </div>
          </div>
          <n-menu
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :collapsed="showSidebar"
            :options="menuOptions"
            @update:value="(v) => $router.push(v)"
            class="bg-primary"
          />
        </n-layout-sider>
        <n-layout style="min-height: 100vh" class="relative">
          <div class="sticky w-full inset-x-0 h-16 z-40 border-b">
            <div class="flex justify-between items-center h-16 px-5 bg-primary">
              <div>
                <n-button class="text-black" @click="showSidebar = !showSidebar">
                  <n-icon class="!text-white">
                    <i-mdi-menu></i-mdi-menu>
                  </n-icon>
                </n-button>
              </div>
              <div>
                <n-dropdown :options="options" @select="(v) => $router.push(v)">
                  <n-button class="primary !text-white">{{ data?.data.name }}</n-button>
                </n-dropdown>
              </div>
            </div>
          </div>
          <main class="p-5">
            <router-view />
          </main>
        </n-layout>
      </n-layout>
    </n-layout>
  </n-space>
</template>
