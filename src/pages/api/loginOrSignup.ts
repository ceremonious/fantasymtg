import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateAccount } from "../../server/auth";
import { supabase } from "../../utils/supabaseClient";

export default async function loginOrSignup(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const phoneNumber = req.body.phoneNumber;
  const token = req.body.token;

  if (typeof phoneNumber !== "string") {
    res.status(400).send({ message: "Missing phone number" });
    return;
  } else if (typeof token !== "string") {
    res.status(400).send({ message: "Missing token" });
    return;
  }

  const resp = await supabase.auth.verifyOtp({
    type: "sms",
    phone: phoneNumber,
    token: token,
  });
  if (resp.data.user !== null) {
    const accountID = resp.data.user.id;
    authenticateAccount(res, accountID);

    res.status(200).json({ status: "SUCCESS" });
  } else {
    res.status(200).json({ status: "FAIL" });
  }
}
