import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Place } from '../places/places.entity'

@Entity('countries')
export class Country{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ name:'flag_url', nullable: false })
    flagUrl: string;

    @OneToMany(()=> Place, (place) => place.country)
    places: Place[];

}