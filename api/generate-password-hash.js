const bcrypt = require('bcrypt');

async function generateHash() {
  const password = '123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Пароль:', password);
  console.log('Bcrypt хэш:', hash);
  console.log('\nSQL команда для обновления:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE password_hash = '123';`);
}

generateHash().catch(console.error);
