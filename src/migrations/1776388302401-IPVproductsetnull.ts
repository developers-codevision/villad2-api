import { MigrationInterface, QueryRunner } from "typeorm";

export class IPVproductsetnull1776388302401 implements MigrationInterface {
    name = 'IPVproductsetnull1776388302401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP FOREIGN KEY \`FK_8c50de5b472d37129815cd622c7\``);
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD CONSTRAINT \`FK_8c50de5b472d37129815cd622c7\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP FOREIGN KEY \`FK_8c50de5b472d37129815cd622c7\``);
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD CONSTRAINT \`FK_8c50de5b472d37129815cd622c7\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
