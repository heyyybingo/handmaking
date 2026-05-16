import { http, HttpResponse, delay } from 'msw';

/**
 * MSW 请求处理器
 * 拦截API请求并返回Mock数据，开发阶段前后端并行开发使用
 * 各业务模块在此数组中添加自己的handler
 */

// ============================================================
// Mock Data
// ============================================================

const MOCK_ADMIN = {
  id: '1',
  nickname: '手作匠人',
  avatar_url: '',
  role: 'admin',
  must_change_password: false,
};

const MOCK_TOKEN = 'mock-jwt-token-admin-2024';

// ---------- Categories ----------

interface MockCategory {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

const mockCategories: MockCategory[] = [
  { id: 'cat-1', name: '编织', icon: '🧶', sort_order: 1, created_at: '2024-01-15T08:00:00Z' },
  { id: 'cat-2', name: '陶瓷', icon: '🏺', sort_order: 2, created_at: '2024-01-15T08:00:00Z' },
  { id: 'cat-3', name: '木工', icon: '🪵', sort_order: 3, created_at: '2024-01-15T08:00:00Z' },
  { id: 'cat-4', name: '刺绣', icon: '🪡', sort_order: 4, created_at: '2024-01-15T08:00:00Z' },
  { id: 'cat-5', name: '皮革', icon: '👜', sort_order: 5, created_at: '2024-01-15T08:00:00Z' },
  { id: 'cat-6', name: '综合材料', icon: '🎨', sort_order: 6, created_at: '2024-01-15T08:00:00Z' },
];

// ---------- Crafts ----------

interface MockImage {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  sort: number;
}

interface MockCraft {
  id: string;
  title: string;
  description: string;
  images: MockImage[];
  video: { url: string; coverUrl: string; duration: number } | null;
  category_id: string;
  category: { id: string; name: string };
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  like_count: number;
  comment_count: number;
  intent_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function makeImages(craftId: string, count: number): MockImage[] {
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/${craftId}-${i}/800/600`,
    thumbnailUrl: `https://picsum.photos/seed/${craftId}-${i}/400/300`,
    width: 800,
    height: 600,
    sort: i,
  }));
}

