import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
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
        
        const existing  = await this.countryRepository.findOne({ where: { name: createCountryDto.name }})
        if (existing) {
            throw new ConflictException(`Country with name ${createCountryDto.name} already exist.`)
        }
        const country = this.countryRepository.create(createCountryDto);
        return await this.countryRepository.save(country);
    }

    async createMany(createCountryDtos: CreateCountryDto[]): Promise<{ created: Country[], skipped: string[] }> {
        const created: Country[] = [];
        const skipped: string[] = [];
      
        for (const dto of createCountryDtos) {
          const exists = await this.countryRepository.findOne({ where: { name: dto.name } });
          if (exists) {
            skipped.push(dto.name);
            continue;
          }
      
          const country = this.countryRepository.create(dto);
          const saved = await this.countryRepository.save(country);
          created.push(saved);
        }
      
        return { created, skipped };
      }

    async update(id: number, updateCountryDto: UpdateCountryDto): Promise<Country>{
        const country = await this.countryRepository.findOneBy({ id });
        if(!country) {
            throw new NotFoundException(`Country with id=${id} not found`);
        }

        const existing = await this.countryRepository.findOneBy({ name: updateCountryDto.name })
        if (existing && existing.id !== id) {
            throw new ConflictException(`A country with this name ${updateCountryDto.name} already exists.`)
        }

        Object.assign(country, updateCountryDto);
        return await this.countryRepository.save(country);
    }

    async remove(id: number): Promise<void>{
        const country = await this.countryRepository.findOneBy({ id });
        if(!country) {
            throw new NotFoundException(`Country with id=${id} not found`);
        }

        await this.countryRepository.delete(id);
    }
}