<script lang="ts" setup>
import TaskDialog, { type TaskForm } from '@/components/TaskDialog.vue';
import type { TaskEntity } from '@/entities/TaskEntity';
import { taskRepository } from '@/store';
import { ref, computed } from 'vue';

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle');
const errorMessage = ref('');
const tasks = ref<TaskEntity[]>([]);

// フィルタ
const filter = ref<'all' | TaskEntity['status']>('all');
function setFilter(f: 'all' | TaskEntity['status']) {
  filter.value = f;
}
const filteredTasks = computed(() =>
  filter.value === 'all' ? tasks.value : tasks.value.filter(task => task.status === filter.value),
);

/** 最後に編集ボタンが押された対象のタスク */
const selectedTask = ref<TaskEntity>();

async function openDialog(task: TaskEntity) {
  isDialogOpened.value = true;

  // 選択されたタスクを記憶しておく
  selectedTask.value = task;
}

async function deleteTask(taskId: string) {
  try {
    await taskRepository.deleteTask(taskId);
    const taskIndex = tasks.value.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      tasks.value.splice(taskIndex, 1);
    }
  } catch {}
}

async function getTasks() {
  status.value = 'pending';
  tasks.value = await taskRepository.getTasks();

  status.value = 'success';
}

getTasks();

async function updataTask(task: TaskForm) {
  // 選択されたタスクがない場合は何もしない
  if (!selectedTask.value) {
    return;
  }

  // サーバーのタスクを更新する
  const updatedTask = await taskRepository.updataTask(selectedTask.value.id, task);

  // 更新したタスクを配列に反映する
  const taskIndex = tasks.value.findIndex(task => task.id === updatedTask.id);

  if (taskIndex !== -1) {
    tasks.value[taskIndex] = updatedTask;
  }

  // ダイアログを閉じる
  isDialogOpened.value = false;

  // タスクを未選択状態にする
  selectedTask.value = undefined;
}

const STATUS_LABEL: Record<TaskEntity['status'], string> = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル',
};
function statusLabel(s: TaskEntity['status']) {
  return STATUS_LABEL[s];
}

const counts = computed(() =>
  tasks.value.reduce(
    (acc, task) => {
      acc[task.status]++;
      acc.all++;
      return acc;
    },
    { pending: 0, in_progress: 0, completed: 0, cancelled: 0, all: 0 },
  ),
);

const isDialogOpened = ref(false);

function closeDialog() {
  isDialogOpened.value = false;
}
</script>

<template>
  <div v-if="isDialogOpened && selectedTask" :class="$style.modalOverlay">
    <TaskDialog @accept="updataTask" @cancel="closeDialog" :task="selectedTask" />
  </div>
  <div :class="$style.container">
    <div :class="$style.headerBar">
      <h1 :class="$style.title">タスク一覧</h1>
      <RouterLink to="/add-task" :class="[$style.button, $style.primary]"> 新規作成 </RouterLink>
    </div>

    <div v-if="status === 'success'" :class="$style.filters">
      <button type="button" :class="[$style.chip, filter === 'all' && $style.chipActive]" @click="setFilter('all')">
        すべて ({{ counts.all }})
      </button>
      <button
        type="button"
        :class="[$style.chip, $style.status_pending, filter === 'pending' && $style.chipActive]"
        @click="setFilter('pending')"
      >
        未着手 ({{ counts.pending }})
      </button>
      <button
        type="button"
        :class="[$style.chip, $style.status_in_progress, filter === 'in_progress' && $style.chipActive]"
        @click="setFilter('in_progress')"
      >
        進行中 ({{ counts.in_progress }})
      </button>
      <button
        type="button"
        :class="[$style.chip, $style.status_completed, filter === 'completed' && $style.chipActive]"
        @click="setFilter('completed')"
      >
        完了 ({{ counts.completed }})
      </button>
      <button
        type="button"
        :class="[$style.chip, $style.status_cancelled, filter === 'cancelled' && $style.chipActive]"
        @click="setFilter('cancelled')"
      >
        キャンセル ({{ counts.cancelled }})
      </button>
    </div>

    <p v-if="status === 'pending'" :class="$style.info">読み込み中...</p>
    <p v-else-if="status === 'error'" :class="$style.error">読み込みに失敗しました: {{ errorMessage }}</p>

    <template v-if="status === 'success'">
      <p v-if="filteredTasks.length === 0" :class="$style.empty">
        条件に一致するタスクがありません。
        <RouterLink to="/add-task" :class="[$style.button, $style.ghost, $style.small]">新規作成</RouterLink>
      </p>

      <ul v-else :class="$style.list">
        <li v-for="task in filteredTasks" :key="task.id" :class="[$style.card, $style['accent_' + task.status]]">
          <div :class="$style.cardHeader">
            <div :class="$style.titleRow">
              <h2 :class="$style.cardTitle">{{ task.title }}</h2>
            </div>
            <div :class="$style.metaRow">
              <span :class="[$style.badge, $style['status_' + task.status]]">{{ statusLabel(task.status) }}</span>
              <div :class="$style.actions">
                <button type="button" :class="[$style.button, $style.primary, $style.small]" @click="openDialog(task)">
                  編集
                </button>
                <button
                  type="button"
                  :class="[$style.button, $style.danger, $style.small]"
                  @click="deleteTask(task.id)"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
          <p v-if="task.description" :class="$style.description">{{ task.description }}</p>
          <div v-if="task.tags?.length" :class="$style.tags">
            <span v-for="tag in task.tags" :key="tag" :class="$style.tag">#{{ tag }}</span>
          </div>
        </li>
      </ul>
    </template>
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

.headerBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 24px;
  margin: 0 0 0.5rem 0;
  text-align: left;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-start;
  margin-bottom: 0.75rem;
}

.empty {
  color: #6b7280;
  font-weight: 600;
  margin-top: 0.5rem;
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
  border-left: 4px solid transparent;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
}

/* 左アクセント（ステータス別） */
.accent_pending {
  border-left-color: #e5e7eb;
}
.accent_in_progress {
  border-left-color: #38bdf8;
}
.accent_completed {
  border-left-color: #34d399;
}
.accent_cancelled {
  border-left-color: #fca5a5;
}

.cardHeader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.titleRow {
  display: flex;
  align-items: center;
}

.metaRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cardMeta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.cardHeader .button {
  margin-top: 0;
}

.cardTitle {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.description {
  margin: 0.5rem 0 0;
  color: var(--color-text);
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  white-space: nowrap;
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
  white-space: nowrap;

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.small {
  padding: 0.375rem 0.75rem;
  font-size: 13px;
}

.primary {
  background: #2563eb;
  color: #ffffff;
  border-color: #1d4ed8;
}
.primary:hover {
  background: #1d4ed8;
}

.danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}
.danger:hover {
  background: #fecaca;
}

.ghost {
  background: transparent;
  color: #2563eb;
  border-color: #93c5fd;
}
.ghost:hover {
  background: #eff6ff;
}

/* フィルタ用チップ */
.chip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.chip:hover {
  background: #f9fafb;
}
.chipActive {
  box-shadow: inset 0 0 0 1px currentColor;
}

/* 右端のボタン枠（更新・削除） */
.actions {
  display: flex;
  gap: 0.5rem;
  justify-self: end;
  white-space: nowrap;
}

/* モーダルの見た目（オーバーレイ＋中央寄せ） */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem; /* 画面が狭い時の余白確保 */
  z-index: 1000; /* リストより前面に */
}
</style>
