import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Place } from "./places.entity";
import { Country } from "src/countries/countries.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePlaceDto } from "./dto/create-place.dto";
import { UpdatePlaceDto } from "./dto/update-place.dto";

@Injectable()
export class PlacesService {

    constructor(
        @InjectRepository(Place)
        private readonly placesRepository: Repository<Place>,
        @InjectRepository(Country)
        private readonly countriesRepository: Repository<Country>,
    ){}

    async findAll(): Promise<Place[]> {
        return await this.placesRepository.find({ order: { meta: 'ASC' } });
    }

    async findOne(id: number): Promise<Place> {
        const place = await this.placesRepository.findOne({ where: { id } });
        if (!place) {
            throw new NotFoundException(`Place with id ${id} not found`);
        }
        return place;
    }

    async create(createPlaceDto: CreatePlaceDto): Promise<Place> {
        // Verifica se o país existe antes de criar o lugar
        const country = await this.countriesRepository.findOne({ where: { id: createPlaceDto.countryId } });
        if (!country) {
            throw new NotFoundException(`Country with id ${createPlaceDto.countryId} not found`);
        }
        
        // Verifica duplicidade: mesmo local para o mesmo país
        const existing = await this.placesRepository.findOne( { 
            where: { local: createPlaceDto.local, country: { id: createPlaceDto.countryId } },
            relations: ['country'],
        });

        if (existing) {
            throw new ConflictException(`Place with local ${createPlaceDto.local} already exists in country ${country.name}`);
        }

        const place = this.placesRepository.create({ 
            local: createPlaceDto.local,
            meta: new Date(`${createPlaceDto.meta}T12:00:00Z`),
            country: country,
        });

        return await this.placesRepository.save(place);
    }

    async update(id: number, updatePlaceDto: UpdatePlaceDto): Promise<Place>{
        const place = await this.findOne(id);

        // Se o local for alterado, verifica duplicidade para o mesmo país
        if (updatePlaceDto.local) {
            const duplicate = await this.placesRepository.findOne({ 
                where: { local: updatePlaceDto.local, country: { id: place.country.id } },
                relations: ['country'],
            });

            if (duplicate && duplicate.id !== id){
                throw new ConflictException(`Place with local ${updatePlaceDto.local} already exists in country ${place.country.name}`)
            }

            place.local = updatePlaceDto.local;
        }

        if (updatePlaceDto.meta) {
            place.meta = new Date(`${updatePlaceDto.meta}T12:00:00Z`);
        }

        return this.placesRepository.save(place);
    }

    async remove(id: number):Promise<void>{
        const result = await this.placesRepository.delete(id);

        if (result.affected === 0){
            throw new NotFoundException(`Place with id ${id} not found`);
        }
    }
}