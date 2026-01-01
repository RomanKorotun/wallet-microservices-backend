import { config } from 'dotenv';
if (process.env.CI !== 'true') {
  config({ path: '.env.test', override: true });
}
