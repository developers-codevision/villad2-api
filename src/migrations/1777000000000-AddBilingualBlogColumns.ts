import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBilingualBlogColumns1777000000000 implements MigrationInterface {
    name = 'AddBilingualBlogColumns1777000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`blogs\`
            ADD COLUMN \`title_es\` varchar(255) NOT NULL AFTER \`id\`,
            ADD COLUMN \`title_en\` varchar(255) NOT NULL AFTER \`title_es\`,
            ADD COLUMN \`slug_es\` varchar(255) NOT NULL AFTER \`title_en\`,
            ADD COLUMN \`slug_en\` varchar(255) NOT NULL AFTER \`slug_es\`,
            ADD COLUMN \`description_es\` text NULL AFTER \`slug_en\`,
            ADD COLUMN \`description_en\` text NULL AFTER \`description_es\`,
            ADD COLUMN \`content_es\` text NOT NULL AFTER \`description_en\`,
            ADD COLUMN \`content_en\` text NOT NULL AFTER \`content_es\`
        `);

        await queryRunner.query(`
            UPDATE \`blogs\` SET
            \`title_es\` = \`title\`,
            \`title_en\` = \`title\`,
            \`slug_es\` = \`slug\`,
            \`slug_en\` = \`slug\`,
            \`description_es\` = \`description\`,
            \`description_en\` = \`description\`,
            \`content_es\` = \`content\`,
            \`content_en\` = \`content\`
        `);

        await queryRunner.query(`ALTER TABLE \`blogs\` DROP INDEX \`IDX_7b18faaddd461656ff66f32e2d\``);

        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`slug\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`content\``);

        await queryRunner.query(`ALTER TABLE \`blogs\` ADD UNIQUE INDEX \`IDX_blog_slug_es\` (\`slug_es\`)`);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD UNIQUE INDEX \`IDX_blog_slug_en\` (\`slug_en\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP INDEX \`IDX_blog_slug_en\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP INDEX \`IDX_blog_slug_es\``);

        await queryRunner.query(`ALTER TABLE \`blogs\` ADD COLUMN \`title\` varchar(255) NOT NULL AFTER \`id\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD COLUMN \`slug\` varchar(255) NOT NULL AFTER \`title\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD COLUMN \`description\` text NULL AFTER \`slug\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` ADD COLUMN \`content\` text NOT NULL AFTER \`description\``);

        await queryRunner.query(`
            UPDATE \`blogs\` SET
            \`title\` = \`title_es\`,
            \`slug\` = \`slug_es\`,
            \`description\` = \`description_es\`,
            \`content\` = \`content_es\`
        `);

        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`title_es\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`title_en\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`slug_es\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`slug_en\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`description_es\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`description_en\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`content_es\``);
        await queryRunner.query(`ALTER TABLE \`blogs\` DROP COLUMN \`content_en\``);

        await queryRunner.query(`ALTER TABLE \`blogs\` ADD UNIQUE INDEX \`IDX_7b18faaddd461656ff66f32e2d\` (\`slug\`)`);
    }
}
