import bcrypt from 'bcryptjs';

async function hashPassword() {
  const plain = "text here";
  const hash = await bcrypt.hash(plain, 10);
  console.log("Hashed password:", hash);
}

hashPassword();
