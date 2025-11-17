<script setup lang="ts">
import { authRepository } from '@/store';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
  email: '',
  password: '',
});

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle');
const errorMessage = ref<string>('');

async function signup() {
  // バリデーション
  if (form.email.length < 1 || form.email.length > 255) {
    status.value = 'error';
    errorMessage.value = 'メールアドレスは1文字以上255文字以下で入力してください';
    return;
  }

  if (form.password.length < 8 || form.password.length > 255) {
    status.value = 'error';
    errorMessage.value = 'パスワードは8文字以上255文字以下で入力してください';
    return;
  }

  status.value = 'pending';
  errorMessage.value = '';

  try {
    await authRepository.signup(form.email, form.password);
    status.value = 'success';

    await router.push('/login');
  } catch (error) {
    status.value = 'error';
    errorMessage.value = error instanceof Error ? error.message : 'サインアップに失敗しました';
  }
}

function clearForm() {
  form.email = '';
  form.password = '';
  status.value = 'idle';
  errorMessage.value = '';
}
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.title">サインアップ</h1>
    <form :class="$style.form">
      <label :class="$style.label">
        メールアドレス
        <input
          type="email"
          :class="$style.input"
          placeholder="example@example.com"
          v-model="form.email"
          :disabled="status === 'pending'"
        />
      </label>

      <label :class="$style.label">
        パスワード
        <input
          type="password"
          :class="$style.input"
          placeholder="8文字以上のパスワード"
          v-model="form.password"
          :disabled="status === 'pending'"
        />
      </label>

      <div :class="$style.buttonGroup">
        <button type="button" :class="[$style.button, $style.primary]" @click="signup" :disabled="status === 'pending'">
          サインアップ
        </button>

        <button type="button" :class="[$style.button, $style.secondary]" @click="clearForm">クリア</button>
      </div>

      <p v-if="status === 'success'" :class="$style.successMessage">サインアップが完了しました</p>
      <p v-if="status === 'error'" :class="$style.errorMessage">
        {{ errorMessage }}
      </p>
    </form>
  </div>
</template>

<style lang="scss" module>
.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 24px;
  margin-bottom: 2rem;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.buttonGroup {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.button {
  padding: 0.75rem 1rem;
  border: 1px solid transparent;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  flex: 1;

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.primary {
  background: #2563eb;
  color: #ffffff;

  &:hover:not([disabled]) {
    background: #1d4ed8;
  }
}

.secondary {
  background: #f3f4f6;
  color: #111827;
  border-color: #e5e7eb;

  &:hover:not([disabled]) {
    background: #e5e7eb;
  }
}

.successMessage {
  color: #059669;
  font-weight: 600;
  margin-top: 0.5rem;
}

.errorMessage {
  color: #dc2626;
  font-weight: 600;
  margin-top: 0.5rem;
}
</style>
