-- Clinic Management Platform — MySQL schema
-- Usage: mysql -u <user> -p <database> < schema.sql
--
-- The schema matches the queries in backend/src/repository.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS MEDICALNOTE;
DROP TABLE IF EXISTS NOTIFICATION;
DROP TABLE IF EXISTS QUEUE;
DROP TABLE IF EXISTS VISIT;
DROP TABLE IF EXISTS EMPLOYEEAVAILABILITY;
DROP TABLE IF EXISTS DOCTOR;
DROP TABLE IF EXISTS EMPLOYEE;
DROP TABLE IF EXISTS OFFICE;
DROP TABLE IF EXISTS PATIENT;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE PATIENT (
    patient_id        INT AUTO_INCREMENT PRIMARY KEY,
    full_name         VARCHAR(200) NOT NULL,
    birth_date        DATE         NOT NULL,
    phone             VARCHAR(30)  NOT NULL,
    gender            VARCHAR(10)  NOT NULL,
    blood_type        VARCHAR(5)   NULL,
    email             VARCHAR(200) NULL,
    additional_info   TEXT         NULL,
    allergies         TEXT         NULL,
    conditions        TEXT         NULL,
    emergency_contact VARCHAR(200) NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_patient_name (full_name),
    KEY idx_patient_phone (phone),
    KEY idx_patient_created (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE OFFICE (
    office_id INT AUTO_INCREMENT PRIMARY KEY,
    room_no   VARCHAR(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE EMPLOYEE (
    employee_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(200) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'doctor',
    email         VARCHAR(200) NULL,
    phone         VARCHAR(30)  NULL,
    office_id     INT          NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_employee_name (full_name),
    CONSTRAINT fk_employee_office FOREIGN KEY (office_id)
        REFERENCES OFFICE (office_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE DOCTOR (
    doctor_id   INT AUTO_INCREMENT PRIMARY KEY,
    employee_id         INT          NOT NULL,
    specialty           VARCHAR(100) NOT NULL,
    slot_length_minutes INT          NOT NULL DEFAULT 20,
    npi                 VARCHAR(20)  NULL,
    license_no          VARCHAR(50)  NULL,
    UNIQUE KEY uq_doctor_employee (employee_id),
    CONSTRAINT fk_doctor_employee FOREIGN KEY (employee_id)
        REFERENCES EMPLOYEE (employee_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE EMPLOYEEAVAILABILITY (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id     INT         NOT NULL,
    start_day       VARCHAR(10) NOT NULL DEFAULT 'monday',
    end_day         VARCHAR(10) NOT NULL DEFAULT 'friday',
    status          ENUM ('present', 'absent') NOT NULL DEFAULT 'absent',
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_availability_employee (employee_id),
    CONSTRAINT fk_availability_employee FOREIGN KEY (employee_id)
        REFERENCES EMPLOYEE (employee_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE VISIT (
    visit_id         INT AUTO_INCREMENT PRIMARY KEY,
    patient_id       INT          NOT NULL,
    doctor_id        INT          NOT NULL,
    visit_date       DATETIME     NOT NULL,
    visit_type       VARCHAR(50)  NOT NULL DEFAULT 'Appointment',
    status           ENUM ('scheduled', 'upcoming', 'checked_in', 'present',
                           'completed', 'done', 'missed', 'absent', 'cancelled')
                                  NOT NULL DEFAULT 'scheduled',
    financial_status ENUM ('paid', 'unpaid') NOT NULL DEFAULT 'unpaid',
    reason           VARCHAR(255) NULL,
    slot             VARCHAR(50)  NULL,
    checked_in_at    DATETIME     NULL,
    completed_at     DATETIME     NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_visit_doctor_date (doctor_id, visit_date),
    KEY idx_visit_patient (patient_id),
    KEY idx_visit_status_date (status, visit_date),
    CONSTRAINT fk_visit_patient FOREIGN KEY (patient_id)
        REFERENCES PATIENT (patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_doctor FOREIGN KEY (doctor_id)
        REFERENCES DOCTOR (doctor_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE QUEUE (
    queue_id  INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT  NOT NULL,
    visit_id  INT  NOT NULL,
    position  INT  NOT NULL,
    queue_day DATE NOT NULL,
    UNIQUE KEY uq_queue_visit (visit_id),
    UNIQUE KEY uq_queue_position (doctor_id, queue_day, position),
    KEY idx_queue_doctor_day (doctor_id, queue_day, position),
    CONSTRAINT fk_queue_doctor FOREIGN KEY (doctor_id)
        REFERENCES DOCTOR (doctor_id) ON DELETE CASCADE,
    CONSTRAINT fk_queue_visit FOREIGN KEY (visit_id)
        REFERENCES VISIT (visit_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE NOTIFICATION (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id        INT       NOT NULL,
    message         TEXT      NOT NULL,
    is_read         TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notification_read (is_read, created_at),
    CONSTRAINT fk_notification_visit FOREIGN KEY (visit_id)
        REFERENCES VISIT (visit_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE MEDICALNOTE (
    note_id    INT AUTO_INCREMENT PRIMARY KEY,
    visit_id   INT        NOT NULL,
    content    TEXT       NOT NULL,
    is_draft   TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_note_visit_draft (visit_id, is_draft),
    CONSTRAINT fk_note_visit FOREIGN KEY (visit_id)
        REFERENCES VISIT (visit_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
