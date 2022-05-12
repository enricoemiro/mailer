# Mailer

This is a simple NestJS mailer module based on NodeMailer.

<p align="center">
  <a href="http://nestjs.com/">
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@enricoemiro/mailer">
    <img src="https://img.shields.io/npm/v/@enricoemiro/mailer.svg" alt="NPM Version" />
  </a>

  <a href="https://www.npmjs.com/org/enricoemiro">
    <img src="https://img.shields.io/npm/l/@enricoemiro/mailer.svg" alt="Package License" />
  </a>

  <a href="https://www.npmjs.com/org/enricoemiro">
    <img src="https://img.shields.io/npm/dm/@enricoemiro/mailer" alt="NPM Downloads" />
  </a>
</p>

<details>
  <summary>
    <strong>Table of content</strong> (click to expand)
  </summary>

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
</details>

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

## License

MIT
