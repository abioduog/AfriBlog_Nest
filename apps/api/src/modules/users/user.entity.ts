import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'hashed_password' })
  hashedPassword!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean = false;

  @Column({ name: 'is_premium_user', default: false })
  isPremiumUser: boolean = false;

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.hashedPassword);
  }
}
