import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHoursAndAmmountSalary1775010280984 implements MigrationInterface {
    name = 'AddHoursAndAmmountSalary1775010280984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP COLUMN \`amount\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD \`netAmount\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD \`vacationsAmount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD \`grossAmount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD \`hours\` decimal(5,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP COLUMN \`hours\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP COLUMN \`grossAmount\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP COLUMN \`vacationsAmount\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP COLUMN \`netAmount\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD \`amount\` decimal(10,2) NOT NULL`);
    }

}
