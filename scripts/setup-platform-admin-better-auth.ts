import { prisma } from "../lib/prisma";

async function setupPlatformAdmin() {
  const userEmail = process.argv[2] || 'prodiuscristian@gmail.com';
  
  console.log(`🔧 Setting up platform admin for: ${userEmail}`);

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      console.log('Please sign up first at http://localhost:3003/sign-up');
      return;
    }

    console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`);

    // Check if PrecuityAI organization exists
    let precuityOrg = await prisma.organization.findUnique({
      where: { slug: 'precuityai' }
    });

    if (!precuityOrg) {
      console.log('📦 Creating PrecuityAI organization...');
      precuityOrg = await prisma.organization.create({
        data: {
          id: 'precuityai-org',
          name: 'PrecuityAI',
          slug: 'precuityai',
          createdAt: new Date(),
          metadata: {
            isPlatformOrg: true,
            createdBy: 'system',
            features: ['full_access', 'platform_admin', 'all_courses', 'all_organizations']
          }
        }
      });
      console.log('✅ PrecuityAI organization created');
    } else {
      console.log(`✅ PrecuityAI organization exists (ID: ${precuityOrg.id})`);
    }

    // Check if user is already a member
    let membership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: precuityOrg.id
        }
      }
    });

    if (!membership) {
      console.log('➕ Creating admin membership...');
      membership = await prisma.member.create({
        data: {
          userId: user.id,
          organizationId: precuityOrg.id,
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
              organizationId: precuityOrg.id
            }
          },
          data: { role: 'admin' }
        });
        console.log('✅ Updated role to admin');
      }
    }

    // Update ALL active sessions to set the organization
    const sessions = await prisma.session.updateMany({
      where: { 
        userId: user.id,
        expiresAt: {
          gt: new Date()
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

    console.log('\n✨ Platform admin setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to http://localhost:3003/dashboard');
    console.log('2. You should now see the PrecuityAI organization');
    console.log('3. Access platform admin at http://localhost:3003/dashboard/platform-admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPlatformAdmin();