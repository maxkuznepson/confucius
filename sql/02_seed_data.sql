-- ============================================================================
-- 02_seed_data.sql — Тестовые данные для школы Конфуция
-- 60 учеников, 60 родителей, 10 учителей, 6 классов
-- Телефоны: ученики 3n+1 и 3n+2, родители 3n+3, учителя 100n+100
-- Email: studentN@confucius.ru, parentN@confucius.ru, teacherN@confucius.ru
-- Пароль: 123
-- ============================================================================

-- ---------- 0. УДАЛЕНИЕ ДАННЫХ (в обратном порядке FK) ----------
DELETE FROM log_access_audit;
DELETE FROM error_logs;
DELETE FROM event_logs;
DELETE FROM finance_reports;
DELETE FROM attendance_reports;
DELETE FROM teacher_reviews;
DELETE FROM notifications;
DELETE FROM announcements;
DELETE FROM points_transactions;
DELETE FROM points_accounts;
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM contracts;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM products;
DELETE FROM product_categories;
DELETE FROM achievements;
DELETE FROM event_media;
DELETE FROM event_registrations;
DELETE FROM events;
DELETE FROM contest_registrations;
DELETE FROM contests;
DELETE FROM makeup_assignments;
DELETE FROM attendance;
DELETE FROM class_rankings;
DELETE FROM exam_registrations;
DELETE FROM exams;
DELETE FROM grades;
DELETE FROM lesson_ratings;
DELETE FROM mistakes_book;
DELETE FROM homework_submissions;
DELETE FROM homeworks;
DELETE FROM materials;
DELETE FROM schedule;
DELETE FROM lesson_progress;
DELETE FROM course_enrollments;
DELETE FROM course_lessons;
DELETE FROM courses;
DELETE FROM class_teachers;
DELETE FROM teacher_students;
DELETE FROM parent_students;
DELETE FROM teachers;
DELETE FROM parents;
DELETE FROM students;
DELETE FROM chat_messages;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM classes;
DELETE FROM user_roles;
DELETE FROM role_permissions;
DELETE FROM roles;
DELETE FROM permissions;
DELETE FROM org_units;
DELETE FROM users;

-- ---------- 1. ПОЛЬЗОВАТЕЛИ: УЧИТЕЛЯ (10) ----------
-- UUID: a0000000-0000-0000-0000-0000000000XX
-- Телефоны: +79998881000, +79998882000, ..., +799988810000
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, preferred_lang, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'teacher1',  '123', 'Иванов Иван Сергеевич',        'teacher1@confucius.ru',  '+79998881000', 'teacher', 'ru', TRUE),
('a0000000-0000-0000-0000-000000000002', 'teacher2',  '123', 'Петрова Мария Петровна',        'teacher2@confucius.ru',  '+79998882000', 'teacher', 'zh', TRUE),
('a0000000-0000-0000-0000-000000000003', 'teacher3',  '123', 'Сидоров Алексей Дмитриевич',    'teacher3@confucius.ru',  '+79998883000', 'teacher', 'ru', TRUE),
('a0000000-0000-0000-0000-000000000004', 'teacher4',  '123', 'Смирнова Елена Николаевна',     'teacher4@confucius.ru',  '+79998884000', 'teacher', 'zh', TRUE),
('a0000000-0000-0000-0000-000000000005', 'teacher5',  '123', 'Кузнецов Дмитрий Александрович','teacher5@confucius.ru',  '+79998885000', 'teacher', 'ru', TRUE),
('a0000000-0000-0000-0000-000000000006', 'teacher6',  '123', 'Попова Ольга Сергеевна',        'teacher6@confucius.ru',  '+79998886000', 'teacher', 'zh', TRUE),
('a0000000-0000-0000-0000-000000000007', 'teacher7',  '123', 'Волков Сергей Петрович',        'teacher7@confucius.ru',  '+79998887000', 'teacher', 'ru', TRUE),
('a0000000-0000-0000-0000-000000000008', 'teacher8',  '123', 'Соколова Наталья Дмитриевна',   'teacher8@confucius.ru',  '+79998888000', 'teacher', 'zh', TRUE),
('a0000000-0000-0000-0000-000000000009', 'teacher9',  '123', 'Лебедев Михаил Александрович',  'teacher9@confucius.ru',  '+79998889000', 'teacher', 'ru', TRUE),
('a0000000-0000-0000-0000-000000000010', 'teacher10', '123', 'Козлова Татьяна Николаевна',    'teacher10@confucius.ru', '+799988810000', 'teacher', 'zh', TRUE);

