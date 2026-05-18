import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** 用户角色——当前仅单管理员模式，admin 通过后台登录，visitor 通过微信登录 */
export enum UserRole {
  ADMIN = 'admin',
  VISITOR = 'visitor',
}

/** 用户——同时承载管理员和微信访客两类身份，通过 role 字段区分 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 微信 openid——访客的唯一标识，由微信登录接口返回 */
  @Index({ unique: true })
  @Column({ unique: true })
  openid: string;

  @Column({ length: 30, default: '手作爱好者' })
  nickname: string;

  @Column({ nullable: true })
  avatar_url: string;

  /** 是否已完善个人资料——用于判断是否需要弹出半屏资料面板 */
  @Column({ default: false })
  has_profile: boolean;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VISITOR })
  role: UserRole;

  /** 管理员密码哈希——仅 admin 角色使用，visitor 为 null */
  @Column({ nullable: true })
  password_hash: string;

  /** 登录失败次数——连续失败达到阈值后锁定账户 */
  @Column({ default: 0 })
  login_fail_count: number;

  /** 账户锁定截止时间——非空且大于当前时间时禁止登录 */
  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date;

  /** 是否必须修改密码——首次登录或重置密码后为 true */
  @Column({ default: false })
  must_change_password: boolean;

  @CreateDateColumn()
  created_at: Date;
}
