import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffModels1774915167475 implements MigrationInterface {
    name = 'AddStaffModels1774915167475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`attendances\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`attendanceDateTime\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`salaries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`comment\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`absences\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`date\` date NOT NULL, \`reason\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffname\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_6a0fba7f3eb61c4aeb2d50bbbc\` (\`staffname\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vacations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`startDate\` date NOT NULL, \`endDate\` date NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`attendances\` ADD CONSTRAINT \`FK_587a0fa2d2de597e8e654b01009\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD CONSTRAINT \`FK_d9d0ce03b35695e9f5ad23de7bf\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`absences\` ADD CONSTRAINT \`FK_112b27da7ca37fa5ee9ab58729d\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacations\` ADD CONSTRAINT \`FK_9ceef3fecf763e5a8d609991f8a\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vacations\` DROP FOREIGN KEY \`FK_9ceef3fecf763e5a8d609991f8a\``);
        await queryRunner.query(`ALTER TABLE \`absences\` DROP FOREIGN KEY \`FK_112b27da7ca37fa5ee9ab58729d\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP FOREIGN KEY \`FK_d9d0ce03b35695e9f5ad23de7bf\``);
        await queryRunner.query(`ALTER TABLE \`attendances\` DROP FOREIGN KEY \`FK_587a0fa2d2de597e8e654b01009\``);
        await queryRunner.query(`DROP TABLE \`vacations\``);
        await queryRunner.query(`DROP INDEX \`IDX_6a0fba7f3eb61c4aeb2d50bbbc\` ON \`staff\``);
        await queryRunner.query(`DROP TABLE \`staff\``);
        await queryRunner.query(`DROP TABLE \`absences\``);
        await queryRunner.query(`DROP TABLE \`salaries\``);
        await queryRunner.query(`DROP TABLE \`attendances\``);
    }

}
