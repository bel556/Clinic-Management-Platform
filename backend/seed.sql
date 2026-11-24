-- Demo data for the Clinic Management Platform.
-- Dates are relative to CURDATE() so the "today" boards are always populated.
-- Usage: mysql -u <user> -p <database> < seed.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE MEDICALNOTE;
TRUNCATE TABLE NOTIFICATION;
TRUNCATE TABLE QUEUE;
TRUNCATE TABLE VISIT;
TRUNCATE TABLE EMPLOYEEAVAILABILITY;
TRUNCATE TABLE DOCTOR;
TRUNCATE TABLE EMPLOYEE;
TRUNCATE TABLE OFFICE;
TRUNCATE TABLE PATIENT;
SET FOREIGN_KEY_CHECKS = 1;

-- Offices -------------------------------------------------------------------
INSERT INTO OFFICE (office_id, room_no) VALUES
    (1, 'Room 204'),
    (2, 'Room 206'),
    (3, 'Room 102'),
    (4, 'Room 105');

-- Employees / doctors -------------------------------------------------------
INSERT INTO EMPLOYEE (employee_id, full_name, role, email, phone, office_id) VALUES
    (1, 'Sarah Jenkins', 'receptionist', 's.jenkins@curapulse-clinic.org', '+15556204433', NULL),
    (2, 'Dr. Alexander Thorne', 'doctor', 'a.thorne@curapulse.health', '+15552348901', 1),
    (3, 'Dr. Elena Vance', 'doctor', 'e.vance@curapulse.health', '+15552348902', 2),
    (4, 'Dr. Robert Chen', 'doctor', 'r.chen@curapulse.health', '+15552348903', 3),
    (5, 'Dr. Maya Lin', 'doctor', 'm.lin@curapulse.health', '+15552348904', 4);

INSERT INTO DOCTOR (doctor_id, employee_id, specialty, slot_length_minutes, npi, license_no) VALUES
    (1, 2, 'Cardiology',      20, 'NPI 1982401824', 'MD-NY-492019'),
    (2, 3, 'Neurology',       30, 'NPI 1740392811', 'MD-NY-381245'),
    (3, 4, 'Pediatrics',      20, 'NPI 1559918273', 'MD-NY-220918'),
    (4, 5, 'General Practice', 15, 'NPI 1917283640', 'MD-NY-512337');

INSERT INTO EMPLOYEEAVAILABILITY (employee_id, start_day, end_day, status) VALUES
    (1, 'monday', 'friday', 'present'),
    (2, 'monday', 'friday', 'present'),
    (3, 'monday', 'friday', 'present'),
    (4, 'monday', 'friday', 'absent'),
    (5, 'monday', 'friday', 'present');

-- Patients ------------------------------------------------------------------
INSERT INTO PATIENT (patient_id, full_name, birth_date, phone, gender, blood_type, email, additional_info, allergies, conditions, emergency_contact) VALUES
    (1,  'Marcus Vance',     '1980-03-18', '+15554389920', 'male',   'O+',  'marcus.vance@example.com',  'Prefers morning appointments.', 'Penicillin (severe rash)\nLatex (contact dermatitis)', 'Essential hypertension\nMild osteoarthritis', 'Elena Vance (Spouse) · +15553829015'),
    (2,  'Eleanor Vance',    '1976-05-12', '+15553829014', 'female', 'A-',  'eleanor.vance@example.com', 'No additional information',     'Sulfonamides (rash)', 'Essential hypertension\nHyperlipidaemia', 'Marcus Vance (Spouse) · +15553829015'),
    (3,  'Elena Rostova',    '1988-05-14', '+15552348801', 'female', 'B+',  'elena.rostova@example.com', 'No additional information',     NULL, 'Migraine', 'Ivan Rostov (Brother) · +15552348810'),
    (4,  'David Hayes',      '1963-01-12', '+15553098812', 'male',   'AB+', 'david.hayes@example.com',   'Hearing aid in right ear.',     'Aspirin (gastric irritation)', 'Type 2 diabetes\nEssential hypertension', 'Ruth Hayes (Daughter) · +15553098813'),
    (5,  'Sofia Reyes',      '1990-09-22', '+15559113049', 'female', 'O-',  'sofia.reyes@example.com',   'No additional information',     NULL, 'Iron-deficiency anaemia', 'Marco Reyes (Husband) · +15559113050'),
    (6,  'Amina Lin',        '1995-07-04', '+15557124091', 'female', 'A+',  'amina.lin@example.com',     'No additional information',     'Ibuprofen (urticaria)', 'Asthma', 'Wei Lin (Father) · +15557124092'),
    (7,  'Lucas Walker',     '1972-11-02', '+15556647712', 'male',   'B-',  'lucas.walker@example.com',  'No additional information',     NULL, 'Gastro-oesophageal reflux', 'Jane Walker (Wife) · +15556647713'),
    (8,  'Nadia Bensaid',    '1992-02-18', '0555628104',   'female', 'O+',  'nadia.bensaid@email.com',   'No additional information',     NULL, NULL, 'Karim Bensaid · 0555628105'),
    (9,  'Arthur Pendelton', '1958-04-09', '+15552017744', 'male',   'O+',  'arthur.p@example.com',      'Walk-in patient.',              NULL, 'Chronic lower back pain', 'Mabel Pendelton (Wife) · +15552017755'),
    (10, 'Nathan Scott',     '1986-12-30', '+15557336611', 'male',   'AB-', 'nathan.scott@example.com',  'No additional information',     NULL, NULL, 'Dana Scott (Sister) · +15557336622'),
    (11, 'Chloe Bennett',    '2001-06-15', '+15554802093', 'female', 'A-',  'chloe.bennett@example.com', 'No additional information',     'Pollen (seasonal rhinitis)', NULL, 'Grace Bennett (Mother) · +15554802094'),
    (12, 'Priya Nair',       '1984-07-21', '+15553139021', 'female', 'A+',  'priya.nair@example.com',    'No additional information',     NULL, 'Hypothyroidism', 'Arjun Nair (Husband) · +15553139022');

