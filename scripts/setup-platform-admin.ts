import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function setupPlatformAdmin() {
  const userEmail = process.argv[2] || 'prodiuscristian@gmail.com';
  
  console.log(`🔍 Setting up platform admin for: ${userEmail}`);

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`);
      console.log('Available users:');
      const users = await prisma.user.findMany();
      users.forEach(u => console.log(`  - ${u.email} (ID: ${u.id})`));
      return;
    }

    console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`);

    // Find or create PrecuityAI organization
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
          description: 'Platform administration organization - Full access to all platform features',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
          subscriptionStatus: 'active',
          subscriptionPlan: 'enterprise',
          billingEmail: 'admin@precuityai.com',
          metadata: {
            isPlatformOrg: true,
            createdBy: 'system',
            features: ['full_access', 'platform_admin', 'all_courses', 'all_organizations']
          }
        }
      });
      console.log('✅ PrecuityAI organization created');
    } else {
      console.log('✅ PrecuityAI organization already exists');
    }

    // Check if user is already a member
    const existingMembership = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: precuityOrg.id
        }
      }
    });

    if (existingMembership) {
      console.log('🔄 Updating existing membership to admin role...');
      await prisma.member.update({
        where: { id: existingMembership.id },
        data: { role: 'admin' }
      });
      console.log('✅ Membership updated to admin role');
    } else {
      console.log('➕ Creating new admin membership...');
      await prisma.member.create({
        data: {
          userId: user.id,
          organizationId: precuityOrg.id,
          role: 'admin'
        }
      });
      console.log('✅ Admin membership created');
    }

    // Update all user sessions to set active organization
    const updatedSessions = await prisma.session.updateMany({
      where: { userId: user.id },
      data: { activeOrganizationId: precuityOrg.id }
    });
    
    console.log(`✅ Updated ${updatedSessions.count} session(s) to set PrecuityAI as active organization`);

    console.log('\n🎉 Platform admin setup complete!');
    console.log(`User ${user.email} is now a platform admin of PrecuityAI organization.`);
    console.log('\n🔄 Please refresh your browser to apply the changes.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPlatformAdmin();