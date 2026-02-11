<script setup lang="ts">
import db from '../composable/db.ts'
const route = useRoute()

if (process.client) {
  const url = localStorage.getItem(route.params.id);
  console.log(url);
}

</script>


<template>
</template>