const mockCrafts: MockCraft[] = [
  {
    id: 'craft-01', title: '手工编织挂毯', description: '采用天然棉麻线材，手工编织而成的北欧风格墙面挂毯，尺寸约60x90cm，适合客厅、卧室装饰。每一根线都经过精心挑选，色彩搭配温暖自然。',
    images: makeImages('craft-01', 3), video: null, category_id: 'cat-1', category: { id: 'cat-1', name: '编织' },
    tags: ['挂毯', '北欧风', '棉麻'], status: 'published', like_count: 128, comment_count: 15, intent_count: 8, sort_order: 1,
    created_at: '2025-01-10T10:00:00Z', updated_at: '2025-03-15T14:30:00Z',
  },
  {
    id: 'craft-02', title: '陶瓷茶杯套装', description: '手工拉坯制作的日式茶杯套装，一壶四杯，采用高温烧制，釉色温润如玉。每只茶杯都有独特的纹理，是独一无二的作品。',
    images: makeImages('craft-02', 4), video: null, category_id: 'cat-2', category: { id: 'cat-2', name: '陶瓷' },
    tags: ['茶具', '日式', '手工拉坯'], status: 'published', like_count: 96, comment_count: 12, intent_count: 15, sort_order: 2,
    created_at: '2025-01-12T09:00:00Z', updated_at: '2025-02-20T11:00:00Z',
  },
  {
    id: 'craft-03', title: '木制音乐盒', description: '精选黑胡桃木手工打磨制作的机械音乐盒，内置18音梳音机芯，旋律悠扬。盒盖采用激光雕刻工艺，可定制图案。',
    images: makeImages('craft-03', 3), video: { url: 'https://example.com/videos/craft-03.mp4', coverUrl: 'https://picsum.photos/seed/craft-03-cover/800/600', duration: 45 },
    category_id: 'cat-3', category: { id: 'cat-3', name: '木工' }, tags: ['音乐盒', '黑胡桃木', '机械'], status: 'published',
    like_count: 203, comment_count: 28, intent_count: 22, sort_order: 3,
    created_at: '2025-01-15T08:30:00Z', updated_at: '2025-04-01T16:00:00Z',
  },
  {
    id: 'craft-04', title: '苏绣团扇', description: '传统苏绣工艺制作的团扇，双面绣花鸟图案，扇骨为紫竹材质，配以流苏装饰。每一针都蕴含匠心，是传统工艺的传承之作。',
    images: makeImages('craft-04', 5), video: null, category_id: 'cat-4', category: { id: 'cat-4', name: '刺绣' },
    tags: ['团扇', '苏绣', '花鸟'], status: 'published', like_count: 156, comment_count: 19, intent_count: 10, sort_order: 4,
    created_at: '2025-01-18T14:00:00Z', updated_at: '2025-03-10T09:00:00Z',
  },
  {
    id: 'craft-05', title: '手工皮具钱包', description: '采用意大利进口植鞣革，纯手工缝制，经典简约款式。随着使用时间推移，皮革会逐渐变色，形成独特的包浆效果。',
    images: makeImages('craft-05', 4), video: null, category_id: 'cat-5', category: { id: 'cat-5', name: '皮革' },
    tags: ['钱包', '植鞣革', '手工缝制'], status: 'published', like_count: 87, comment_count: 10, intent_count: 18, sort_order: 5,
    created_at: '2025-01-20T11:00:00Z', updated_at: '2025-02-28T13:00:00Z',
  },
  {
    id: 'craft-06', title: '钩针蕾丝桌布', description: '精细钩针编织的圆形蕾丝桌布，直径约80cm，采用纯棉蕾丝线，图案为经典菠萝花。适合铺在茶几或餐桌中央，增添浪漫氛围。',
    images: makeImages('craft-06', 3), video: null, category_id: 'cat-1', category: { id: 'cat-1', name: '编织' },
    tags: ['桌布', '蕾丝', '钩针'], status: 'published', like_count: 112, comment_count: 8, intent_count: 5, sort_order: 6,
    created_at: '2025-01-22T15:00:00Z', updated_at: '2025-02-15T10:00:00Z',
  },
  {
    id: 'craft-07', title: '柴烧茶壶', description: '传统柴窑烧制72小时而成的茶壶，自然落灰釉效果，每一把都独一无二。壶身保留火焰痕迹，质朴自然，泡茶口感醇厚。',
    images: makeImages('craft-07', 4), video: null, category_id: 'cat-2', category: { id: 'cat-2', name: '陶瓷' },
    tags: ['茶壶', '柴烧', '落灰釉'], status: 'published', like_count: 178, comment_count: 22, intent_count: 12, sort_order: 7,
    created_at: '2025-02-01T09:00:00Z', updated_at: '2025-04-05T14:00:00Z',
  },
  {
    id: 'craft-08', title: '木质书签套装', description: '精选紫檀木、花梨木、鸡翅木三种木材手工打磨制作的精美书签套装。每枚书签纹理各异，配以流苏，是送给读书人的绝佳礼物。',
    images: makeImages('craft-08', 4), video: null, category_id: 'cat-3', category: { id: 'cat-3', name: '木工' },
    tags: ['书签', '红木', '套装'], status: 'published', like_count: 65, comment_count: 7, intent_count: 9, sort_order: 8,
    created_at: '2025-02-05T10:00:00Z', updated_at: '2025-03-01T08:00:00Z',
  },
  {
    id: 'craft-09', title: '法式刺绣胸针', description: '采用法式钩针刺绣技法制作的昆虫系列胸针，使用日本进口米珠和亮片，光泽闪耀。可作为胸针、帽饰或包饰使用。',
    images: makeImages('craft-09', 5), video: null, category_id: 'cat-4', category: { id: 'cat-4', name: '刺绣' },
    tags: ['胸针', '法式刺绣', '昆虫'], status: 'published', like_count: 134, comment_count: 16, intent_count: 14, sort_order: 9,
    created_at: '2025-02-08T13:00:00Z', updated_at: '2025-03-20T11:00:00Z',
  },
  {
    id: 'craft-10', title: '手工皮具笔记本', description: 'A5尺寸手工皮面笔记本，内芯可替换。封面采用头层牛皮，经手工染色做旧处理，配以弹力绑带和书签绳。',
    images: makeImages('craft-10', 3), video: null, category_id: 'cat-5', category: { id: 'cat-5', name: '皮革' },
    tags: ['笔记本', '头层牛皮', '做旧'], status: 'published', like_count: 92, comment_count: 11, intent_count: 16, sort_order: 10,
    created_at: '2025-02-10T16:00:00Z', updated_at: '2025-03-25T09:00:00Z',
  },
  {
    id: 'craft-11', title: 'Macrame 编织壁挂', description: '使用Macrame编织技法制作的波西米亚风格壁挂，尺寸约40x80cm。纯棉绳编织，配以天然木棍挂杆，营造温暖自然的家居氛围。',
    images: makeImages('craft-11', 3), video: null, category_id: 'cat-1', category: { id: 'cat-1', name: '编织' },
    tags: ['Macrame', '波西米亚', '壁挂'], status: 'published', like_count: 143, comment_count: 13, intent_count: 7, sort_order: 11,
    created_at: '2025-02-12T08:00:00Z', updated_at: '2025-03-30T15:00:00Z',
  },
  {
    id: 'craft-12', title: '青花瓷盘', description: '手工绘制青花图案的陶瓷装饰盘，直径25cm。传统青花钴料绘制缠枝莲纹样，高温烧制，发色纯正，适合陈设或挂墙装饰。',
    images: makeImages('craft-12', 4), video: null, category_id: 'cat-2', category: { id: 'cat-2', name: '陶瓷' },
    tags: ['青花', '瓷盘', '缠枝莲'], status: 'published', like_count: 189, comment_count: 24, intent_count: 11, sort_order: 12,
    created_at: '2025-02-15T10:30:00Z', updated_at: '2025-04-10T08:00:00Z',
  },
  {
    id: 'craft-13', title: '木雕小动物摆件', description: '手工雕刻的可爱小动物系列，选用椴木雕刻，手工上色。每只小动物都形态各异，栩栩如生，是书桌或书架上的趣味点缀。',
    images: makeImages('craft-13', 6), video: null, category_id: 'cat-3', category: { id: 'cat-3', name: '木工' },
    tags: ['木雕', '动物', '摆件'], status: 'published', like_count: 210, comment_count: 31, intent_count: 19, sort_order: 13,
    created_at: '2025-02-18T14:00:00Z', updated_at: '2025-04-12T10:00:00Z',
  },
  {
    id: 'craft-14', title: '十字绣风景画', description: '大幅十字绣风景作品，图案为江南水乡，色彩层次丰富。成品已装裱，尺寸50x70cm，适合客厅或书房装饰。',
    images: makeImages('craft-14', 3), video: null, category_id: 'cat-4', category: { id: 'cat-4', name: '刺绣' },
    tags: ['十字绣', '风景', '装裱'], status: 'published', like_count: 78, comment_count: 9, intent_count: 6, sort_order: 14,
    created_at: '2025-02-20T09:00:00Z', updated_at: '2025-03-18T14:00:00Z',
  },
  {
    id: 'craft-15', title: '复古相机包', description: '为微单相机量身定制的手工皮具相机包，内衬防震海绵，可调节肩带。复古棕色，黄铜五金件，兼具实用与美观。',
    images: makeImages('craft-15', 4), video: null, category_id: 'cat-5', category: { id: 'cat-5', name: '皮革' },
    tags: ['相机包', '复古', '定制'], status: 'published', like_count: 101, comment_count: 14, intent_count: 20, sort_order: 15,
    created_at: '2025-02-22T11:00:00Z', updated_at: '2025-04-08T16:00:00Z',
  },
  {
    id: 'craft-16', title: '综合材料装饰画', description: '融合纸艺、布艺、金属丝等多种材料创作的立体装饰画，主题为"秋日森林"。多层次叠加，光影变化丰富。',
    images: makeImages('craft-16', 4), video: null, category_id: 'cat-6', category: { id: 'cat-6', name: '综合材料' },
    tags: ['装饰画', '综合材料', '立体'], status: 'published', like_count: 167, comment_count: 18, intent_count: 13, sort_order: 16,
    created_at: '2025-02-25T15:30:00Z', updated_at: '2025-04-15T09:00:00Z',
  },
  {
    id: 'craft-17', title: '编织收纳篮', description: '使用彩色棉绳编织的圆形收纳篮，直径30cm，高20cm。可用于收纳杂物、玩具或作为花盆套，实用又美观。',
    images: makeImages('craft-17', 3), video: null, category_id: 'cat-1', category: { id: 'cat-1', name: '编织' },
    tags: ['收纳', '棉绳', '实用'], status: 'draft', like_count: 0, comment_count: 0, intent_count: 0, sort_order: 17,
    created_at: '2025-03-01T08:00:00Z', updated_at: '2025-03-01T08:00:00Z',
  },
  {
    id: 'craft-18', title: '陶土花盆系列', description: '手工捏制的不规则形状陶土花盆，表面保留手工纹理，底部有排水孔。适合多肉植物和小型绿植，质朴自然风格。',
    images: makeImages('craft-18', 5), video: null, category_id: 'cat-2', category: { id: 'cat-2', name: '陶瓷' },
    tags: ['花盆', '陶土', '多肉'], status: 'published', like_count: 74, comment_count: 6, intent_count: 8, sort_order: 18,
    created_at: '2025-03-05T10:00:00Z', updated_at: '2025-04-20T11:00:00Z',
  },
  {
    id: 'craft-19', title: '木质餐具套装', description: '手工打磨的黑胡桃木筷子+勺子套装，食品级木蜡油处理，安全无毒。每件餐具纹理独特，手感温润，让每一餐都充满仪式感。',
    images: makeImages('craft-19', 3), video: null, category_id: 'cat-3', category: { id: 'cat-3', name: '木工' },
    tags: ['餐具', '黑胡桃木', '套装'], status: 'published', like_count: 115, comment_count: 17, intent_count: 21, sort_order: 19,
    created_at: '2025-03-08T14:00:00Z', updated_at: '2025-04-22T08:00:00Z',
  },
  {
    id: 'craft-20', title: '珠绣手拿包', description: '全手工珠绣晚宴手拿包，使用日本TOHO米珠和施华洛世奇水晶，图案为孔雀羽毛。搭配真丝内衬和磁吸扣，适合婚礼和晚宴场合。',
    images: makeImages('craft-20', 5), video: null, category_id: 'cat-4', category: { id: 'cat-4', name: '刺绣' },
    tags: ['手拿包', '珠绣', '晚宴'], status: 'published', like_count: 245, comment_count: 35, intent_count: 28, sort_order: 20,
    created_at: '2025-03-10T09:00:00Z', updated_at: '2025-04-25T15:00:00Z',
  },
  {
    id: 'craft-21', title: '手工皮具钥匙包', description: '小巧精致的钥匙包，可收纳4-6把钥匙。采用马缰革制作，黄铜五金件，四合扣开合，保护包内物品不被钥匙划伤。',
    images: makeImages('craft-21', 3), video: null, category_id: 'cat-5', category: { id: 'cat-5', name: '皮革' },
    tags: ['钥匙包', '马缰革', '小巧'], status: 'archived', like_count: 43, comment_count: 5, intent_count: 4, sort_order: 21,
    created_at: '2025-03-12T11:00:00Z', updated_at: '2025-04-28T10:00:00Z',
  },
  {
    id: 'craft-22', title: '纸雕灯箱', description: '多层纸雕组合而成的光影灯箱，内置暖色LED灯带。图案为星空下的城堡，层次分明，打开灯光后立体感十足。',
    images: makeImages('craft-22', 4), video: { url: 'https://example.com/videos/craft-22.mp4', coverUrl: 'https://picsum.photos/seed/craft-22-cover/800/600', duration: 30 },
    category_id: 'cat-6', category: { id: 'cat-6', name: '综合材料' }, tags: ['灯箱', '纸雕', '光影'], status: 'published',
    like_count: 198, comment_count: 26, intent_count: 17, sort_order: 22,
    created_at: '2025-03-15T16:00:00Z', updated_at: '2025-05-01T09:00:00Z',
  },
];

