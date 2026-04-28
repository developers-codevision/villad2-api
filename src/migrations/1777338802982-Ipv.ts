import { MigrationInterface, QueryRunner } from "typeorm";

export class Ipv1777338802982 implements MigrationInterface {
    name = 'Ipv1777338802982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ipvs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('cocina', 'bar', 'minibar') NOT NULL, \`review\` text NULL, \`inital\` int NULL, \`final\` int NULL, \`intake\` int NULL, \`decrease\` int NULL, \`bills\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`ipvId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`rooms\` CHANGE \`description\` \`description\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`title\` \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`description\` \`description\` text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_fb006c75adaac45e874561744e8\` FOREIGN KEY (\`ipvId\`) REFERENCES \`ipvs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_fb006c75adaac45e874561744e8\``);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`promotions\` CHANGE \`title\` \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`rooms\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`ipvId\``);
        await queryRunner.query(`DROP TABLE \`ipvs\``);
    }

}
