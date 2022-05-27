import * as JSONTransport from 'nodemailer/lib/json-transport';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as SESTransport from 'nodemailer/lib/ses-transport';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as StreamTransport from 'nodemailer/lib/stream-transport';
import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ModuleMetadata,
} from '@nestjs/common';
import { Socket } from 'net';
import { Transport, TransportOptions, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Url } from 'url';

export type MailerTransportType =
  | JSONTransport
  | SendmailTransport
  | SESTransport
  | SMTPTransport
  | StreamTransport
  | Transport
  | string;

export type MailerTransportOptions =
  | JSONTransport.Options
  | SendmailTransport.Options
  | SESTransport.Options
  | SMTPTransport.Options
  | StreamTransport.Options
  | TransportOptions;

/**
 * Stage in which the plugin should be hooked.
 */
export enum MailerPluginStep {
  /**
   * Step where the email data is set but nothing has been done with it yet.
   * At this step you can modify mail options, for example modify html content,
   * add new headers etc.
   */
  COMPILE = 'compile',

  /**
   * Step where message tree has been compiled and is ready to be streamed.
   * At this step you can modify the generated MIME tree or add a transform
   * stream that the generated raw email will be piped through before passed
   * to the transport object.
   */
  STREAM = 'stream',
}

export type MailerPluginOptions = {
  [step in MailerPluginStep]?: Mail.PluginFunction;
};

export enum MailerProxyKey {
  PROXY_HANDLER_HTTP = 'proxy_handler_http',
  PROXY_HANDLER_HTTPS = 'proxy_handler_https',
  PROXY_HANDLER_SOCKS = 'proxy_handler_socks',
  PROXY_HANDLER_SOCKS5 = 'proxy_handler_socks5',
  PROXY_HANDLER_SOCKS4 = 'proxy_handler_socks4',
  PROXY_HANDLER_SOCKS4A = 'proxy_handler_socks4a',
  PROXY_SOCKS_MODULE = 'proxy_socks_module',
}

export interface MailerProxyOptions {
  key: MailerProxyKey | string;
  value:
    | ((
        proxy: Url,
        options: TransportOptions,
        callback: (
          err: Error | null,
          socketOptions?: {
            connection: Socket;
          },
        ) => void,
      ) => void)
    | any;
}

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

  /**
   * Plugins to be associated with the transporter.
   */
  plugins?: MailerPluginOptions;

  /**
   * Proxy to be associated with the transporter.
   */
  proxy?: MailerProxyOptions;
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
}

export interface MailerTransportFactory {
  createMailerModuleOptions():
    | Promise<MailerModuleOptions>
    | MailerModuleOptions;
}

export interface MailerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: FactoryProvider<
    Promise<MailerModuleOptions> | MailerModuleOptions
  >['useFactory'];
  useExisting?: ExistingProvider<MailerTransportFactory>['useExisting'];
  useClass?: ClassProvider<MailerTransportFactory>['useClass'];
}
