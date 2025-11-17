import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating admin user...');
    
    // Create a new admin user
    const username = 'admin';
    const password = = process.env.ADMIN_KEY;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        username,
        role: 'admin'
      }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword }
      });
      
      console.log('Admin user updated:');
      console.log('ID:', updatedAdmin.id);
      console.log('Username:', username);
      console.log('Password:', password);
    } else {
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          username,
          password: hashedPassword,
          role: 'admin',
        }
      });
      
      console.log('Admin user created:');
      console.log('ID:', newAdmin.id);
      console.log('Username:', username);
      console.log('Password:', password);
    }
    
    console.log('\nYou can now login with these credentials');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 