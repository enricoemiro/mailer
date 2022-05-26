import { Inject, Injectable } from '@nestjs/common';
import { SentMessageInfo, Transporter, createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { MAILER_OPTIONS } from './mailer.constants';
import {
  MailerModuleOptions,
  MailerPluginStep,
  MailerTransport,
  MailerTransporter,
} from './mailer.interface';

@Injectable()
export class MailerService {
  private transporters = new Map<string, MailerTransporter>();

  public constructor(
    @Inject(MAILER_OPTIONS) mailerModuleOptions: MailerModuleOptions,
  ) {
    this.initTransporters(mailerModuleOptions.transports);
  }

  /**
   * Async wrapper of the nodemailer sendMail function.
   *
   * @param name Name of the transporter.
   * @param mailOptions Mail Options object.
   * @returns Sent message info.
   */
  public async sendAsyncMail(
    name: string,
    mailOptions: Mail.Options,
  ): Promise<SentMessageInfo> {
    return this.getTransporter(name).sendMail(mailOptions);
  }

  /**
   * Get transporter by name.
   *
   * @param name Name of the transporter.
   * @throws {Error} If the transporter does not exists.
   * @returns Transporter instance.
   */
  public getTransporter(name: string): Readonly<Transporter> {
    if (!this.transporters.has(name)) {
      throw new Error(
        `The \"${name}\" transporter does not exists. Are you sure you typed the correct name?`,
      );
    }

    return this.transporters.get(name).transporter;
  }

  private addTransporter(mailerTransport: MailerTransport): void {
    if (this.transporters.has(mailerTransport.name)) {
      throw new Error(
        `There is already a transporter with the name \"${mailerTransport.name}\"`,
      );
    }

    const newTransporter = createTransport(
      mailerTransport.transport,
      mailerTransport.defaults,
    );

    this.initPlugins(newTransporter, mailerTransport);

    this.transporters.set(mailerTransport.name, {
      transporter: newTransporter,
    });
  }

  private initPlugins(
    transporter: Transporter,
    mailerTransport: MailerTransport,
  ): void {
    const compile = mailerTransport?.plugins?.compile;
    const stream = mailerTransport?.plugins?.stream;

    if (compile) {
      transporter.use(MailerPluginStep.COMPILE, compile);
    }

    if (stream) {
      transporter.use(MailerPluginStep.STREAM, stream);
    }
  }

  private initTransporters(mailerTransports: MailerTransport[]) {
    if (mailerTransports.length === 0) {
      throw new Error(
        `Make sure to provide a nodemailer transport configuration object,
         connection url or a transport plugin instance.`,
      );
    }

    mailerTransports.forEach((mailerTransport: MailerTransport) => {
      this.addTransporter(mailerTransport);
    });
  }
}
