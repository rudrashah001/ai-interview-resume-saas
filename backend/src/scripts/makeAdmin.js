/**
 * Dev helper: make any registered user admin (+ active premium for testing).
 * Usage: npm run make-admin -- your@email.com
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const email = process.argv[2]?.toLowerCase().trim();

if (!email) {
  console.log('\nUsage: npm run make-admin -- your@email.com\n');
  console.log('Pehle website pe usi email se Register karo, phir yeh command chalao.\n');
  process.exit(1);
}

await connectDB();

const user = await User.findOneAndUpdate(
  { email },
  {
    role: 'admin',
    subscription: {
      status: 'active',
      plan: 'premium_dev',
      currentPeriodEnd: new Date('2099-12-31'),
    },
  },
  { new: true }
);

if (!user) {
  console.log(`\nUser nahi mila: ${email}`);
  console.log('Pehle http://localhost:5173/register pe account banao, phir dubara try karo.\n');
  process.exit(1);
}

console.log('\nDone!');
console.log(`  Name:  ${user.name}`);
console.log(`  Email: ${user.email}`);
console.log(`  Role:  ${user.role}`);
console.log(`  Plan:  ${user.subscription?.status} (${user.subscription?.plan})`);
console.log('\nAb browser mein Log out → Log in karo. Admin + Premium dono unlock.\n');
process.exit(0);
