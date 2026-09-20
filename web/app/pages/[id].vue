<script setup lang="ts">
import { onMounted, ref } from "vue"
import axios from "axios"
import api from '../composable/api.ts'

const route = useRoute()
const notFound = ref(false);
const failed = ref(false);

onMounted(async () => {
  try {
    const response = await api.resolveUrl(route.params.id as string)
    await navigateTo(response.url, { external: true });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound.value = true;
      return;
    }

    failed.value = true;
  }
});

</script>

<template>
  <div>
    <p v-if="notFound">Short url not found.</p>
    <p v-else-if="failed">Could not resolve the short url. Try again.</p>
    <p v-else>Redirecting...</p>
  </div>
</template>
