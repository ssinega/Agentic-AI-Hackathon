const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Verifying database...\n');
    
    const users = await prisma.user.findMany();
    console.log('✓ Users in database:', users.length);
    
    if (users.length > 0) {
      console.log('\nUser details:');
      users.forEach(u => {
        console.log(`  - Email: ${u.email}`);
        console.log(`    Name: ${u.name}`);
        console.log(`    ID: ${u.id}`);
        console.log(`    Created: ${u.createdAt}`);
        console.log('');
      });
    }

    console.log('✓ Database connection successful');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
