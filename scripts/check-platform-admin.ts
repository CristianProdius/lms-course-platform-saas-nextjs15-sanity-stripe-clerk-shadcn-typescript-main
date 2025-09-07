import { prisma } from "../lib/prisma";

async function checkPlatformAdmin() {
  try {
    // Platform admin emails
    const platformAdminEmails = [
      'prodiuscristian@gmail.com',
      ...(process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
      process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL
    ].filter(Boolean);

    console.log("Platform admin emails:", platformAdminEmails);

    // Check PrecuityAI organization
    const precuityOrg = await prisma.organization.findUnique({
      where: { slug: 'precuityai' },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!precuityOrg) {
      console.log("❌ PrecuityAI organization not found!");
      return;
    }

    console.log("\n✅ PrecuityAI organization found:");
    console.log("- ID:", precuityOrg.id);
    console.log("- Name:", precuityOrg.name);
    console.log("- Members:", precuityOrg.members.length);

    // Check each platform admin
    for (const email of platformAdminEmails) {
      console.log(`\nChecking platform admin: ${email}`);
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: {
              organization: true
            }
          }
        }
      });

      if (!user) {
        console.log(`  ❌ User not found`);
        continue;
      }

      console.log(`  ✅ User found: ${user.id}`);
      
      // Check if user is member of PrecuityAI
      const isMember = precuityOrg.members.some(m => m.userId === user.id);
      
      if (isMember) {
        console.log(`  ✅ Already a member of PrecuityAI`);
      } else {
        console.log(`  ❌ NOT a member of PrecuityAI - Adding...`);
        
        // Add as member
        await prisma.member.create({
          data: {
            userId: user.id,
            organizationId: precuityOrg.id,
            role: 'admin'
          }
        });
        
        console.log(`  ✅ Added as admin member of PrecuityAI`);
      }

      // List all user's organizations
      console.log(`  Organizations: ${user.memberships.length}`);
      user.memberships.forEach(m => {
        console.log(`    - ${m.organization.name} (${m.role})`);
      });
    }

    console.log("\n✅ Platform admin check complete!");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlatformAdmin();