import type { Request } from "express"
import { RequestWithParams } from "./types/express"

const parseResult = (result: any, req: Request) => {
  const { page, limit, sort, sortOrder } = (req as RequestWithParams).data
    .query as {
    page?: number
    limit?: number
    sort?: string
    sortOrder?: string
  }
  return {
    result: result,
    meta: {
      count: Array.isArray(result) ? result.length : 1,
      ...(limit && { pageCount: Math.ceil(result.length / limit) }),
      ...(page && { currentPage: page }),
      ...(limit && { perPage: limit }),
      ...(sort && { sort }),
      ...(sortOrder && { sortOrder }),
    },
  }
}

export default parseResult
