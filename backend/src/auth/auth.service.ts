import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

const users = new Map<string, User>();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SALT_ROUNDS = 10;

function validateEmail(email: unknown) {
  return typeof email === "string" && /\S+@\S+\.\S+/.test(email);
}

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string) {
    if (!validateEmail(email)) throw new Error("Invalid email");
    if (typeof password !== "string" || password.length < 6)
      throw new Error("Password must be at least 6 characters");
    if (!firstName || !lastName) throw new Error("First and last name required");
    if (users.has(email)) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user: User = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      firstName,
      lastName,
    };
    users.set(email, user);
    return this.issueToken(user);
  }

  async login(email: string, password: string) {
    const user = users.get(email);
    if (!user) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    return this.issueToken(user);
  }

  private issueToken(user: User) {
    const token = jwt.sign(
      { sub: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    return { token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } };
  }
}

export const authService = new AuthService();
