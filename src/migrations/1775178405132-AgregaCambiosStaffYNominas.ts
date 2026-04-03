import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregaCambiosStaffYNominas1775178405132 implements MigrationInterface {
    name = 'AgregaCambiosStaffYNominas1775178405132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`attendances\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`attendanceDateTime\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payrolls\` (\`id\` int NOT NULL AUTO_INCREMENT, \`month\` int NOT NULL, \`year\` int NOT NULL, UNIQUE INDEX \`IDX_9a974f673e1f9f03db898000ee\` (\`month\`, \`year\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`salaries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`payrollId\` int NULL, \`netAmount\` decimal(10,2) NOT NULL, \`vacationsAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`grossAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`hours\` decimal(5,2) NULL, \`comment\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`absences\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`date\` date NOT NULL, \`reason\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffname\` varchar(100) NOT NULL, \`expNumber\` varchar(20) NOT NULL, \`type\` enum ('gerente', 'supervisora', 'Tec Contable', 'Recepcionista') NOT NULL DEFAULT 'Recepcionista', UNIQUE INDEX \`IDX_88795054038a91eee408cfec5b\` (\`expNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vacations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`staffId\` int NOT NULL, \`startDate\` date NOT NULL, \`endDate\` date NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`idNumber\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD UNIQUE INDEX \`IDX_d6378d81695b40cc9c90f2c5b6\` (\`idNumber\`)`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`type\` enum ('habitacion', 'terraza') NOT NULL DEFAULT 'habitacion'`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`hoursCount\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD \`observations\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_73fa8fb7243b56914e00f8a0b14\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`roomId\` \`roomId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`status\` \`status\` enum ('pendiente', 'confirmada', 'cancelada', 'terminada', 'no_show') NOT NULL DEFAULT 'pendiente'`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`baseGuestsCount\` \`baseGuestsCount\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`attendances\` ADD CONSTRAINT \`FK_587a0fa2d2de597e8e654b01009\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD CONSTRAINT \`FK_d9d0ce03b35695e9f5ad23de7bf\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`salaries\` ADD CONSTRAINT \`FK_0b52f082884d64be600fe4fd482\` FOREIGN KEY (\`payrollId\`) REFERENCES \`payrolls\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`absences\` ADD CONSTRAINT \`FK_112b27da7ca37fa5ee9ab58729d\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vacations\` ADD CONSTRAINT \`FK_9ceef3fecf763e5a8d609991f8a\` FOREIGN KEY (\`staffId\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_73fa8fb7243b56914e00f8a0b14\` FOREIGN KEY (\`roomId\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_73fa8fb7243b56914e00f8a0b14\``);
        await queryRunner.query(`ALTER TABLE \`vacations\` DROP FOREIGN KEY \`FK_9ceef3fecf763e5a8d609991f8a\``);
        await queryRunner.query(`ALTER TABLE \`absences\` DROP FOREIGN KEY \`FK_112b27da7ca37fa5ee9ab58729d\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP FOREIGN KEY \`FK_0b52f082884d64be600fe4fd482\``);
        await queryRunner.query(`ALTER TABLE \`salaries\` DROP FOREIGN KEY \`FK_d9d0ce03b35695e9f5ad23de7bf\``);
        await queryRunner.query(`ALTER TABLE \`attendances\` DROP FOREIGN KEY \`FK_587a0fa2d2de597e8e654b01009\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`baseGuestsCount\` \`baseGuestsCount\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`status\` \`status\` enum ('pendiente', 'confirmada', 'cancelada', 'terminada') NOT NULL DEFAULT 'pendiente'`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`roomId\` \`roomId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_73fa8fb7243b56914e00f8a0b14\` FOREIGN KEY (\`roomId\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`observations\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`hoursCount\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP INDEX \`IDX_d6378d81695b40cc9c90f2c5b6\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`idNumber\``);
        await queryRunner.query(`DROP TABLE \`vacations\``);
        await queryRunner.query(`DROP INDEX \`IDX_88795054038a91eee408cfec5b\` ON \`staff\``);
        await queryRunner.query(`DROP TABLE \`staff\``);
        await queryRunner.query(`DROP TABLE \`absences\``);
        await queryRunner.query(`DROP TABLE \`salaries\``);
        await queryRunner.query(`DROP INDEX \`IDX_9a974f673e1f9f03db898000ee\` ON \`payrolls\``);
        await queryRunner.query(`DROP TABLE \`payrolls\``);
        await queryRunner.query(`DROP TABLE \`attendances\``);
    }

}
