import { createConnection } from 'typeorm';
import { config } from 'dotenv';
config();

(async () => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'postgres',
      entities: ['src/entities/**/*.ts'],
      migrations: ["src/migrations/**/*.ts"],
      synchronize: true, 
    });

    // Create the actual database if it does not exist
    const databaseName = process.env.DB_NAME; // Use the environment variable for the database name
    const query = `CREATE DATABASE ${databaseName};`;

    await connection.query(query);
    console.log(`Database "${databaseName}" created successfully.`);

    await connection.close();
  } catch (error) {
    console.error('Error creating database:', error);
  }
})();
