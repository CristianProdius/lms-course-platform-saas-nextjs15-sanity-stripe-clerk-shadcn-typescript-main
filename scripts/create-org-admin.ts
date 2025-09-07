import { prisma } from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";

async function createOrgAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const orgName = process.argv[4];
  
  if (!email || !password || !orgName) {
    console.error('❌ Usage: tsx scripts/create-org-admin.ts <email> <password> <organization-name>');
    console.error('Example: tsx scripts/create-org-admin.ts admin@example.com password123 "Example Corp"');
    process.exit(1);
  }
  
  console.log(`🔧 Creating organization admin...`);
  console.log(`   Email: ${email}`);
  console.log(`   Organization: ${orgName}`);

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      console.log(`✅ User already exists: ${user.name || user.email} (ID: ${user.id})`);
    } else {
      // Create the user
      console.log('📦 Creating user...');
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use part before @ as name
          emailVerified: true,
          createdAt: new Date(),
        }
      });
      console.log(`✅ User created (ID: ${user.id})`);

      // Create account with password for Better Auth
      const hashedPassword = await hashPassword(password);
      await prisma.account.create({
        data: {
          userId: user.id,
          providerId: 'credential',
          accountId: email,
          password: hashedPassword,
          createdAt: new Date(),
        }
      });
      console.log('✅ Account with password created');
    }

    // Check if organization exists
    const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-');
    let organization = await prisma.organization.findUnique({
      where: { slug: orgSlug }
    });

    if (!organization) {
      console.log(`📦 Creating organization: ${orgName}...`);
      organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          createdAt: new Date(),
          metadata: {
            createdBy: 'admin-script',
            adminEmail: email
          }
        }
      });
      console.log(`✅ Organization created (ID: ${organization.id})`);
    } else {
      console.log(`✅ Organization already exists: ${organization.name} (ID: ${organization.id})`);
    }

    // Check if user is already a member
    let membership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id
        }
      }
    });

    if (!membership) {
      console.log('➕ Creating admin membership...');
      membership = await prisma.member.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'admin',
          createdAt: new Date()
        }
      });
      console.log('✅ Admin membership created');
    } else {
      console.log(`✅ Membership exists with role: ${membership.role}`);
      
      // Update to admin if not already
      if (membership.role !== 'admin') {
        await prisma.member.update({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: organization.id
            }
          },
          data: { role: 'admin' }
        });
        console.log('✅ Updated role to admin');
      }
    }

    console.log('\n✨ Organization admin setup complete!');
    console.log('\n📝 Next steps:');
    console.log(`1. Go to http://localhost:3000/sign-in`);
    console.log(`2. Sign in with email: ${email} and password: ${password}`);
    console.log(`3. You will be logged in as admin of ${orgName}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrgAdmin();