import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Place } from "./places.entity";
import { Country } from "src/countries/countries.entity";
import { PlacesController } from "./places.controller";
import { PlacesService } from "./places.service";

@Module({
    imports: [TypeOrmModule.forFeature([Place, Country])],
    controllers: [PlacesController],
    providers: [PlacesService],
})
export class PlacesModule {}