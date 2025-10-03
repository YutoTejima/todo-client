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

interface UpdataTaskRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string;
  expiresAt: string;
  completedAt: string;
}

export class TaskRepository {
  private readonly baseUrl: string;
  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async createTask(createTaskRequest: CreateTaskRequest): Promise<TaskEntity> {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
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
      throw new Error('エラーが発生しました');
    }

    const data: TaskEntity = await response.json();
    return data;
  }

  public async getTasks(): Promise<TaskEntity[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks`, {
      headers: {
        Accept: 'application/json',
      },
    });
    const data: TaskEntity[] = await response.json();

    return data;
  }

  public async updataTask(taskId: string, updataTaskRequest: UpdataTaskRequest): Promise<TaskEntity> {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updataTaskRequest.title,
        description: updataTaskRequest.description,
        status: updataTaskRequest.status,
        priority: updataTaskRequest.priority || undefined,
        tags: updataTaskRequest.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        expiresAt: updataTaskRequest.expiresAt || undefined,
        completedAt: updataTaskRequest.completedAt || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error('エラーが発生しました');
    }

    const data: TaskEntity = await response.json();
    return data;
  }

  public async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('エラーが発生しました');
    }
  }
}
