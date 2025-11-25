export interface Tag {
  id: number;
  userId: number;
  name: string;
  color: string;
}

export interface TaskEntity {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags: Tag[];
  expiresAt?: string;
  completedAt?: string;
}
