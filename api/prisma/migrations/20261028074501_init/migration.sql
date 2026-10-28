-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(254) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(64) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,

    INDEX `sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_failures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(254) NOT NULL,
    `at` DATETIME(3) NOT NULL,

    INDEX `login_failures_email_at_idx`(`email`, `at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `birth_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `birth_date` CHAR(10) NOT NULL,
    `birth_time` CHAR(5) NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `place_name` VARCHAR(255) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `birth_profiles_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profile_id` INTEGER NOT NULL,
    `kind` ENUM('tu_vi', 'than_so_hoc', 'chiem_tinh') NOT NULL,
    `status` ENUM('ok', 'skipped', 'error') NOT NULL,
    `data` JSON NULL,
    `house_system` VARCHAR(20) NULL,
    `calc_version` INTEGER NOT NULL,
    `computed_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `charts_profile_id_kind_key`(`profile_id`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `luan_giai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `khoa` VARCHAR(191) NOT NULL,
    `mon` ENUM('tu_vi', 'than_so_hoc', 'chiem_tinh') NOT NULL,
    `loai` VARCHAR(32) NOT NULL,
    `tieu_de` VARCHAR(200) NULL,
    `noi_dung` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `luan_giai_khoa_key`(`khoa`),
    INDEX `luan_giai_mon_loai_idx`(`mon`, `loai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `birth_profiles` ADD CONSTRAINT `birth_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `charts` ADD CONSTRAINT `charts_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `birth_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- BR10: mỗi tài khoản tối đa một hồ sơ chính. MySQL không có unique có điều kiện, nên dùng cột sinh:
-- VIRTUAL vì MySQL cấm cột sinh STORED dựa trên cột có khóa ngoại CASCADE.
-- hồ sơ chính mang user_id, hồ sơ thường mang NULL (UNIQUE cho phép nhiều NULL).
ALTER TABLE `birth_profiles`
  ADD COLUMN `primary_owner` INTEGER GENERATED ALWAYS AS (IF(`is_primary`, `user_id`, NULL)) VIRTUAL,
  ADD UNIQUE INDEX `birth_profiles_one_primary_per_user`(`primary_owner`);
