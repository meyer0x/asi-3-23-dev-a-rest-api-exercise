import { PageStatus, PrismaClient } from "@prisma/client"
import { Application } from "express"
import authenticate from "../middleware/authenticate"
import authorize from "../middleware/authorize"
import validate from "../middleware/validate"
import parseResult from "../parseResult"
import getQuery from "../query"
import { pageSanitize } from "../sanitizers"
import { RequestWithParams } from "../types/express"
import {
  contentValidator,
  idValidator,
  queryValidator,
  slugValidator,
  statusValidator,
  titleValidator,
} from "../validators"

const makeRoutesPages = (app: Application, prisma: PrismaClient) => {
  app.post(
    "/pages",
    validate({
      body: {
        title: titleValidator,
        content: contentValidator,
        slug: slugValidator,
      },
    }),
    authenticate(),
    authorize("page", "create", true),
    async (req, res) => {
      const { title, content, slug } = (req as RequestWithParams).data.body

      const session = (req as RequestWithParams).session

      const page = await prisma.page.create({
        data: {
          title,
          slug,
          content,
          creator: {
            connect: {
              id: session?.id,
            },
          },
          status: PageStatus.DRAFT,
        },
        select: pageSanitize,
      })

      if (!page) {
        return
      }

      res.send(parseResult(page, req))

      return
    }
  )
  app.patch(
    "/pages/:id",
    validate({
      body: {
        title: titleValidator.optional(),
        content: contentValidator.optional(),
        status: statusValidator.optional(),
      },
      params: { id: idValidator },
    }),
    authenticate(),
    authorize("page", "update", true),
    async (req, res) => {
      const { title, content, status } = (req as RequestWithParams).data.body
      const id = (req as RequestWithParams).data.params.id
      const session = (req as RequestWithParams).session

      const updatedPage = await prisma.page.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(status && { status: status as PageStatus }),
          modifiers: {
            connect: {
              id: session?.id,
            },
          },
        },
        select: pageSanitize,
      })

      if (!updatedPage) {
        return
      }

      res.send(parseResult(updatedPage, req))

      return
    }
  )
  app.get(
    "/pages/:id",
    validate({ params: { id: idValidator } }),
    authenticate(true),
    authorize("page", "read", true),
    async (req, res) => {
      const { id } = (req as RequestWithParams).data.params
      const session = (req as RequestWithParams).session

      const page = await prisma.page.findFirst({
        where: {
          id,
          ...(!session && { status: PageStatus.PUBLISHED }),
          ...(session && {
            OR: [
              { status: PageStatus.PUBLISHED },
              {
                status: PageStatus.DRAFT,
                OR: [
                  { creatorId: session.id },
                  { modifiers: { some: { id: session.id } } },
                ],
              },
            ],
          }),
        },
        select: pageSanitize,
      })

      if (!page) {
        return
      }

      res.send(parseResult(page, req))

      return
    }
  )
  app.get(
    "/pages",
    validate({ query: queryValidator }),
    authenticate(true),
    authorize("page", "read"),
    async (req, res) => {
      const { session } = req as RequestWithParams
      const pages = await prisma.page.findMany({
        ...getQuery(req),
        where: {
          OR: [
            { status: PageStatus.PUBLISHED },
            ...(session
              ? [
                  {
                    status: PageStatus.DRAFT,
                    OR: [
                      { creatorId: session.id },
                      { modifiers: { some: { id: session.id } } },
                    ],
                  },
                ]
              : []),
          ],
        },
        select: pageSanitize,
      })

      res.send(parseResult(pages, req))

      return
    }
  )
  app.delete(
    "/pages/:id",
    validate({ params: { id: idValidator } }),
    authenticate(),
    authorize("page", "delete", true),
    async (req, res) => {
      const { id } = (req as RequestWithParams).data.params

      const deletedPage = await prisma.page.delete({
        where: {
          id,
        },
        select: pageSanitize,
      })

      if (!deletedPage) {
        return
      }

      res.send(parseResult(deletedPage, req))

      return
    }
  )
}

export default makeRoutesPages
