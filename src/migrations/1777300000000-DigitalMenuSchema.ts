import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class DigitalMenuSchema1777300000000 implements MigrationInterface {
  name = 'DigitalMenuSchema1777300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'menus',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '100' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'schedule', type: 'varchar', length: '100', isNullable: true },
        { name: 'order', type: 'int', default: 0 },
        { name: 'active', type: 'tinyint', width: 1, default: 1 },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'categories',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '100' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'active', type: 'tinyint', width: 1, default: 1 },
        { name: 'order', type: 'int', default: 0 },
        { name: 'menu_id', type: 'int' },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createForeignKey('categories', new TableForeignKey({
      columnNames: ['menu_id'], referencedColumnNames: ['id'], referencedTableName: 'menus', onDelete: 'CASCADE',
    }));

    await queryRunner.createTable(new Table({
      name: 'menu_products',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '300' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'price', type: 'decimal', precision: 10, scale: 2 },
        { name: 'active', type: 'tinyint', width: 1, default: 1 },
        { name: 'featured', type: 'tinyint', width: 1, default: 0 },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'category_product',
      columns: [
        { name: 'category_id', type: 'int', isPrimary: true },
        { name: 'product_id', type: 'int', isPrimary: true },
        { name: 'order', type: 'int', default: 0 },
      ],
    }), true);

    await queryRunner.createForeignKey('category_product', new TableForeignKey({
      columnNames: ['category_id'], referencedColumnNames: ['id'], referencedTableName: 'categories', onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('category_product', new TableForeignKey({
      columnNames: ['product_id'], referencedColumnNames: ['id'], referencedTableName: 'menu_products', onDelete: 'CASCADE',
    }));

    await queryRunner.createTable(new Table({
      name: 'subtitulos',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'menu_id', type: 'int' },
        { name: 'text', type: 'text' },
        { name: 'order', type: 'int', default: 0 },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createForeignKey('subtitulos', new TableForeignKey({
      columnNames: ['menu_id'], referencedColumnNames: ['id'], referencedTableName: 'menus', onDelete: 'CASCADE',
    }));

    await queryRunner.createTable(new Table({
      name: 'service_config',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'key', type: 'varchar', length: '50', isUnique: true },
        { name: 'value', type: 'text' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subtitulos');
    await queryRunner.dropTable('category_product');
    await queryRunner.dropTable('menu_products');
    await queryRunner.dropTable('categories');
    await queryRunner.dropTable('service_config');
    await queryRunner.dropTable('menus');
  }
}
