-- ============================================================================
-- 03_triggers_and_seed.sql — updated_* поля, триггеры аудита, views, seed
-- Идемпотентно: удаляет прежние триггеры, функции, views и справочные данные.
-- ============================================================================

-- ---------- 0. УДАЛЕНИЕ ПРЕЖНИХ ОБЪЕКТОВ ----------

-- 0.1 Триггеры аудита на всех таблицах
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT DISTINCT event_object_table AS tbl
          FROM information_schema.triggers
         WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_audit_before ON %1$I', t.tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_audit_after  ON %1$I', t.tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_audit_link   ON %1$I', t.tbl);
    END LOOP;
END $$;

-- 0.2 Прочие триггеры и функции
DROP TRIGGER  IF EXISTS users_create_points ON users;
DROP TRIGGER  IF EXISTS points_apply_tx     ON points_transactions;
DROP FUNCTION IF EXISTS trg_create_points_account() CASCADE;
DROP FUNCTION IF EXISTS trg_update_points_balance() CASCADE;
DROP FUNCTION IF EXISTS trg_audit_before()          CASCADE;
DROP FUNCTION IF EXISTS trg_audit_after()           CASCADE;
DROP FUNCTION IF EXISTS trg_audit_link_after()      CASCADE;

-- 0.3 Представления
DROP VIEW IF EXISTS v_student_daily_attendance CASCADE;
DROP VIEW IF EXISTS v_student_grades_dynamics  CASCADE;
DROP VIEW IF EXISTS v_points_overview          CASCADE;
DROP VIEW IF EXISTS v_product_sales            CASCADE;

-- 0.4 Справочные данные (чтобы повторный запуск не падал на UNIQUE)
TRUNCATE TABLE role_permissions RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_roles       RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE permissions      RESTART IDENTITY CASCADE;
TRUNCATE TABLE roles            RESTART IDENTITY CASCADE;

-- ---------- 1. updated_by / updated_at во все ключевые таблицы ----------
-- events, event_registrations, event_media — исключены.
DO $$
DECLARE
    t RECORD;
    v_tables TEXT[] := ARRAY[
        'users', 'org_units', 'roles', 'permissions',
        'classes', 'groups', 'chat_messages',
        'students', 'parents', 'teachers', 'class_teachers',
        'courses', 'course_lessons', 'course_enrollments',
        'lesson_progress', 'schedule', 'materials',
        'homeworks', 'homework_submissions', 'mistakes_book',
        'lesson_ratings', 'grades', 'exams', 'exam_registrations',
        'class_rankings', 'attendance', 'makeup_assignments',
        'contests', 'contest_registrations', 'achievements',
        'product_categories', 'products', 'carts', 'cart_items',
        'contracts', 'orders', 'order_items', 'payments',
        'points_accounts', 'points_transactions',
        'announcements', 'notifications', 'teacher_reviews',
        'attendance_reports', 'finance_reports'
    ];
BEGIN
    FOR t IN SELECT unnest(v_tables) AS tbl LOOP
        EXECUTE format(
            'ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()',
            t.tbl);
        EXECUTE format(
            'ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL',
            t.tbl);
    END LOOP;
END $$;

-- ---------- 2. BEFORE-триггер: служебные поля ----------
CREATE OR REPLACE FUNCTION trg_audit_before() RETURNS TRIGGER AS $$
DECLARE
    v_user UUID := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at := NOW();
        NEW.updated_by := COALESCE(v_user, NEW.updated_by);
    ELSIF TG_OP = 'INSERT' THEN
        IF v_user IS NOT NULL AND NEW.updated_by IS NULL THEN
            NEW.updated_by := v_user;
        END IF;
        -- updated_at НЕ трогаем — берётся DEFAULT NOW()
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- 3. AFTER-триггер: запись события в event_logs ----------
CREATE OR REPLACE FUNCTION trg_audit_after() RETURNS TRIGGER AS $$
DECLARE
    v_user    UUID := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
    v_entity  UUID;
    v_payload JSONB;
    v_event   TEXT := TG_TABLE_NAME || '.' || lower(TG_OP);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_entity  := OLD.id;
        v_payload := jsonb_build_object('old', to_jsonb(OLD));
    ELSIF TG_OP = 'UPDATE' THEN
        v_entity  := NEW.id;
        v_payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSE
        v_entity  := NEW.id;
        v_payload := jsonb_build_object('new', to_jsonb(NEW));
    END IF;

    INSERT INTO event_logs (level, source, event_type, user_id, entity_type, entity_id, payload)
    VALUES ('INFO', 'db', v_event, v_user, TG_TABLE_NAME, v_entity, v_payload);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ---------- 4. AFTER-триггер для таблиц-связок (без id) ----------
