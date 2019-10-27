import { Plugin } from '@jitesoft/yolog';
import nodemailer from 'nodemailer';

export default class Email extends Plugin {
  /** @var {Mailer[]} */
  #transporters = [];
  #recipients = [];
  #sender = '';
  #htmlTemplate = Email.#defaultHtml;
  #textTemplate = Email.#defaultText;
  #subject = '';

  /**
   * Set the html template to use instead of the default template.
   * Placeholder variables are defined with `{PLACEHOLDER}` and the following placeholders are currently available:
   *
   * <pre>
   *  TAG        - The message tag/type.
   *  DATETIME   - Date as ISO string.
   *  MESSAGE    - Log message.
   *  STACKTRACE - Stack trace (from yolog.log and upwards).
   * </pre>
   *
   * @param {String} template Template to use.
   */
  setHtmlTemplate (template) {
    this.#htmlTemplate = template;
  }

  /**
   * Set the text template to use instead of the default template.
   * Placeholder variables are defined with `{PLACEHOLDER}` and the following placeholders are currently available:
   *
   * <pre>
   *  TAG        - The message tag/type.
   *  DATETIME   - Date as ISO string.
   *  MESSAGE    - Log message.
   *  STACKTRACE - Stack trace (from yolog.log and upwards).
   * </pre>
   *
   * @param {String} template Template to use.
   */
  setTextTemplate (template) {
    this.#textTemplate = template;
  }

  static #defaultText = 'Logged a log message with {TAG} tag at {DATETIME}.\n\nMessage: {MESSAGE}\n\nCallstack:\n{STACKTRACE}';
  static #defaultHtml = `<div>
    <span style="font-size: 1.4em; text-decoration: underline;">{TAG} message logged.</span>
    <pre>At: {DATETIME}</pre>
    <div style="padding-top: 1em;">
        <span style="text-decoration: underline; line-height: 0.4em;">Message:</span>
        <p>{MESSAGE}</p>
    </div>
    <pre style="border: 1px black dotted; font-size: 1em; width: max-content; padding: 1em 3em;">{STACKTRACE}</pre>
    <span style="font-size: 0.6em;">This message was logged via the <a style="text-decoration: none;" href="https://www.npmjs.com/package/@jitesoft/yolog"><code>@jitesoft/yolog</code></a> email plugin.</span>
</div>`;

  /**
   * Email plugin constructor.
   *
   * If no transport is passed, the plugin instance will try to create a sendmail transport using
   * localhost sendmail. If this does not exist on the system, the plugin will likely crash.
   *
   * @param {Array<String>} recipients               Recipients email addresses as array.
   * @param {String} sender                          Sender email address, can be in the form of `Name <email@local.com>` if wanted..
   * @param {String} subject                         Subject template, see setTextTemplate or setHtmlTemplate for parameter values.
   * @param {Array<Mailer>|Array<Object>} transports Nodemailer transporters as array.
   */
  constructor (recipients = [], sender = 'yolog-email-plugin@localhost', subject = '{TAG} - {DATETIME}', transports = []) {
    super();

    this.#subject = subject;
    this.#sender = sender;
    this.#recipients.push(...recipients);
    this.#transporters.push(...transports);

    if (transports.length === 0) {
      this.#transporters.push(
        nodemailer.createTransport({
          sendmail: true,
          newline: 'unix'
        })
      );
    }

    if (this.#recipients.length <= 0) {
      throw new Error('Failed to initialize plugin. No recipients found.');
    }
  }

  /**
   * Method called when a log message is intercepted and the plugin is listening to the given tag.
   *
   * @param {String} tag       Tag which was used when logging the message.
   * @param {Number} timestamp Timestamp (in ms) when the log was intercepted by the Yolog instance.
   * @param {String} message   Message to log.
   * @param {Error}  error     Error to use for call stack etc.
   * @return Promise<*>
   */
  async log (tag, timestamp, message, error) {
    const htmlTemplate = this.#htmlTemplate
      .replace('{MESSAGE}', message)
      .replace('{DATETIME}', new Date(timestamp).toISOString())
      .replace('{TAG}', tag)
      .replace('{STACKTRACE}', error.stack);

    const textTemplate = this.#textTemplate
      .replace('{MESSAGE}', message)
      .replace('{DATETIME}', new Date(timestamp).toISOString())
      .replace('{TAG}', tag)
      .replace('{STACKTRACE}', error.stack);

    const subject = this.#subject
      .replace('{MESSAGE}', message)
      .replace('{DATETIME}', new Date(timestamp).toISOString())
      .replace('{TAG}', tag)
      .replace('{STACKTRACE}', error.stack);

    const promises = this.#transporters.map((t) => {
      return Email.#sendMail(this.#sender, this.#recipients, subject, textTemplate, htmlTemplate, t);
    });

    return Promise.allSettled(promises);
  }

  static #sendMail = async (sender, recipients, subject, text, html, transport) => {
    return new Promise((resolve, reject) => {
      transport.sendMail({
        from: sender,
        to: recipients,
        subject: subject,
        text: text,
        html: html
      }, (err, info) => {
        if (err) {
          return reject(err);
        }
        return resolve(info);
      });
    });
  };
}
