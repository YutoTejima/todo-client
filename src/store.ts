import { TaskRepository } from '@/repositories/TaskRepository';

export const taskRepository = new TaskRepository('http://localhost:8787');
