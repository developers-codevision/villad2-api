import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeOptionalsFieldsInReservations1775103337021 implements MigrationInterface {
    name = 'MakeOptionalsFieldsInReservations1775103337021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_73fa8fb7243b56914e00f8a0b14\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`reservationNumber\` \`reservationNumber\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`roomId\` \`roomId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`checkInDate\` \`checkInDate\` varchar(19) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`checkOutDate\` \`checkOutDate\` varchar(19) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`totalPrice\` \`totalPrice\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_73fa8fb7243b56914e00f8a0b14\` FOREIGN KEY (\`roomId\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_73fa8fb7243b56914e00f8a0b14\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`totalPrice\` \`totalPrice\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`checkOutDate\` \`checkOutDate\` varchar(19) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`checkInDate\` \`checkInDate\` varchar(19) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`roomId\` \`roomId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` CHANGE \`reservationNumber\` \`reservationNumber\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_73fa8fb7243b56914e00f8a0b14\` FOREIGN KEY (\`roomId\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
