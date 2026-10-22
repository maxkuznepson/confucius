import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

// Конфигурация подключения к PostgreSQL
const dbConfig = {
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'confucius_school',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '', // Пустая строка = без пароля
};

// Создаём подключение через postgres.js
// Если пароль пустой — не передаём его (локальный доступ без пароля)
const connectionConfig: any = {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  max: 10, // Максимум подключений в пуле
  idle_timeout: 20,
  connect_timeout: 10,
};

// Добавляем пароль только если он задан
if (dbConfig.password) {
  connectionConfig.password = dbConfig.password;
}

export const sql = postgres(connectionConfig);

// Тест подключения
export async function testConnection(): Promise<void> {
  try {
    await sql`SELECT 1`;
    console.log('✅ PostgreSQL подключён успешно');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.username}`);
    console.log(`   Password: ${dbConfig.password ? '***' : '(без пароля)'}`);
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
