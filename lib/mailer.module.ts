import { DynamicModule, Module, ValueProvider } from '@nestjs/common';

import { MAILER_OPTIONS } from './mailer.constants';
import { MailerModuleOptions, MailerTransport } from './mailer.interface';
import { MailerService } from './mailer.service';

@Module({})
export class MailerModule {
  static forRoot(options: MailerModuleOptions): DynamicModule {
    const MailerOptionsProvider: ValueProvider<MailerTransport[]> = {
      provide: MAILER_OPTIONS,
      useValue: options.transports,
    };

    return {
      module: MailerModule,
      providers: [MailerOptionsProvider, MailerService],
      exports: [MailerService],
      global: options.global || false,
    };
  }
}
