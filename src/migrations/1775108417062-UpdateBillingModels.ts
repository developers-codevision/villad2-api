import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBillingModels1775108417062 implements MigrationInterface {
  name = 'UpdateBillingModels1775108417062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`concepts\` DROP COLUMN \`priceUsd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`concepts\` DROP COLUMN \`autoConsumeInventory\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`concepts\` DROP COLUMN \`isActive\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`concepts\` ADD \`isActive\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`concepts\` ADD \`autoConsumeInventory\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`concepts\` ADD \`priceUsd\` decimal(10,2) NOT NULL DEFAULT 0.00`,
    );
  }
}
