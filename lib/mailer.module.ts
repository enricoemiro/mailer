import {
  DynamicModule,
  FactoryProvider,
  Module,
  ValueProvider,
} from '@nestjs/common';

import { MAILER_OPTIONS } from './mailer.constants';
import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
  MailerTransport,
} from './mailer.interface';
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

  static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [this.createAsyncFactoryProvider(options), MailerService],
      imports: options.imports || [],
      exports: [MailerService],
      global: options.global || false,
    };
  }

  private static createAsyncFactoryProvider(
    options: MailerModuleAsyncOptions,
  ): FactoryProvider {
    if (options.useFactory === null) return;

    return {
      provide: MAILER_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
