import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTablePlaces1743801198620 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "places",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "local",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "meta",
            type: "date",
            isNullable: false,
          },
          {
            name: "country_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        uniques: [
          {
            name: "UQ_places_country_id_local",
            columnNames: ["country_id", "local"],
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "places",
      new TableForeignKey({
        columnNames: ["country_id"],
        referencedTableName: "countries",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("places");
    if(table){
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("country_id") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("places", foreignKey);
        }
    }
    await queryRunner.dropTable("places");
  }
}
