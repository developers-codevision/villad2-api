import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogCommentsTable1777200000000 implements MigrationInterface {
    name = 'AddBlogCommentsTable1777200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`blog_comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`post_id\` int NOT NULL, \`name\` varchar(100) NOT NULL, \`content\` text NOT NULL, \`response\` text NULL, \`status\` varchar(20) NOT NULL DEFAULT 'INACTIVE', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`blog_comments\` ADD CONSTRAINT \`FK_blog_comments_post_id\` FOREIGN KEY (\`post_id\`) REFERENCES \`blogs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_comments\` DROP FOREIGN KEY \`FK_blog_comments_post_id\``);
        await queryRunner.query(`DROP TABLE \`blog_comments\``);
    }

}
