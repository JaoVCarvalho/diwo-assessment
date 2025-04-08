import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Place } from './places.entity';
import { Country } from '../countries/countries.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PlacesService', () => {
  let service: PlacesService;
  let placesRepository: Repository<Place>;
  let countriesRepository: Repository<Country>;

  const mockPlacesRepository  = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCountriesRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlacesRepository,
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountriesRepository, 
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    placesRepository = module.get<Repository<Place>>(getRepositoryToken(Place));
    countriesRepository = module.get<Repository<Country>>(getRepositoryToken(Country))
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all places ordered by meta (ASC)', async () => {
    // Arrange
    const mockPlaces: Place[] = [
        { id: 1, local: 'Tokyo', meta: new Date('2024-10-01'), country: {} as Country, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, local: 'Paris', meta: new Date('2025-01-01'), country: {} as Country, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, local: 'Rio de Janeiro', meta: new Date('2025-02-01'), country: {} as Country, createdAt: new Date(), updatedAt: new Date() },
        { id: 4, local: 'Nova York', meta: new Date('2025-03-01'), country: {} as Country, createdAt: new Date(), updatedAt: new Date() },
        { id: 5, local: 'Berlim', meta: new Date('2025-04-01'), country: {} as Country, createdAt: new Date(), updatedAt: new Date() },
    ];

    mockPlacesRepository.find.mockResolvedValue(mockPlaces);

    // Act
    const result = await service.findAll();

    // Assert
    expect(placesRepository.find).toHaveBeenCalledWith({ order: { meta: 'ASC' } });
    expect(result).toEqual(mockPlaces);
  });

  it('should return the place when it exists', async () => {
    // Arrange
    const id = 1;
    const mockPlace: Place = {
      id,
      local: 'Tokyo',
      meta: new Date('2025-04-01'),
      country: {} as Country,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    mockPlacesRepository.findOne = jest.fn().mockResolvedValue(mockPlace);
  
    // Act
    const result = await service.findOne(id);
  
    // Assert
    expect(placesRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    expect(result).toEqual(mockPlace);
  });

  it('should throw NotFoundException if place does not exist', async () => {
    // Arrange
    const id = 999;
  
    mockPlacesRepository.findOne = jest.fn().mockResolvedValue(null);
  
    // Act and Assert
    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    expect(placesRepository.findOne).toHaveBeenCalledWith({ where: { id } });
  });

  it('should create a place when data is valid and country exists', async () => {
    // Arrange
    const createDto = {
      local: 'Tokyo',
      meta: '2025-04-01',
      countryId: 1,
    };
  
    const mockCountry = { id: 1, name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png', places: [] };
    const mockPlace: Place = {
      id: 1,
      local: createDto.local,
      meta: new Date(`${createDto.meta}T12:00:00Z`),
      country: mockCountry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    countriesRepository.findOne = jest.fn().mockResolvedValue(mockCountry);
    placesRepository.findOne = jest.fn().mockResolvedValue(null);
    placesRepository.create = jest.fn().mockReturnValue(mockPlace);
    placesRepository.save = jest.fn().mockResolvedValue(mockPlace);
  
    // Act
    const result = await service.create(createDto);
  
    // Assert
    expect(countriesRepository.findOne).toHaveBeenCalledWith({ where: { id: createDto.countryId } });
    expect(placesRepository.findOne).toHaveBeenCalledWith({
      where: { local: createDto.local, country: { id: createDto.countryId } },
      relations: ['country'],
    });
    expect(placesRepository.create).toHaveBeenCalledWith({
      local: createDto.local,
      meta: new Date(`${createDto.meta}T12:00:00Z`),
      country: mockCountry,
    });
    expect(placesRepository.save).toHaveBeenCalledWith(mockPlace);
    expect(result).toEqual(mockPlace);
  });
  
  it('should throw NotFoundException if country does not exist', async () => {
    // Arrange
    const createDto = {
      local: 'Tokyo',
      meta: '2025-04-01',
      countryId: 999,
    };
  
    countriesRepository.findOne = jest.fn().mockResolvedValue(null);
  
    // Act and Assert
    await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    expect(countriesRepository.findOne).toHaveBeenCalledWith({ where: { id: createDto.countryId } });
    expect(placesRepository.findOne).not.toHaveBeenCalled();
  });

  
  it('should throw ConflictException if place already exists in the same country', async () => {
    // Arrange
    const createDto = {
      local: 'Paris',
      meta: '2025-04-01',
      countryId: 1,
    };
  
    const mockCountry = { id: 1, name: 'França', flagUrl: 'https://flagcdn.com/w80/fr.png', places: [] };
    const existingPlace: Place = {
      id: 99,
      local: 'Paris',
      meta: new Date('2025-04-01'),
      country: mockCountry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    countriesRepository.findOne = jest.fn().mockResolvedValue(mockCountry);
    placesRepository.findOne = jest.fn().mockResolvedValue(existingPlace);
  
    // Act and Assert
    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  
    expect(countriesRepository.findOne).toHaveBeenCalledWith({ where: { id: createDto.countryId } });
    expect(placesRepository.findOne).toHaveBeenCalledWith({
      where: { local: createDto.local, country: { id: createDto.countryId } },
      relations: ['country'],
    });
    expect(placesRepository.create).not.toHaveBeenCalled();
    expect(placesRepository.save).not.toHaveBeenCalled();
  });
  
  it('should update local and/or meta of a place successfully', async () => {
    // Arrange
    const id = 1;
    const updateDto = {
      local: 'Kyoto',
      meta: '2025-06-01',
    };
  
    const existingPlace: Place = {
      id,
      local: 'Tokyo',
      meta: new Date('2025-01-01'),
      country: { id: 1, name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png', places: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    const updatedPlace = {
      ...existingPlace,
      local: updateDto.local,
      meta: new Date(`${updateDto.meta}T12:00:00Z`),
    };
  
    jest.spyOn(service, 'findOne').mockResolvedValue(existingPlace);
    placesRepository.findOne = jest.fn().mockResolvedValue(null);
    placesRepository.save = jest.fn().mockResolvedValue(updatedPlace);
  
    // Act 
    const result = await service.update(id, updateDto);
  
    // Assert
    expect(service.findOne).toHaveBeenCalledWith(id);   
    expect(placesRepository.findOne).toHaveBeenCalledWith({
      where: { local: updateDto.local, country: { id: existingPlace.country.id } },
      relations: ['country'],
    });
    expect(placesRepository.save).toHaveBeenCalledWith(updatedPlace);
    expect(result.local).toBe(updateDto.local);
    expect(result.meta.toISOString()).toBe(updatedPlace.meta.toISOString());
  });

  it('should throw NotFoundException if place does not exist', async () => {
    // Arrange
    const id = 999;
    const updateDto = { local: 'Kyoto' };
  
    jest.spyOn(service, 'findOne').mockImplementation(async () => {
      throw new NotFoundException();
    });
  
    // Act and Assert
    await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
  
    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should throw ConflictException if another place in the same country has the same local', async () => {
    // Arrange
    const id = 1;
    const updateDto = { local: 'Kyoto' };
  
    const currentPlace: Place = {
      id,
      local: 'Tokyo',
      meta: new Date('2025-01-01'),
      country: { id: 1, name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png', places: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    const conflictingPlace: Place = {
      id: 2,
      local: 'Kyoto',
      meta: new Date('2025-04-01'),
      country: currentPlace.country,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    jest.spyOn(service, 'findOne').mockResolvedValue(currentPlace);
    placesRepository.findOne = jest.fn().mockResolvedValue(conflictingPlace);
  
    // Act and Assert
    await expect(service.update(id, updateDto)).rejects.toThrow(ConflictException);
  
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(placesRepository.findOne).toHaveBeenCalledWith({
      where: { local: updateDto.local, country: { id: currentPlace.country.id } },
      relations: ['country'],
    });
  });

  it('should remove the place if it exists', async () => {
    // Arrange
    const id = 1;
  
    placesRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
  
    // Act
    await service.remove(id);
  
    // Assert
    expect(placesRepository.delete).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if place does not exist', async () => {
    // Arrange
    const id = 999;
  
    placesRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });
  
    // Act and Assert
    await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    expect(placesRepository.delete).toHaveBeenCalledWith(id);
  });
  
});
