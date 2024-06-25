<route lang="yaml">
  meta:
    layout: main.layout
  </route>
  
<script setup lang="ts">

</script>
  
<template>
  <div>
    <n-h2>
      Management Pengguna
    </n-h2>
  </div>
  <div>
    <n-form>
      <n-form-item label="Name">
        <n-input />
      </n-form-item>
      <n-form-item label="Email">
        <n-input />
      </n-form-item>
      <n-form-item label="Role">
        <n-select></n-select>
      </n-form-item>
      <n-form-item label="Phone">
        <n-input />
      </n-form-item>
      <div class="flex gap-3">
        <n-button type="primary">
          Save
        </n-button>
        <n-button type="tertiary">
          Cancel
        </n-button>
      </div>
    </n-form>
  </div>
</template>
