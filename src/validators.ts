import { PageStatus } from "@prisma/client"
import { z } from "zod"

//Common validators
export const idValidator = z.string()

//User validators
export const emailValidator = z.string().email()
export const firstNameValidator = z.string().min(1)
export const lastNameValidator = z.string().min(1)
export const passwordValidator = z.string().min(1)

//Page validators
export const titleValidator = z.string().min(4)
export const contentValidator = z.string().min(4)
export const statusValidator = z.enum(
  Object.keys(PageStatus) as unknown as readonly [string, ...string[]]
)
export const slugValidator = z.string().min(4)

// Limit and page validators

export const queryLimitValidator = z.preprocess(
  (arg) => parseInt(arg as string),
  z.number().min(1)
)

export const queryPageValidator = z.preprocess(
  (arg) => parseInt(arg as string),
  z.number().min(0)
)

export const querySortByValidator = z.string()

export const querySortOrderValidator = z.enum(["asc", "desc"])

export const queryValidator = {
  page: queryPageValidator.optional(),
  limit: queryLimitValidator.optional(),
  sort: querySortByValidator.optional(),
  sortOrder: querySortOrderValidator.optional(),
}
