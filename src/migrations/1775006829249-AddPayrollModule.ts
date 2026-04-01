import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayrollModule1775006829249 implements MigrationInterface {
    name = 'AddPayrollModule1775006829249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payrolls\` (\`id\` int NOT NULL AUTO_INCREMENT, \`month\` int NOT NULL, \`year\` int NOT NULL, UNIQUE INDEX \`IDX_9a974f673e1f9f03db898000ee\` (\`month\`, \`year\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD \`payrollId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD CONSTRAINT \`FK_0b52f082884d64be600fe4fd482\` FOREIGN KEY (\`payrollId\`) REFERENCES \`payrolls\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP FOREIGN KEY \`FK_0b52f082884d64be600fe4fd482\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP COLUMN \`payrollId\``);
        await queryRunner.query(`DROP INDEX \`IDX_9a974f673e1f9f03db898000ee\` ON \`payrolls\``);
        await queryRunner.query(`DROP TABLE \`payrolls\``);
    }

}
