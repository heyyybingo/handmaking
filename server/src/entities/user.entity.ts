import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  VISITOR = 'visitor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  openid: string;

  @Column({ length: 30, default: '手作爱好者' })
  nickname: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ default: false })
  has_profile: boolean;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VISITOR })
  role: UserRole;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ default: 0 })
  login_fail_count: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date;

  @Column({ default: false })
  must_change_password: boolean;

  @CreateDateColumn()
  created_at: Date;
}
