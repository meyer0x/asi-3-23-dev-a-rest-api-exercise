import { Prisma } from "@prisma/client"

export const userSanitize = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
})

export const pageSanitize = Prisma.validator<Prisma.PageSelect>()({
  id: true,
  title: true,
  content: true,
  slug: true,
  status: true,
})
