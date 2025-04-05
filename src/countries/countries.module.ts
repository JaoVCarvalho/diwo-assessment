import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Country } from "./countries.entity";
import { CountriesController } from "./countries.controller";
import { CountriesService } from "./countries.service";

@Module({
    imports: [TypeOrmModule.forFeature([Country])],
    controllers: [CountriesController],
    providers: [CountriesService]    
})
export class CountriesModule {}