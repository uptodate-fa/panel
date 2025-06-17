import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import * as Kavenegar from 'kavenegar';
let kavenegarApi;

@Controller('kavenegar')
export class KavenegarController {
  constructor() {
    console.log(111);
    kavenegarApi = Kavenegar.KavenegarApi({
      apikey: process.env.KAVENEGAR_API_KEY,
    });
  }

  @Get('lookup/:template/:mobile/:token')
  async lookup(
    @Param('template') template: string,
    @Param('mobile') mobile: string,
    @Param('token') token: string,
  ) {
    try {
      await this.lookupFunction(mobile, template, token);
    } catch (error) {
      return new HttpException(error.response, error.status);
    }
  }

  async lookupFunction(
    mobilePhone: string,
    kavenagarTemplate: string,
    token: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      kavenegarApi.VerifyLookup(
        {
          receptor: mobilePhone,
          token,
          template: kavenagarTemplate,
        },
        async (response, status) => {
          if (status == 200) {
            resolve(true);
          } else {
            reject({ response, status });
          }
        },
      );
    });
  }
}
