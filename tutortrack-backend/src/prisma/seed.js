/**
 * Seed Script — run with: npm run seed
 * Creates an admin user + sample subjects + 2 sample students
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashed = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'trevourthetutor001@gmail.com' },
    update: {},
    create: {
      name: 'Trevour Sithole',
      email: 'trevourthetutor001@gmail.com',
      password: hashed,
      role: 'admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Subjects
  const subjectNames = ['Mathematics', 'Physical Science', 'English', 'Life Sciences', 'Accounting'];
  for (const name of subjectNames) {
    await prisma.subject.upsert({
      where: { id: name }, // won't match — will create
      update: {},
      create: { name },
    }).catch(() =>
      prisma.subject.findFirst({ where: { name } }) // already exists, skip
    );
  }
  // Simpler approach for subjects
  for (const name of subjectNames) {
    const exists = await prisma.subject.findFirst({ where: { name } });
    if (!exists) await prisma.subject.create({ data: { name } });
  }
  console.log('✅ Subjects seeded');

  // Sample students
  const students = [
    { full_name: 'Siyanda Dlamini', email: 'siyanda@example.com', phone: '071 234 5678', grade: 'Grade 11' },
    { full_name: 'Amahle Zulu',     email: 'amahle@example.com',  phone: '082 345 6789', grade: 'Grade 10' },
  ];
  for (const s of students) {
    const exists = await prisma.student.findFirst({ where: { email: s.email } });
    if (!exists) await prisma.student.create({ data: s });
  }
  console.log('✅ Sample students seeded');

  console.log('\n🎉 Done! Login with:');
  console.log('   Email:    trevourthetutor001@gmail.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  Change the password immediately after first login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