-- ---------- 2. КЛАССЫ (6) ----------
-- UUID: f0000000-0000-0000-0000-0000000000XX
INSERT INTO classes (id, name, academic_year, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'A-1', '2024-2025', 'published'),
('f0000000-0000-0000-0000-000000000002', 'A-2', '2024-2025', 'published'),
('f0000000-0000-0000-0000-000000000003', 'B-1', '2024-2025', 'published'),
('f0000000-0000-0000-0000-000000000004', 'B-2', '2024-2025', 'published'),
('f0000000-0000-0000-0000-000000000005', 'C-1', '2024-2025', 'published'),
('f0000000-0000-0000-0000-000000000006', 'C-2', '2024-2025', 'published');

-- ---------- 3. УЧЕНИКИ (60) И РОДИТЕЛИ (60) ----------
-- Ученики users: b0000000-0000-0000-0000-0000000000XX (1..60)
-- Ученики students: c0000000-0000-0000-0000-0000000000XX (1..60)
-- Родители users: d0000000-0000-0000-0000-0000000000XX (1..60)
-- Родители parents: e0000000-0000-0000-0000-0000000000XX (1..60)
-- n ∈ [0..29], каждый n даёт 2 ученика и 2 родителей
-- Классы: A-1 (n=0..4), A-2 (n=5..9), B-1 (n=10..14), B-2 (n=15..19), C-1 (n=20..24), C-2 (n=25..29)

DO $$
DECLARE
    n INT;
    class_idx INT;
    s1 INT;
    s2 INT;
    p1 INT;
    p2 INT;
    phone_s1 TEXT;
    phone_s2 TEXT;
    phone_p TEXT;
    class_uuid UUID;
    occ TEXT;
