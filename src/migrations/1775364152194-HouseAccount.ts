import { MigrationInterface, QueryRunner } from "typeorm";

export class HouseAccount1775364152194 implements MigrationInterface {
    name = 'HouseAccount1775364152194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`billing_records\` ADD \`billingItemId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`billing_records\` ADD \`quantity\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`billing_records\` ADD \`unitPrice\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`billing_records\` ADD \`houseAccount\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`billing_records\` DROP COLUMN \`houseAccount\``);
        await queryRunner.query(`ALTER TABLE \`billing_records\` DROP COLUMN \`unitPrice\``);
        await queryRunner.query(`ALTER TABLE \`billing_records\` DROP COLUMN \`quantity\``);
        await queryRunner.query(`ALTER TABLE \`billing_records\` DROP COLUMN \`billingItemId\``);
    }

}
