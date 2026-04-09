import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTraductionColumns1775709899938 implements MigrationInterface {
    name = 'AddTraductionColumns1775709899938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rooms\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`rooms\` ADD \`description_es\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rooms\` ADD \`description_en\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` ADD \`title_en\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` ADD \`title_es\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` ADD \`description_en\` text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`promotions\` ADD \`description_es\` text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`promotions\` DROP COLUMN \`description_es\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` DROP COLUMN \`description_en\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` DROP COLUMN \`title_es\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` DROP COLUMN \`title_en\``);
        await queryRunner.query(`ALTER TABLE \`rooms\` DROP COLUMN \`description_en\``);
        await queryRunner.query(`ALTER TABLE \`rooms\` DROP COLUMN \`description_es\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` ADD \`description\` text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`promotions\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rooms\` ADD \`description\` text NOT NULL`);
    }

}