BEGIN
    FOR n IN 0..29 LOOP
        class_idx := n / 5;
        s1 := n * 2 + 1;
        s2 := n * 2 + 2;
        p1 := n * 2 + 1;
        p2 := n * 2 + 2;
        
        phone_s1 := '+7999888' || lpad((3*n + 1)::text, 4, '0');
        phone_s2 := '+7999888' || lpad((3*n + 2)::text, 4, '0');
        phone_p  := '+7999888' || lpad((3*n + 3)::text, 4, '0');
        
        class_uuid := ('f0000000-0000-0000-0000-' || lpad((class_idx + 1)::text, 12, '0'))::uuid;
        
        occ := CASE n % 8
            WHEN 0 THEN 'Инженер'        WHEN 1 THEN 'Врач'
            WHEN 2 THEN 'Учитель'        WHEN 3 THEN 'Предприниматель'
            WHEN 4 THEN 'Менеджер'       WHEN 5 THEN 'Программист'
            WHEN 6 THEN 'Бухгалтер'      ELSE 'Юрист'
        END;
        
        -- ===== УЧЕНИК 1 =====
        INSERT INTO users (id, username, password_hash, full_name, email, phone, role, preferred_lang, is_active)
        VALUES (
            ('b0000000-0000-0000-0000-' || lpad(s1::text, 12, '0'))::uuid,
            'student' || s1, '123',
            'Ученик ' || s1,
            'student' || s1 || '@confucius.ru',
            phone_s1, 'student', 'ru', TRUE
        );
        
        INSERT INTO students (id, user_id, class_id, student_no, birth_date, gender, enrollment_date, status)
        VALUES (
            ('c0000000-0000-0000-0000-' || lpad(s1::text, 12, '0'))::uuid,
            ('b0000000-0000-0000-0000-' || lpad(s1::text, 12, '0'))::uuid,
            class_uuid,
            'STU-2024-' || lpad(s1::text, 3, '0'),
            '2010-01-01'::date + (n * 15 || ' days')::interval,
            CASE WHEN s1 % 2 = 1 THEN 'male' ELSE 'female' END,
            '2023-09-01', 'active'
        );
        
        -- ===== РОДИТЕЛЬ 1 =====
        INSERT INTO users (id, username, password_hash, full_name, email, phone, role, preferred_lang, is_active)
        VALUES (
            ('d0000000-0000-0000-0000-' || lpad(p1::text, 12, '0'))::uuid,
            'parent' || p1, '123',
            'Родитель ' || p1,
            'parent' || p1 || '@confucius.ru',
            phone_p, 'parent', 'ru', TRUE
        );
        
        INSERT INTO parents (id, user_id, occupation)
        VALUES (
            ('e0000000-0000-0000-0000-' || lpad(p1::text, 12, '0'))::uuid,
            ('d0000000-0000-0000-0000-' || lpad(p1::text, 12, '0'))::uuid,
            occ
        );
        
        -- ===== УЧЕНИК 2 =====
        INSERT INTO users (id, username, password_hash, full_name, email, phone, role, preferred_lang, is_active)
        VALUES (
            ('b0000000-0000-0000-0000-' || lpad(s2::text, 12, '0'))::uuid,
            'student' || s2, '123',
            'Ученик ' || s2,
            'student' || s2 || '@confucius.ru',
            phone_s2, 'student', 'ru', TRUE
        );
        
        INSERT INTO students (id, user_id, class_id, student_no, birth_date, gender, enrollment_date, status)
        VALUES (
            ('c0000000-0000-0000-0000-' || lpad(s2::text, 12, '0'))::uuid,
            ('b0000000-0000-0000-0000-' || lpad(s2::text, 12, '0'))::uuid,
            class_uuid,
            'STU-2024-' || lpad(s2::text, 3, '0'),
            '2010-01-01'::date + ((n * 15 + 7) || ' days')::interval,
            CASE WHEN s2 % 2 = 0 THEN 'male' ELSE 'female' END,
            '2023-09-01', 'active'
        );
        
        -- ===== РОДИТЕЛЬ 2 =====
        INSERT INTO users (id, username, password_hash, full_name, email, phone, role, preferred_lang, is_active)
        VALUES (
            ('d0000000-0000-0000-0000-' || lpad(p2::text, 12, '0'))::uuid,
            'parent' || p2, '123',
            'Родитель ' || p2,
            'parent' || p2 || '@confucius.ru',
            phone_p, 'parent', 'ru', TRUE
        );
        
        INSERT INTO parents (id, user_id, occupation)
        VALUES (
            ('e0000000-0000-0000-0000-' || lpad(p2::text, 12, '0'))::uuid,
            ('d0000000-0000-0000-0000-' || lpad(p2::text, 12, '0'))::uuid,
            CASE (n+1) % 8
                WHEN 0 THEN 'Инженер'        WHEN 1 THEN 'Врач'
                WHEN 2 THEN 'Учитель'        WHEN 3 THEN 'Предприниматель'
                WHEN 4 THEN 'Менеджер'       WHEN 5 THEN 'Программист'
                WHEN 6 THEN 'Бухгалтер'      ELSE 'Юрист'
            END
        );
    END LOOP;
END $$;

-- ---------- 4. СВЯЗИ РОДИТЕЛЬ-УЧЕНИК ----------
DO $$
DECLARE
    n INT;
    s1 INT; s2 INT; p1 INT; p2 INT;
BEGIN
    FOR n IN 0..29 LOOP
        s1 := n * 2 + 1; s2 := n * 2 + 2;
        p1 := n * 2 + 1; p2 := n * 2 + 2;
        
        INSERT INTO parent_students (parent_id, student_id, relation, is_primary) VALUES
        (('e0000000-0000-0000-0000-' || lpad(p1::text, 12, '0'))::uuid,
         ('c0000000-0000-0000-0000-' || lpad(s1::text, 12, '0'))::uuid,
         'parent', TRUE),
        (('e0000000-0000-0000-0000-' || lpad(p2::text, 12, '0'))::uuid,
         ('c0000000-0000-0000-0000-' || lpad(s2::text, 12, '0'))::uuid,
         'parent', TRUE);
    END LOOP;
END $$;

