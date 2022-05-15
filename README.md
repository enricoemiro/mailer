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

1. Register the module as a dependency:

This could be done (a)synchronously using the methods: `forRoot()` and `forRootAsync()`.

`./app.service.ts`

```ts
import { MailerModule } from '@enricoemiro/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transports: [
        {
          name: 'mailtrap',
          transport: {
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
              user: 'your-user',
              pass: 'pass',
            },
          },
        },
      ],
      global: true,
    }),

    // OR

    // DISCLAIMER: ConfigService and ConfigModule are assumed to exist
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => [
        {
          name: 'mailtrap',
          transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: configService.get<number>('MAIL_PORT'),
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
          },
        },
      ],
      inject: [ConfigService],
      global: true,
    }),
  ],
})
export class AppModule {}
```

2. Inject the `MailerService` as a dependency:

`./yourServiceName.service.ts`

```ts
import { MailerService } from '@enricoemiro/mailer';

@Injectable()
export class AuthService {
  constructor(private mailerService: MailerService) {}

  async sendUserRegistrationEmail() {
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