-- Visits --------------------------------------------------------------------
-- Today: 6 scheduled · 6 checked-in · 3 completed · 2 missed · 1 cancelled
INSERT INTO VISIT (patient_id, doctor_id, visit_date, visit_type, status, financial_status, reason, slot) VALUES
    -- Dr. Thorne (1)
    (1,  1, TIMESTAMP(CURDATE(), '08:30:00'), 'Consultation', 'checked_in', 'paid',   'Follow-up consultation and blood pressure review', '08:30 AM – 09:00 AM'),
    (3,  1, TIMESTAMP(CURDATE(), '09:00:00'), 'Appointment',  'checked_in', 'unpaid', 'Follow-up consultation',                           '09:00 AM – 09:30 AM'),
    (12, 1, TIMESTAMP(CURDATE(), '09:30:00'), 'Regular',      'checked_in', 'unpaid', 'Thyroid review',                                   '09:30 AM – 10:00 AM'),
    (10, 1, TIMESTAMP(CURDATE(), '10:00:00'), 'Appointment',  'scheduled',  'unpaid', 'Routine review',                                    '10:00 AM – 10:30 AM'),
    (6,  1, TIMESTAMP(CURDATE(), '11:00:00'), 'Consultation', 'scheduled',  'paid',   'Asthma follow-up',                                  '11:00 AM – 11:30 AM'),
    (2,  1, TIMESTAMP(CURDATE(), '14:00:00'), 'Appointment',  'scheduled',  'unpaid', 'Hypertension quarterly follow-up',                  '02:00 PM – 02:30 PM'),
    (1,  1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:00:00'), 'Consultation', 'completed', 'paid', 'Blood pressure review', NULL),
    (3,  1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '10:00:00'), 'Consultation', 'completed', 'paid', 'Migraine review', NULL),

    -- Dr. Vance (2)
    (4,  2, TIMESTAMP(CURDATE(), '08:00:00'), 'Appointment',  'missed',     'unpaid', 'Knee pain review', NULL),
    (5,  2, TIMESTAMP(CURDATE(), '10:30:00'), 'Consultation', 'checked_in', 'unpaid', 'Anaemia follow-up', '10:30 AM – 11:00 AM'),
    (9,  2, TIMESTAMP(CURDATE(), '12:00:00'), 'Consultation', 'scheduled',  'unpaid', 'Neurology review', '12:00 PM – 12:30 PM'),
    (4,  2, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 7 DAY), '11:00:00'), 'Consultation', 'completed', 'paid', 'Knee pain review', NULL),

    -- Dr. Chen (3)
    (11, 3, TIMESTAMP(CURDATE(), '09:00:00'), 'Regular',      'scheduled',  'paid',   'Paediatric check-up', '09:00 AM – 09:30 AM'),
    (11, 3, TIMESTAMP(CURDATE(), '13:30:00'), 'Appointment',  'cancelled',  'unpaid', 'Vaccination', NULL),

    -- Dr. Lin (4)
    (7,  4, TIMESTAMP(CURDATE(), '10:15:00'), 'Consultation', 'checked_in', 'paid',   'Reflux review', '10:15 AM – 10:45 AM'),
    (8,  4, TIMESTAMP(CURDATE(), '11:45:00'), 'Regular',      'checked_in', 'unpaid', 'Annual wellness check', '11:45 AM – 12:15 PM'),
    (12, 4, TIMESTAMP(CURDATE(), '15:00:00'), 'Regular',      'scheduled',  'unpaid', 'Routine review', '03:00 PM – 03:30 PM'),
    (7,  4, TIMESTAMP(CURDATE(), '16:15:00'), 'Regular',      'missed',     'unpaid', 'Reflux review', NULL),
    (8,  4, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:00:00'), 'Regular', 'completed', 'paid', 'Annual wellness check', NULL),

    -- Tomorrow
    (2,  1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), 'Appointment', 'scheduled', 'unpaid', 'Hypertension quarterly follow-up', '10:00 AM – 10:30 AM'),
    (5,  1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00'), 'Appointment', 'scheduled', 'paid',   'Asthma follow-up', '11:00 AM – 11:30 AM'),
    (9,  2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'Consultation', 'scheduled', 'unpaid', 'Neurology review', '09:30 AM – 10:00 AM');

-- Queue: one row per checked-in visit, positions scoped to doctor + day ------
INSERT INTO QUEUE (doctor_id, visit_id, position, queue_day)
SELECT v.doctor_id,
       v.visit_id,
       ROW_NUMBER() OVER (PARTITION BY v.doctor_id ORDER BY v.visit_date),
       CURDATE()
FROM VISIT v
WHERE v.status IN ('checked_in', 'present')
  AND DATE(v.visit_date) = CURDATE();

-- Check-in / completion timestamps (drive wait times and daily stats) -------
UPDATE VISIT
SET checked_in_at = DATE_SUB(visit_date, INTERVAL 5 MINUTE)
WHERE status IN ('checked_in', 'present');

UPDATE VISIT
SET completed_at = DATE_ADD(visit_date, INTERVAL 25 MINUTE)
WHERE status IN ('completed', 'done');

-- Medical notes -------------------------------------------------------------
INSERT INTO MEDICALNOTE (visit_id, content, is_draft, created_at)
SELECT v.visit_id,
       'Follow-up blood pressure review. Patient reports reduced chest tightness after exertion. Continue the prescribed plan and review in 3 months.',
       0,
       TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:24:00')
FROM VISIT v
WHERE v.patient_id = 1 AND v.doctor_id = 1 AND v.status = 'completed'
LIMIT 1;

INSERT INTO MEDICALNOTE (visit_id, content, is_draft, created_at)
SELECT v.visit_id,
       'Migraine frequency reduced to twice monthly. Continue current prophylaxis. Lifestyle and hydration guidance reinforced.',
       0,
       TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '10:18:00')
