import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Country } from '../countries/countries.entity'

@Entity('places')
@Unique(['country', 'local'])
export class Place {

    @PrimaryGeneratedColumn()
    id: Number;

    @Column({ nullable: false })
    local: string;

    // Usamos o tipo 'date' para armazenar a meta com um dia fixo (ex: sempre 01)
    @Column({ nullable: false, type: 'date'})
    meta: Date;

    @ManyToOne(() => Country, (country) => country.places, { eager: true})
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn( { name: 'updated_at' })
    updatedAt: Date;
}