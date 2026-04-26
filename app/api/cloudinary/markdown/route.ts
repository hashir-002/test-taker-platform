import { NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = "dspzxvbki";
const API_KEY = "839892817882997";
const API_SECRET = "SY0ZBvGeiwdi7L5A5FQ07dPSS_I";

function getCloudinaryAuthHeader() {
  const encoded = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return `Basic ${encoded}`;
}

function getPublicIdFromUrl(url: string) {
  const parsed = new URL(url);
  const uploadIndex = parsed.pathname.indexOf("/upload/");
  if (uploadIndex === -1) {
    throw new Error("Invalid Cloudinary URL");
  }

  let publicId = parsed.pathname.slice(uploadIndex + "/upload/".length);
  publicId = publicId.replace(/^v\d+\//, "");
  const dotIndex = publicId.lastIndexOf(".");
  if (dotIndex !== -1) {
    publicId = publicId.slice(0, dotIndex);
  }
  return publicId;
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: getCloudinaryAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Cloudinary upload failed: ${response.status} ${response.statusText} ${errorBody}`
    );
  }

  return (await response.json()) as {
    secure_url: string;
    public_id: string;
  };
}

async function deleteFile(publicId: string) {
  const encodedPublicId = encodeURIComponent(publicId);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/raw/upload?public_ids[]=${encodedPublicId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: getCloudinaryAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Cloudinary delete failed: ${response.status} ${response.statusText} ${errorBody}`
    );
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A markdown file is required." },
      { status: 400 }
    );
  }

  const oldLink = formData.get("oldLink");
  const uploadResult = await uploadFile(file);

  if (typeof oldLink === "string" && oldLink.trim()) {
    try {
      const oldPublicId = getPublicIdFromUrl(oldLink);
      await deleteFile(oldPublicId);
    } catch (error) {
      console.error("Failed to delete old Cloudinary file:", error);
    }
  }

  return NextResponse.json({
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });
}
