import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@uptodate/types';
import { PersianNumberService } from '@uptodate/utils';
const JWT_KEY = 'jwtToken';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private client: HttpClient) {}

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
    return this.user;
  }

  private getToken = () => localStorage.getItem(JWT_KEY);

  private setToken = (token: string) => localStorage.setItem(JWT_KEY, token);

  private clearToken = () => localStorage.removeItem(JWT_KEY);

  get user() {
    try {
      const token = this.getToken();
      if (token) {
        const user: User = JSON.parse(atob(token.split('.')[1]));
        if (user && user.exp && user.exp * 1000 > Date.now()) return user;
      }
    } catch (error) {
      // unhandled
    }
    this.clearToken();
    return null;
  }
}
