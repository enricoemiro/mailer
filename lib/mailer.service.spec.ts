import * as JSONTransport from 'nodemailer/lib/json-transport';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as SESTransport from 'nodemailer/lib/ses-transport';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as StreamTransport from 'nodemailer/lib/stream-transport';
import { Test, TestingModule } from '@nestjs/testing';

import { MAILER_OPTIONS } from './mailer.constants';
import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
} from './mailer.interface';
import { MailerService } from './mailer.service';

import MailMessage = require('nodemailer/lib/mailer/mail-message');
import Mail = require('nodemailer/lib/mailer');

const SMTP_CONNECTION = 'smtps://user@domain.com:pass@smtp.domain.com';

async function createMailerService(
  options: MailerModuleOptions,
): Promise<MailerService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [MailerService, { provide: MAILER_OPTIONS, useValue: options }],
  }).compile();

  const service = module.get<MailerService>(MailerService);
  return service;
}

async function createAsyncMailerService(options: MailerModuleAsyncOptions) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      MailerService,
      {
        provide: MAILER_OPTIONS,
        useFactory: options.useFactory,
      },
    ],
  }).compile();

  const service = module.get<MailerService>(MailerService);
  return service;
}

function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(function (
      mail: MailMessage,
      callback: (
        err: Error | null,
        info: SMTPTransport.SentMessageInfo,
      ) => void,
    ): void {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'unique',
        accepted: [],
        rejected: [],
        pending: [],
        response: 'ok',
      });
    });
}

