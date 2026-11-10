import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultReviewsToInactive1794283200000 implements MigrationInterface {
  name = 'DefaultReviewsToInactive1794283200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `reviews` MODIFY `status` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `reviews` MODIFY `status` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'",
    );
  }
}
