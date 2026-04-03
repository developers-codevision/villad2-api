import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConceptProducts1775236501242 implements MigrationInterface {
  name = 'ConceptProducts1775236501242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the concept_products table
    await queryRunner.query(`
            CREATE TABLE \`concept_products\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`conceptId\` int NOT NULL,
                \`productId\` int NOT NULL,
                \`quantity\` decimal(10,2) NOT NULL DEFAULT 1,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    // Add foreign keys
    await queryRunner.query(`
            ALTER TABLE \`concept_products\` 
            ADD CONSTRAINT \`FK_6043e301f2f6a55a0e77ef56d94\` 
            FOREIGN KEY (\`conceptId\`) REFERENCES \`concepts\`(\`id\`) ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE \`concept_products\` 
            ADD CONSTRAINT \`FK_f3c43fe25953807b5d3f5b8a66f\` 
            FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`concept_products\` DROP FOREIGN KEY \`FK_f3c43fe25953807b5d3f5b8a66f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`concept_products\` DROP FOREIGN KEY \`FK_6043e301f2f6a55a0e77ef56d94\``,
    );
    await queryRunner.query(`DROP TABLE \`concept_products\``);
  }
}
