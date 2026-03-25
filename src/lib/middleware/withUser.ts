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

      const supabaseAdmin = await createAdmin();
      const data = await supabaseAdmin?.auth.getUser(token);
      // console.log("Data",data)

      if (data?.error || !data?.data) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      // console.log(data);

      return handler(req, data.data?.user);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  };
