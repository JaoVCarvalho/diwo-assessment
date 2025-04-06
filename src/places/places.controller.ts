import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { PlacesService } from "./places.service";
import { Place } from "./places.entity";
import { CreatePlaceDto } from "./dto/create-place.dto";
import { UpdatePlaceDto } from "./dto/update-place.dto";

@Controller('places')
export class PlacesController{
    constructor(private readonly placesService: PlacesService){}

    @Get('Hello')
    async hello(): Promise<string> {
        return "Welcone to Places Controller!"
    }

    @Get()
    async getAll():Promise<Place[]>{
        return await this.placesService.findAll();
    }

    @Post()
    async create(@Body() createPlaceDto: CreatePlaceDto):Promise<Place>{
        return await this.placesService.create(createPlaceDto);
    }

    // Pensar em qual faz mais sentido PUT ou PATCH
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number, @Body() updatePlaceDto: UpdatePlaceDto): Promise<Place>{
        return await this.placesService.update(id, updatePlaceDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void>{
        return await this.placesService.remove(id);
    }
    
}