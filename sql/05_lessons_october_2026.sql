-- ============================================================================
-- 05_lessons_october_2026.sql — Уроки на октябрь 2026
-- Один урок в день на каждый класс
-- Период: 12-30 октября 2026 (19 дней)
-- ============================================================================

-- Удаляем старые уроки
DELETE FROM course_lessons;

-- Генерируем уроки для каждого класса на каждый день
DO $$
DECLARE
    day INT;
    class_record RECORD;
    lesson_id UUID;
    day_index INT;
    title_ru TEXT;
    title_zh TEXT;
    lesson_time TIME;
    lesson_room TEXT;
    lesson_duration INT;
    lesson_status live_status_enum;
BEGIN
    -- Определяем статус урока в зависимости от даты
    -- До 20 октября - finished, 20 октября - live, после 20 - upcoming
    
    FOR day IN 12..30 LOOP
        day_index := day - 12; -- 0-18
        
        -- Определяем статус
        IF day < 20 THEN
            lesson_status := 'finished'::live_status_enum;
        ELSIF day = 20 THEN
            lesson_status := 'live'::live_status_enum;
        ELSE
            lesson_status := 'upcoming'::live_status_enum;
        END IF;
        
        -- Класс A-1 (Китайский язык)
        INSERT INTO course_lessons (id, course_id, title, title_zh, lesson_order, scheduled_at, duration_min, room, live_status)
        VALUES (
            uuid_generate_v4(),
            'crs-1',
            'Урок ' || (day_index + 1) || ': ' || (ARRAY['Приветствия', 'Числа', 'Семья', 'Еда', 'Цвета', 'Животные', 'Школа', 'Дом', 'Погода', 'Время', 'Транспорт', 'Одежда', 'Тело', 'Эмоции', 'Хобби', 'Спорт', 'Музыка', 'Путешествия', 'Работа'])[day_index % 19 + 1],
            '第' || (day_index + 1) || '课：' || (ARRAY['问候', '数字', '家庭', '食物', '颜色', '动物', '学校', '家', '天气', '时间', '交通', '衣服', '身体', '情绪', '爱好', '运动', '音乐', '旅行', '工作'])[day_index % 19 + 1],
            day_index + 1,
            ('2026-10-' || LPAD(day::TEXT, 2, '0') || ' 09:00:00')::TIMESTAMP,
            45,
            'А-101',
            lesson_status
        );
        
        -- Класс A-2 (Китайский язык)
        INSERT INTO course_lessons (id, course_id, title, title_zh, lesson_order, scheduled_at, duration_min, room, live_status)
        VALUES (
            uuid_generate_v4(),
            'crs-1',
            'Урок ' || (day_index + 1) || ': ' || (ARRAY['Приветствия', 'Числа', 'Семья', 'Еда', 'Цвета', 'Животные', 'Школа', 'Дом', 'Погода', 'Время', 'Транспорт', 'Одежда', 'Тело', 'Эмоции', 'Хобби', 'Спорт', 'Музыка', 'Путешествия', 'Работа'])[day_index % 19 + 1],
            '第' || (day_index + 1) || '课：' || (ARRAY['问候', '数字', '家庭', '食物', '颜色', '动物', '学校', '家', '天气', '时间', '交通', '衣服', '身体', '情绪', '爱好', '运动', '音乐', '旅行', '工作'])[day_index % 19 + 1],
            day_index + 1,
            ('2026-10-' || LPAD(day::TEXT, 2, '0') || ' 10:00:00')::TIMESTAMP,
            45,
            'А-102',
            lesson_status
        );
        
        -- Класс B-1 (Математика)
        INSERT INTO course_lessons (id, course_id, title, title_zh, lesson_order, scheduled_at, duration_min, room, live_status)
        VALUES (
            uuid_generate_v4(),
            'crs-2',
            'Урок ' || (day_index + 1) || ': ' || (ARRAY['Арифметика', 'Геометрия', 'Алгебра', 'Задачи', 'Уравнения', 'Дроби', 'Проценты', 'Графики', 'Статистика', 'Вероятность', 'Логика', 'Площади', 'Объёмы', 'Координаты', 'Функции', 'Пропорции', 'Степени', 'Корни', 'Множества'])[day_index % 19 + 1],
            '第' || (day_index + 1) || '课：' || (ARRAY['算术', '几何', '代数', '问题', '方程', '分数', '百分比', '图表', '统计', '概率', '逻辑', '面积', '体积', '坐标', '函数', '比例', '幂', '根', '集合'])[day_index % 19 + 1],
            day_index + 1,
            ('2026-10-' || LPAD(day::TEXT, 2, '0') || ' 11:00:00')::TIMESTAMP,
            45,
            'Б-201',
            lesson_status
        );
        
        -- Класс B-2 (Математика)
        INSERT INTO course_lessons (id, course_id, title, title_zh, lesson_order, scheduled_at, duration_min, room, live_status)
        VALUES (
            uuid_generate_v4(),
            'crs-2',
            'Урок ' || (day_index + 1) || ': ' || (ARRAY['Арифметика', 'Геометрия', 'Алгебра', 'Задачи', 'Уравнения', 'Дроби', 'Проценты', 'Графики', 'Статистика', 'Вероятность', 'Логика', 'Площади', 'Объёмы', 'Координаты', 'Функции', 'Пропорции', 'Степени', 'Корни', 'Множества'])[day_index % 19 + 1],
            '第' || (day_index + 1) || '课：' || (ARRAY['算术', '几何', '代数', '问题', '方程', '分数', '百分比', '图表', '统计', '概率', '逻辑', '面积', '体积', '坐标', '函数', '比例', '幂', '根', '集合'])[day_index % 19 + 1],
            day_index + 1,
            ('2026-10-' || LPAD(day::TEXT, 2, '0') || ' 12:00:00')::TIMESTAMP,
            45,
            'Б-202',
            lesson_status
        );
        
        -- Класс C-1 (Каллиграфия)
        INSERT INTO course_lessons (id, course_id, title, title_zh, lesson_order, scheduled_at, duration_min, room, live_status)
        VALUES (
            uuid_generate_v4(),
            'crs-3',
            'Урок ' || (day_index + 1) || ': ' || (ARRAY['Иероглифы', 'Штрихи', 'Компоненты', 'Практика', 'Сочинение', 'Каллиграфия', 'Письмо', 'Чтение', 'Диктант', 'Творчество', 'История', 'Культура', 'Искусство', 'Философия', 'Поэзия', 'Литература', 'Театр', 'Музыка', 'Танцы'])[day_index % 19 + 1],
            '第' || (day_index + 1) || '课：' || (ARRAY['汉字', '笔画', '组件', '练习', '作文', '书法', '写作', '阅读', '听写', '创作', '历史', '文化', '艺术', '哲学', '诗歌', '文学', '戏剧', '音乐', '舞蹈'])[day_index % 19 + 1],
            day_index + 1,
            ('2026-10-' || LPAD(day::TEXT, 2, '0') || ' 14:00:00')::TIMESTAMP,
            30,
            'В-301',
            lesson_status
        );
        
        -- Класс C-2 (Каллиграфия)
        INSERT INTO course_lessons (id, course_id, title, title_zh, lesson_order, scheduled_at, duration_min, room, live_status)
        VALUES (
            uuid_generate_v4(),
            'crs-3',
            'Урок ' || (day_index + 1) || ': ' || (ARRAY['Иероглифы', 'Штрихи', 'Компоненты', 'Практика', 'Сочинение', 'Каллиграфия', 'Письмо', 'Чтение', 'Диктант', 'Творчество', 'История', 'Культура', 'Искусство', 'Философия', 'Поэзия', 'Литература', 'Театр', 'Музыка', 'Танцы'])[day_index % 19 + 1],
            '第' || (day_index + 1) || '课：' || (ARRAY['汉字', '笔画', '组件', '练习', '作文', '书法', '写作', '阅读', '听写', '创作', '历史', '文化', '艺术', '哲学', '诗歌', '文学', '戏剧', '音乐', '舞蹈'])[day_index % 19 + 1],
            day_index + 1,
            ('2026-10-' || LPAD(day::TEXT, 2, '0') || ' 15:00:00')::TIMESTAMP,
            30,
            'В-302',
            lesson_status
        );
    END LOOP;
END $$;

-- Проверка результата
SELECT 
    DATE(scheduled_at) as lesson_date,
    COUNT(*) as lessons_count,
    STRING_AGG(DISTINCT room, ', ') as rooms
FROM course_lessons
WHERE scheduled_at >= '2026-10-12' AND scheduled_at <= '2026-10-30'
GROUP BY DATE(scheduled_at)
ORDER BY lesson_date;

-- Общая статистика
SELECT 
    COUNT(*) as total_lessons,
    COUNT(DISTINCT DATE(scheduled_at)) as days_with_lessons,
    COUNT(DISTINCT room) as rooms_used
FROM course_lessons
WHERE scheduled_at >= '2026-10-12' AND scheduled_at <= '2026-10-30';
