import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableCountries1743800621007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: "countries",
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            {
              name: "name",
              type: "varchar",
              isUnique: true,
              isNullable: false,
            },
            {
              name: "flagUrl",
              type: "varchar",
              isNullable: false,
            },
          ],
        })
      );
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("countries");
    }
  }
