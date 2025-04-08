import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from './countries.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: Repository<Country>;

  const mockCountries: Country[] = [
    
    { id: 1, name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png', places: [] },
    { id: 2, name: 'França', flagUrl: 'https://flagcdn.com/w80/fr.png', places: [] },
    { id: 3, name: 'México', flagUrl: 'https://flagcdn.com/w80/mx.png', places: [] },
    { id: 4, name: 'Bolívia', flagUrl: 'https://flagcdn.com/w80/bo.png', places: [] },
    { id: 5, name: 'Estados Unidos', flagUrl: 'https://flagcdn.com/w80/us.png', places: [] },
    { id: 6, name: 'Itália', flagUrl: 'https://flagcdn.com/w80/it.png', places: [] },
    { id: 7, name: 'Emirados Árabes Unidos', flagUrl: 'https://flagcdn.com/w80/ae.png', places: [] },
    { id: 8, name: 'Alemanha', flagUrl: 'https://flagcdn.com/w80/de.png', places: [] },
    { id: 9, name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png', places: [] },
    { id: 10, name: 'Canadá', flagUrl: 'https://flagcdn.com/w80/ca.png', places: [] },
  ];

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: getRepositoryToken(Country),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    repository = module.get<Repository<Country>>(getRepositoryToken(Country));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all countries ordered by name (ASC)', async () => {
    // AAA pattern 
    // Arrange (preparação)
    const expected = [...mockCountries].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    mockRepository.find.mockResolvedValue(expected);

    // Act (ação)
    const result = await service.findAll();

    // Assert (verificação)
    expect(repository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    expect(result).toEqual(expected);
  });

  it('should create a new country when data is valid and name is unique', async () => {
    // Arrange (preparação)
    const createDto = { name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' };
    const createdCountry = { id: 1, ...createDto, places: [] };
  
    mockRepository.findOne = jest.fn().mockResolvedValue(null);
    mockRepository.create = jest.fn().mockReturnValue(createdCountry);
    mockRepository.save = jest.fn().mockResolvedValue(createdCountry);
  
    // Act (ação)
    const result = await service.create(createDto);
  
    // Assert (verificação)
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    expect(mockRepository.save).toHaveBeenCalledWith(createdCountry);
    expect(result).toEqual(createdCountry);
  });

  it('should throw ConflictException if country name already exists', async () => {
    // Arrange (preparação)
    const createDto = { name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' };
    const existingCountry = { id: 99, ...createDto, places: [] };
  
    mockRepository.findOne = jest.fn().mockResolvedValue(existingCountry);
    mockRepository.create = jest.fn();
    mockRepository.save = jest.fn();
  
    // Act (ação) and Assert (verificação)
    await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should create only the countries that do not already exist', async () => {
    // Arrange 
    const createDtos = [
      { name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png' },
      { name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' },
      { name: 'Canadá', flagUrl: 'https://flagcdn.com/w80/ca.png' },
    ];
  
    const existingCountries = ['Brasil'];
    
    mockRepository.findOne = jest.fn(({ where: { name } }) =>
      existingCountries.includes(name) ? Promise.resolve({ name }) : Promise.resolve(null)
    );
  
    // id: Date.now() -> Forma rápida de adquirir um valor único, simulando o id do banco
    mockRepository.create = jest.fn((dto) => ({ id: Date.now(), ...dto, places: [] }));
    mockRepository.save = jest.fn(async (country) => country); 
  

    // Act 
    const result = await service.createMany(createDtos);
  
    // Assert 
    expect(mockRepository.findOne).toHaveBeenCalledTimes(createDtos.length);
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
    expect(result.created.length).toBe(2);
    expect(result.skipped).toEqual(['Brasil']);
  });
  
  it('should skip all countries if they already exist', async () => {
    // Arrange 
    const createDtos = [
      { name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' },
      { name: 'Argentina', flagUrl: 'https://flagcdn.com/w80/ar.png' },
    ];
  
    mockRepository.findOne = jest.fn(() => Promise.resolve({}));
    mockRepository.create = jest.fn();
    mockRepository.save = jest.fn();
  
    // Act 
    const result = await service.createMany(createDtos);
  
    // Assert 
    expect(mockRepository.findOne).toHaveBeenCalledTimes(createDtos.length);
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result.created).toEqual([]);
    expect(result.skipped).toEqual(['Brasil', 'Argentina']);
  });

  it('should create all countries if none already exist', async () => {
    // Arrange
    const createDtos = [
      { name: 'Chile', flagUrl: 'https://flagcdn.com/w80/cl.png' },
      { name: 'Uruguai', flagUrl: 'https://flagcdn.com/w80/uy.png' },
    ];
  
    mockRepository.findOne = jest.fn(() => Promise.resolve(null)); 
    mockRepository.create = jest.fn((dto) => ({ ...dto, id: Date.now(), places: [] }));
    mockRepository.save = jest.fn(async (country) => country); 
  
    // Act
    const result = await service.createMany(createDtos);
  
    // Assert
    expect(mockRepository.findOne).toHaveBeenCalledTimes(createDtos.length);
    expect(mockRepository.create).toHaveBeenCalledTimes(createDtos.length);
    expect(mockRepository.save).toHaveBeenCalledTimes(createDtos.length);
  
    // Garante que os países tem o mesmo nome, independente da ordem
    const createdNames = result.created.map((c) => c.name).sort();
    const inputNames = createDtos.map((d) => d.name).sort();
  
    expect(createdNames).toEqual(inputNames);
    expect(result.skipped).toEqual([]);
  });

  it('should update the name and flagUrl of an existing country', async () => {
    // Arrange 
    const id = 1;
    const updateDto = { name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png' };
  
    const existingCountry = { id, name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png', places: [] };
  
    mockRepository.findOneBy = jest
      .fn()
      .mockImplementation(({ id: searchId, name }) => {
        if (searchId === id) return Promise.resolve(existingCountry); // 1ª chamada: busca pelo ID
        if (name === updateDto.name) return Promise.resolve(null); // 2ª chamada: verifica duplicado
      });
  
    mockRepository.save = jest.fn().mockResolvedValue({ ...existingCountry, ...updateDto });
  
    // Act
    const result = await service.update(id, updateDto);
  
    // Assert  
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ name: updateDto.name });
    expect(mockRepository.save).toHaveBeenCalledWith({ ...existingCountry, ...updateDto });
    expect(result.name).toBe(updateDto.name);
    expect(result.flagUrl).toBe(updateDto.flagUrl);
  });

  it('should throw NotFoundException if country with given id does not exist', async () => {
    // Arrange
    const id = 99;
    const updateDto = { name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png'};
  
    mockRepository.findOneBy = jest.fn().mockResolvedValue(null); // país não encontrado
  
    // Act and Assert
    await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
  });

  it('should throw ConflictException if another country already has the same name', async () => {
    // Arrange
    const id = 1;
    const updateDto = { name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png' };
  
    const countryToUpdate = { id, name: 'Japão', flagUrl: 'https://flagcdn.com/w80/ja.png', places: [] };
    const conflictingCountry = { id: 2, name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png', places: [] };
  
    mockRepository.findOneBy = jest
      .fn()
      .mockImplementation(({ id: searchId, name }) => {
        if (searchId === id) return Promise.resolve(countryToUpdate); // busca pelo ID
        if (name === updateDto.name) return Promise.resolve(conflictingCountry); // conflito
      });
  
    // Act and Assert  
    await expect(service.update(id, updateDto)).rejects.toThrow(ConflictException);
  
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ name: updateDto.name });
  });

  it('should delete a country if it exists', async () => {
    // Arrange
    const id = 1;
    const existingCountry = { id, name: 'Brasil', flagUrl: 'https://flagcdn.com/w80/br.png', places: [] };
  
    mockRepository.findOneBy = jest.fn().mockResolvedValue(existingCountry);
    mockRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
  
    // Act
    await service.remove(id);
  
    // Assert
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockRepository.delete).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if country does not exist', async () => {
    // Arrange
    const id = 99;
  
    mockRepository.findOneBy = jest.fn().mockResolvedValue(null);
  
    // Act and Assert
    await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
  
});
