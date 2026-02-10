"use server";

export async function mapCsvHeadersAction(headers: string[]) {
  // Placeholder stub
  return {
    date: headers.find((h) => h.toLowerCase().includes("date")) || headers[0],
    description:
      headers.find((h) => h.toLowerCase().includes("desc")) || headers[1],
    amount:
      headers.find((h) => h.toLowerCase().includes("amount")) || headers[2],
  };
}
