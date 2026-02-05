<script setup>
import { ref } from 'vue';

const userUrl = ref('');
const output = ref('');

const submitUrl = () => {
  output.value = `Shortening: ${userUrl.value}`;
}

</script>
<template>
  <div>
    <h1>Shorl</h1>
    <input v-model="userUrl">
    <button @click="submitUrl">Short it</button>
    <p>{{ output }}</p>
  </div>
</template>
