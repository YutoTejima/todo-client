import type { SafeUserEntity, UserEntity } from '@/entities/UserEntity';
import Cookies from 'js-cookie';

interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export class AuthRepository {
  public async requestWithAuth(...args: Parameters<typeof globalThis.fetch>) {
    const [url, init] = args;

    // アクセストークンをクッキーから取得
    const accessToken = Cookies.get('accessToken');

    if (init?.headers) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return await fetch(url, init);
  }

  // fetch を拡張して fetch するたびにリフレッシュを挟む
  public async requestWithRefresh(...args: Parameters<typeof globalThis.fetch>) {
    const [url, init] = args;

    // アクセストークンをクッキーから取得
    const accessToken = Cookies.get('accessToken');

    if (init?.headers) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    const response = await fetch(url, init);

    // アクセストークンが有効期限切れの場合リフレッシュする
    if (response.status === 401) {
      const refreshResponse = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: Cookies.get('refreshToken'),
        }),
      });

      // リフレッシュトークンが有効期限切れの場合例外をスローする
      if (!refreshResponse.ok) {
        throw { status: refreshResponse.status, message: refreshResponse.statusText };
      }
      // 新しいトークンを Cookie に保存する
      const refreshData: TokenResponse = await refreshResponse.json();
      Cookies.set('accessToken', refreshData.accessToken);
      Cookies.set('refreshToken', refreshData.refreshToken);

      if (init?.headers) {
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${refreshData.accessToken}`,
        };
      }
      return await fetch(url, init);
    }

    return response;
  }

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

  public async login(email: string, password: string): Promise<TokenResponse> {
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

    const data: TokenResponse = await response.json();

    Cookies.set('accessToken', data.accessToken);
    Cookies.set('refreshToken', data.refreshToken);

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
    Cookies.remove('refreshToken');
  }

  public async me(): Promise<Omit<SafeUserEntity, 'password'>> {
    const response = await this.requestWithRefresh(`${this.baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
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
