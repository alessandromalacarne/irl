<script setup lang="ts">
import api from '../composable/api.ts'
import { SendUrlResponse } from '../types.ts'

const userUrl = ref('');
const output = ref('');

const clickShort = async () => {
  const response: SendUrlResponse = await api.sendUrl(userUrl.value);
  localStorage.setItem(response.id, response.url);
  output.value = `Shortened ${userUrl.value} to ${response.id}`;
};

</script>

<template>
  <div>
    <h1>Shorl</h1>
    <form @submit.prevent="clickShort">
      <input v-model="userUrl" type="url" required placeholder="https://example.com">
      <button type="submit">Short it</button>
    </form>
    <p>{{ output }}</p>
  </div>
</template>
