const { setupEnv, printDbInfo } = require('./utils');
setupEnv();
printDbInfo();

const { Client } = require('pg');

async function checkSchema() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    console.error('Error: Missing DATABASE_URL in .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database.');

    const query = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'qa_completed_at';
    `;

    const res = await client.query(query);
    if (res.rows.length > 0) {
      console.log('Column found:');
      console.log(JSON.stringify(res.rows, null, 2));
    } else {
      console.log('Column "qa_completed_at" NOT found in "orders" table.');
      
      // Also list all columns to see what's there
      const allCols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders'
      `);
      console.log('Available columns in "orders":');
      console.log(allCols.rows.map(r => r.column_name).join(', '));
    }
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

checkSchema();
