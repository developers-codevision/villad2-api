import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIpv1776372507809 implements MigrationInterface {
    name = 'AddIpv1776372507809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ipvs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('cocina', 'bar', 'minibar') NOT NULL, \`productId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`rooms\` CHANGE \`description\` \`description\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`title\` \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`description\` \`description\` text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`ipvs\` ADD CONSTRAINT \`FK_8c50de5b472d37129815cd622c7\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ipvs\` DROP FOREIGN KEY \`FK_8c50de5b472d37129815cd622c7\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`title\` \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`rooms\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`DROP TABLE \`ipvs\``);
    }

}
