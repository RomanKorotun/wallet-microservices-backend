import { execa } from 'execa';
import { config } from 'dotenv';

config({ path: '.env.test.local' });

async function main() {
  await execa('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' });
  await execa('npx', ['prisma', 'generate'], { stdio: 'inherit' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