// ---------- Comments ----------

interface MockComment {
  id: string;
  craft_id: string;
  craft_title?: string;
  parent_id: string | null;
  content: string;
  author_type: 'admin' | 'visitor';
  author_name: string;
  author_avatar: string;
  is_author_reply: boolean;
  created_at: string;
}

const mockComments: MockComment[] = [
  { id: 'cmt-01', craft_id: 'craft-03', craft_title: '木制音乐盒', parent_id: null, content: '这个音乐盒真的太精美了！音质也很好，送给朋友做生日礼物，她特别喜欢～', author_type: 'visitor', author_name: '音乐爱好者', author_avatar: '', is_author_reply: false, created_at: '2025-05-10T10:30:00Z' },
  { id: 'cmt-02', craft_id: 'craft-03', craft_title: '木制音乐盒', parent_id: 'cmt-01', content: '感谢你的喜爱！每一个音乐盒都是我用心制作的，很高兴它能成为一份美好的礼物 💝', author_type: 'admin', author_name: '手作匠人', author_avatar: '', is_author_reply: true, created_at: '2025-05-10T14:00:00Z' },
  { id: 'cmt-03', craft_id: 'craft-01', craft_title: '手工编织挂毯', parent_id: null, content: '挂毯的颜色搭配好温柔，挂在卧室床头每天看到心情都很好！', author_type: 'visitor', author_name: '家居控', author_avatar: '', is_author_reply: false, created_at: '2025-05-09T09:15:00Z' },
  { id: 'cmt-04', craft_id: 'craft-01', craft_title: '手工编织挂毯', parent_id: null, content: '请问可以定制尺寸吗？我家的墙面比较大', author_type: 'visitor', author_name: '装修中', author_avatar: '', is_author_reply: false, created_at: '2025-05-09T11:00:00Z' },
  { id: 'cmt-05', craft_id: 'craft-01', craft_title: '手工编织挂毯', parent_id: 'cmt-04', content: '可以的！请通过"我想要"功能提交你的需求，我会根据你的墙面尺寸来定制。', author_type: 'admin', author_name: '手作匠人', author_avatar: '', is_author_reply: true, created_at: '2025-05-09T14:30:00Z' },
  { id: 'cmt-06', craft_id: 'craft-07', craft_title: '柴烧茶壶', parent_id: null, content: '柴烧的质感真的太棒了，泡出来的茶确实不一样，推荐！', author_type: 'visitor', author_name: '茶道中人', author_avatar: '', is_author_reply: false, created_at: '2025-05-08T08:00:00Z' },
  { id: 'cmt-07', craft_id: 'craft-07', craft_title: '柴烧茶壶', parent_id: 'cmt-06', content: '谢谢认可！柴烧的魅力就在于每一件作品都是独一无二的 🔥', author_type: 'admin', author_name: '手作匠人', author_avatar: '', is_author_reply: true, created_at: '2025-05-08T12:00:00Z' },
  { id: 'cmt-08', craft_id: 'craft-13', craft_title: '木雕小动物摆件', parent_id: null, content: '太可爱了！买了一套放在办公桌上，同事们都来问哪里买的 😄', author_type: 'visitor', author_name: '打工人', author_avatar: '', is_author_reply: false, created_at: '2025-05-07T15:20:00Z' },
  { id: 'cmt-09', craft_id: 'craft-13', craft_title: '木雕小动物摆件', parent_id: null, content: '能不能出一个12生肖的系列？想集齐一套', author_type: 'visitor', author_name: '收藏控', author_avatar: '', is_author_reply: false, created_at: '2025-05-07T16:00:00Z' },
  { id: 'cmt-10', craft_id: 'craft-13', craft_title: '木雕小动物摆件', parent_id: 'cmt-09', content: '好主意！我正在设计生肖系列，敬请期待～', author_type: 'admin', author_name: '手作匠人', author_avatar: '', is_author_reply: true, created_at: '2025-05-07T18:00:00Z' },
  { id: 'cmt-11', craft_id: 'craft-20', craft_title: '珠绣手拿包', parent_id: null, content: '这个包太美了！正好要参加朋友的婚礼，果断下单了', author_type: 'visitor', author_name: '时尚达人', author_avatar: '', is_author_reply: false, created_at: '2025-05-06T10:00:00Z' },
  { id: 'cmt-12', craft_id: 'craft-20', craft_title: '珠绣手拿包', parent_id: null, content: '手工真的太精细了，每一颗珠子都排列得很整齐，佩服！', author_type: 'visitor', author_name: '手作爱好者', author_avatar: '', is_author_reply: false, created_at: '2025-05-06T11:30:00Z' },
  { id: 'cmt-13', craft_id: 'craft-12', craft_title: '青花瓷盘', parent_id: null, content: '青花发色很美，图案绘制细腻，挂在墙上很有艺术感', author_type: 'visitor', author_name: '瓷器收藏家', author_avatar: '', is_author_reply: false, created_at: '2025-05-05T09:00:00Z' },
  { id: 'cmt-14', craft_id: 'craft-12', craft_title: '青花瓷盘', parent_id: 'cmt-13', content: '感谢欣赏！青花绘制需要极大的耐心，很高兴你能喜欢 💙', author_type: 'admin', author_name: '手作匠人', author_avatar: '', is_author_reply: true, created_at: '2025-05-05T13:00:00Z' },
  { id: 'cmt-15', craft_id: 'craft-16', craft_title: '综合材料装饰画', parent_id: null, content: '立体感太强了！不同角度看有不同的光影效果，很独特', author_type: 'visitor', author_name: '艺术爱好者', author_avatar: '', is_author_reply: false, created_at: '2025-05-04T14:00:00Z' },
  { id: 'cmt-16', craft_id: 'craft-02', craft_title: '陶瓷茶杯套装', parent_id: null, content: '杯子手感很好，釉色温润，每天早上用它喝茶心情都会变好', author_type: 'visitor', author_name: '茶客', author_avatar: '', is_author_reply: false, created_at: '2025-05-03T08:00:00Z' },
  { id: 'cmt-17', craft_id: 'craft-04', craft_title: '苏绣团扇', parent_id: null, content: '绣工精湛！现在很少看到这么传统的苏绣作品了，值得收藏', author_type: 'visitor', author_name: '非遗爱好者', author_avatar: '', is_author_reply: false, created_at: '2025-05-02T16:00:00Z' },
];

