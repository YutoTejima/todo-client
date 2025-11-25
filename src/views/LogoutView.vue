<script lang="ts" setup>
import { authRepository, userStore } from '@/store';
import { useRouter } from 'vue-router';

const router = useRouter();

(async () => {
  await authRepository.logout();
  userStore.value = undefined;
  await router.push('/login');
})();
</script>

<template>
  <p>安全にログアウトしています...</p>
</template>
