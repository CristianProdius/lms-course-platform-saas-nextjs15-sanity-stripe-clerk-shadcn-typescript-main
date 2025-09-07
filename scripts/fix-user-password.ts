import { prisma } from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";

async function fixUserPassword() {
  const email = process.argv[2] || 'cristianprodius1@gmail.com';
  const password = process.argv[3] || 'GJJjE4sGV@dA';
  
  console.log('Fixing password for:', email);
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  // Hash password with Better Auth
  const hashedPassword = await hashPassword(password);
  
  // Update account
  const result = await prisma.account.updateMany({
    where: { 
      userId: user.id,
      providerId: 'credential'
    },
    data: {
      password: hashedPassword
    }
  });
  
  console.log(`Password updated with Better Auth hashing. Updated ${result.count} account(s)`);
  
  // Verify the account exists
  const account = await prisma.account.findFirst({
    where: { userId: user.id }
  });
  
  console.log('Account details:', {
    providerId: account?.providerId,
    accountId: account?.accountId,
    hasPassword: !!account?.password
  });
  
  await prisma.$disconnect();
}

fixUserPassword().catch(console.error);