// ---------- Intents ----------

interface MockIntent {
  id: string;
  craft_id: string;
  craft_title?: string;
  type: 'want_collect' | 'want_custom' | 'want_know_more';
  message: string;
  visitor_name: string;
  visitor_contact: string;
  status: 'pending' | 'viewed' | 'replied';
  created_at: string;
}

const mockIntents: MockIntent[] = [
  { id: 'int-01', craft_id: 'craft-03', craft_title: '木制音乐盒', type: 'want_custom', message: '我想定制一个音乐盒，雕刻我们的结婚纪念日日期和名字', visitor_name: '小李', visitor_contact: '138****1234', status: 'pending', created_at: '2025-05-16T09:00:00Z' },
  { id: 'int-02', craft_id: 'craft-01', craft_title: '手工编织挂毯', type: 'want_custom', message: '请问可以定制120x180cm的大尺寸挂毯吗？颜色想要更偏暖色调', visitor_name: '王女士', visitor_contact: '139****5678', status: 'pending', created_at: '2025-05-15T14:30:00Z' },
  { id: 'int-03', craft_id: 'craft-07', craft_title: '柴烧茶壶', type: 'want_know_more', message: '想了解更多关于柴烧工艺的细节，比如烧制温度和时间', visitor_name: '茶艺师', visitor_contact: '136****9012', status: 'viewed', created_at: '2025-05-15T10:00:00Z' },
  { id: 'int-04', craft_id: 'craft-13', craft_title: '木雕小动物摆件', type: 'want_collect', message: '太喜欢这些小动物了，想收藏一整套！', visitor_name: '收藏家', visitor_contact: '137****3456', status: 'viewed', created_at: '2025-05-14T16:00:00Z' },
  { id: 'int-05', craft_id: 'craft-20', craft_title: '珠绣手拿包', type: 'want_custom', message: '想定制一个蓝色系的珠绣包，用于女儿的成人礼', visitor_name: '张妈妈', visitor_contact: '135****7890', status: 'replied', created_at: '2025-05-14T11:00:00Z' },
  { id: 'int-06', craft_id: 'craft-12', craft_title: '青花瓷盘', type: 'want_know_more', message: '想了解青花钴料的来源和绘制工艺，有意学习', visitor_name: '学艺人', visitor_contact: '133****2468', status: 'pending', created_at: '2025-05-13T15:00:00Z' },
  { id: 'int-07', craft_id: 'craft-05', craft_title: '手工皮具钱包', type: 'want_custom', message: '想在钱包上压印一个特殊的logo图案', visitor_name: '创业者', visitor_contact: '132****1357', status: 'viewed', created_at: '2025-05-13T09:00:00Z' },
  { id: 'int-08', craft_id: 'craft-15', craft_title: '复古相机包', type: 'want_custom', message: '我的相机是索尼A7M4配24-70镜头，请问能定制合适的尺寸吗？', visitor_name: '摄影师', visitor_contact: '131****2468', status: 'pending', created_at: '2025-05-12T14:00:00Z' },
  { id: 'int-09', craft_id: 'craft-19', craft_title: '木质餐具套装', type: 'want_collect', message: '想买两套送给新婚的朋友', visitor_name: '礼物达人', visitor_contact: '130****3579', status: 'replied', created_at: '2025-05-12T10:00:00Z' },
  { id: 'int-10', craft_id: 'craft-04', craft_title: '苏绣团扇', type: 'want_know_more', message: '想了解苏绣的学习途径，有没有推荐的课程或师傅？', visitor_name: '刺绣新手', visitor_contact: '129****4680', status: 'pending', created_at: '2025-05-11T08:00:00Z' },
  { id: 'int-11', craft_id: 'craft-22', craft_title: '纸雕灯箱', type: 'want_custom', message: '想定制一个以"海底世界"为主题的灯箱', visitor_name: '海洋迷', visitor_contact: '128****5791', status: 'viewed', created_at: '2025-05-10T16:00:00Z' },
  { id: 'int-12', craft_id: 'craft-16', craft_title: '综合材料装饰画', type: 'want_know_more', message: '请问这种综合材料的创作技法是怎样的？想学习', visitor_name: '美术生', visitor_contact: '127****6802', status: 'pending', created_at: '2025-05-10T11:00:00Z' },
];

