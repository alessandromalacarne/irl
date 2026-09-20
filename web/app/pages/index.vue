<script setup lang="ts">
import { ref } from "vue"
import api from '../composable/api.ts'
import type { SendUrlResponse } from '../../types.ts'

const userUrl = ref('');
const output = ref('');

const clickShort = async () => {
  try {
    const response: SendUrlResponse = await api.sendUrl(userUrl.value);
    output.value = `Shortened ${response.url} to ${response.id}`;
  } catch {
    output.value = 'Could not shorten the url. Try again.';
  }
};

</script>

<template>
  <div>
    <h1>Irl</h1>
    <form @submit.prevent="clickShort">
      <input v-model="userUrl" type="text" inputmode="url" required placeholder="google.com">
      <button type="submit">Short it</button>
    </form>
    <p>{{ output }}</p>
  </div>
</template>
