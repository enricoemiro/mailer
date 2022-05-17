# Mailer

This is a simple [NestJS](https://nestjs.com/) mailer module based on [NodeMailer](npmjs.com/package/nodemailer).

<p align="center">
  <a href="http://nestjs.com/">
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@enricoemiro/mailer">
    <img src="https://img.shields.io/npm/v/@enricoemiro/mailer.svg" alt="NPM Version" />
  </a>

  <a href="https://www.npmjs.com/package/@enricoemiro/mailer">
    <img src="https://img.shields.io/npm/l/@enricoemiro/mailer.svg" alt="Package License" />
  </a>

  <a href="https://www.npmjs.com/package/@enricoemiro/mailer">
    <img src="https://img.shields.io/npm/dm/@enricoemiro/mailer" alt="NPM Downloads" />
  </a>

  <a href="https://www.npmjs.com/package/@enricoemiro/mailer">
    <img src="https://github.com/enricoemiro/mailer/actions/workflows/test.yml/badge.svg" alt="Test CI" />
  </a>
</p>

## Table of Contents

- [Why should you install this package?](#why-should-you-install-this-package)
- [Installation](#installation)
- [Usage](#usage)
- [API Methods](#api-methods)
- [Changelog](#changelog)
- [License](#license)

## Why should you install this package?

This package is meant to be a wrapper of NodeMailer (nothing less, nothing more). If your goal is to be able to use NodeMailer within NestJS then this package is for you.

**IMPORTANT**: This package will never add native support for template engines (such as pug, handlebars, etc...).

## Installation

Installation is as simple as running:

```sh
npm install @enricoemiro/mailer nodemailer
npm install --save-dev @types/nodemailer
# OR
yarn add @enricoemiro/mailer nodemailer
yarn add -D @types/nodemailer
```

## Usage

A basic usage example:

1. Register the module as a dependency (`app.module.ts`)

Using `forRoot()`

```ts
import { MailerModule } from '@enricoemiro/mailer';

MailerModule.forRoot({
  transports: [
    {
      name: 'mailtrap',
      transport: {
        host: 'smtp.mailtrap.io',
        // ... transport settings
      },
    },
  ],
  global: true,
});
```

Using `forRootAsync()`

- Using `useFactory`

```ts
import { MailerModule } from '@enricoemiro/mailer';

MailerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async function (configService: ConfigService) {
    return [
      {
        name: 'mailtrap',
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          // ... transport settings
        },
      },
    ];
  },
  inject: [ConfigService],
  global: true,
});
```

- Using `useClass` or `useExisting`

```ts
@Injectable()
export class MailerConfigService implements MailerTransportFactory {
  createMailerTransports(): Promise<MailerTransport[]> | MailerTransport[] {
    return [
      {
        name: 'smtp',
        transport: {
          // ... transport settings
        },
      },
    ];
  }
}
```

```ts
import { MailerModule } from '@enricoemiro/mailer';

import { MailerConfigService } from './mailerConfigServicePath.ts';

MailerModule.forRootAsync({
  useClass: MailerConfigService,
  global: true,
});
```

2. Inject the `MailerService` as a dependency:

```ts
import { MailerService } from '@enricoemiro/mailer';

@Injectable()
export class YourService {
  constructor(private mailerService: MailerService) {}

  async sendHelloWorldEmail() {
    this.mailerService.sendAsyncMail('mailtrap', {
      from: '"Ghost Foo 👻" <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
      subject: 'Hello ✔',
      text: 'Hello world?',
      html: '<b>Hello world?</b>',
    });
  }
}
```

## API Methods

The `MailerModule` can be instantied synchronously or asynchronously using respectively:

- `forRoot(options: MailerModuleOptions)`
- `forRootAsync(options: MailerModuleAsyncOptions)`

The `MailerService` exposes the following two methods:

- `sendAsyncEmail(name: string, mailOptions: Mail.Options): Promise<SentMessageInfo>`
- `getTransporter(name: string): Transporter`

## Changelog

All changelog are available [here](https://github.com/enricoemiro/mailer/releases).

## License

MIT