// ============================================================
// Helper Functions
// ============================================================

function paginate<T extends { id: string }>(
  items: T[],
  cursor: string | null,
  limit: number,
): { items: T[]; nextCursor: string | null; hasMore: boolean } {
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = items.findIndex((item) => item.id === cursor);
    if (cursorIndex >= 0) {
      startIndex = cursorIndex + 1;
    }
  }

  const slice = items.slice(startIndex, startIndex + limit + 1);
  const hasMore = slice.length > limit;
  const resultItems = hasMore ? slice.slice(0, limit) : slice;
  const nextCursor = hasMore ? resultItems[resultItems.length - 1].id : null;

  return { items: resultItems, nextCursor, hasMore };
}

function generateTrends(days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      visitors: Math.floor(Math.random() * 80) + 20,
      likes: Math.floor(Math.random() * 30) + 5,
      intents: Math.floor(Math.random() * 10) + 1,
    };
  });
}

function generateDashboardTrends(days: number) {
  const now = new Date();
  const crafts: { date: string; value: number }[] = [];
  const likes: { date: string; value: number }[] = [];
  const comments: { date: string; value: number }[] = [];
  const intents: { date: string; value: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    crafts.push({ date: dateStr, value: Math.floor(Math.random() * 3) + 1 });
    likes.push({ date: dateStr, value: Math.floor(Math.random() * 30) + 5 });
    comments.push({ date: dateStr, value: Math.floor(Math.random() * 8) + 1 });
    intents.push({ date: dateStr, value: Math.floor(Math.random() * 5) + 1 });
  }

  return { crafts, likes, comments, intents };
}

