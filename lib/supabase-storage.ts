const DEFAULT_BUCKET = "product-images";
const STORAGE_PREFIX = "supabase://";

function getConfig() {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
  if (!baseUrl || !secretKey) {
    throw new Error("Supabase Storage is not configured.");
  }
  return { baseUrl, secretKey, bucket };
}

function authHeaders(contentType?: string) {
  const { secretKey } = getConfig();
  // Supabase's new sb_secret_* keys are opaque API keys, not JWTs.
  // Sending an sb_secret_* key as "Authorization: Bearer ..." makes
  // Storage try to parse it as a JWT and returns "Invalid Compact JWS".
  // Send new secret keys via apikey only. Legacy service_role keys remain
  // compatible with the Authorization header.
  const headers: Record<string, string> = {
    apikey: secretKey,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
  if (!secretKey.startsWith("sb_secret_")) {
    headers.Authorization = `Bearer ${secretKey}`;
  }
  return headers;
}

function encodedPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function storageReference(bucket: string, path: string) {
  return `${STORAGE_PREFIX}${bucket}/${path}`;
}

export function parseStorageReference(value: string) {
  if (!value.startsWith(STORAGE_PREFIX)) return null;
  const raw = value.slice(STORAGE_PREFIX.length);
  const slash = raw.indexOf("/");
  if (slash <= 0) return null;
  return { bucket: raw.slice(0, slash), path: raw.slice(slash + 1) };
}

export async function uploadStorageObject(
  path: string,
  file: Blob,
  contentType: string,
) {
  const { baseUrl, bucket } = getConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath(path)}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(contentType),
        "Cache-Control": "31536000",
        "x-upsert": "false",
      },
      body: file,
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  return storageReference(bucket, path);
}

export async function deleteStorageObject(reference: string) {
  const parsed = parseStorageReference(reference);
  if (!parsed) return;

  const { baseUrl } = getConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(parsed.bucket)}/${encodedPath(parsed.path)}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );

  if (!response.ok && response.status !== 404) {
    const detail = await response.text();
    throw new Error(`Supabase Storage delete failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}

async function signBucketPaths(
  bucket: string,
  paths: string[],
  expiresIn: number,
) {
  if (!paths.length) return new Map<string, string>();

  const { baseUrl } = getConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}`,
    {
      method: "POST",
      headers: {
        ...authHeaders("application/json"),
      },
      body: JSON.stringify({ expiresIn, paths }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase Storage signing failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const rows = (await response.json()) as Array<{
    path?: string;
    signedURL?: string;
    error?: string;
  }>;

  const result = new Map<string, string>();
  for (const row of rows) {
    if (!row.path || !row.signedURL || row.error) continue;
    const url = row.signedURL.startsWith("http")
      ? row.signedURL
      : `${baseUrl}/storage/v1${row.signedURL}`;
    result.set(row.path, url);
  }
  return result;
}

export async function resolveImageUrls(
  urls: string[],
  expiresIn = 3600,
) {
  const result = new Map<string, string>();
  const groups = new Map<string, string[]>();

  for (const url of urls) {
    const parsed = parseStorageReference(url);
    if (!parsed) {
      result.set(url, url);
      continue;
    }
    const list = groups.get(parsed.bucket) || [];
    if (!list.includes(parsed.path)) list.push(parsed.path);
    groups.set(parsed.bucket, list);
  }

  await Promise.all(
    Array.from(groups.entries()).map(async ([bucket, paths]) => {
      const signed = await signBucketPaths(bucket, paths, expiresIn);
      for (const path of paths) {
        const reference = storageReference(bucket, path);
        result.set(reference, signed.get(path) || reference);
      }
    }),
  );

  return result;
}

export function storageProxyUrl(reference: string) {
  return `/api/products/image?ref=${encodeURIComponent(reference)}`;
}

export async function resolveImageUrl(url: string, expiresIn = 3600) {
  const map = await resolveImageUrls([url], expiresIn);
  return map.get(url) || url;
}
