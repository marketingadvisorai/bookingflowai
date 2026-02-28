import { SESv2Client } from '@aws-sdk/client-sesv2';

let client: SESv2Client | null = null;

export function getSesClient(): SESv2Client {
  if (client) return client;

  client = new SESv2Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.BF_AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.BF_AWS_SECRET_ACCESS_KEY ?? '',
    },
  });

  return client;
}
