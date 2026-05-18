import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { SystemConfig } from '../entities/system-config.entity';

const DEFAULT_CATEGORIES = [
  { name: '编织', icon: '🧶', sort_order: 1 },
  { name: '陶艺', icon: '🏺', sort_order: 2 },
  { name: '木工', icon: '🪵', sort_order: 3 },
  { name: '刺绣', icon: '🪡', sort_order: 4 },
  { name: '皮具', icon: '👜', sort_order: 5 },
  { name: '其他', icon: '✨', sort_order: 6 },
];

const DEFAULT_SYSTEM_CONFIGS = [
  { key: 'site_name', value: '手作展示' },
  { key: 'announcement', value: '' },
  { key: 'notification_enabled', value: 'true' },
];

export async function runSeed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const configRepo = dataSource.getRepository(SystemConfig);

  // Seed default admin
  const adminExists = await userRepo.findOne({
    where: { role: UserRole.ADMIN },
  });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await userRepo.save({
      openid: 'admin-default',
      nickname: '管理员',
      role: UserRole.ADMIN,
      has_profile: true,
      password_hash: passwordHash,
      must_change_password: true,
    });
    console.log('Default admin created (username: admin, password: admin123)');
  }

  // Seed default categories
  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await categoryRepo.findOne({ where: { name: cat.name } });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create(cat));
    }
  }

  // Seed default system configs
  for (const cfg of DEFAULT_SYSTEM_CONFIGS) {
    const exists = await configRepo.findOne({ where: { key: cfg.key } });
    if (!exists) {
      await configRepo.save(configRepo.create(cfg));
    }
  }

  console.log('Seed completed');
}
