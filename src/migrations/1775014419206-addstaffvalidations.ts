import { MigrationInterface, QueryRunner } from "typeorm";

export class Addstaffvalidations1775014419206 implements MigrationInterface {
    name = 'Addstaffvalidations1775014419206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_6a0fba7f3eb61c4aeb2d50bbbc\` ON \`staff\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_6a0fba7f3eb61c4aeb2d50bbbc\` ON \`staff\` (\`staffname\`)`);
    }

}
