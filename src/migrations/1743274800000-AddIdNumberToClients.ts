import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdNumberToClients1743274800000 implements MigrationInterface {
  name = 'AddIdNumberToClients1743274800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna idNumber a la tabla clients
    await queryRunner.query(`
      ALTER TABLE clients 
      ADD COLUMN idNumber VARCHAR(20) NULL,
      ADD UNIQUE INDEX IDX_CLIENTS_ID_NUMBER (idNumber)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna idNumber
    await queryRunner.query(`
      ALTER TABLE clients 
      DROP INDEX IDX_CLIENTS_ID_NUMBER,
      DROP COLUMN idNumber
    `);
  }
}
