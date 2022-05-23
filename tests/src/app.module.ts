import { DynamicModule, Injectable, Module } from '@nestjs/common';

import {
  MailerModule,
  MailerModuleOptions,
  MailerService,
  MailerTransport,
  MailerTransportFactory,
} from '../../lib/index';

const mockTransport: MailerTransport = {
  name: 'smtp',
  transport: 'smtps://user@domain.com:pass@smtp.domain.com',
};

@Injectable()
export class TestTransportFactory implements MailerTransportFactory {
  public createMailerModuleOptions(): MailerModuleOptions {
    return {
      transports: [mockTransport],
    };
  }
}

@Module({})
export class AppModule {
  public constructor(public readonly mailerService: MailerService) {}

  public static usingForRoot(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        MailerModule.forRoot({
          transports: [mockTransport],
        }),
      ],
    };
  }

  public static usingForRootAsync(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        MailerModule.forRootAsync({
          useFactory: (): MailerModuleOptions => {
            return {
              transports: [mockTransport],
            };
          },
        }),
      ],
    };
  }

  public static usingForRootAsyncWithUseClass(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TestTransportFactory,
        MailerModule.forRootAsync({
          useClass: TestTransportFactory,
        }),
      ],
    };
  }
}
