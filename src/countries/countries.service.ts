import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Country } from "./countries.entity";
import { Not, Repository } from "typeorm";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";

@Injectable()
export class CountriesService {
    constructor(
        @InjectRepository(Country)
// readonly -> Garante que a propriedade não será reatribuída depois que foi definido no construtor.
        private readonly countryRepository: Repository<Country>
    ){}

    async findAll(): Promise<Country[]>{
        return await this.countryRepository.find({ order: { name: 'ASC'}});
    }

    async create(createCountryDto: CreateCountryDto): Promise<Country>{
        const country = this.countryRepository.create(createCountryDto);
        return await this.countryRepository.save(country);
    }

    async createMany(createCountryDtos: CreateCountryDto[]): Promise<Country[]>{
        const countries = this.countryRepository.create(createCountryDtos);
        return await this.countryRepository.save(countries);
    }

    async update(id: number, updateCountryDto: UpdateCountryDto): Promise<Country>{
        const country = await this.countryRepository.findOneBy({ id });
        if(!country) {
            throw new NotFoundException(`Country with id ${id} not found`);
        }

        Object.assign(country, updateCountryDto);
        return await this.countryRepository.save(country);
    }

    async delete(id: number): Promise<void>{
        const country = await this.countryRepository.findOneBy({ id });
        if(!country) {
            throw new NotFoundException(`Country with id ${id} not found`);
        }

        await this.countryRepository.delete(id);
    }
}