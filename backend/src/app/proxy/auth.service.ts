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

  constructor(private http: HttpService, private redis: RedisService) {
    // this.login();
  }

  private async login() {
    const body = `userName=${USERNAME}&password=${PASSWORD}`;
    // console.log(body);
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
        console.log(this._sessionId);
      }
    }
  }

  get session() {
    return '960115FA6D01464E9BED1E79AD991693.1105';
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
