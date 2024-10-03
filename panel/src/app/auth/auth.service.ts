import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@uptodate/types';
import { PersianNumberService } from '@uptodate/utils';
import { lastValueFrom } from 'rxjs';
const JWT_KEY = 'jwtToken';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfo: User;
  constructor(private client: HttpClient) {
    this.revalidateUserInfo();
  }

  async revalidateUserInfo() {
    const user = await lastValueFrom(this.client.get<User>(`/api/auth/info`));
    if (user) this.userInfo = user;
  }

  async sendToken(mobilePhone: string) {
    const sanitizePhone = PersianNumberService.toEnglish(mobilePhone);
    await this.client.get(`/api/auth/sendToken/${sanitizePhone}`).toPromise();
  }

  async login(mobilePhone: string, token: string) {
    const sanitizePhone = PersianNumberService.toEnglish(mobilePhone);
    const sanitizeToken = PersianNumberService.toEnglish(token);
    const jwtToken = await this.client
      .get(`/api/auth/login/${sanitizePhone}/${sanitizeToken}`, {
        responseType: 'text',
      })
      .toPromise();

    if (jwtToken) this.setToken(jwtToken);
    this.revalidateUserInfo();
    return this.user;
  }

  private getToken = () => localStorage.getItem(JWT_KEY);

  private setToken = (token: string) => localStorage.setItem(JWT_KEY, token);

  private clearToken = () => localStorage.removeItem(JWT_KEY);

  async update(dto: User) {
    await lastValueFrom(this.client.put(`/api/auth/edit`, dto));
    this.revalidateUserInfo();
  }

  get user() {
    try {
      const token = this.getToken();
      if (token) {
        const user: User = JSON.parse(atob(token.split('.')[1]));
        if (user && user.exp && user.exp * 1000 > Date.now())
          return this.userInfo || user;
      }
    } catch (error) {
      // unhandled
    }
    this.clearToken();
    return null;
  }

  get isProfileComplete() {
    return this.user?.firstName && this.user?.lastName;
  }
}