-- ---------- 5. СВЯЗИ УЧИТЕЛЬ-УЧЕНИК ----------
DO $$
DECLARE
    student_num INT;
    teacher_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        teacher_num := ((student_num - 1) % 10) + 1;
        
        INSERT INTO teacher_students (teacher_id, student_id, subject)
        VALUES (
            ('a0000000-0000-0000-0000-' || lpad(teacher_num::text, 12, '0'))::uuid,
            ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
            CASE teacher_num
                WHEN 1 THEN 'Китайский язык'  WHEN 2 THEN 'Математика'
                WHEN 3 THEN 'Каллиграфия'     WHEN 4 THEN 'История Китая'
                WHEN 5 THEN 'Литература'      WHEN 6 THEN 'Китайский язык'
                WHEN 7 THEN 'Математика'      WHEN 8 THEN 'Каллиграфия'
                WHEN 9 THEN 'История Китая'   ELSE 'Литература'
            END
        );
    END LOOP;
END $$;

-- ---------- 6. КУРСЫ (4) ----------
-- UUID: 10000000-0000-0000-0000-0000000000XX
INSERT INTO courses (id, code, title, title_zh, description, description_zh, course_type, subject, is_free, price, is_additional, status) VALUES
('10000000-0000-0000-0000-000000000001', 'ZH-101',   'Китайский язык — начальный', '初级汉语',   'Основы китайского языка',   '汉语基础',     'live',    'Китайский язык', FALSE, 15000.00, FALSE, 'published'),
('10000000-0000-0000-0000-000000000002', 'MATH-101', 'Математика — базовый курс',  '基础数学',   'Базовый курс математики',   '数学基础课程', 'live',    'Математика',     FALSE, 12000.00, FALSE, 'published'),
('10000000-0000-0000-0000-000000000003', 'CALL-201', 'Каллиграфия',                '书法课',     'Дополнительное занятие',   '书法选修课',   'offline', 'Каллиграфия',    TRUE,  0.00,    TRUE,  'published'),
('10000000-0000-0000-0000-000000000004', 'CULT-301', 'Культура Китая',             '中国文化',   'Дополнительное занятие',   '文化选修课',   'offline', 'Культурология',  TRUE,  0.00,    TRUE,  'published');

-- ---------- 7. УРОКИ ----------
-- Уроки генерируются в скрипте 05_lessons_october_2026.sql
-- Этот раздел удалён, используйте 05_lessons_october_2026.sql

-- ---------- 8. ЗАПИСЬ НА КУРСЫ ----------
DO $$
DECLARE
    student_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        INSERT INTO course_enrollments (course_id, student_id, progress_pct, contract_signed, paid) VALUES
        ('10000000-0000-0000-0000-000000000001', ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid, 40.0 + (student_num % 60), TRUE, TRUE),
        ('10000000-0000-0000-0000-000000000002', ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid, 30.0 + (student_num % 70), TRUE, TRUE);
        
        IF student_num % 2 = 0 THEN
            INSERT INTO course_enrollments (course_id, student_id, progress_pct, contract_signed, paid)
            VALUES ('10000000-0000-0000-0000-000000000003', ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid, 50.0 + (student_num % 50), FALSE, FALSE);
        END IF;
        
        IF student_num % 3 = 0 THEN
            INSERT INTO course_enrollments (course_id, student_id, progress_pct, contract_signed, paid)
            VALUES ('10000000-0000-0000-0000-000000000004', ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid, 40.0 + (student_num % 60), FALSE, FALSE);
        END IF;
    END LOOP;
END $$;

-- ---------- 9. ДОМАШНИЕ ЗАДАНИЯ (6) ----------
-- UUID: 30000000-0000-0000-0000-0000000000XX
INSERT INTO homeworks (id, course_id, title, description, hw_type, max_score, published_at, deadline_at, allow_late) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Выучить приветствия', 'Выучить 10 приветствий на китайском', 'vocabulary', 100, '2026-10-12 10:00:00', '2026-10-14 23:59:00', TRUE),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Написать иероглифы',  'Написать иероглифы из урока 2',       'writing',    100, '2026-10-15 10:00:00', '2026-10-17 23:59:00', FALSE),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Диалог',              'Составить диалог на китайском',       'speaking',   100, '2026-10-18 10:00:00', '2026-10-20 23:59:00', TRUE),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Решить задачи',       'Решить 10 задач по арифметике',       'practice',   100, '2026-10-12 10:00:00', '2026-10-14 23:59:00', FALSE),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Доказать теорему',    'Доказать теорему Пифагора',           'writing',    100, '2026-10-15 10:00:00', '2026-10-17 23:59:00', TRUE),
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Контрольная работа',  'Контрольная по алгебре',              'practice',   100, '2026-10-18 10:00:00', '2026-10-20 23:59:00', FALSE);

