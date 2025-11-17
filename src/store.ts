import { AuthRepository } from '@/repositories/AuthRepository';
import { TaskRepository } from '@/repositories/TaskRepository';

const baseUrl = 'http://localhost:8787';
export const authRepository = new AuthRepository(baseUrl);
export const taskRepository = new TaskRepository(baseUrl);
