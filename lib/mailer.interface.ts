import * as JSONTransport from 'nodemailer/lib/json-transport';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as SESTransport from 'nodemailer/lib/ses-transport';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as StreamTransport from 'nodemailer/lib/stream-transport';
import { Transporter } from 'nodemailer';

export type MailerTransportType =
  | JSONTransport
  | SendmailTransport
  | SESTransport
  | SMTPTransport
  | StreamTransport
  | string;

export type MailerTransportOptions =
  | JSONTransport.Options
  | SendmailTransport.Options
  | SESTransport.Options
  | SMTPTransport.Options
  | StreamTransport.Options;

export interface MailerTransport {
  /**
   * Name to be assigned to the transporter (must be unique).
   */
  name: string;

  /**
   * Transport configuration object, connection url or a transport plugin instance.
   */
  transport: MailerTransportType | MailerTransportOptions;

  /**
   * Object that defines values for mail options.
   */
  defaults?: MailerTransportOptions;
}

export interface MailerTransporter {
  /**
   * Instance of a transport.
   */
  transporter: Transporter;
}

export interface MailerModuleOptions {
  /**
   * Array of Mailer Transport object.
   */
  transports: MailerTransport[];

  /**
   * When "true", makes the module global-scoped.
   */
  global?: boolean;
}