-- ---------- 10. ОТПРАВКИ ДЗ ----------
DO $$
DECLARE
    student_num INT;
    hw_num INT;
    status_val hw_status_enum;
BEGIN
    FOR student_num IN 1..60 LOOP
        FOR hw_num IN 1..2 LOOP
            status_val := CASE (student_num + hw_num) % 4
                WHEN 0 THEN 'pending'::hw_status_enum
                WHEN 1 THEN 'graded'::hw_status_enum
                WHEN 2 THEN 'graded'::hw_status_enum
                ELSE 'overdue'::hw_status_enum
            END;
            
            INSERT INTO homework_submissions (homework_id, student_id, status, submitted_at, score, correctness, time_spent_min)
            VALUES (
                ('30000000-0000-0000-0000-' || lpad(hw_num::text, 12, '0'))::uuid,
                ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
                status_val,
                CASE WHEN status_val != 'pending' THEN ('2026-10-' || lpad((12 + (student_num % 9))::text, 2, '0') || ' 18:00:00')::timestamp ELSE NULL END,
                CASE WHEN status_val = 'graded' THEN 60 + (student_num % 41) ELSE NULL END,
                CASE WHEN status_val = 'graded' THEN 60 + (student_num % 41) ELSE NULL END,
                CASE WHEN status_val != 'pending' THEN 15 + (student_num % 46) ELSE NULL END
            );
        END LOOP;
    END LOOP;
END $$;

-- ---------- 11. ОЦЕНКИ ----------
DO $$
DECLARE
    student_num INT;
    grade_count INT;
    i INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        grade_count := 5 + (student_num % 11);
        
        FOR i IN 0..(grade_count-1) LOOP
            INSERT INTO grades (student_id, subject, grade_type, period_label, score, max_score, graded_at)
            VALUES (
                ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
                CASE i % 2 WHEN 0 THEN 'Китайский язык' ELSE 'Математика' END,
                CASE i % 3 WHEN 0 THEN 'lesson' WHEN 1 THEN 'monthly' ELSE 'semester' END,
                'Январь 2025',
                3.0 + (student_num % 20) * 0.1,
                5,
                '2026-10-' || lpad((12 + (i % 9))::text, 2, '0')
            );
        END LOOP;
    END LOOP;
END $$;

-- ---------- 12. ПОСЕЩАЕМОСТЬ ----------
DO $$
DECLARE
    student_num INT;
    lesson_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        FOR lesson_num IN 1..5 LOOP
            INSERT INTO attendance (student_id, lesson_id, status, marked_at)
            VALUES (
                ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
                ('20000000-0000-0000-0000-' || lpad(lesson_num::text, 12, '0'))::uuid,
                CASE (student_num + lesson_num) % 5
                    WHEN 0 THEN 'present'::attendance_status_enum
                    WHEN 1 THEN 'present'::attendance_status_enum
                    WHEN 2 THEN 'present'::attendance_status_enum
                    WHEN 3 THEN 'late'::attendance_status_enum
                    ELSE 'absent'::attendance_status_enum
                END,
                '2026-10-' || lpad((12 + lesson_num)::text, 2, '0')
            );
        END LOOP;
    END LOOP;
END $$;

-- ---------- 13. РЕЙТИНГИ УРОКОВ ----------
DO $$
DECLARE
    student_num INT;
    lesson_num INT;
