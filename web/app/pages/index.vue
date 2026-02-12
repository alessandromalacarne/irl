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
    <form @submit.prevent="clickShort">
      <input v-model="userUrl" type="url" required placeholder="https://example.com">
      <button type="submit">Short it</button>
    </form>
    <p>{{ output }}</p>
  </div>
</template>
