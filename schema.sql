PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name_fa TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

INSERT OR IGNORE INTO categories(slug,name_fa,sort_order) VALUES
('hymenoplasty','ترمیم بکارت',1),('labiaplasty','لابیاپلاستی',2),('vaginoplasty','واژینوپلاستی',3),('perineoplasty','پرینئوپلاستی',4),('hoodectomy','هودکتومی',5),('filler','فیلر',6),('prp','PRP',7),('exosome','اگزوزوم',8),('care','مراقبت‌ها',9),('faq','پرسش‌های متداول',10),('news','اخبار و مطالب آموزشی',11);

INSERT OR IGNORE INTO settings(key,value) VALUES
('about_home','آکادمی جراحی زیبایی فرهمند با تمرکز بر ارائه اطلاعات و هماهنگی خدمات زیبایی و جراحی زنان فعالیت می‌کند. رویکرد مجموعه بر حفظ حریم خصوصی، پاسخ‌گویی محترمانه، هماهنگی منظم و ارائه اطلاعات روشن پیش از مراجعه است.'),
('about_full','آکادمی جراحی زیبایی فرهمند با هدف ارائه اطلاعات آموزشی و هماهنگی خدمات زیبایی و جراحی زنان شکل گرفته است. در این مجموعه تلاش می‌شود مراجعان پیش از تصمیم‌گیری، اطلاعات روشن‌تری درباره خدمات، روند مشاوره، مراقبت‌های عمومی و نحوه هماهنگی دریافت کنند. حفظ حریم خصوصی، احترام به انتخاب فرد و ارتباط منظم از اصول مهم این مجموعه است.');
