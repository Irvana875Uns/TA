<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <n-config-provider :theme-overrides="{
    common: {
      primaryColor: '#1c2142',
      primaryColorHover: '#1c2142',
      primaryColorPressed: '#1c2142',
    },
    Layout: {
      color: 'rgba(255, 255, 255, 1)',
      siderColor: 'rgba(28, 33, 66, 1)',
    },
    Menu: {
      itemIconColorHover: 'rgba(255, 255, 255, 0.9)',
      itemTextColorActive: '#00000',
      itemTextColorActiveHorizontal: 'rgba(255, 255, 255, 0.9)',
      itemColorActiveCollapsed: 'rgba(36, 19, 131, 0.15)',
      itemIconColorHorizontal: 'rgba(4, 0, 0, 0.9)',
      itemIconColorCollapsed: 'rgba(22, 1, 1, 0.9)',
      itemColorActiveInverted: 'rgba(27, 28, 28, 1)',
      itemTextColor: '#fff',
      itemIconColor: '#fff',
      itemIconColorActive: '#fff',
      itemTextColorHover: 'rgba(255, 255, 255, 0.9)',
      itemTextColorActiveHover: 'rgba(255, 255, 255, 0.9)',
      itemColorActive: 'rgba(36, 19, 131, 0.15)',
      itemTextColorChildActive: 'rgba(255, 255, 255, 0.9)',
      itemIconColorChildActiveHorizontal: 'rgba(255, 255, 255, 0.9)',
      itemIconColorChildActive: 'rgba(255, 255, 255, 0.9)',
    }
  }" preflight-style-disabled>
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>
