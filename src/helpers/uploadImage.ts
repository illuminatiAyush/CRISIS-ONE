import fs from "fs-extra";
import { createAdmin } from "@/lib/supabase/admin";

export const uploadImageToSupabase = async (filePath: string, fileName: string, bucketName: string) => {
    const supabaseAdmin = await createAdmin()
  const buffer = await fs.readFile(filePath);
  const data = await supabaseAdmin?.storage
    .from(bucketName)
    .upload(fileName, buffer);

  if (data?.error) throw data?.error;

  const media = supabaseAdmin?.storage
    .from(bucketName)
    .getPublicUrl(fileName);

    console.log(media)

  return media;
};
