import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { env } from '../config/env';

async function main() {
  // 1️⃣ Create raw Postgres client
  const sql = postgres(env.DATABASE_URL, { max: 1 });

  // 2️⃣ Wrap it in Drizzle
  const db = drizzle(sql);

  try {
    // 3️⃣ Run migrations
    await migrate(db, {
      migrationsFolder: './src/db/migrations',
    });

    console.log('✅ Migrations completed');
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
