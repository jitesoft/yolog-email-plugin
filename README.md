# Yolog email plugin

[![npm (scoped)](https://img.shields.io/npm/v/@jitesoft/yolog-email-plugin)](https://www.npmjs.com/package/@jitesoft/yolog-email-plugin)
[![Known Vulnerabilities](https://snyk.io/test/npm/@jitesoft/yolog-email-plugin/badge.svg)](https://snyk.io/test/npm/@jitesoft/yolog-email-plugin)
[![pipeline status](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/email/badges/master/pipeline.svg)](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/email/commits/master)
[![coverage report](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/email/badges/master/coverage.svg)](https://gitlab.com/jitesoft/open-source/javascript/yolog-plugins/email/commits/master)
[![npm](https://img.shields.io/npm/dt/@jitesoft/yolog-email-plugin)](https://www.npmjs.com/package/@jitesoft/yolog-email-plugin)
[![Back project](https://img.shields.io/badge/Open%20Collective-Tip%20the%20devs!-blue.svg)](https://opencollective.com/jitesoft-open-source)


Plugin for the [`@jitesoft/yolog`](https://www.npmjs.com/package/@jitesoft/yolog) logger to post logs and errors to a set of email addresses.  
The plugin is backed by [`nodemailer`](https://nodemailer.com/) and is able to use any transporter that nodemailer supports!

Due to the nature of the plugin and the dependency on nodemailer, this plugin is only supported on node-like platforms, not browser.

### Default transporter

If no transporter is passed to the Plugin through the constructor, a default `sendmail` transporter will be
added. If sendmail does not exist on the machine, the plugin will likely crash on logging messages.

### Templates

There are default templates set for `HTML`, `Text` and `Subject`.
Subject template is set through the constructor, while the text and html templates can
be changed with the `setHmlTemplate` and `setTextTemplate` methods in the instance.

Parameters that will be replaced are currently the following:

```
TAG        - The message tag/type.
DATETIME   - Date as ISO string.
MESSAGE    - Log message.
STACKTRACE - Stack trace (from yolog.log and upwards).
```

Each parameter uses `{PARAMETER}` in the templates.

Default HTML template:
```html
<div>
    <span style="font-size: 1.4em; text-decoration: underline;">{TAG} message logged.</span>
    <pre>At: {DATETIME}</pre>
    <div style="padding-top: 1em;">
        <span style="text-decoration: underline; line-height: 0.4em;">Message:</span>
        <p>{MESSAGE}</p>
    </div>
    <pre style="border: 1px black dotted; font-size: 1em; width: max-content; padding: 1em 3em;">{STACKTRACE}</pre>
    <span style="font-size: 0.6em;">This message was logged via the <a style="text-decoration: none;" href="https://www.npmjs.com/package/@jitesoft/yolog"><code>@jitesoft/yolog</code></a> email plugin.</span>
</div>
```

Default text template:

```text
Logged a log message with {TAG} tag at {DATETIME}.\n\nMessage: {MESSAGE}\n\nCallstack:\n{STACKTRACE}
```

## Usage:

Install with your favorite package manager!

```bash
npm i @jitesoft/yolog-email-plugin --save
yarn add @jitesoft/yolog-email-plugin
```

Use it!

```javascript
import EmailPlugin from '@jitesoft/yolog-email-plugin';
import { logger } from '@jitesoft/yolog';
import nodemailer from 'nodemailer';
const plugin = new EmailPlugin(['target@target.target'], 'sender@sender.send', 'Subject!', [
  nodemailer.createTransport({
    /* ... */
  })
]);
logger.addPlugin(plugin);
logger.error('YOU GOT MAIL!');
```

### Recommendation

Turn off lesser levels of logging for the plugin so that your inbox is not filled with debug messages and your smtp server
gets spam listed instantly!
