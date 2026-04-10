import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSpanishColumns1775715000000 implements MigrationInterface {
  name = 'RemoveSpanishColumns1775715000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar columnas 'es' de la tabla rooms
    await queryRunner.query(`
      ALTER TABLE \`rooms\` DROP COLUMN \`description_es\`
    `);

    // Renombrar description_en a description en rooms
    await queryRunner.query(`
      ALTER TABLE \`rooms\` CHANGE \`description_en\` \`description\` text
    `);

    // Eliminar columnas 'es' de la tabla promotions
    await queryRunner.query(`
      ALTER TABLE \`promotions\` DROP COLUMN \`title_es\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`promotions\` DROP COLUMN \`description_es\`
    `);

    // Renombrar columnas 'en' a nombres sin sufijo en promotions
    await queryRunner.query(`
      ALTER TABLE \`promotions\` CHANGE \`title_en\` \`title\` varchar(255)
    `);

    await queryRunner.query(`
      ALTER TABLE \`promotions\` CHANGE \`description_en\` \`description\` text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en promotions
    await queryRunner.query(`
      ALTER TABLE \`promotions\` CHANGE \`title\` \`title_en\` varchar(255)
    `);

    await queryRunner.query(`
      ALTER TABLE \`promotions\` CHANGE \`description\` \`description_en\` text
    `);

    await queryRunner.query(`
      ALTER TABLE \`promotions\` ADD \`title_es\` varchar(255) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`promotions\` ADD \`description_es\` text DEFAULT ''
    `);

    // Revertir cambios en rooms
    await queryRunner.query(`
      ALTER TABLE \`rooms\` CHANGE \`description\` \`description_en\` text
    `);

    await queryRunner.query(`
      ALTER TABLE \`rooms\` ADD \`description_es\` text NOT NULL
    `);
  }
}
