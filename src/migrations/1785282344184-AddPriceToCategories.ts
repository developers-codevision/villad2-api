import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceToCategories1785282344184 implements MigrationInterface {
    name = 'AddPriceToCategories1785282344184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` ADD \`price\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`price\``);
    }
}
