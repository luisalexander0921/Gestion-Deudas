import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Client } from 'pg';

async function createDatabaseIfNotExists() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME]
    );

    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`✅ Base de datos '${process.env.DB_NAME}' creada exitosamente`);
    } else {
      console.log(`ℹ️  Base de datos '${process.env.DB_NAME}' ya existe`);
    }
  } catch (error) {
    console.error('❌ Error al verificar/crear base de datos:', error.message);
  } finally {
    await client.end();
  }
}

async function bootstrap() {
  const envFilePath = join(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`);
  
  if (existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
  } else {
    console.log(`Env file ${envFilePath} not found, falling back to default .env`);
    dotenv.config();
  }

  // Verificar y crear base de datos antes de iniciar la aplicación
  await createDatabaseIfNotExists();

  const app = await NestFactory.create(AppModule);

  const directories = [
    join(__dirname, '..', '../uploads'),
    join(__dirname, '..', '../pdfs')
  ];

  // Verificar y crear directorios si no existen
  directories.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
