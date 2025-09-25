/**
 * サーバーと Task のやり取りを担当するクラス
 */

import type { TaskEntity } from '@/entities/TaskEntity';

interface CreateTaskRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string;
  expiresAt: string;
  completedAt: string;
}

export class TaskRepository {
  public async createTask(createTaskRequest: CreateTaskRequest): Promise<TaskEntity | null> {
    const response = await fetch('http://localhost:8787/api/v1/tasks', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: createTaskRequest.title,
        description: createTaskRequest.description,
        status: createTaskRequest.status,
        priority: createTaskRequest.priority || undefined,
        tags: createTaskRequest.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        expiresAt: createTaskRequest.expiresAt || undefined,
        completedAt: createTaskRequest.completedAt || undefined,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data: TaskEntity = await response.json();
    return data;
  }

  public async getTasks(): Promise<TaskEntity[]> {
    const response = await fetch('http://localhost:8787/api/v1/tasks', {
      headers: {
        Accept: 'application/json',
      },
    });
    const data: TaskEntity[] = await response.json();

    return data;
  }
}
