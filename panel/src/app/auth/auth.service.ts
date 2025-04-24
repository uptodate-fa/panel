import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserRole } from '@uptodate/types';
import { PersianNumberService } from '@uptodate/utils';
import { lastValueFrom } from 'rxjs';
const JWT_KEY = 'jwtToken';
const HASH_KEY = 'userHash';
declare const Goftino: any;
declare const clarity: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfo: User;
  private userLoaded: Promise<void>;
  private userLoadedResolver: () => void;

  constructor(private client: HttpClient) {
    this.userLoaded = new Promise((resolve) => {
      this.userLoadedResolver = resolve;
    });
    this.revalidateUserInfo();
  }

  private handleGoftino() {
    window.addEventListener('goftino_ready', () => {
      Goftino.setUserId(this.user?._id);
      Goftino.setUser({
        email: this.user?.email,
        name: `${this.user?.firstName} ${this.user?.lastName}`,
        phone: this.user?.phone,
        forceUpdate: true,
      });
    });
  }

  async revalidateUserInfo() {
    const user = await lastValueFrom(this.client.get<User>(`/api/auth/info`));
    if (user?.role === UserRole.User) this.userInfo = user;
    else if (user) {
      this.clearToken();
      location.reload();
    }
    this.handleGoftino();
    this.userLoadedResolver();
    try {
      if (user.phone) clarity('set', 'userId', user?.phone);
    } catch (error) {
      //  do nothing
    }
  }

  async preLogin(mobilePhone: string) {
    const sanitizePhone = PersianNumberService.toEnglish(mobilePhone);
    return this.client
      .get<{ password: string }>(`/api/auth/preLogin/${sanitizePhone}`)
      .toPromise();
  }

  async sendToken(mobilePhone: string) {
    const sanitizePhone = PersianNumberService.toEnglish(mobilePhone);
    await this.client.get(`/api/auth/sendToken/${sanitizePhone}`).toPromise();
  }

  async login(mobilePhone: string, token: string, saveLogin?: boolean) {
    const sanitizePhone = PersianNumberService.toEnglish(mobilePhone);
    const sanitizeToken = PersianNumberService.toEnglish(token);
    const jwtToken = await this.client
      .post(
        `/api/auth/loginOtp`,
        {
          phone: sanitizePhone,
          otp: sanitizeToken,
          hash: this.hash,
          saveLogin,
        },
        {
          responseType: 'text',
        },
      )
      .toPromise();

    if (jwtToken) this.setToken(jwtToken);
    await this.revalidateUserInfo();
    return this.user;
  }

  async logout() {
    await this.client.get(`/api/auth/logout/${this.hash}`).toPromise();
    this.clearToken();
    location.reload();
  }

  async loginWithPassword(
    mobilePhone: string,
    password: string,
    saveLogin?: boolean,
  ) {
    const sanitizePhone = PersianNumberService.toEnglish(mobilePhone);
    const jwtToken = await this.client
      .post(
        `/api/auth/login`,
        {
          phone: sanitizePhone,
          password,
          hash: this.hash,
          saveLogin,
        },
        {
          responseType: 'text',
        },
      )
      .toPromise();

    if (jwtToken) this.setToken(jwtToken);
    await this.revalidateUserInfo();
    return this.user;
  }

  private getToken = () => localStorage.getItem(JWT_KEY);

  private setToken = (token: string) => localStorage.setItem(JWT_KEY, token);

  clearToken = () => localStorage.removeItem(JWT_KEY);

  async update(dto: User) {
    await lastValueFrom(this.client.put(`/api/auth/edit`, dto));
    await this.revalidateUserInfo();
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

  async complete(): Promise<void> {
    return this.userLoaded; // Wait for the user to be loaded
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  get hash(): string {
    let hash =
      sessionStorage.getItem(HASH_KEY) || localStorage.getItem(HASH_KEY);
    if (!hash) {
      hash = this.generateUUID();
      sessionStorage.setItem(HASH_KEY, hash);
      localStorage.setItem(HASH_KEY, hash);
    }
    return hash;
  }

  isActiveSubscription() {
    if (!this.user?.subscription) return false;
    return new Date(this.user.subscription.expiredAt).valueOf() > Date.now();
  }
}
