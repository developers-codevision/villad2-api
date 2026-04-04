import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID único del usuario', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre de usuario', example: 'admin' })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  username: string;

  @ApiProperty({ description: 'Contraseña encriptada' })
  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  password: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'admin@hostal.com' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @ApiPropertyOptional({ description: 'Nombre completo', example: 'Administrador del Sistema' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName: string;

  @ApiPropertyOptional({ description: 'Número de teléfono', example: '+53 55555555' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: 'Indica si el usuario está activo', example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Indica si el usuario está verificado', example: false })
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Roles del usuario', example: ['admin'] })
  @Column({ type: 'json' })
  roles: string[] = ['user'];

  @ApiPropertyOptional({ description: 'Token para restablecer contraseña' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  resetPasswordToken: string;

  @ApiPropertyOptional({ description: 'Fecha de expiración del token de restablecer contraseña' })
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Fecha de eliminación lógica' })
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @ApiPropertyOptional({ description: 'Token de actualización' })
  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
