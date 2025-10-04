import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class DatabaseSetupService {
  private readonly logger = new Logger(DatabaseSetupService.name);

  constructor(private configService: ConfigService) {}

  async createDatabaseIfNotExists(): Promise<void> {
    const dbName = this.configService.get<string>('database.postgres.database');
    const host = this.configService.get<string>('database.postgres.host');
    const port = this.configService.get<number>('database.postgres.port');
    const username = this.configService.get<string>('database.postgres.username');
    const password = this.configService.get<string>('database.postgres.password');

    // Conectar a la base de datos 'postgres' por defecto para crear la nueva BD
    const client = new Client({
      host,
      port,
      user: username,
      password,
      database: 'postgres', // Base de datos por defecto
    });

    try {
      await client.connect();
      
      // Verificar si la base de datos existe
      const result = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );

      if (result.rows.length === 0) {
        // La base de datos no existe, crearla
        await client.query(`CREATE DATABASE "${dbName}"`);
        this.logger.log(`Base de datos '${dbName}' creada exitosamente`);
      } else {
        this.logger.log(`Base de datos '${dbName}' ya existe`);
      }
    } catch (error) {
      this.logger.error(`Error al crear la base de datos: ${error.message}`);
      throw error;
    } finally {
      await client.end();
    }
  }
}