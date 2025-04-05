import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Country } from '../countries/countries.entity'

@Entity('places')
@Unique(['country', 'local'])
export class Place {

    @PrimaryGeneratedColumn()
    id: Number;

    @Column()
    local: string;

    // Usamos o tipo 'date' para armazenar a meta com um dia fixo (ex: sempre 01)
    @Column({ type: 'date'})
    meta: Date;

    @ManyToOne(() => Country, (country) => country.places, { eager: true})
    country: Country;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}