BEGIN
    FOR student_num IN 1..60 LOOP
        FOR lesson_num IN 1..3 LOOP
            INSERT INTO lesson_ratings (lesson_id, student_id, stars, comment, rated_at)
            VALUES (
                ('20000000-0000-0000-0000-' || lpad(lesson_num::text, 12, '0'))::uuid,
                ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
                3 + (student_num % 3),
                CASE (student_num + lesson_num) % 4
                    WHEN 0 THEN 'Отличная работа!'
                    WHEN 1 THEN 'Хорошо, но нужно больше практики'
                    WHEN 2 THEN 'Внимателен на уроке'
                    ELSE 'Активно участвует'
                END,
                '2026-10-' || lpad((12 + lesson_num)::text, 2, '0')
            );
        END LOOP;
    END LOOP;
END $$;

-- ---------- 14. ДОСТИЖЕНИЯ (60% учеников) ----------
-- UUID: 40000000-0000-0000-0000-0000000000XX
DO $$
DECLARE
    student_num INT;
    cat achievement_category_enum;
BEGIN
    FOR student_num IN 1..60 LOOP
        IF student_num % 5 < 3 THEN
            cat := CASE student_num % 3
                WHEN 0 THEN 'class'::achievement_category_enum
                WHEN 1 THEN 'school'::achievement_category_enum
                ELSE 'external'::achievement_category_enum
            END;
            
            INSERT INTO achievements (id, student_id, category, title, description, issuer, issued_date)
            VALUES (
                ('40000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
                ('c0000000-0000-0000-0000-' || lpad(student_num::text, 12, '0'))::uuid,
                cat,
                CASE cat
                    WHEN 'class' THEN 'Лучший ученик месяца'
                    WHEN 'school' THEN 'Победитель олимпиады'
                    ELSE 'Сертификат HSK'
                END,
                'За отличные результаты',
                'Школа Конфуция',
                '2024-' || lpad((1 + (student_num % 12))::text, 2, '0') || '-' || lpad((1 + (student_num % 28))::text, 2, '0')
            );
        END IF;
    END LOOP;
END $$;

-- ---------- 15. КОНКУРСЫ (2) ----------
-- UUID: 50000000-0000-0000-0000-0000000000XX
INSERT INTO contests (id, title, title_zh, description, description_zh, rules, start_date, end_date, registration_deadline, status) VALUES
('50000000-0000-0000-0000-000000000001', 'Конкурс каллиграфии', '书法比赛', 'Ежегодный конкурс каллиграфии среди учеников', '年度学生书法比赛', 'Участники пишут иероглифы в течение 30 минут', '2026-11-15', '2026-11-15', '2026-11-10', 'open'),
('50000000-0000-0000-0000-000000000002', 'Конкурс чтецов',      '朗诵比赛', 'Чтение стихов на китайском языке',               '中文诗歌朗诵',       'Стихотворение наизусть, 2-3 минуты',             '2026-12-01', '2026-12-01', '2026-11-25', 'open');

-- ---------- 16. МЕРОПРИЯТИЯ (2) ----------
-- UUID: 60000000-0000-0000-0000-0000000000XX
INSERT INTO events (id, title, title_zh, description, description_zh, event_type, start_at, end_at, location, is_paid, price, status) VALUES
('60000000-0000-0000-0000-000000000001', 'День открытых дверей', '开放日',   'Приглашаем на день открытых дверей!',  '欢迎参加开放日！',   'open_day',  '2026-11-20 10:00:00', '2026-11-20 16:00:00', 'Главный корпус', FALSE, 0,      'open'),
('60000000-0000-0000-0000-000000000002', 'Праздник весны',       '春节庆典', 'Празднование Китайского нового года',  '庆祝中国新年',       'cultural',  '2027-01-29 18:00:00', '2027-01-29 22:00:00', 'Актовый зал',      TRUE,  500.00, 'open');

-- ---------- 17. УВЕДОМЛЕНИЯ ----------
INSERT INTO notifications (user_id, type, title, body, is_read, created_at)
SELECT id, 'system'::notification_type_enum, 'Добро пожаловать!', 'Ваш аккаунт успешно создан', FALSE, '2026-10-12 10:00:00'
FROM users
WHERE username IN ('student1','student2','student3','student4','student5','parent1','parent2','parent3','teacher1','teacher2');

-- ---------- 18. БАЛЛЫ ----------
-- Перенесены в 03_triggers_and_seed.sql (после создания триггеров
-- users_create_points и points_apply_tx), чтобы автоматически
-- корректно обновлялся balance.
