import type { SafeUserEntity } from '@/entities/UserEntity';
import { AuthRepository } from '@/repositories/AuthRepository';
import { TaskRepository } from '@/repositories/TaskRepository';
import { ref } from 'vue';

const baseUrl = 'http://localhost:8787';
export const authRepository = new AuthRepository(baseUrl);
export const taskRepository = new TaskRepository(baseUrl);

// ユーザー情報を取得する
export const userStore = ref<SafeUserEntity>();

(async () => {
  userStore.value = await authRepository.me();
})();
