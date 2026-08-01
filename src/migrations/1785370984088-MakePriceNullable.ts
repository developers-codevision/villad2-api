import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePriceNullable1785370984088 implements MigrationInterface {
    name = 'MakePriceNullable1785370984088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu_products\` CHANGE \`price\` \`price\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu_products\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL`);
    }
}