-- CreateTable
CREATE TABLE `Channel` (
    `id` CHAR(36) NOT NULL,
    `channelCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `publishTokenCipher` LONGBLOB NOT NULL,
    `publishTokenIv` LONGBLOB NOT NULL,
    `publishTokenTag` LONGBLOB NOT NULL,
    `lastPublishAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdByUserId` VARCHAR(36) NULL,
    `updatedByUserId` VARCHAR(36) NULL,

    UNIQUE INDEX `Channel_channelCode_key`(`channelCode`),
    INDEX `Channel_name_idx`(`name`),
    INDEX `Channel_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `youtubeCategoryId` INTEGER NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelCategory` (
    `channelId` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,

    INDEX `ChannelCategory_categoryId_idx`(`categoryId`),
    INDEX `ChannelCategory_channelId_idx`(`channelId`),
    PRIMARY KEY (`channelId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChannelCategory` ADD CONSTRAINT `ChannelCategory_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChannelCategory` ADD CONSTRAINT `ChannelCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
