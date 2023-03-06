import { PrismaClient } from "@prisma/client"

const roles = ["admin", "manager", "editor"]

const permissions = {
  user: {
    create: ["admin"],
    read: ["admin"],
    update: ["admin"],
    delete: ["admin"],
  },
  page: {
    create: ["admin", "manager"],
    read: ["admin", "manager", "editor"],
    update: ["admin", "manager", "editors"],
    delete: ["admin", "manager"],
  },
  navigationMenu: {
    create: ["admin", "manager"],
    read: ["admin", "manager", "editor"],
    update: ["admin", "manager"],
    delete: ["admin", "manager"],
  },
}

const prisma = new PrismaClient()

const main = async () => {
  await prisma.role.createMany({
    data: roles.map((role) => ({
      name: role,
    })),
  })

  for (const [resource, data] of Object.entries(permissions)) {
    for (const [action, roles] of Object.entries(data)) {
      await prisma.permission.create({
        data: {
          action,
          resource,
          role: {
            connectOrCreate: roles.map((role) => ({
              create: {
                name: role,
              },
              where: {
                name: role,
              },
            })),
          },
        },
      })
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
