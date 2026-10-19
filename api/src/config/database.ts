import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

// Конфигурация подключения к PostgreSQL
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'confucius_school',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
};

// Создаём подключение через postgres.js
export const sql = postgres({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  max: 10, // Максимум подключений в пуле
  idle_timeout: 20,
  connect_timeout: 10,
});

// Тест подключения
export async function testConnection(): Promise<void> {
  try {
    await sql`SELECT 1`;
    console.log('✅ PostgreSQL подключён успешно');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Закрытие подключения к БД...');
  await sql.end();
  process.exit(0);
});

export default sql;
