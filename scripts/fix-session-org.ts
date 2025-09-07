import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function fixSessionOrg() {
  const userEmail = process.argv[2] || 'prodiuscristian@gmail.com';
  
  console.log(`🔧 Fixing session for: ${userEmail}`);

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      return;
    }

    console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`);

    // Find PrecuityAI organization
    const precuityOrg = await prisma.organization.findUnique({
      where: { slug: 'precuityai' }
    });

    if (!precuityOrg) {
      console.error('❌ PrecuityAI organization not found');
      return;
    }

    console.log(`✅ Found PrecuityAI org (ID: ${precuityOrg.id})`);

    // Check membership
    const membership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: precuityOrg.id
        }
      }
    });

    if (!membership) {
      console.log('➕ Creating membership...');
      await prisma.member.create({
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

    // Update ALL sessions for this user to have the active organization
    const sessions = await prisma.session.updateMany({
      where: { 
        userId: user.id,
        expiresAt: {
          gt: new Date() // Only update non-expired sessions
        }
      },
      data: { 
        activeOrganizationId: precuityOrg.id 
      }
    });

    console.log(`✅ Updated ${sessions.count} active session(s)`);

    // Show current sessions
    const currentSessions = await prisma.session.findMany({
      where: { 
        userId: user.id,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        activeOrganizationId: true,
        expiresAt: true,
        createdAt: true
      }
    });

    console.log('\n📋 Current sessions:');
    currentSessions.forEach(s => {
      console.log(`  - Session ${s.id.substring(0, 8)}... | Org: ${s.activeOrganizationId || 'NONE'} | Expires: ${s.expiresAt.toISOString()}`);
    });

    console.log('\n✨ Session fix complete! Please refresh your browser.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSessionOrg();