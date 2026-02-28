import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

function getRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
}

export async function sendEmail(opts: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const client = new SESv2Client({ region: getRegion() });

  const cmd = new SendEmailCommand({
    FromEmailAddress: opts.from,
    Destination: { ToAddresses: [opts.to] },
    Content: {
      Simple: {
        Subject: { Data: opts.subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: opts.text, Charset: 'UTF-8' },
          ...(opts.html ? { Html: { Data: opts.html, Charset: 'UTF-8' } } : {}),
        },
      },
    },
  });

  await client.send(cmd);
}
