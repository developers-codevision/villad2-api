import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeOptionalsFieldsInClients1775103674437 implements MigrationInterface {
  name = 'MakeOptionalsFieldsInClients1775103674437';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`lastName\` \`lastName\` varchar(50) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`sex\` \`sex\` enum ('M', 'F', 'otro') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`email\` \`email\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`phone\` \`phone\` varchar(20) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`phone\` \`phone\` varchar(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`email\` \`email\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`sex\` \`sex\` enum ('M', 'F', 'otro') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`clients\` CHANGE \`lastName\` \`lastName\` varchar(50) NOT NULL`,
    );
  }
}
