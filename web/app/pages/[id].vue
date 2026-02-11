<script setup lang="ts">
import db from '../composable/db.ts'
const route = useRoute()

if (process.client) {
  const url = localStorage.getItem(route.params.id);
  navigateTo(url, { external: true });
}

</script>


<template>
</template>
