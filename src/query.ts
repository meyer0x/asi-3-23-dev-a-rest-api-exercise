import type { Request } from "express"
import { RequestWithParams } from "./types/express"

const getQuery = (req: Request) => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    sortOrder = "asc",
  } = (req as RequestWithParams).data.query as {
    page?: number
    limit?: number
    sort?: string
    sortOrder?: string
  }

  const skip = (page - 1) * limit

  return { skip, take: limit, orderBy: { [sort]: sortOrder } }
}

export default getQuery
