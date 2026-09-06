import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Falta la variable de entorno DATABASE_URL');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const sucursal = await prisma.sucursal.upsert({
    where: { id: "sucursal-principal" },
    update: {},
    create: {
      id: "sucursal-principal",
      nombre: "Sucursal Principal",
    },
  });

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: "Administrador" },
    update: {},
    create: {
      nombre: "Administrador",
      permisos: ["*"],
    },
  });

  await prisma.rol.upsert({
    where: { nombre: "Groomer" },
    update: {},
    create: {
      nombre: "Groomer",
      permisos: ["citas.ver", "citas.actualizar", "clientes.ver"],
    },
  });

  await prisma.usuario.upsert({
    where: { email: "admin@grooming-suite.local" },
    update: {},
    create: {
      nombre: "Admin",
      email: "admin@grooming-suite.local",
      // Placeholder: cuando armemos el módulo de auth, esto se reemplaza
      // por un hash real (bcrypt/argon2) generado al crear el usuario.
      passwordHash:
        "$2a$12$DFpfQOlxDBr03GyqteNBp.OqINQsH/KrIie7FTiGFZJi/j0jFfHRC", // Hash de Ejemplo: 'Warhammer'
      rolId: rolAdmin.id,
      sucursalId: sucursal.id,
    },
  });

  console.log("Seed completo: sucursal, roles y usuario admin creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
