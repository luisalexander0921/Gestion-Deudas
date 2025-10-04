const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

async function setupDatabase() {
  const dbName = process.env.DB_NAME;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;

  console.log(`Configurando base de datos: ${dbName}`);

  const client = new Client({
    host,
    port,
    user: username,
    password,
    database: 'postgres', // Conectar a la BD por defecto
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');

    // Verificar si la base de datos existe
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Crear la base de datos
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    } else {
      console.log(`ℹ️  Base de datos '${dbName}' ya existe`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();