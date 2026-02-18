<script setup lang="ts">
const route = useRoute()

if (process.client) {
  const url = localStorage.getItem(route.params.id);
  navigateTo(url, { external: true });
}

</script>


<template>
</template>
