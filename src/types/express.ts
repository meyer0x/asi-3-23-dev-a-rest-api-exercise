import { User } from "@prisma/client"
import { Request } from "express"

export type RequestWithParams = Request & {
  data: {
    params: Record<string, string>
    body: Record<string, string>
    query: Record<string, string>
  }
  session?: User
}
