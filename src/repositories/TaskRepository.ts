/**
 * サーバーと Task のやり取りを担当するクラス
 */

import type { TaskEntity, Tag } from '@/entities/TaskEntity';
import { AuthRepository } from '@/repositories/AuthRepository';
import Cookies from 'js-cookie';

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

// API Types
interface ApiTag {
  id: number;
  userId: number;
  name: string;
  color: string;
}

interface ApiTaskTag {
  taskId: number;
  tagId: number;
  tag: ApiTag;
}

interface ApiTask {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  completedAt?: string;
  taskTags: ApiTaskTag[];
}

export class TaskRepository {
  private readonly baseUrl: string;
  private readonly authRepository: AuthRepository;
  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.authRepository = new AuthRepository(baseUrl);
  }

  private mapApiTaskToUi(apiTask: ApiTask): TaskEntity {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      status: apiTask.status === 'inProgress' ? 'in_progress' : apiTask.status,
      priority: apiTask.priority,
      tags: apiTask.taskTags.map(tt => ({
        id: tt.tag.id,
        userId: tt.tag.userId,
        name: tt.tag.name,
        color: tt.tag.color,
      })),
      expiresAt: apiTask.expiresAt,
      completedAt: apiTask.completedAt,
    };
  }

  public async createTask(createTaskRequest: CreateTaskRequest): Promise<TaskEntity> {
    const statusMap: Record<string, string> = {
      in_progress: 'inProgress',
    };
    const apiStatus = statusMap[createTaskRequest.status] || createTaskRequest.status;

    const response = await this.authRepository.requestWithAuth(`${this.baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: createTaskRequest.title,
        description: createTaskRequest.description,
        status: apiStatus,
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

    const data: ApiTask = await response.json();
    return this.mapApiTaskToUi(data);
  }

  public async getTasks(): Promise<TaskEntity[]> {
    const response = await this.authRepository.requestWithAuth(`${this.baseUrl}/api/v1/tasks`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('エラーが発生しました');
    }

    const data: ApiTask[] = await response.json();

    return data.map(task => this.mapApiTaskToUi(task));
  }

  public async updataTask(taskId: number, updataTaskRequest: UpdataTaskRequest): Promise<TaskEntity> {
    const statusMap: Record<string, string> = {
      in_progress: 'inProgress',
    };
    const apiStatus = statusMap[updataTaskRequest.status] || updataTaskRequest.status;

    const response = await this.authRepository.requestWithAuth(`${this.baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updataTaskRequest.title,
        description: updataTaskRequest.description,
        status: apiStatus,
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

    const data: ApiTask = await response.json();
    return this.mapApiTaskToUi(data);
  }

  public async deleteTask(taskId: number): Promise<void> {
    const response = await this.authRepository.requestWithAuth(`${this.baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('エラーが発生しました');
    }
  }
}
