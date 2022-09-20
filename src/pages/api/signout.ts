import type { NextApiRequest, NextApiResponse } from "next";
import { clearAccountCookie } from "../../server/auth";

export default async function signout(_: NextApiRequest, res: NextApiResponse) {
  clearAccountCookie(res);
  res.status(200).json({ status: "SUCCESS" });
}
