import { parseSampleBanks, type SampleBankSchema } from "./samples-validate.js";

const SAMPLE_BANK_PATH =
  "https://raw.githubusercontent.com/andy-stewart-design/drome/refs/heads/turborepo/packages/samples/drome.json";

async function getSampleBanks() {
  try {
    const response = await fetch(SAMPLE_BANK_PATH);

    if (!response.ok) {
      const errorText = await response.text(); // Get error message from response body
      return {
        data: null,
        error: `HTTP Error: ${response.status} - ${errorText}`,
      } as const;
    }

    const data = await response.json(); // Assuming JSON response
    const parsedData = parseSampleBanks(data);

    return { data: parsedData, error: null } as const;
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    } as const;
  }
}

function getSamplePath(
  banks: SampleBankSchema | null,
  bank: string,
  name: string,
  index: number | string
) {
  if (!banks) return null;
  const data = banks[bank.toLocaleLowerCase()];
  const slugs = data?.slugs[name];
  if (!data || !slugs) return undefined;
  const slug = slugs[toNumber(index) % slugs.length];
  return `${data.basePath}${slug}`;
}

function toNumber(value: number | string): number {
  if (typeof value === "number") {
    return isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
}

export { getSampleBanks, getSamplePath };
