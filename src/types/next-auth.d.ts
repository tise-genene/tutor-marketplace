import { Role } from "@prisma/client"

declare module "better-auth" {
  interface User {
    id: string
    role: Role
  }

  interface Session {
    user: User & {
      id: string
      role: Role
    }
  }
} 