import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { CreateCountryDto } from './dto/create-country.dto';
import { CountriesService } from './countries.service';
import { Country } from "./countries.entity";
import { UpdateCountryDto } from "./dto/update-country.dto";

@Controller('countries')
export class CountriesController{
    constructor(private readonly countriesService: CountriesService) {}

    @Get('/hello')
    async hello(): Promise<string> {
        return 'Welcome to the Countries Controller!'; 
    }

    @Get()
    async getAll(): Promise<Country[]> {
        return await this.countriesService.findAll();
    }

    @Post()
    async create(@Body() createCountryDto: CreateCountryDto): Promise<Country> {
        return await this.countriesService.create(createCountryDto);
    }
    
    @Post('many')
    async createMany(@Body() createCountryDtos: CreateCountryDto[]): Promise<Country[]> {
        return await this.countriesService.createMany(createCountryDtos);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateCountryDto: UpdateCountryDto): Promise<Country> {
        return await this.countriesService.update(id, updateCountryDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.countriesService.delete(id);
    }   
}