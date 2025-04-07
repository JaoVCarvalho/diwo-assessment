import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Res } from "@nestjs/common";
import { Response } from 'express';
import { CreateCountryDto } from './dto/create-country.dto';
import { CountriesService } from './countries.service';
import { Country } from "./countries.entity";
import { UpdateCountryDto } from "./dto/update-country.dto";

@Controller('countries')
export class CountriesController{
    constructor(private readonly countriesService: CountriesService) {}

    @Get('ping')
    ping(): string {
        return 'pong';
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
    async createMany(@Body() createCountryDto: CreateCountryDto[],@Res() res: Response) {
        const result = await this.countriesService.createMany(createCountryDto);
      
        if (result.skipped.length === 0) {
          return res.status(201).json({
            message: 'All countries were created successfully.',
            created: result.created
          });
        } else if (result.created.length === 0) {
          return res.status(409).json({
            message: 'No country was created. All already exist.',
            skipped: result.skipped
          });
        } else {
          return res.status(207).json({
            message: 'Some countries were created successfully.',
            created: result.created,
            skipped: result.skipped
          });
        }
      }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateCountryDto: UpdateCountryDto): Promise<Country> {
        return await this.countriesService.update(id, updateCountryDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.countriesService.remove(id);
    }   
}