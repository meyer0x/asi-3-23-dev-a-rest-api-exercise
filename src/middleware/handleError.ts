import { ErrorRequestHandler } from "express"
import { AppError } from "../errors"

const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
  if (!(error instanceof AppError)) {
    // eslint-disable-next-line no-console
    console.error(error)

    response.send({
      error: ["Oops. Something went wrong."],
      errorCode: "error",
    })

    return
  }

  response
    .status(error.httpCode || 404)
    .send({ error: error.errors, errorCode: error.errorCode })
}

export default handleError