CREATE OR REPLACE FUNCTION trg_audit_link_after() RETURNS TRIGGER AS $$
DECLARE
    v_user    UUID := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
    v_payload JSONB;
    v_event   TEXT := TG_TABLE_NAME || '.' || lower(TG_OP);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_payload := jsonb_build_object('old', to_jsonb(OLD));
    ELSIF TG_OP = 'UPDATE' THEN
        v_payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSE
        v_payload := jsonb_build_object('new', to_jsonb(NEW));
    END IF;

    INSERT INTO event_logs (level, source, event_type, user_id, entity_type, entity_id, payload)
    VALUES ('INFO', 'db', v_event, v_user, TG_TABLE_NAME, NULL, v_payload);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ---------- 5. Навешивание триггеров на таблицы с одиночным PK "id" ----------
DO $$
DECLARE
    t RECORD;
    v_tables TEXT[] := ARRAY[
        'users', 'org_units',
        'classes', 'groups', 'chat_messages',
        'students', 'parents', 'teachers', 'class_teachers',
        'courses', 'course_lessons', 'course_enrollments',
        'schedule', 'materials',
        'homeworks', 'homework_submissions',
        'exams', 'exam_registrations',
        'makeup_assignments',
        'contests', 'contest_registrations', 'achievements',
        'products', 'carts', 'contracts', 'orders', 'payments',
        'announcements',
        'teacher_reviews'
    ];
