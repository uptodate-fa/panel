import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { RedisService } from '../core/redis.service';
import axios from 'axios';
import * as tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const USERNAME = process.env['UPTODATE_USERNAME'];
const PASSWORD = process.env['UPTODATE_PASSWORD'];

@Injectable()
export class AuthService {
  private _sessionId: string;
  private _sessionPromise: Promise<string>;
  private cookieJar = new tough.CookieJar();
  client = wrapper(
    axios.create({ jar: this.cookieJar, withCredentials: true }),
  );

  constructor(
    private http: HttpService,
    private redis: RedisService,
  ) {
    // this.redis.sessionId?.then((key) => {
    //   if (key && !this._sessionPromise) {
    //     this._sessionId = key;
    //     console.log(this._sessionId);
    //   }
    // });
    this.login().then(() => {
      this.client.put(
        'https://www.uptodate.com/services/app/localization/user',
        { value: 'en' },
      );
    });
  }

  async needLogin(response?: any) {
    if (
      response?.assetList &&
      !response.assetList.find((x) => !!x.data.user || !!x.data.userInfo)
    ) {
      return true;
    }
  }

  async login() {
    const body = `userName=${USERNAME}&password=${PASSWORD}`;
    console.log('start login');
    await this.client.post(
      'https://www.uptodate.com/services/app/login/json',
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      },
    );

    console.log(this.cookieJar);
  }
}
