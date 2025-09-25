<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';

interface TaskEntity {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  expiresAt?: string;
  completedAt?: string;
}

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle');
const errorMessage = ref('');
const tasks = ref<TaskEntity[]>([]);

async function loadTasks() {
  status.value = 'pending';
  errorMessage.value = '';
  try {
    const res = await fetch('http://localhost:8787/api/v1/tasks', {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    tasks.value = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    status.value = 'success';
  } catch (e: any) {
    status.value = 'error';
    errorMessage.value = e?.message ?? '読み込みに失敗しました';
  }
}

onMounted(loadTasks);

function statusLabel(s: TaskEntity['status']) {
  return s === 'pending' ? '未着手' : s === 'in_progress' ? '進行中' : s === 'completed' ? '完了' : 'キャンセル';
}

const counts = computed(() => {
  const c = { pending: 0, in_progress: 0, completed: 0, cancelled: 0, all: 0 };
  for (const t of tasks.value) {
    if (t.status === 'pending') c.pending++;
    else if (t.status === 'in_progress') c.in_progress++;
    else if (t.status === 'completed') c.completed++;
    else if (t.status === 'cancelled') c.cancelled++;
  }
  c.all = tasks.value.length;
  return c;
});
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.title">タスク一覧</h1>

    <div v-if="status === 'success'" :class="$style.stats">
      <span :class="[$style.badge, $style.status_pending]">未着手: {{ counts.pending }}</span>
      <span :class="[$style.badge, $style.status_in_progress]">進行中: {{ counts.in_progress }}</span>
      <span :class="[$style.badge, $style.status_completed]">完了: {{ counts.completed }}</span>
      <span :class="[$style.badge, $style.status_cancelled]">キャンセル: {{ counts.cancelled }}</span>
      <span :class="$style.total">合計: {{ counts.all }}</span>
    </div>

    <p v-if="status === 'pending'" :class="$style.info">読み込み中...</p>
    <p v-else-if="status === 'error'" :class="$style.error">読み込みに失敗しました: {{ errorMessage }}</p>
    <p v-else-if="status === 'success' && tasks.length === 0" :class="$style.info">タスクはありません</p>

    <ul v-if="status === 'success' && tasks.length > 0" :class="$style.list">
      <li v-for="t in tasks" :key="t.id" :class="$style.card">
        <div :class="$style.cardHeader">
          <h2 :class="$style.cardTitle">{{ t.title }}</h2>
          <span :class="[$style.badge, $style['status_' + t.status]]">{{ statusLabel(t.status) }}</span>
        </div>
        <p v-if="t.description" :class="$style.description">{{ t.description }}</p>
        <div v-if="t.tags?.length" :class="$style.tags">
          <span v-for="tag in t.tags" :key="tag" :class="$style.tag">#{{ tag }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" module>
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 24px;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.total {
  font-weight: 700;
  color: #374151;
  align-self: center;
}

.info {
  color: #6b7280;
  font-weight: 600;
  margin-top: 0.5rem;
}

.error {
  color: #dc2626;
  font-weight: 600;
  margin-top: 0.5rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  background: var(--color-background);
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cardTitle {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.description {
  margin: 0.5rem 0 0;
  color: var(--color-text);
  opacity: 0.9;
}

.tags {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

/* status */
.status_pending {
  background: #f3f4f6;
  color: #111827;
  border-color: #e5e7eb;
}
.status_in_progress {
  background: #e0f2fe;
  color: #075985;
  border-color: #bae6fd;
}
.status_completed {
  background: #dcfce7;
  color: #065f46;
  border-color: #bbf7d0;
}
.status_cancelled {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}
</style>
