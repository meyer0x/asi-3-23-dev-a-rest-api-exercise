import { pbkdf2Sync, randomBytes } from "node:crypto"
import config from "./config"

const security = config?.security.session.password as {
  saltlen: number
  iterations: number
  keylen: number
  digest: "sha512"
}

const hashPassword = (
  passsword: string,
  salt = randomBytes(20).toString("hex")
) => [
  pbkdf2Sync(
    passsword,
    salt,
    security?.iterations,
    security?.keylen,
    security?.digest
  ).toString("hex"),
  salt,
]

export default hashPassword