describe('MailerService', () => {
  it('should not be defined if transports array is empty', async () => {
    await expect(
      createMailerService({
        transports: [],
      }),
    ).rejects.toThrow(Error);
  });

  it('should not be defined if transports array not contains unique names', async () => {
    await expect(
      createMailerService({
        transports: [
          { name: 'smtp', transport: {} },
          { name: 'smtp', transport: {} },
        ],
      }),
    ).rejects.toThrow(Error);
  });

  it('should be defined if transports array contains unique names', async () => {
    const service = await createMailerService({
      transports: [
        { name: 'smtp-1', transport: {} },
        { name: 'smtp-2', transport: {} },
      ],
    });

    expect(service).toBeDefined();
  });

  it('should throw error if transporter name does not exists', async () => {
    const service = await createMailerService({
      transports: [{ name: 'smtp', transport: {} }],
    });

    expect(service).toBeDefined();
    expect(() => service.getTransporter('notExists')).toThrow(Error);
  });

  it('should accept a json transport options', async () => {
    const service = await createMailerService({
      transports: [
        {
          name: 'json',
          transport: { jsonTransport: true, skipEncoding: true },
        },
      ],
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('json').transporter).toBeInstanceOf(
      JSONTransport,
    );
  });

  it('should accept a sendmail transport options', async () => {
    const service = await createMailerService({
      transports: [{ name: 'sendmail', transport: { sendmail: true } }],
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('sendmail').transporter).toBeInstanceOf(
      SendmailTransport,
    );
  });

  it('should accept a smtp transport string', async () => {
    const service = await createMailerService({
      transports: [{ name: 'smtp', transport: SMTP_CONNECTION }],
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('smtp').transporter).toBeInstanceOf(
      SMTPTransport,
    );
  });

  it('should accept a ses transport options', async () => {
    const service = await createMailerService({
      transports: [
        {
          name: 'ses',
          transport: { SES: {}, ses: undefined },
        },
      ],
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('ses').transporter).toBeInstanceOf(
      SESTransport,
    );
  });

  it('should accept a smtp transport options', async () => {
    const service = await createMailerService({
      transports: [
        {
          name: 'smtp',
          transport: {
            secure: true,
            auth: { user: 'user@domain.com', pass: 'pass' },
            options: { host: 'smtp.domain.com' },
          },
        },
      ],
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('smtp').transporter).toBeInstanceOf(
      SMTPTransport,
    );
  });

  it('should accept a stream transport options', async () => {
    const service = await createMailerService({
      transports: [{ name: 'smtp', transport: { streamTransport: true } }],
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('smtp').transporter).toBeInstanceOf(
      StreamTransport,
    );
  });

  it('should accept a custom transport options', async () => {
    const service = await createMailerService({
      transports: [
        {
          name: 'smtp',
          transport: {
            name: 'custom-smtp',
            version: '0.0.1',
            send: function (mail: any, callback: any): void {
              const input = mail.message.createReadStream();
              const envelope = mail.message.getEnvelope();
              const messageId = mail.message.messageId();
              input.pipe(process.stdout);
              input.on('end', function () {
                callback(null, {
                  envelope,
                  messageId,
                });
              });
            },
          },
        },
      ],
    });

    expect(service).toBeDefined();

    const transporter = service.getTransporter('smtp').transporter;
    expect(transporter).toHaveProperty('name');
    expect(transporter).toHaveProperty('version');
    expect(transporter).toHaveProperty('send');
  });

  it('should set compile and stream', async () => {
    const spy = jest.spyOn(Mail.prototype, 'use');
    const service = await createMailerService({
      transports: [
        {
          name: 'smtp-1',
          transport: SMTP_CONNECTION,
          plugins: {
            compile: () => 'compile',
            stream: () => 'stream',
          },
        },
        {
          name: 'smtp-2',
          transport: SMTP_CONNECTION,
          plugins: {
            compile: () => 'compile',
          },
        },
        {
          name: 'smtp-3',
          transport: SMTP_CONNECTION,
          plugins: {
            stream: () => 'stream',
          },
        },
        {
          name: 'smtp-4',
          transport: SMTP_CONNECTION,
        },
      ],
    });

    expect(service).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(4);
  });

  it('should set proxy', async () => {
    const spy = jest.spyOn(Mail.prototype, 'set');
    const service = await createMailerService({
      transports: [
        {
          name: 'smtp-1',
          transport: SMTP_CONNECTION,
          proxy: {
            key: 'proxy_handler_custom',
            value: () => 'custom',
          },
        },
      ],
    });

    expect(service).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should send email', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await createMailerService({
      transports: [{ name: 'smtp', transport: SMTP_CONNECTION }],
    });

    await service.sendAsyncMail('smtp', {
      from: '"Ghost Foo 👻" <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
      subject: 'Hello ✔',
      text: 'Hello world?',
      html: '<b>Hello world?</b>',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('"Ghost Foo 👻" <foo@example.com>');
    expect(lastMail.data.to).toBe('bar@example.com, baz@example.com');
    expect(lastMail.data.subject).toBe('Hello ✔');
    expect(lastMail.data.text).toBe('Hello world?');
    expect(lastMail.data.html).toBe('<b>Hello world?</b>');
  });

  it('should use defaults options when send mail', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await createMailerService({
      transports: [
        {
          name: 'smtp',
          transport: SMTP_CONNECTION,
          defaults: { from: '"Ghost Foo 👻" <foo@example.com>' },
        },
      ],
    });

    await service.sendAsyncMail('smtp', {
      to: 'user2@example.test',
      subject: 'Hello ✔',
      text: 'Hello world?',
      html: '<b>Hello world?</b>',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('"Ghost Foo 👻" <foo@example.com>');
  });

  it('should throw error if custom factory is not provided', async () => {
    await expect(createAsyncMailerService({})).rejects.toThrow(Error);
  });

  it('should be defined with custom factory', async () => {
    const service = await createAsyncMailerService({
      useFactory: () => {
        return {
          transports: [
            {
              name: 'smtp',
              transport: SMTP_CONNECTION,
            },
          ],
        };
      },
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('smtp').transporter).toBeInstanceOf(
      SMTPTransport,
    );
  });

  it('should be defined with custom async factory', async () => {
    const service = await createAsyncMailerService({
      useFactory: async () => {
        return {
          transports: [
            {
              name: 'smtp',
              transport: SMTP_CONNECTION,
            },
          ],
        };
      },
    });

    expect(service).toBeDefined();
    expect(service.getTransporter('smtp').transporter).toBeInstanceOf(
      SMTPTransport,
    );
  });
});
