import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumn1775334823945 implements MigrationInterface {
    name = 'ChangeColumn1775334823945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`billing_records\` ADD \`change\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`billing_records\` DROP COLUMN \`change\``);
    }

}
