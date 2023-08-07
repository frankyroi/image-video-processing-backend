import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export class NewDataSource extends DataSource {
  constructor() {
    super({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['src/entities/**/*.ts'],
      migrations: ["src/migrations/**/*.ts"],
      logging: true,
    });
    
  }
}

export default new NewDataSource();