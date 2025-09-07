import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function signInAsPlatformAdmin() {
  const email = process.argv[2] || 'prodiuscristian@gmail.com';
  
  console.log(`🔐 Setting up platform admin session for: ${email}`);

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User ${email} not found`);
      return;
    }

    console.log(`✅ Found user: ${user.name || user.email}`);

    // Find PrecuityAI organization
    const precuityOrg = await prisma.organization.findUnique({
      where: { slug: 'precuityai' }
    });

    if (!precuityOrg) {
      console.error('❌ PrecuityAI organization not found. Run pnpm db:seed first.');
      return;
    }

    console.log(`✅ Found PrecuityAI organization`);

    // Ensure membership exists
    let membership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: precuityOrg.id
        }
      }
    });

    if (!membership) {
      console.log('Creating admin membership...');
      membership = await prisma.member.create({
        data: {
          userId: user.id,
          organizationId: precuityOrg.id,
          role: 'admin'
        }
      });
      console.log('✅ Admin membership created');
    } else {
      console.log(`✅ Membership exists with role: ${membership.role}`);
    }

    // Get all active sessions for this user
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    console.log(`📋 Found ${sessions.length} active session(s)`);

    // Update each session to set the active organization
    for (const session of sessions) {
      await prisma.session.update({
        where: { id: session.id },
        data: { 
          activeOrganizationId: precuityOrg.id,
          updatedAt: new Date() // Force update timestamp
        }
      });
      console.log(`✅ Updated session ${session.id.substring(0, 8)}...`);
    }

    console.log('\n🎉 Platform admin setup complete!');
    console.log('📝 Instructions:');
    console.log('1. Go to http://localhost:3003/dashboard');
    console.log('2. You should now see the PrecuityAI organization');
    console.log('3. If not, clear cookies and sign in again');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

signInAsPlatformAdmin();