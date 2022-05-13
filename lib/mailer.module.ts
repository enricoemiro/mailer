import {
  ClassProvider,
  DynamicModule,
  FactoryProvider,
  Module,
  Provider,
  ValueProvider,
} from '@nestjs/common';

import { MAILER_OPTIONS } from './mailer.constants';
import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
  MailerTransport,
  MailerTransportFactory,
} from './mailer.interface';
import { MailerService } from './mailer.service';

@Module({})
export class MailerModule {
  public static forRoot(options: MailerModuleOptions): DynamicModule {
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

  public static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    const MailerAsyncProviders: Provider[] = this.createAsyncProviders(options);

    return {
      module: MailerModule,
      providers: [...MailerAsyncProviders, MailerService],
      imports: options.imports || [],
      exports: [MailerService],
      global: options.global || false,
    };
  }

  private static createAsyncProviders(options: MailerModuleAsyncOptions) {
    if (!options.useFactory && !options.useExisting && !options.useClass) {
      throw new Error(
        'Invalid forRootAsync configuration. Must provide useFactory, useExisting or useClass.',
      );
    }

    if (options.useFactory) return [this.createAsyncFactoryProvider(options)];
    if (options.useExisting) return [this.createAsyncCustomProvider(options)];
    if (options.useClass) {
      return [
        this.createAsyncCustomProvider(options),
        this.createAsyncClassProvider(options),
      ];
    }
  }

  private static createAsyncFactoryProvider(
    options: MailerModuleAsyncOptions,
  ): FactoryProvider {
    return {
      provide: MAILER_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  private static createAsyncCustomProvider(
    options: MailerModuleAsyncOptions,
  ): FactoryProvider {
    return {
      provide: MAILER_OPTIONS,
      useFactory: (f: MailerTransportFactory) => f.createMailerTransports(),
      inject: [options.useClass || options.useExisting],
    };
  }

  private static createAsyncClassProvider(
    options: MailerModuleAsyncOptions,
  ): ClassProvider {
    return {
      provide: options.useClass,
      useClass: options.useClass,
    };
  }
}
