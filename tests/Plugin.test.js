import Plugin from '../src/index';
import nodemailer from 'nodemailer';

let plugin = null;

describe('Tests for the Yolog email plugin.', () => {
  beforeEach(() => {
    plugin = new Plugin(
      ['test@example.com', 'test@localhost', 'Test McTest <test@local>'],
      'Tester McTestington the third <test@localhost>', '{TAG} - {DATETIME}',
      [nodemailer.createTransport({ jsonTransport: true })]
    );
  });

  test('Emails are sent to recipients.', async () => {
    const result = await plugin.log('error', Date.now(), 'Message!', new Error('...'));
    const resultAsObject = JSON.parse(result[0].value.message);

    expect(resultAsObject.to).toHaveLength(3);
    expect(resultAsObject.to).toEqual([
      {
        address: 'test@example.com',
        name: ''
      },
      {
        address: 'test@localhost',
        name: ''
      },
      {
        address: 'test@local',
        name: 'Test McTest'
      }
    ]);
  });

  test('Sender email is correct.', async () => {
    const result = await plugin.log('error', Date.now(), 'Message!', new Error('...'));
    const resultAsObject = JSON.parse(result[0].value.message);
    expect(resultAsObject.from).toEqual({
      name: 'Tester McTestington the third',
      address: 'test@localhost'
    });
  });

  test('Message is correctly parsed as HTML.', async () => {
    const d = new Date();
    const tag = 'error';
    const message = 'Hi, this is the message!';
    const error = new Error('An error!');
    const stacktrace = error.stack;
    const result = await plugin.log(tag, d, message, error);
    const resultAsObject = JSON.parse(result[0].value.message);

    expect(resultAsObject.html).toBe(`<div>
    <span style="font-size: 1.4em; text-decoration: underline;">${tag} message logged.</span>
    <pre>At: ${d.toISOString()}</pre>
    <div style="padding-top: 1em;">
        <span style="text-decoration: underline; line-height: 0.4em;">Message:</span>
        <p>${message}</p>
    </div>
    <pre style="border: 1px black dotted; font-size: 1em; width: max-content; padding: 1em 3em;">${stacktrace}</pre>
    <span style="font-size: 0.6em;">This message was logged via the <a style="text-decoration: none;" href="https://www.npmjs.com/package/@jitesoft/yolog"><code>@jitesoft/yolog</code></a> email plugin.</span>
</div>`
    );
  });

  test('Message is correctly parsed as Text.', async () => {
    const d = new Date();
    const tag = 'error';
    const message = 'Hi, this is the message!';
    const error = new Error('An error!');
    const stacktrace = error.stack;
    const result = await plugin.log(tag, d, message, error);
    const resultAsObject = JSON.parse(result[0].value.message);

    expect(resultAsObject.text).toBe(`Logged a log message with ${tag} tag at ${d.toISOString()}.\n\nMessage: ${message}\n\nCallstack:\n${stacktrace}`);
  });

  test('Message is correctly parsed as none-default HTML.', async () => {
    plugin.setHtmlTemplate('<a href="abc123">hej! {TAG}</a>');
    const result = await plugin.log('error', Date.now(), 'anything', new Error());
    const resultAsObject = JSON.parse(result[0].value.message);

    expect(resultAsObject.html).toBe('<a href="abc123">hej! error</a>');
  });

  test('Message is correctly parsed as none-default Text.', async () => {
    plugin.setTextTemplate('Hej! {TAG} {MESSAGE}');
    const result = await plugin.log('error', Date.now(), 'anything', new Error());
    const resultAsObject = JSON.parse(result[0].value.message);

    expect(resultAsObject.text).toBe('Hej! error anything');
  });

  test('Subject is correct.', async () => {
    const date = new Date();
    const result = await plugin.log('error', date, 'anything', new Error());
    const resultAsObject = JSON.parse(result[0].value.message);
    expect(resultAsObject.subject).toBe(`error - ${date.toISOString()}`);
  });

  test('No recipients throws error!', () => {
    expect(() => new Plugin([])).toThrow('Failed to initialize plugin. No recipients found.');
  });

  test('No error results in ´undefined´ string value instead of callstack.', async () => {
    const d = new Date();
    const tag = 'error';
    const message = 'Hi, this is the message!';
    const result = await plugin.log(tag, d, message, null);
    const resultAsObject = JSON.parse(result[0].value.message);

    expect(resultAsObject.text).toBe(`Logged a log message with ${tag} tag at ${d.toISOString()}.\n\nMessage: ${message}\n\nCallstack:\nundefined`);
  });

  test('Creates a sendmail transporter if no other is included.', () => {
    const plugin = new Plugin(['test@localhost']);
    expect(plugin.activeTransporters).toHaveLength(1);
    expect(plugin.activeTransporters[0].options.sendmail).toBe(true);
  });
});