FROM VISIT v
WHERE v.patient_id = 3 AND v.doctor_id = 1 AND v.status = 'completed'
LIMIT 1;

INSERT INTO MEDICALNOTE (visit_id, content, is_draft, created_at)
SELECT v.visit_id,
       'Patient reports reduced chest tightness after exertion. Blood pressure steady at 128/82 mmHg. Resting ECG shows normal sinus rhythm.',
       1,
       TIMESTAMP(CURDATE(), '08:45:00')
FROM VISIT v
WHERE v.patient_id = 1 AND v.doctor_id = 1 AND v.status = 'checked_in'
LIMIT 1;

-- Notifications -------------------------------------------------------------
INSERT INTO NOTIFICATION (visit_id, message, is_read, created_at)
SELECT v.visit_id,
       CONCAT('Visit ', v.visit_id, ' was rescheduled to today. Reception informed.'),
       0,
       TIMESTAMP(CURDATE(), '07:45:00')
FROM VISIT v
WHERE v.patient_id = 1 AND v.status = 'checked_in'
LIMIT 1;

INSERT INTO NOTIFICATION (visit_id, message, is_read, created_at)
SELECT v.visit_id,
       CONCAT('Visit ', v.visit_id, ' was cancelled by the doctor.'),
       0,
       TIMESTAMP(CURDATE(), '08:10:00')
FROM VISIT v
WHERE v.status = 'cancelled'
LIMIT 1;

INSERT INTO NOTIFICATION (visit_id, message, is_read, created_at)
SELECT v.visit_id,
       CONCAT('Visit ', v.visit_id, ' was marked as missed.'),
       1,
       TIMESTAMP(CURDATE(), '08:55:00')
FROM VISIT v
WHERE v.status = 'missed'
ORDER BY v.visit_date
LIMIT 1;