BEGIN
    FOR t IN SELECT unnest(v_tables) AS tbl LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_audit_before ON %1$I', t.tbl);
        EXECUTE format(
            'CREATE TRIGGER trg_%1$s_audit_before BEFORE INSERT OR UPDATE ON %1$I
             FOR EACH ROW EXECUTE FUNCTION trg_audit_before()', t.tbl);

        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_audit_after ON %1$I', t.tbl);
        EXECUTE format(
            'CREATE TRIGGER trg_%1$s_audit_after AFTER INSERT OR UPDATE OR DELETE ON %1$I
             FOR EACH ROW EXECUTE FUNCTION trg_audit_after()', t.tbl);
    END LOOP;
END $$;

-- ---------- 6. AFTER-триггер для таблиц-связок ----------
DO $$
DECLARE
    t RECORD;
    v_tables TEXT[] := ARRAY[
        'parent_students',
        'teacher_students',
        'group_members',
        'role_permissions',
        'user_roles',
        'cart_items',
        'order_items'
    ];
BEGIN
    FOR t IN SELECT unnest(v_tables) AS tbl LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_audit_link ON %1$I', t.tbl);
        EXECUTE format(
            'CREATE TRIGGER trg_%1$s_audit_link AFTER INSERT OR UPDATE OR DELETE ON %1$I
             FOR EACH ROW EXECUTE FUNCTION trg_audit_link_after()', t.tbl);
    END LOOP;
END $$;

-- ---------- 7. Триггер автосоздания points_accounts ----------
CREATE OR REPLACE FUNCTION trg_create_points_account() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO points_accounts(user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_create_points ON users;
CREATE TRIGGER users_create_points
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION trg_create_points_account();

-- ---------- 8. Триггер обновления баллов ----------
CREATE OR REPLACE FUNCTION trg_update_points_balance() RETURNS TRIGGER AS $$
BEGIN
    UPDATE points_accounts
       SET balance      = balance + NEW.amount,
           total_earned = total_earned + GREATEST(NEW.amount, 0),
           updated_at   = NOW()
     WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS points_apply_tx ON points_transactions;
CREATE TRIGGER points_apply_tx
    AFTER INSERT ON points_transactions
    FOR EACH ROW EXECUTE FUNCTION trg_update_points_balance();

-- ---------- 9. Представления ----------
CREATE OR REPLACE VIEW v_student_daily_attendance AS
SELECT student_id,
       DATE(marked_at) AS day,
       COUNT(*) FILTER (WHERE status = 'present') AS present_cnt,
       COUNT(*) FILTER (WHERE status = 'absent')  AS absent_cnt,
       COUNT(*) FILTER (WHERE status = 'late')    AS late_cnt
FROM attendance
GROUP BY student_id, DATE(marked_at);

CREATE OR REPLACE VIEW v_student_grades_dynamics AS
SELECT student_id, subject, grade_type, period_label,
       AVG(score) AS avg_score, COUNT(*) AS cnt
FROM grades
GROUP BY student_id, subject, grade_type, period_label;

CREATE OR REPLACE VIEW v_points_overview AS
SELECT pa.user_id, pa.balance, pa.total_earned,
       COUNT(pt.id) AS tx_count,
       MAX(pt.created_at) AS last_tx_at
FROM points_accounts pa
LEFT JOIN points_transactions pt ON pt.user_id = pa.user_id
GROUP BY pa.user_id, pa.balance, pa.total_earned;

CREATE OR REPLACE VIEW v_product_sales AS
SELECT p.id AS product_id, p.title, p.category_id,
       COUNT(oi.id) AS items_sold,
       SUM(oi.price * oi.quantity) AS revenue
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
GROUP BY p.id, p.title, p.category_id;

-- ---------- 10. Базовые данные ----------
INSERT INTO product_categories (code, name_ru, name_zh) VALUES
    ('courses',      'Образовательные курсы',            '教育课程'),
    ('video',        'Видеоуроки',                       '视频课程'),
    ('trips',        'Образовательные поездки',          '教育旅行'),
    ('study_abroad', 'Обучение за рубежом',              '海外留学'),
    ('souvenirs',    'Сувениры',                         '纪念品'),
    ('third_party',  'Сторонние услуги (отель, билеты)', '第三方服务（酒店、机票）');

INSERT INTO roles (code, name, is_system) VALUES
    ('super_admin',  'Супер-администратор', TRUE),
    ('school_admin', 'Администратор школы',  TRUE),
    ('teacher',      'Преподаватель',        TRUE),
    ('student',      'Ученик',               TRUE),
    ('parent',       'Родитель',             TRUE);

INSERT INTO permissions (code, description) VALUES
    ('users.import',         'Массовый импорт пользователей'),
    ('users.export',         'Экспорт пользователей'),
    ('users.freeze',         'Заморозка/активация'),
    ('announcements.publish','Публикация объявлений'),
    ('products.manage',      'Управление продуктами'),
    ('courses.manage',       'Управление курсами'),
    ('grades.manage',        'Управление оценками'),
    ('attendance.manage',    'Управление посещаемостью'),
    ('finance.view',         'Просмотр финансов'),
    ('points.manage',        'Управление баллами'),
    ('reports.export',       'Экспорт отчётов');

-- ---------- 11. Привязка прав к ролям ----------
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.code = 'super_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'users.import','users.export','users.freeze',
    'announcements.publish','courses.manage','grades.manage',
    'attendance.manage','reports.export'
)
WHERE r.code = 'school_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('grades.manage','attendance.manage','courses.manage')
WHERE r.code = 'teacher';

-- ---------- 12. Демо-супер-админ ----------
INSERT INTO users (username, password_hash, full_name, email, role, preferred_lang)
VALUES (
    'root',
    crypt('ChangeMe!123', gen_salt('bf')),
    'Root Super Admin',
    'root@school.local',
    'super_admin',
    'ru'
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'root' AND r.code = 'super_admin';

-- ---------- 13. user_roles для всех пользователей ----------
-- Ученики
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'student' AND r.code = 'student';

-- Родители
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'parent' AND r.code = 'parent';

-- Учителя
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'teacher' AND r.code = 'teacher';

-- ---------- 14. Товары (products) ----------
INSERT INTO products (id, category_id, title, title_zh, description, description_zh, price, stock_qty, is_third_party, status) VALUES
-- Курсы (category_id = 1)
('70000000-0000-0000-0000-000000000001', 1, 'Курс "Продвинутый китайский"', '高级汉语课程', 'Углублённый курс китайского языка', '高级汉语课程', 25000.00, 100, FALSE, 'published'),
('70000000-0000-0000-0000-000000000002', 1, 'Курс "Деловой китайский"', '商务汉语课程', 'Китайский для бизнеса', '商务汉语课程', 30000.00, 50, FALSE, 'published'),
-- Видеоуроки (category_id = 2)
('70000000-0000-0000-0000-000000000003', 2, 'Видеокурс "Иероглифы"', '汉字视频课程', '50 видеоуроков по иероглифам', '50个汉字视频课程', 5000.00, 999, FALSE, 'published'),
-- Поездки (category_id = 3)
('70000000-0000-0000-0000-000000000004', 3, 'Образовательная поездка в Пекин', '北京教育之旅', '7 дней в Пекине', '北京7天', 120000.00, 20, FALSE, 'published'),
('70000000-0000-0000-0000-000000000005', 3, 'Поездка в Шанхай', '上海之旅', '5 дней в Шанхае', '上海5天', 95000.00, 15, FALSE, 'published'),
-- Сувениры (category_id = 5)
('70000000-0000-0000-0000-000000000006', 5, 'Набор для каллиграфии', '书法套装', 'Кисти, тушь, бумага', '毛笔、墨、纸', 3500.00, 50, FALSE, 'published'),
('70000000-0000-0000-0000-000000000007', 5, 'Учебник HSK 3', 'HSK 3 教材', 'Учебник для подготовки к HSK 3', 'HSK 3 准备教材', 1500.00, 200, FALSE, 'published'),
-- Сторонние услуги (category_id = 6)
('70000000-0000-0000-0000-000000000008', 6, 'Билеты Москва-Пекин', '莫斯科-北京机票', 'Авиабилеты в обе стороны', '往返机票', 45000.00, 100, TRUE, 'published'),
('70000000-0000-0000-0000-000000000009', 6, 'Отель в Пекине (7 nights)', '北京酒店（7晚）', 'Проживание 7 ночей', '住宿7晚', 35000.00, 50, TRUE, 'published');

-- ---------- 15. class_teachers (привязка учителей к классам) ----------
DO $$
DECLARE
    class_num INT;
    teacher_num INT;
BEGIN
    FOR class_num IN 1..6 LOOP
        teacher_num := ((class_num - 1) % 10) + 1;
        
        -- Классный руководитель
        INSERT INTO class_teachers (class_id, teacher_id, subject, is_head) VALUES
        (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
         ('a0000000-0000-0000-0000-' || lpad(teacher_num::text, 12, '0'))::uuid,
         CASE teacher_num
             WHEN 1 THEN 'Китайский язык'  WHEN 2 THEN 'Математика'
             WHEN 3 THEN 'Каллиграфия'     WHEN 4 THEN 'История Китая'
             WHEN 5 THEN 'Литература'      WHEN 6 THEN 'Китайский язык'
             WHEN 7 THEN 'Математика'      WHEN 8 THEN 'Каллиграфия'
             WHEN 9 THEN 'История Китая'   ELSE 'Литература'
         END,
         TRUE);
        
        -- Ещё 2 учителя-предметника
        INSERT INTO class_teachers (class_id, teacher_id, subject, is_head) VALUES
        (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
         ('a0000000-0000-0000-0000-' || lpad(((teacher_num % 10) + 1)::text, 12, '0'))::uuid,
         CASE (teacher_num % 10) + 1
             WHEN 1 THEN 'Китайский язык'  WHEN 2 THEN 'Математика'
             WHEN 3 THEN 'Каллиграфия'     WHEN 4 THEN 'История Китая'
             WHEN 5 THEN 'Литература'      WHEN 6 THEN 'Китайский язык'
             WHEN 7 THEN 'Математика'      WHEN 8 THEN 'Каллиграфия'
             WHEN 9 THEN 'История Китая'   ELSE 'Литература'
         END,
         FALSE),
        (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
         ('a0000000-0000-0000-0000-' || lpad((((teacher_num + 1) % 10) + 1)::text, 12, '0'))::uuid,
         CASE ((teacher_num + 1) % 10) + 1
             WHEN 1 THEN 'Китайский язык'  WHEN 2 THEN 'Математика'
             WHEN 3 THEN 'Каллиграфия'     WHEN 4 THEN 'История Китая'
             WHEN 5 THEN 'Литература'      WHEN 6 THEN 'Китайский язык'
             WHEN 7 THEN 'Математика'      WHEN 8 THEN 'Каллиграфия'
             WHEN 9 THEN 'История Китая'   ELSE 'Литература'
         END,
         FALSE);
    END LOOP;
END $$;

-- ---------- 16. Материалы (materials) ----------
INSERT INTO materials (id, course_id, title, description, material_type, is_hard_topic, status, download_count) VALUES
('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Словарь уроков 1-5', 'Все слова из первых 5 уроков', 'pdf', FALSE, 'published', 45),
('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Грамматика: частицы', 'Сложная тема — частицы 的, 了, 过', 'pdf', TRUE, 'published', 30),
('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Формулы алгебры', 'Все формулы за курс', 'pdf', FALSE, 'published', 55),
('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Теорема Пифагора', 'Сложная тема — доказательство', 'video', TRUE, 'published', 25),
('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Порядок написания иероглифов', 'Правила каллиграфии', 'pdf', FALSE, 'published', 40);

-- ---------- 17. Расписание (schedule) ----------
DO $$
DECLARE
    class_num INT;
BEGIN
    FOR class_num IN 1..6 LOOP
        -- Понедельник: Китайский язык
        INSERT INTO schedule (class_id, course_id, teacher_id, weekday, start_time, end_time, room, valid_from, valid_to) VALUES
        (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
         '10000000-0000-0000-0000-000000000001',
         ('a0000000-0000-0000-0000-' || lpad(1::text, 12, '0'))::uuid,
         1, '10:00', '11:30', 'A-' || (100 + class_num), '2024-09-01', '2025-06-30');
        
        -- Среда: Математика
        INSERT INTO schedule (class_id, course_id, teacher_id, weekday, start_time, end_time, room, valid_from, valid_to) VALUES
        (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
         '10000000-0000-0000-0000-000000000002',
         ('a0000000-0000-0000-0000-' || lpad(2::text, 12, '0'))::uuid,
         3, '14:00', '15:30', 'B-' || (200 + class_num), '2024-09-01', '2025-06-30');
        
        -- Пятница: Каллиграфия (доп. занятие)
        INSERT INTO schedule (class_id, course_id, teacher_id, weekday, start_time, end_time, room, valid_from, valid_to) VALUES
        (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
         '10000000-0000-0000-0000-000000000003',
         ('a0000000-0000-0000-0000-' || lpad(3::text, 12, '0'))::uuid,
         5, '16:00', '16:30', 'C-' || (300 + class_num), '2024-09-01', '2025-06-30');
    END LOOP;
END $$;

-- ---------- 18. Объявления (announcements) ----------
INSERT INTO announcements (id, title_ru, title_zh, body_ru, body_zh, tags, target_roles, status) VALUES
('90000000-0000-0000-0000-000000000001', 
 'День открытых дверей', '开放日',
 'Уважаемые родители! 20 февраля состоится день открытых дверей. Приглашаем всех желающих!',
 '尊敬的家长！2月20日将举行开放日。欢迎所有人！',
 ARRAY['event', 'important'], ARRAY['student', 'parent']::user_role_enum[], 'published'),
('90000000-0000-0000-0000-000000000002',
 'Изменение расписания', '课程表变更',
 'Внимание! С 1 февраля изменяется расписание занятий в классах A-1 и A-2.',
 '注意！从2月1日起，A-1和A-2班的课程表有所变更。',
 ARRAY['schedule', 'important'], ARRAY['student', 'parent']::user_role_enum[], 'published'),
('90000000-0000-0000-0000-000000000003',
 'Регистрация на HSK', 'HSK报名',
 'Открыта регистрация на экзамен HSK. Дедлайн — 15 февраля.',
 'HSK考试报名已开始。截止日期为2月15日。',
 ARRAY['exam', 'registration'], ARRAY['student', 'parent']::user_role_enum[], 'published');

-- ---------- 19. Экзамены (exams) ----------
INSERT INTO exams (id, exam_type, title, exam_date, registration_deadline, status) VALUES
('a1000000-0000-0000-0000-000000000001', 'monthly', 'Ежемесячный экзамен — Январь', '2025-01-31', '2025-01-28', 'completed'),
('a1000000-0000-0000-0000-000000000002', 'semester', 'Семестровый экзамен — Осень 2024', '2024-12-25', '2024-12-20', 'completed'),
('a1000000-0000-0000-0000-000000000003', 'hsk', 'HSK Level 2', '2025-03-15', '2025-03-01', 'open'),
('a1000000-0000-0000-0000-000000000004', 'yct', 'YCT Level 3', '2025-04-10', '2025-03-25', 'open');

-- ---------- 20. Регистрации на экзамены (exam_registrations) ----------
DO $$
DECLARE
    student_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        INSERT INTO exam_registrations (exam_id, student_id, score, result_level) VALUES
        ('a1000000-0000-0000-0000-000000000001',
         ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
         60 + (student_num % 40),
         CASE WHEN (student_num % 40) > 30 THEN 'excellent' WHEN (student_num % 40) > 20 THEN 'good' ELSE 'satisfactory' END);
        
        IF student_num % 2 = 0 THEN
            INSERT INTO exam_registrations (exam_id, student_id) VALUES
            ('a1000000-0000-0000-0000-000000000003',
             ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid);
        END IF;
        
        IF student_num % 3 = 0 THEN
            INSERT INTO exam_registrations (exam_id, student_id) VALUES
            ('a1000000-0000-0000-0000-000000000004',
             ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid);
        END IF;
    END LOOP;
END $$;

-- ---------- 21. Рейтинги классов (class_rankings) ----------
DO $$
DECLARE
    class_num INT;
    student_num INT;
    rank_pos INT := 1;
BEGIN
    FOR class_num IN 1..6 LOOP
        rank_pos := 1;
        FOR student_num IN ((class_num - 1) * 10 + 1)..(class_num * 10) LOOP
            INSERT INTO class_rankings (class_id, student_id, period_label, rank_position, total_score) VALUES
            (('f0000000-0000-0000-0000-' || lpad(class_num::text, 12, '0'))::uuid,
             ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
             'Январь 2025',
             rank_pos,
             400.0 - (rank_pos * 10));
            rank_pos := rank_pos + 1;
        END LOOP;
    END LOOP;
END $$;

-- ---------- 22. Тетрадь ошибок (mistakes_book) ----------
DO $$
DECLARE
    student_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        IF student_num % 10 < 7 THEN
            INSERT INTO mistakes_book (student_id, homework_id, question_ref, mistake_text, correct_text) VALUES
            (('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
             '30000000-0000-0000-0000-000000000001',
             'Q1',
             'Неправильное использование частицы 的',
             'Правильное использование: 我的书'),
            (('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
             '30000000-0000-0000-0000-000000000002',
             'Q3',
             'Ошибка в написании иероглифа 学',
             'Правильное написание: 学');
        END IF;
    END LOOP;
END $$;

-- ---------- 23. Отзывы учителей (teacher_reviews) ----------
DO $$
DECLARE
    parent_num INT;
    teacher_num INT;
BEGIN
    FOR parent_num IN 1..60 LOOP
        teacher_num := ((parent_num - 1) % 10) + 1;
        
        INSERT INTO teacher_reviews (teacher_id, parent_id, student_id, rating, comment) VALUES
        (('a0000000-0000-0000-0000-' || lpad(teacher_num::text, 12, '0'))::uuid,
         ('e0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
         ('c0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
         3 + (parent_num % 3),
         CASE parent_num % 4
             WHEN 0 THEN 'Отличный преподаватель!'
             WHEN 1 THEN 'Очень доволен результатами'
             WHEN 2 THEN 'Хороший учитель, рекомендую'
             ELSE 'Профессиональный подход к обучению'
         END);
    END LOOP;
END $$;

-- ---------- 24. Договоры и заказы (contracts, orders, order_items, payments) ----------
DO $$
DECLARE
    parent_num INT;
    order_uuid UUID;
    contract_uuid UUID;
BEGIN
    FOR parent_num IN 1..60 LOOP
        order_uuid := ('b1000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid;
        contract_uuid := ('c1000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid;
        
        INSERT INTO contracts (id, user_id, contract_no, signed_at, status) VALUES
        (contract_uuid,
         ('d0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
         'CTR-2024-' || lpad(parent_num::text, 4, '0'),
         '2024-09-01 10:00:00',
         'signed');
        
        INSERT INTO orders (id, user_id, order_no, total_amount, status, contract_id, paid_at) VALUES
        (order_uuid,
         ('d0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
         'ORD-2024-' || lpad(parent_num::text, 4, '0'),
         27000.00,
         'paid',
         contract_uuid,
         '2024-09-01 10:05:00');
        
        INSERT INTO order_items (order_id, product_id, title_snapshot, price, quantity) VALUES
        (order_uuid, '10000000-0000-0000-0000-000000000001', 'Китайский язык — начальный', 15000.00, 1),
        (order_uuid, '10000000-0000-0000-0000-000000000002', 'Математика — базовый курс', 12000.00, 1);
        
        INSERT INTO payments (order_id, user_id, amount, method, status, paid_at) VALUES
        (order_uuid,
         ('d0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
         27000.00,
         'card',
         'completed',
         '2024-09-01 10:05:00');
    END LOOP;
END $$;

-- ---------- 25. Записи на конкурсы (contest_registrations) ----------
DO $$
DECLARE
    student_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        IF student_num % 5 < 2 THEN
            INSERT INTO contest_registrations (contest_id, student_id) VALUES
            ('50000000-0000-0000-0000-000000000001',
             ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid);
        END IF;
        
        IF student_num % 3 = 0 THEN
            INSERT INTO contest_registrations (contest_id, student_id) VALUES
            ('50000000-0000-0000-0000-000000000002',
             ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid);
        END IF;
    END LOOP;
END $$;

-- ---------- 26. Записи на мероприятия (event_registrations) ----------
DO $$
DECLARE
    parent_num INT;
BEGIN
    FOR parent_num IN 1..60 LOOP
        IF parent_num % 2 = 0 THEN
            INSERT INTO event_registrations (event_id, user_id, payment_status) VALUES
            ('60000000-0000-0000-0000-000000000001',
             ('d0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
             'unpaid');
        END IF;
        
        IF parent_num % 3 = 0 THEN
            INSERT INTO event_registrations (event_id, user_id, payment_status) VALUES
            ('60000000-0000-0000-0000-000000000002',
             ('d0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid,
             'paid');
        END IF;
    END LOOP;
END $$;

-- ---------- 27. Баллы (points_accounts и points_transactions) ----------
-- Перенесено из 02_seed_data.sql, так как теперь есть триггеры
-- users_create_points (автосоздание accounts) и points_apply_tx (обновление balance)
DO $$
DECLARE
    parent_num INT;
    parent_user_uuid UUID;
BEGIN
    FOR parent_num IN 1..60 LOOP
        parent_user_uuid := ('d0000000-0000-0000-0000-' || lpad(parent_num::text, 12, '0'))::uuid;
        
        -- points_accounts уже создан триггером users_create_points при INSERT в users
        -- Триггер points_apply_tx сработает при INSERT в transactions
        
        -- Транзакция 1: покупка курса
        INSERT INTO points_transactions (user_id, source, amount, description, created_at) VALUES
        (parent_user_uuid, 'purchase'::points_source_enum, 50000 + (parent_num * 3333) % 150000, 'Покупка курса', '2025-01-15');
        
        -- Транзакция 2: реферал (для 50%)
        IF parent_num % 2 = 0 THEN
            INSERT INTO points_transactions (user_id, source, amount, description, created_at) VALUES
            (parent_user_uuid, 'referral'::points_source_enum, 50000, 'Привлечение друга', '2024-12-15');
        END IF;
        
        -- Транзакция 3: бонус (для 30%)
        IF parent_num % 3 = 0 THEN
            INSERT INTO points_transactions (user_id, source, amount, description, created_at) VALUES
            (parent_user_uuid, 'manual'::points_source_enum, 150000, 'Бонус за активность', '2025-01-20');
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- КОНЕЦ 03_triggers_and_seed.sql
-- ============================================================================
