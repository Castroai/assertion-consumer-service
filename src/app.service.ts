import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello From Simple Setup HTTP Application Programming Interface';
  }
}
