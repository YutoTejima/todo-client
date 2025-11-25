export interface UserEntity {
  id: string;
  email: string;
  password: string;
  createdAt: string;
}

export type SafeUserEntity = Omit<UserEntity, 'password'>;