// ============================================================
// Handlers
// ============================================================

export const handlers = [
  // ============================================================
  // Health Check
  // ============================================================
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }),

  // ============================================================
  // Auth
  // ============================================================
  http.post('/api/admin/auth/login', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { username: string; password: string };

    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        accessToken: MOCK_TOKEN,
        mustChangePassword: false,
      });
    }

    return HttpResponse.json(
      { code: 'AUTH_FAILED', message: '账号或密码错误' },
      { status: 401 },
    );
  }),

  http.get('/api/admin/auth/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (auth === `Bearer ${MOCK_TOKEN}`) {
      return HttpResponse.json(MOCK_ADMIN);
    }
    return HttpResponse.json(
      { code: 'UNAUTHORIZED', message: '未授权' },
      { status: 401 },
    );
  }),

  http.put('/api/admin/auth/password', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { oldPassword: string; newPassword: string };
    if (body.oldPassword === 'admin123') {
      return HttpResponse.json({ success: true });
    }
    return HttpResponse.json(
      { code: 'WRONG_PASSWORD', message: '旧密码错误' },
      { status: 400 },
    );
  }),

  // ============================================================
  // Dashboard
  // ============================================================
  http.get('/api/admin/dashboard/stats', async () => {
    await delay(300);
    const trends = generateDashboardTrends(7);
    return HttpResponse.json({
      totalCrafts: 128,
      totalLikes: 2340,
      totalComments: 567,
      totalIntents: 89,
      todayVisitors: 120,
      trends,
    });
  }),

  http.get('/api/admin/dashboard/trends', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    return HttpResponse.json(generateTrends(days));
  }),

  http.get('/api/admin/dashboard/hot-crafts', async () => {
    await delay(300);
    const hot = [...mockCrafts]
      .filter((c) => c.status === 'published')
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, 10)
      .map((c) => ({ ...c, video: null }));
    return HttpResponse.json(hot);
  }),

  // ============================================================
  // Crafts
  // ============================================================
  http.get('/api/admin/crafts', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const categoryId = url.searchParams.get('category_id');
    const status = url.searchParams.get('status');

    let filtered = [...mockCrafts];
    if (categoryId) {
      filtered = filtered.filter((c) => c.category_id === categoryId);
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }

    return HttpResponse.json(paginate(filtered, cursor, limit));
  }),

  http.post('/api/admin/crafts', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.title) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '作品标题不能为空' },
        { status: 400 },
      );
    }

    const category = mockCategories.find((c) => c.id === body.category_id);
    if (!category) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '分类不存在' },
        { status: 400 },
      );
    }

    const newCraft: MockCraft = {
      id: `craft-new-${Date.now()}`,
      title: body.title as string,
      description: (body.description as string) || '',
      images: (body.images as MockImage[]) || [],
      video: (body.video as MockCraft['video']) || null,
      category_id: body.category_id as string,
      category: { id: category.id, name: category.name },
      tags: (body.tags as string[]) || [],
      status: (body.status as MockCraft['status']) || 'draft',
      like_count: 0,
      comment_count: 0,
      intent_count: 0,
      sort_order: (body.sort_order as number) || mockCrafts.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockCrafts.push(newCraft);
    return HttpResponse.json(newCraft);
  }),

  http.get('/api/admin/crafts/:id', async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const craft = mockCrafts.find((c) => c.id === id && c.status !== 'archived');
    if (!craft) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `作品 #${id} 不存在` },
        { status: 404 },
      );
    }
    return HttpResponse.json(craft);
  }),

  http.put('/api/admin/crafts/:id', async ({ params, request }) => {
    await delay(400);
    const id = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const index = mockCrafts.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `作品 #${id} 不存在` },
        { status: 404 },
      );
    }

    const craft = mockCrafts[index];
    if (body.title !== undefined) craft.title = body.title as string;
    if (body.description !== undefined) craft.description = body.description as string;
    if (body.images !== undefined) craft.images = body.images as MockImage[];
    if (body.video !== undefined) craft.video = body.video as MockCraft['video'];
    if (body.category_id !== undefined) {
      const category = mockCategories.find((c) => c.id === body.category_id);
      if (category) {
        craft.category_id = body.category_id as string;
        craft.category = { id: category.id, name: category.name };
      }
    }
    if (body.tags !== undefined) craft.tags = body.tags as string[];
    if (body.status !== undefined) craft.status = body.status as MockCraft['status'];
    if (body.sort_order !== undefined) craft.sort_order = body.sort_order as number;
    craft.updated_at = new Date().toISOString();

    return HttpResponse.json(craft);
  }),

  http.delete('/api/admin/crafts/:id', async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const index = mockCrafts.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `作品 #${id} 不存在` },
        { status: 404 },
      );
    }

    // Soft delete: mark as archived
    mockCrafts[index].status = 'archived';
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/admin/crafts/batch', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as {
      ids: string[];
      action: string;
      category_id?: string;
    };

    if (!body.ids || body.ids.length === 0) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '请选择要操作的作品' },
        { status: 400 },
      );
    }

    const targets = mockCrafts.filter((c) => body.ids.includes(c.id));
    if (targets.length !== body.ids.length) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '部分作品不存在' },
        { status: 400 },
      );
    }

    switch (body.action) {
      case 'publish':
        targets.forEach((c) => { c.status = 'published'; });
        break;
      case 'unpublish':
        targets.forEach((c) => { c.status = 'draft'; });
        break;
      case 'archive':
        targets.forEach((c) => { c.status = 'archived'; });
        break;
      case 'delete':
        targets.forEach((c) => { c.status = 'archived'; });
        break;
      case 'move_category':
        if (!body.category_id) {
          return HttpResponse.json(
            { code: 'VALIDATION_ERROR', message: '移动分类需要指定目标分类' },
            { status: 400 },
          );
        }
        targets.forEach((c) => {
          c.category_id = body.category_id!;
          const cat = mockCategories.find((x) => x.id === body.category_id);
          if (cat) c.category = { id: cat.id, name: cat.name };
        });
        break;
      default:
        return HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: `不支持的操作: ${body.action}` },
          { status: 400 },
        );
    }

    return HttpResponse.json({ success: true, affected: targets.length });
  }),

  // ============================================================
  // Categories
  // ============================================================
  http.get('/api/admin/categories', async () => {
    await delay(300);
    const categoriesWithCount = mockCategories.map((cat) => {
      const craftCount = mockCrafts.filter(
        (c) => c.category_id === cat.id && c.status !== 'archived',
      ).length;
      return { ...cat, craftCount };
    });
    return HttpResponse.json(categoriesWithCount);
  }),

  http.post('/api/admin/categories', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { name: string; icon?: string; sort_order?: number };

    if (!body.name || !body.name.trim()) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '分类名称不能为空' },
        { status: 400 },
      );
    }

    const exists = mockCategories.some((c) => c.name === body.name.trim());
    if (exists) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '分类名称已存在' },
        { status: 400 },
      );
    }

    const newCat: MockCategory = {
      id: `cat-new-${Date.now()}`,
      name: body.name.trim(),
      icon: body.icon || '📦',
      sort_order: body.sort_order ?? mockCategories.length + 1,
      created_at: new Date().toISOString(),
    };

    mockCategories.push(newCat);
    return HttpResponse.json(newCat);
  }),

  http.put('/api/admin/categories/:id', async ({ params, request }) => {
    await delay(400);
    const id = params.id as string;
    const body = (await request.json()) as { name?: string; icon?: string; sort_order?: number };
    const index = mockCategories.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `分类 #${id} 不存在` },
        { status: 404 },
      );
    }

    if (body.name !== undefined) {
      const duplicate = mockCategories.some(
        (c) => c.id !== id && c.name === body.name!.trim(),
      );
      if (duplicate) {
        return HttpResponse.json(
          { code: 'VALIDATION_ERROR', message: '分类名称已存在' },
          { status: 400 },
        );
      }
      mockCategories[index].name = body.name.trim();
    }
    if (body.icon !== undefined) mockCategories[index].icon = body.icon;
    if (body.sort_order !== undefined) mockCategories[index].sort_order = body.sort_order;

    return HttpResponse.json(mockCategories[index]);
  }),

  http.delete('/api/admin/categories/:id', async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const index = mockCategories.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `分类 #${id} 不存在` },
        { status: 404 },
      );
    }

    // Check if any crafts are associated with this category
    const associatedCrafts = mockCrafts.filter(
      (c) => c.category_id === id && c.status !== 'archived',
    );
    if (associatedCrafts.length > 0) {
      return HttpResponse.json(
        {
          code: 'ASSOCIATION_ERROR',
          message: `该分类下有 ${associatedCrafts.length} 个作品，无法删除`,
        },
        { status: 400 },
      );
    }

    mockCategories.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  http.put('/api/admin/categories/reorder', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { ids: string[] };

    if (!body.ids || body.ids.length === 0) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '排序数据不能为空' },
        { status: 400 },
      );
    }

    body.ids.forEach((id, index) => {
      const cat = mockCategories.find((c) => c.id === id);
      if (cat) {
        cat.sort_order = index + 1;
      }
    });

    // Sort categories by the new order
    mockCategories.sort((a, b) => {
      const aIdx = body.ids.indexOf(a.id);
      const bIdx = body.ids.indexOf(b.id);
      if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
      return a.sort_order - b.sort_order;
    });

    return HttpResponse.json({ success: true });
  }),

  // ============================================================
  // Comments
  // ============================================================
  http.get('/api/admin/comments', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const craftId = url.searchParams.get('craft_id');

    let filtered = [...mockComments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (craftId) {
      filtered = filtered.filter((c) => c.craft_id === craftId);
    }

    return HttpResponse.json(paginate(filtered, cursor, limit));
  }),

  http.post('/api/admin/comments/:id/reply', async ({ params, request }) => {
    await delay(400);
    const id = params.id as string;
    const body = (await request.json()) as { content: string };

    const parentComment = mockComments.find((c) => c.id === id);
    if (!parentComment) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `评论 #${id} 不存在` },
        { status: 404 },
      );
    }

    if (!body.content || !body.content.trim()) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '回复内容不能为空' },
        { status: 400 },
      );
    }

    const reply: MockComment = {
      id: `cmt-reply-${Date.now()}`,
      craft_id: parentComment.craft_id,
      craft_title: parentComment.craft_title,
      parent_id: id,
      content: body.content.trim(),
      author_type: 'admin',
      author_name: '手作匠人',
      author_avatar: '',
      is_author_reply: true,
      created_at: new Date().toISOString(),
    };

    mockComments.push(reply);
    return HttpResponse.json(reply);
  }),

  http.delete('/api/admin/comments/:id', async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const index = mockComments.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `评论 #${id} 不存在` },
        { status: 404 },
      );
    }

    mockComments.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/admin/comments/batch-delete', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { ids: string[] };

    if (!body.ids || body.ids.length === 0) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '请选择要删除的评论' },
        { status: 400 },
      );
    }

    let deleted = 0;
    body.ids.forEach((id) => {
      const index = mockComments.findIndex((c) => c.id === id);
      if (index >= 0) {
        mockComments.splice(index, 1);
        deleted++;
      }
    });

    return HttpResponse.json({ success: true, deleted });
  }),

  // ============================================================
  // Intents
  // ============================================================
  http.get('/api/admin/intents', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');

    let filtered = [...mockIntents].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (type) {
      filtered = filtered.filter((i) => i.type === type);
    }
    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }

    return HttpResponse.json(paginate(filtered, cursor, limit));
  }),

  http.get('/api/admin/intents/stats', async () => {
    await delay(300);
    const total = mockIntents.length;
    const today = new Date().toISOString().split('T')[0];
    const todayNew = mockIntents.filter(
      (i) => i.created_at.startsWith(today),
    ).length;
    const pending = mockIntents.filter((i) => i.status === 'pending').length;

    return HttpResponse.json({
      total,
      todayNew,
      pending,
      byType: {
        want_collect: mockIntents.filter((i) => i.type === 'want_collect').length,
        want_custom: mockIntents.filter((i) => i.type === 'want_custom').length,
        want_know_more: mockIntents.filter((i) => i.type === 'want_know_more').length,
      },
    });
  }),

  http.put('/api/admin/intents/:id/status', async ({ params, request }) => {
    await delay(300);
    const id = params.id as string;
    const body = (await request.json()) as { status: string };
    const index = mockIntents.findIndex((i) => i.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `意向 #${id} 不存在` },
        { status: 404 },
      );
    }

    const validStatuses = ['pending', 'viewed', 'replied'];
    if (!validStatuses.includes(body.status)) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: `无效的状态: ${body.status}` },
        { status: 400 },
      );
    }

    mockIntents[index].status = body.status as MockIntent['status'];
    return HttpResponse.json({ success: true });
  }),

  // ============================================================
  // Files
  // ============================================================
  http.post('/api/admin/files/presign', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { filename: string; fileType: 'image' | 'video' };

    if (!body.filename) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '文件名不能为空' },
        { status: 400 },
      );
    }

    const key = `uploads/${Date.now()}-${body.filename}`;
    return HttpResponse.json({
      url: `https://mock-storage.example.com/presign?key=${encodeURIComponent(key)}`,
      key,
    });
  }),

  http.post('/api/admin/files/confirm', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { key: string };

    if (!body.key) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '文件key不能为空' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      url: `https://mock-storage.example.com/files/${encodeURIComponent(body.key)}`,
    });
  }),

  // ============================================================
  // System Config
  // ============================================================
  http.get('/api/admin/config', async () => {
    await delay(300);
    return HttpResponse.json({
      siteName: '手作匠人工作室',
      siteDescription: '用心制作每一件手工作品，传递温暖与匠心',
      announcement: '欢迎光临！新作品每周五更新，敬请期待～',
      enableNotification: 'true',
      notificationEmail: 'admin@craftstudio.example.com',
      maintenanceMode: 'false',
      maxUploadSize: '52428800',
    });
  }),

  http.put('/api/admin/config', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { configs?: { key: string; value: string }[] };

    if (!body.configs || body.configs.length === 0) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: '配置数据不能为空' },
        { status: 400 },
      );
    }

    // In a real app, these would be saved to DB. Here we just echo back.
    const result: Record<string, string> = {
      siteName: '手作匠人工作室',
      siteDescription: '用心制作每一件手工作品，传递温暖与匠心',
      announcement: '欢迎光临！新作品每周五更新，敬请期待～',
      enableNotification: 'true',
      notificationEmail: 'admin@craftstudio.example.com',
      maintenanceMode: 'false',
      maxUploadSize: '52428800',
    };

    body.configs.forEach((c) => {
      result[c.key] = c.value;
    });

    return HttpResponse.json(result);
  }),
];