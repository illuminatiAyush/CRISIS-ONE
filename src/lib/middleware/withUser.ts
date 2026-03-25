import { NextRequest, NextResponse } from "next/server";
import { createAdmin } from "../supabase/admin";
import { cookies } from "next/headers";

export const withUser =
  (handler: (req: NextRequest, user: any) => Promise<NextResponse>) =>
  async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get("authorization");
      const cookieStore = await cookies();
      let token: string | undefined;

      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = cookieStore.get("sb-access-token")?.value;
      }

      // console.log(authHeader," " ,token);

      // if (!authHeader || !token) {
      //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // }

      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      // Handle testing bypass tokens
      if (token.startsWith("test-session-")) {
        try {
          const payloadBase64 = token.replace("test-session-", "");
          const userData = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          // Return a mocked user object that satisfies the user type
          return handler(req, {
            id: userData.id,
            email: userData.email,
            user_metadata: { role: userData.role }
          });
        } catch (e) {
          console.error("Test token parse error", e);
          return NextResponse.json({ error: "Invalid test token" }, { status: 401 });
        }
      }

      const supabaseAdmin = await createAdmin();
      const data = await supabaseAdmin?.auth.getUser(token);
      // console.log("Data",data)

      if (data?.error || !data?.data?.user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      // console.log(data);

      return handler(req, data.data.user);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  };
