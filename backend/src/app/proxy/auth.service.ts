import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import axios from 'axios';
import * as tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { captureEvent } from '@sentry/node';
import { InjectModel } from '@nestjs/mongoose';
import { UptodateAccount, UptodateAccountStatus } from '@uptodate/types';
import { Model } from 'mongoose';

type Client = { instance: AxiosInstance; account: UptodateAccount };

@Injectable()
export class AuthService {
  private clients: Client[] = [];

  constructor(
    @InjectModel(UptodateAccount.name)
    private accountModel: Model<UptodateAccount>,
  ) {
    this.init();
    setInterval(() => {
      this.init();
    }, 30000);
  }

  init() {
    this.accountModel.find().then((accounts) => {
      for (const account of accounts) {
        const exist = this.clients.find(
          (item) => item.account._id.toString() === account._id.toString(),
        );
        if (
          exist &&
          exist.account.updatedAt?.valueOf() === account.updatedAt?.valueOf()
        )
          continue;
        const cookieJar = new tough.CookieJar();
        const instance = wrapper(
          axios.create({ jar: cookieJar, withCredentials: true }),
        );
        const client = { instance, account };
        if (exist) this.clients[this.clients.indexOf(exist)] = client;
        this.clients.push(client);

        this.login(client).then(() => {
          client.instance.put(
            'https://www.uptodate.com/services/app/localization/user',
            { value: 'en' },
          );
        });
      }
    });
  }

  get client() {
    return this.clients.find((item) => !item.account.blockedAt);
  }

  async needLogin(response?: any) {
    if (
      response?.assetList &&
      !response.assetList.find((x) => !!x.data.user || !!x.data.userInfo)
    ) {
      return true;
    }
  }

  async login(client: Client, onPath?: string) {
    const body = `userName=${client.account.username}&password=${client.account.password}`;

    captureEvent({
      message: 'uptodate login',
      level: 'debug',
      transaction: onPath,
    });

    try {
      await client.instance.post(
        'https://www.uptodate.com/services/app/login/json',
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      );
      if (client.account.status !== UptodateAccountStatus.Active) {
        client.account.status = UptodateAccountStatus.Active;
        client.account.errorMessage = null;
        client.account.blockedAt = null;
        this.accountModel
          .findByIdAndUpdate(client.account.id.toString(), {
            status: UptodateAccountStatus.Active,
            errorMessage: null,
            blockedAt: null,
            loginAt: new Date(),
          })
          .exec();
      }
    } catch (error) {
      const errorData = error.response?.data?.data?.errors?.[0];

      if (error.status === 403) {
        if (
          client.account.status !== UptodateAccountStatus.Wrong &&
          errorData?.message?.search('global.login.error.wayf') > -1
        ) {
          client.account.status = UptodateAccountStatus.Wrong;
          this.accountModel
            .findByIdAndUpdate(client.account.id.toString(), {
              status: UptodateAccountStatus.Wrong,
              errorMessage: errorData?.message,
              blockedAt: null,
            })
            .exec();
        } else if (
          client.account.status !== UptodateAccountStatus.Blocked &&
          errorData?.message?.search('locked') > -1
        ) {
          client.account.status = UptodateAccountStatus.Blocked;
          this.accountModel
            .findByIdAndUpdate(client.account.id.toString(), {
              status: UptodateAccountStatus.Blocked,
              errorMessage: errorData?.message,
              blockedAt: new Date(),
            })
            .exec();
        }
      }
    }
  }
}
