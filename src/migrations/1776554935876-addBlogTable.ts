import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogTable1776554935876 implements MigrationInterface {
    name = 'AddBlogTable1776554935876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`blogs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` text NULL, \`content\` text NOT NULL, \`image\` varchar(500) NULL, \`status\` varchar(20) NOT NULL DEFAULT 'HIDDEN', \`publishedAt\` date NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7b18faaddd461656ff66f32e2d\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_7b18faaddd461656ff66f32e2d\` ON \`blogs\``);
        await queryRunner.query(`DROP TABLE \`blogs\``);
    }

}
