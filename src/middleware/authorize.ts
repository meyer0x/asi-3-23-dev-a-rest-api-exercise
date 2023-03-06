import { PrismaClient, User } from "@prisma/client"
import { Request, RequestHandler } from "express"
import { InvalidAccessError, NotFoundError } from "../errors"

const prisma = new PrismaClient()

interface AuthRequest extends Request {
  session: User
}

type Resource = "user" | "page" | "navigationMenu"

type Action = "create" | "read" | "update" | "delete"

const authorize =
  (resource: Resource, action: Action, selfAble?: boolean): RequestHandler =>
  async (req, res, next) => {
    try {
      const { session } = req as AuthRequest

      const user = await prisma.user.findUnique({
        where: {
          id: session.id,
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      })

      const permissions = user?.role?.permissions

      if (!permissions) {
        throw new NotFoundError()
      }

      const hasPermission = permissions.some(
        (permission) =>
          permission.resource === resource && permission.action === action
      )

      if (!hasPermission) {
        throw new InvalidAccessError()
      }

      if (!selfAble) {
        next()
        return
      }

      //@ts-ignore
      const idParams = req.data.params.id

      if (resource === "user" && idParams !== user.id) {
        throw new InvalidAccessError()
      }

      next()
    } catch (error) {
      if (error instanceof InvalidAccessError) {
        throw new InvalidAccessError()
      }

      throw new NotFoundError()
    }
  }

export default authorize
