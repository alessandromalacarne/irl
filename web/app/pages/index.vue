<script setup>
import shorten from '../composable/shortener.ts'

const userUrl = ref('');
const output = ref('');

const clickShort = () => {
  const shortenResult = shorten(userUrl.value);
  output.value = shortenResult;
};

</script>

<template>
  <div>
    <h1>Shorl</h1>
    <input v-model="userUrl">
    <button @click="clickShort">Short it</button>
    <p>{{ output }}</p>
  </div>
</template>
