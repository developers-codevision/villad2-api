import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env
config({ path: path.join(__dirname, '..', '.env') });

export default new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsTableName: 'migrations',
  logging: false,
});
