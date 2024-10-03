import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { RedisService } from '../core/redis.service';
const USERNAME = process.env['UPTODATE_USERNAME'];
const PASSWORD = process.env['UPTODATE_PASSWORD'];

@Injectable()
export class AuthService {
  private _sessionId: string;
  private _sessionPromise: Promise<string>;

  constructor(
    private http: HttpService,
    private redis: RedisService,
  ) {
    this.redis.sessionId?.then((key) => {
      if (key && !this._sessionPromise) {
        this._sessionId = key;
        console.log(this._sessionId);
      }
    });
  }

  async checkLogin(key: string, response?: any) {
    if (process.env.SESSION_ID) return;
    if (
      response?.assetList &&
      !response.assetList.find((x) => !!x.data.user || !!x.data.userInfo)
    ) {
      console.log(key, 'need login');
      await this.login();
    }
  }

  private async login() {
    const body = `userName=${USERNAME}&password=${PASSWORD}`;
    console.log('start login');
    const response = await this.http
      .post('https://www.uptodate.com/services/app/login/json', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      })
      .toPromise();
    const data = response.data;
    if (data.data.value) {
      const cookies = response.headers['set-cookie'];
      const sessionCookie = cookies.find((x) => x.search('JSESSIONID=') > -1);
      if (sessionCookie) {
        const sessionId = sessionCookie.split('=')[1].split(';')[0];
        this._sessionId = sessionId;
        this.redis.setSessionId(sessionId);
      }
    }
  }

  get session() {
    if (process.env.SESSION_ID) return process.env.SESSION_ID;
    if (this._sessionId) return this._sessionId;
    else if (!this._sessionPromise)
      this._sessionPromise = new Promise((resolve) => {
        this.login().then(() => resolve(this._sessionId));
      });
    return this._sessionPromise;
  }

  async headers(): Promise<AxiosHeaders> {
    const sessionId = await this.session;
    const headers = new AxiosHeaders();
    headers.set('Cookie', `JSESSIONID=${sessionId}`);
    return headers;
  }
}
