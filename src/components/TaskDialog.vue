<script lang="ts" setup>
import type { TaskEntity } from '@/entities/TaskEntity';
import { reactive, watch } from 'vue';

const taskForm = reactive({
  title: '',
  description: '',
  status: '',
  priority: '',
  tags: '',
  expiresAt: '',
  completedAt: '',
});

// プロパティの定義
const props = defineProps<{
  task: TaskEntity;
}>();

watch(
  props,
  newProps => {
    taskForm.title = newProps.task.title;
    taskForm.description = newProps.task.description ?? '';
    taskForm.status = newProps.task.status;
    taskForm.priority = newProps.task.priority ?? '';
    taskForm.tags = newProps.task.tags.join(',');
    taskForm.expiresAt = newProps.task.expiresAt ?? '';
    taskForm.completedAt = newProps.task.completedAt ?? '';
  },
  { immediate: true },
);

// イベントの定義
const emits = defineEmits<{
  (event: 'close'): void;
}>();

function onClose() {
  emits('close');
  console.log(new Date());
}
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.title">タスクを更新する</h1>
    <button type="button" aria-label="閉じる" @click="onClose">×</button>
    <form :class="$style.form">
      <label :class="$style.label">
        タイトル
        <input type="text" :class="$style.input" placeholder="タスク名" v-model="taskForm.title" />
      </label>

      <pre>{{ taskForm }}</pre>

      <label :class="$style.label">
        ディスクリプション
        <textarea :class="$style.input" placeholder="説明文" rows="3" v-model="taskForm.description"></textarea>
      </label>

      <label :class="$style.label">
        ステータス
        <select :class="$style.input" v-model="taskForm.status">
          <option value="pending">未着手</option>
          <option value="in_progress">進行中</option>
          <option value="completed">完了</option>
          <option value="cancelled">キャンセル</option>
        </select>
      </label>

      <label :class="$style.label">
        優先度
        <select :class="$style.input" v-model="taskForm.priority">
          <option value="">-</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="urgent">緊急</option>
        </select>
      </label>

      <label :class="$style.label">
        タグ
        <input type="text" :class="$style.input" placeholder="タグ名" v-model="taskForm.tags" />
      </label>

      <label :class="$style.label">
        期限
        <input type="date" :class="$style.input" v-model="taskForm.expiresAt" />
      </label>

      <label :class="$style.label">
        終了日
        <input type="date" :class="$style.input" v-model="taskForm.completedAt" />
      </label>

      <button type="button" :class="[$style.button, $style.primary]">更新</button>

      <button type="button" :class="[$style.button, $style.secondary]" @click="onClose">キャンセル</button>

      <p v-if="false" :class="$style.successMessage">タスクを更新しました</p>
      <p v-if="false" :class="$style.errorMessage">タスクの更新に失敗しました</p>
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
  margin-top: 0.5rem;

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.primary {
  background: #2563eb;
  color: #ffffff;

  &:hover {
    background: #1d4ed8;
  }
}

.secondary {
  background: #f3f4f6;
  color: #111827;
  border-color: #e5e7eb;

  &:hover {
    background: #e5e7eb;
  }
}

/* 並び調整: ボタンの間隔 */
.button + .button {
  margin-left: 0.5rem;
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
