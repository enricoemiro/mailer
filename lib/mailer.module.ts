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
  MailerTransportFactory,
} from './mailer.interface';
import { MailerService } from './mailer.service';

@Module({})
export class MailerModule {
  public static forRoot(
    options: MailerModuleOptions & { isGlobal?: boolean },
  ): DynamicModule {
    const MailerOptionsProvider: ValueProvider<MailerModuleOptions> = {
      provide: MAILER_OPTIONS,
      useValue: options,
    };

    return {
      module: MailerModule,
      providers: [MailerOptionsProvider, MailerService],
      exports: [MailerService],
      global: options.isGlobal || false,
    };
  }

  public static forRootAsync(
    options: MailerModuleAsyncOptions & { isGlobal?: boolean },
  ): DynamicModule {
    const MailerAsyncProviders: Provider[] = this.createAsyncProviders(options);

    return {
      module: MailerModule,
      providers: [...MailerAsyncProviders, MailerService],
      imports: options.imports || [],
      exports: [MailerService],
      global: options.isGlobal || false,
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
      useFactory: (f: MailerTransportFactory) => f.createMailerModuleOptions(),
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
