import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Place } from '../places/places.entity'

@Entity('countries')
export class Country{

    @PrimaryGeneratedColumn()
    id: Number;

    @Column({ unique: true })
    name: string;

    @Column()
    flagUrl: string;

    @OneToMany(()=> Place, (place) => place.country)
    places: Place[];

}