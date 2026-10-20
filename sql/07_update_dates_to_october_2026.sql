-- ============================================================================
-- 07_update_dates_to_october_2026.sql — Обновление всех дат на октябрь 2026
-- Этот скрипт обновляет все даты в базе данных для синхронизации с mock.ts
-- ============================================================================

-- Обновляем даты домашних заданий на октябрь 2026
UPDATE homeworks
SET published_at = CASE
    WHEN id = '30000000-0000-0000-0000-000000000001' THEN '2026-10-12 10:00:00'
    WHEN id = '30000000-0000-0000-0000-000000000002' THEN '2026-10-15 10:00:00'
    WHEN id = '30000000-0000-0000-0000-000000000003' THEN '2026-10-18 10:00:00'
    WHEN id = '30000000-0000-0000-0000-000000000004' THEN '2026-10-12 10:00:00'
    WHEN id = '30000000-0000-0000-0000-000000000005' THEN '2026-10-15 10:00:00'
    WHEN id = '30000000-0000-0000-0000-000000000006' THEN '2026-10-18 10:00:00'
END,
deadline_at = CASE
    WHEN id = '30000000-0000-0000-0000-000000000001' THEN '2026-10-14 23:59:00'
    WHEN id = '30000000-0000-0000-0000-000000000002' THEN '2026-10-17 23:59:00'
    WHEN id = '30000000-0000-0000-0000-000000000003' THEN '2026-10-20 23:59:00'
    WHEN id = '30000000-0000-0000-0000-000000000004' THEN '2026-10-14 23:59:00'
    WHEN id = '30000000-0000-0000-0000-000000000005' THEN '2026-10-17 23:59:00'
    WHEN id = '30000000-0000-0000-0000-000000000006' THEN '2026-10-20 23:59:00'
END
WHERE id IN (
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000006'
);

-- Обновляем даты оценок на октябрь 2026
UPDATE grades
SET graded_at = '2026-10-' || lpad((12 + (id % 9))::text, 2, '0')
WHERE graded_at LIKE '2025-%';

-- Обновляем даты посещаемости на октябрь 2026
UPDATE attendance
SET marked_at = '2026-10-' || lpad((12 + (id % 9))::text, 2, '0')
WHERE marked_at LIKE '2025-%';

-- Обновляем даты рейтингов уроков на октябрь 2026
UPDATE lesson_ratings
SET rated_at = '2026-10-' || lpad((12 + (id % 9))::text, 2, '0')
WHERE rated_at LIKE '2025-%';

-- Обновляем даты отправок домашних заданий на октябрь 2026
UPDATE homework_submissions
SET submitted_at = '2026-10-' || lpad((12 + (id % 9))::text, 2, '0') || ' 18:00:00'
WHERE submitted_at IS NOT NULL AND submitted_at::text LIKE '2025-%';

-- Обновляем даты конкурсов
UPDATE contests
SET start_date = '2026-11-15',
    end_date = '2026-11-15',
    registration_deadline = '2026-11-10'
WHERE id = '50000000-0000-0000-0000-000000000001';

UPDATE contests
SET start_date = '2026-12-01',
    end_date = '2026-12-01',
    registration_deadline = '2026-11-25'
WHERE id = '50000000-0000-0000-0000-000000000002';

-- Обновляем даты мероприятий
UPDATE events
SET start_at = '2026-11-20 10:00:00',
    end_at = '2026-11-20 16:00:00'
WHERE id = '60000000-0000-0000-0000-000000000001';

UPDATE events
SET start_at = '2027-01-29 18:00:00',
    end_at = '2027-01-29 22:00:00'
WHERE id = '60000000-0000-0000-0000-000000000002';

-- Обновляем даты уведомлений
UPDATE notifications
SET created_at = '2026-10-12 10:00:00'
WHERE created_at LIKE '2025-%';

-- Обновляем даты экзаменов
UPDATE exams
SET exam_date = '2026-10-31',
    registration_deadline = '2026-10-28'
WHERE id = 'a1000000-0000-0000-0000-000000000001';

UPDATE exams
SET exam_date = '2027-03-15',
    registration_deadline = '2027-03-01'
WHERE id = 'a1000000-0000-0000-0000-000000000003';

UPDATE exams
SET exam_date = '2027-04-10',
    registration_deadline = '2027-03-25'
WHERE id = 'a1000000-0000-0000-0000-000000000004';

-- Обновляем даты расписания
UPDATE schedule
SET valid_from = '2026-09-01',
    valid_to = '2027-06-30'
WHERE valid_to = '2025-06-30';

-- Обновляем даты транзакций баллов
UPDATE points_transactions
SET created_at = '2026-09-15'
WHERE created_at = '2025-01-15';

UPDATE points_transactions
SET created_at = '2026-10-20'
WHERE created_at = '2025-01-20';

-- Проверка результата
SELECT 'homeworks' as table_name, COUNT(*) as count, MIN(published_at) as min_date, MAX(published_at) as max_date FROM homeworks
UNION ALL
SELECT 'grades', COUNT(*), MIN(graded_at), MAX(graded_at) FROM grades
UNION ALL
SELECT 'attendance', COUNT(*), MIN(marked_at), MAX(marked_at) FROM attendance
UNION ALL
SELECT 'lesson_ratings', COUNT(*), MIN(rated_at), MAX(rated_at) FROM lesson_ratings
UNION ALL
SELECT 'notifications', COUNT(*), MIN(created_at), MAX(created_at) FROM notifications;
