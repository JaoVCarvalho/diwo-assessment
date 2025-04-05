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
            name: "countryId",
            type: "int",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        uniques: [
          {
            name: "UQ_places_countryId_local",
            columnNames: ["countryId", "local"],
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "places",
      new TableForeignKey({
        columnNames: ["countryId"],
        referencedTableName: "countries",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("places");
    if(table){
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("countryId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("places", foreignKey);
        }
    }
    await queryRunner.dropTable("places");
  }
}
