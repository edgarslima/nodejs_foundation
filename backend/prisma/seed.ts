import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const ARGON2_CONFIG = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  type: "argon2id"
} as const;

async function seedAdminUser(): Promise<void> {
  const rawEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const rawPassword = process.env.ADMIN_PASSWORD;
  const pepper = process.env.PASSWORD_PEPPER ?? "";

  if (!rawEmail || !rawPassword) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: rawEmail } });
  if (existing) {
    console.info(`Admin user ${rawEmail} already exists. Skipping.`);
    return;
  }

  const passwordHash = await hash(`${rawPassword}${pepper}`, ARGON2_CONFIG);

  await prisma.user.create({
    data: {
      email: rawEmail,
      passwordHash,
      passwordAlgo: "argon2id",
      role: UserRole.ADMIN,
      isActive: true
    }
  });

  console.info(`Seeded admin user ${rawEmail}.`);
}

async function main(): Promise<void> {
  await seedAdminUser();
}

main()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });