import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/module/redis/redis.service';

@Injectable()
export default class Utils {
  private crypto;
  private configService: ConfigService = new ConfigService();
  private redisService: RedisService = new RedisService(this.configService);
  private key: string = this.configService.get('ENCRYPT_DEFAULT_KEY');
  private iv = this.configService.get('ENCRYPT_DEFAULT_KEY');

  constructor() {
    this.crypto = require('crypto-js');
  }

  public isNull(obj: any) {
    const type = this.getType(obj);
    if ((type === 'String' || type === 'Number' || type === 'Boolean') && !obj)
      return true;
    if (obj === null || obj === undefined) return true;
    if (type === 'Array' && obj.length === 0) return true;
    if (type === 'Object') {
      for (const key in obj) {
        if (obj.hasOwnProperty.call(obj, key)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private getType(obj: unknown) {
    const str = Object.prototype.toString.call(obj).split(' ')[1];
    return str.substring(0, str.length - 1);
  }

  /**
   *
   * @param to 标识用户
   * @param len 生成随机字符长度
   * @returns
   */
  public async generateCode(to: string, len: number = 32) {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    let result = '';
    for (let index = 0; index < len; index++) {
      result += chars.charAt(Math.floor(Math.random() * len));
    }
    const code = Buffer.from(result).toString('base64');
    await this.redisService.set(`${to}_code`, code);
    await this.redisService.expire(`${to}_code`, 600);
    return this.encrypt(code);
  }

  private encrypt(data, keys?: string, ivs?: string) {
    const key = this.crypto.enc.Utf8.parse(keys || this.key);
    const iv = this.crypto.enc.Utf8.parse(ivs || this.iv);
    const src = this.crypto.enc.Utf8.parse(data);
    return this.crypto.DES.encrypt(src, key, {
      iv,
      mode: this.crypto.mode.CBC,
      padding: this.crypto.pad.Pkcs7,
    }).toString();
  }

  private decrypt(data, keys?: string, ivs?: string) {
    const key = this.crypto.enc.Utf8.parse(keys || this.key);
    const iv = this.crypto.enc.Utf8.parse(ivs || this.iv);
    const src = this.crypto.enc.Utf8.parse(data);
    return this.crypto.DES.decrypt(src, key, {
      iv,
      mode: this.crypto.mode.CBC,
      padding: this.crypto.pad.Pkcs7,
    }).toString();
  }
}
