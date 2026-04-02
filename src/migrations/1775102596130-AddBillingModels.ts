import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingModels1775102596130 implements MigrationInterface {
    name = 'AddBillingModels1775102596130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`billing_payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`billingRecordId\` int NOT NULL, \`paymentMethod\` enum ('cash_usd', 'cash_eur', 'cash_cup', 'transfer_mobile', 'bizum', 'zelle', 'transfer_abroad', 'stripe', 'paypal') NOT NULL, \`currency\` enum ('USD', 'EUR', 'CUP') NOT NULL, \`amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`amountInUsd\` decimal(10,2) NOT NULL DEFAULT '0.00', \`exchangeRate\` decimal(10,4) NOT NULL DEFAULT '1.0000', \`billDenominations\` json NULL, \`isAdvance\` tinyint NOT NULL DEFAULT 0, \`advanceConsumed\` tinyint NOT NULL DEFAULT 0, \`advanceConsumedByBillingId\` int NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tax10_distributions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`billingRecordId\` int NOT NULL, \`totalTax10\` decimal(10,2) NOT NULL DEFAULT '0.00', \`distributions\` json NOT NULL, \`distributedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`billing_records\` (\`id\` int NOT NULL AUTO_INCREMENT, \`billingId\` int NOT NULL, \`date\` date NOT NULL, \`totalAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`tip\` decimal(10,2) NOT NULL DEFAULT '0.00', \`tax10Percent\` decimal(10,2) NOT NULL DEFAULT '0.00', \`grandTotal\` decimal(10,2) NOT NULL DEFAULT '0.00', \`paymentStatus\` enum ('pending', 'partial', 'paid', 'overpaid') NOT NULL DEFAULT 'pending', \`pendingAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`advanceBalance\` decimal(10,2) NOT NULL DEFAULT '0.00', \`isParked\` tinyint NOT NULL DEFAULT 0, \`conceptConsumptions\` json NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tip_distributions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`billingRecordId\` int NOT NULL, \`totalTip\` decimal(10,2) NOT NULL DEFAULT '0.00', \`distributions\` json NOT NULL, \`distributedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`concepts\` ADD \`autoConsumeInventory\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`concepts\` ADD \`isActive\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`totalUsd\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`totalCup\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`discount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`discountType\` enum ('percentage', 'fixed') NOT NULL DEFAULT 'fixed'`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`pendingConsumption\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`roomNumber\` varchar(10) NULL`);
        await queryRunner.query(`ALTER TABLE \`billing_items\` ADD \`conceptSource\` enum ('minibar', 'terraza', 'alojamiento', 'other') NOT NULL DEFAULT 'other'`);
        await queryRunner.query(`ALTER TABLE \`billing_payments\` ADD CONSTRAINT \`FK_32f35eabab2b9fe98e1127cf5f2\` FOREIGN KEY (\`billingRecordId\`) REFERENCES \`billing_records\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tax10_distributions\` ADD CONSTRAINT \`FK_283ba9ce3b59a2c66e2432b86e6\` FOREIGN KEY (\`billingRecordId\`) REFERENCES \`billing_records\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`billing_records\` ADD CONSTRAINT \`FK_a3efa73cb3c5b1bb96fefa92e45\` FOREIGN KEY (\`billingId\`) REFERENCES \`billings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tip_distributions\` ADD CONSTRAINT \`FK_06ad02e9043a587b948137b1980\` FOREIGN KEY (\`billingRecordId\`) REFERENCES \`billing_records\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tip_distributions\` DROP FOREIGN KEY \`FK_06ad02e9043a587b948137b1980\``);
        await queryRunner.query(`ALTER TABLE \`billing_records\` DROP FOREIGN KEY \`FK_a3efa73cb3c5b1bb96fefa92e45\``);
        await queryRunner.query(`ALTER TABLE \`tax10_distributions\` DROP FOREIGN KEY \`FK_283ba9ce3b59a2c66e2432b86e6\``);
        await queryRunner.query(`ALTER TABLE \`billing_payments\` DROP FOREIGN KEY \`FK_32f35eabab2b9fe98e1127cf5f2\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`conceptSource\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`roomNumber\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`pendingConsumption\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`discountType\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`discount\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`totalCup\``);
        await queryRunner.query(`ALTER TABLE \`billing_items\` DROP COLUMN \`totalUsd\``);
        await queryRunner.query(`ALTER TABLE \`concepts\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`concepts\` DROP COLUMN \`autoConsumeInventory\``);
        await queryRunner.query(`DROP TABLE \`tip_distributions\``);
        await queryRunner.query(`DROP TABLE \`billing_records\``);
        await queryRunner.query(`DROP TABLE \`tax10_distributions\``);
        await queryRunner.query(`DROP TABLE \`billing_payments\``);
    }

}
