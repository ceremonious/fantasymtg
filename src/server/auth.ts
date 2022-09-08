import jwt from "jsonwebtoken";
import { CookieSerializeOptions, serialize } from "cookie";
import { NextApiResponse } from "next";

const cookieOptions = {
  httpOnly: true,
  maxAge: 2592000,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

function setCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  options: CookieSerializeOptions | undefined
): void {
  const stringValue =
    typeof value === "object" ? `j:${JSON.stringify(value)}` : String(value);

  res.setHeader("Set-Cookie", serialize(name, String(stringValue), options));
}

export function authenticateAccount(
  res: NextApiResponse,
  accountID: string
): void {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (JWT_SECRET === undefined) {
    throw new Error("JWT Secret not found");
  }

  const token = jwt.sign({ accountID }, JWT_SECRET, {
    expiresIn: "1y",
  });

  setCookie(res, "auth", token, cookieOptions);
}

export function clearAccountCookie(res: NextApiResponse): void {
  setCookie(res, "auth", "0", {
    ...cookieOptions,
    path: "/",
    maxAge: 1,
  });
}

// This gives back the user behind a given request
// either on API routes or getServerSideProps
// export async function userFromRequest(
//   req: IncomingMessage & { cookies: NextApiRequestCookies }
// ): Promise<User | undefined> {
//   const { auth: token } = req.cookies;

//   if (!token) return undefined;

//   try {
//     const data = jwt.verify(token, JWT_TOKEN_KEY);

//     if (!data) return undefined;

//     const user = await prisma.user.findUnique({
//       where: { email: (data as any).email },
//     });

//     if (user) user.password = "";

//     return user;
//   } catch (error) {
//     return undefined;
//   }
// }
