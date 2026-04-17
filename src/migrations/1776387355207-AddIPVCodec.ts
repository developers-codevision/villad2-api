import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIPVCodec1776387355207 implements MigrationInterface {
    name = 'AddIPVCodec1776387355207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD \`code\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD UNIQUE INDEX \`IDX_b25e9abf41110ed6b6ab422800\` (\`code\`)`);
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP FOREIGN KEY \`FK_8c50de5b472d37129815cd622c7\``);
        await queryRunner.query(`ALTER TABLE \`ipvs\` CHANGE \`productId\` \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD CONSTRAINT \`FK_8c50de5b472d37129815cd622c7\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP FOREIGN KEY \`FK_8c50de5b472d37129815cd622c7\``);
        await queryRunner.query(`ALTER TABLE \`ipvs\` CHANGE \`productId\` \`productId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD CONSTRAINT \`FK_8c50de5b472d37129815cd622c7\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP INDEX \`IDX_b25e9abf41110ed6b6ab422800\``);
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP COLUMN \`code\``);
    }

}
