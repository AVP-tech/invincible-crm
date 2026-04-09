import { type CsvContactImportPreview } from "@/lib/schemas";

type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

const headerAliases: Record<string, "name" | "email" | "phone" | "companyName" | "source" | "tagsText"> = {
  name: "name",
  full_name: "name",
  fullname: "name",
  contact_name: "name",
  person: "name",
  email: "email",
  email_address: "email",
  mail: "email",
  phone: "phone",
  mobile: "phone",
  mobile_number: "phone",
  phone_number: "phone",
  company: "companyName",
  company_name: "companyName",
  organization: "companyName",
  business: "companyName",
  source: "source",
  lead_source: "source",
  channel: "source",
  tags: "tagsText",
  labels: "tagsText"
};

export function parseCsvText(csvText: string): ParsedCsv {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  const normalized = csvText.replace(/\r\n/g, "\n");

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const nextChar = normalized[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      currentRow.push(currentValue.trim());
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  const [rawHeaders = [], ...dataRows] = rows.filter((row) => row.some((cell) => cell.length > 0));

  return {
    headers: rawHeaders,
    rows: dataRows
  };
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function mapContactColumns(headers: string[]) {
  return headers.reduce<Record<string, keyof CsvContactImportPreview["rows"][number]["contact"]>>((mapping, header, index) => {
    const alias = headerAliases[normalizeHeader(header)];

    if (alias) {
      mapping[String(index)] = alias;
    }

    return mapping;
  }, {});
}

export function coerceCsvContactRow(headers: string[], row: string[]) {
  const mappedColumns = mapContactColumns(headers);
  const contact: {
    name?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    source?: string;
    tagsText: string;
  } = {
    name: undefined,
    email: undefined,
    phone: undefined,
    companyName: undefined,
    source: undefined,
    tagsText: ""
  };

  for (const [columnIndex, field] of Object.entries(mappedColumns)) {
    const value = row[Number(columnIndex)]?.trim();

    if (!value) {
      continue;
    }

    if (field === "tagsText") {
      contact.tagsText = value.replace(/;/g, ", ");
      continue;
    }

    switch (field) {
      case "name":
        contact.name = value;
        break;
      case "email":
        contact.email = value;
        break;
      case "phone":
        contact.phone = value;
        break;
      case "companyName":
        contact.companyName = value;
        break;
      case "source":
        contact.source = value;
        break;
      default:
        break;
    }
  }

  return contact;
}
