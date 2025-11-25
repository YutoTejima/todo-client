import type { SafeUserEntity, UserEntity } from '@/entities/UserEntity';
import Cookies from 'js-cookie';

interface LoginResponse {
  accessToken: string;
}

export class AuthRepository {
  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async signup(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('サインアップに失敗しました');
    }
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('ログインに失敗しました');
    }

    const data: LoginResponse = await response.json();

    Cookies.set('accessToken', data.accessToken);

    return data;
  }

  public async logout(): Promise<void> {
    const accessToken = Cookies.get('accessToken');

    const response = await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    Cookies.remove('accessToken');
  }

  public async me(): Promise<Omit<SafeUserEntity, 'password'>> {
    const accessToken = Cookies.get('accessToken');

    const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    const data: Omit<SafeUserEntity, 'password'> = await response.json();

    return data;
  }
}
