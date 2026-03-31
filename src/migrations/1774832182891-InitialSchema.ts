import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1774832182891 implements MigrationInterface {
  name = 'InitialSchema1774832182891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL, \`password\` varchar(255) NOT NULL, \`email\` varchar(100) NOT NULL, \`fullName\` varchar(100) NULL, \`phone\` varchar(20) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`roles\` json NOT NULL, \`resetPasswordToken\` varchar(100) NULL, \`resetPasswordExpires\` timestamp NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`refreshToken\` varchar(255) NULL, UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`rooms\` (\`id\` int NOT NULL AUTO_INCREMENT, \`number\` varchar(10) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` text NOT NULL, \`pricePerNight\` decimal(10,2) NOT NULL, \`baseCapacity\` int NOT NULL, \`extraCapacity\` int NOT NULL, \`extraGuestCharge\` decimal(10,2) NOT NULL, \`roomType\` enum ('standard_economic', 'standard', 'standard_plus', 'suite_balcony') NOT NULL DEFAULT 'standard', \`roomAmenities\` json NULL, \`bathroomAmenities\` json NULL, \`status\` enum ('vacia_limpia', 'vacia_sucia', 'fuera_de_orden', 'ocupada') NOT NULL DEFAULT 'vacia_limpia', \`mainPhoto\` json NULL, \`additionalPhotos\` json NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_82a975f8999493b4cf1fbd9f88\` (\`number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`key\` varchar(100) NOT NULL, \`description\` text NOT NULL, \`value\` decimal(10,2) NOT NULL DEFAULT '0.00', \`type\` varchar(20) NOT NULL DEFAULT 'currency', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c8639b7626fa94ba8265628f21\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reviews\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`stars\` int NOT NULL, \`response\` text NULL, \`status\` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`clients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(50) NOT NULL, \`lastName\` varchar(50) NOT NULL, \`sex\` enum ('M', 'F', 'otro') NOT NULL, \`email\` varchar(100) NOT NULL, \`phone\` varchar(20) NOT NULL, \`idNumber\` varchar(20) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d6378d81695b40cc9c90f2c5b6\` (\`idNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reservations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reservationNumber\` varchar(20) NOT NULL, \`roomId\` int NULL, \`clientId\` int NOT NULL, \`checkInDate\` varchar(19) NOT NULL, \`checkOutDate\` varchar(19) NOT NULL, \`reservedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`status\` enum ('pendiente', 'confirmada', 'cancelada', 'terminada', 'no_show') NOT NULL DEFAULT 'pendiente', \`type\` enum ('habitacion', 'terraza') NOT NULL DEFAULT 'habitacion', \`baseGuestsCount\` int NOT NULL DEFAULT '1', \`extraGuestsCount\` int NOT NULL DEFAULT '0', \`hoursCount\` int NOT NULL DEFAULT '0', \`notes\` text NULL, \`observations\` text NULL, \`additionalGuests\` json NULL, \`earlyCheckIn\` tinyint NOT NULL DEFAULT 0, \`lateCheckOut\` tinyint NOT NULL DEFAULT 0, \`transferRoundTrip\` tinyint NOT NULL DEFAULT 0, \`transferOneWay\` tinyint NOT NULL DEFAULT 0, \`breakfasts\` int NOT NULL DEFAULT '0', \`totalPrice\` decimal(10,2) NOT NULL, \`stripePaymentIntentId\` varchar(255) NULL, \`paymentStatus\` varchar(50) NULL, \`paymentExpiresAt\` timestamp NULL, UNIQUE INDEX \`IDX_2570c3e5cdb61dd04ae72f3e8c\` (\`reservationNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`promotions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`maxPeople\` int NOT NULL DEFAULT '0', \`minPeople\` int NOT NULL DEFAULT '0', \`time\` varchar(100) NOT NULL DEFAULT '', \`services\` text NOT NULL, \`description\` text NOT NULL DEFAULT '', \`checkInTime\` varchar(10) NOT NULL DEFAULT '', \`checkOutTime\` varchar(10) NOT NULL DEFAULT '', \`photo\` varchar(255) NULL, \`status\` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_families\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`code\` int NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_188255f51f667edca9325ee715\` (\`name\`), UNIQUE INDEX \`IDX_948530a3d539ecd6d758a797a5\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_daily_records\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`productId\` int NOT NULL, \`initial\` decimal(10,2) NOT NULL DEFAULT '0.00', \`incoming\` decimal(10,2) NOT NULL DEFAULT '0.00', \`consumption\` decimal(10,2) NOT NULL DEFAULT '0.00', \`waste\` decimal(10,2) NOT NULL DEFAULT '0.00', \`homeConsumption\` decimal(10,2) NOT NULL DEFAULT '0.00', \`final\` decimal(10,2) NOT NULL DEFAULT '0.00', \`observations\` text NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_dc1e30b6ac7d849dedf6ddf680\` (\`productId\`, \`date\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` int NOT NULL, \`name\` varchar(100) NOT NULL, \`unitMeasure\` varchar(20) NOT NULL, \`volume\` varchar(50) NOT NULL, \`price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`productFamilyId\` int NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7cfc24d6c24f0ec91294003d6b\` (\`code\`), UNIQUE INDEX \`IDX_4c9fb58de893725258746385e1\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`stripePaymentIntentId\` varchar(255) NOT NULL, \`reservationId\` int NOT NULL, \`status\` enum ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded') NOT NULL DEFAULT 'pending', \`type\` enum ('reservation', 'deposit', 'full_payment') NOT NULL DEFAULT 'reservation', \`amount\` decimal(10,2) NOT NULL, \`currency\` varchar(3) NOT NULL, \`stripeCustomerId\` varchar(255) NULL, \`stripeChargeId\` varchar(255) NULL, \`failureReason\` text NULL, \`metadata\` json NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_57059f281caef51ef1c15adaf3\` (\`stripePaymentIntentId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`concepts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`priceUsd\` decimal(10,2) NOT NULL DEFAULT '0.00', \`category\` varchar(255) NULL, \`productId\` int NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a9039e79ac8b5547a83266668c\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`billing_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`billingId\` int NOT NULL, \`conceptId\` int NOT NULL, \`quantity\` decimal(10,2) NOT NULL DEFAULT '0.00', \`priceUsd\` decimal(10,2) NOT NULL DEFAULT '0.00', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`billings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`usdToCupRate\` decimal(10,2) NOT NULL DEFAULT '1.00', \`eurToCupRate\` decimal(10,2) NOT NULL DEFAULT '1.00', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3e3139358adc56ae3c32e5d08e\` (\`date\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`paypal_payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`paypalOrderId\` varchar(255) NOT NULL, \`paypalPaymentId\` varchar(255) NULL, \`reservationId\` int NOT NULL, \`status\` enum ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded') NOT NULL DEFAULT 'pending', \`type\` enum ('reservation', 'deposit', 'full_payment') NOT NULL DEFAULT 'reservation', \`amount\` decimal(10,2) NOT NULL, \`currency\` varchar(3) NOT NULL, \`paypalPayerId\` varchar(255) NULL, \`failureReason\` text NULL, \`metadata\` json NULL, \`paypalResponse\` json NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_2633a53ff5d0c7a90285f8f5ef\` (\`paypalOrderId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_73fa8fb7243b56914e00f8a0b14\` FOREIGN KEY (\`roomId\`) REFERENCES \`rooms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_e31637a1b37f007468858cd3855\` FOREIGN KEY (\`clientId\`) REFERENCES \`clients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_daily_records\` ADD CONSTRAINT \`FK_8a1a0f111602f8d35ea780bba66\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_6cc12940073ebd8958669cc94b6\` FOREIGN KEY (\`productFamilyId\`) REFERENCES \`product_families\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_1221b304716c539fde3fb3cb8db\` FOREIGN KEY (\`reservationId\`) REFERENCES \`reservations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`billing_items\` ADD CONSTRAINT \`FK_12cd954c5fe58b742dd810062f4\` FOREIGN KEY (\`billingId\`) REFERENCES \`billings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`billing_items\` ADD CONSTRAINT \`FK_f9789a114510eadcca6181a2bee\` FOREIGN KEY (\`conceptId\`) REFERENCES \`concepts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`paypal_payments\` ADD CONSTRAINT \`FK_1f5a56e6492385f90e8a43492bd\` FOREIGN KEY (\`reservationId\`) REFERENCES \`reservations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`paypal_payments\` DROP FOREIGN KEY \`FK_1f5a56e6492385f90e8a43492bd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`billing_items\` DROP FOREIGN KEY \`FK_f9789a114510eadcca6181a2bee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`billing_items\` DROP FOREIGN KEY \`FK_12cd954c5fe58b742dd810062f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_1221b304716c539fde3fb3cb8db\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_6cc12940073ebd8958669cc94b6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_daily_records\` DROP FOREIGN KEY \`FK_8a1a0f111602f8d35ea780bba66\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_e31637a1b37f007468858cd3855\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_73fa8fb7243b56914e00f8a0b14\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_2633a53ff5d0c7a90285f8f5ef\` ON \`paypal_payments\``,
    );
    await queryRunner.query(`DROP TABLE \`paypal_payments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_3e3139358adc56ae3c32e5d08e\` ON \`billings\``,
    );
    await queryRunner.query(`DROP TABLE \`billings\``);
    await queryRunner.query(`DROP TABLE \`billing_items\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a9039e79ac8b5547a83266668c\` ON \`concepts\``,
    );
    await queryRunner.query(`DROP TABLE \`concepts\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_57059f281caef51ef1c15adaf3\` ON \`payments\``,
    );
    await queryRunner.query(`DROP TABLE \`payments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_4c9fb58de893725258746385e1\` ON \`products\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7cfc24d6c24f0ec91294003d6b\` ON \`products\``,
    );
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_dc1e30b6ac7d849dedf6ddf680\` ON \`product_daily_records\``,
    );
    await queryRunner.query(`DROP TABLE \`product_daily_records\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_948530a3d539ecd6d758a797a5\` ON \`product_families\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_188255f51f667edca9325ee715\` ON \`product_families\``,
    );
    await queryRunner.query(`DROP TABLE \`product_families\``);
    await queryRunner.query(`DROP TABLE \`promotions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_2570c3e5cdb61dd04ae72f3e8c\` ON \`reservations\``,
    );
    await queryRunner.query(`DROP TABLE \`reservations\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_d6378d81695b40cc9c90f2c5b6\` ON \`clients\``,
    );
    await queryRunner.query(`DROP TABLE \`clients\``);
    await queryRunner.query(`DROP TABLE \`reviews\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_c8639b7626fa94ba8265628f21\` ON \`settings\``,
    );
    await queryRunner.query(`DROP TABLE \`settings\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_82a975f8999493b4cf1fbd9f88\` ON \`rooms\``,
    );
    await queryRunner.query(`DROP TABLE \`rooms\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
