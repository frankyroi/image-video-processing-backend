import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    assetId!: string;

  @Column()
    fileName!: string;
}
