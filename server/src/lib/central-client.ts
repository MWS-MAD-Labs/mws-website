import type {
  CentralNamedRef,
  CentralUser,
  CentralUnitRef,
  EmployeeLookupResponse,
  StudentLookupResponse,
} from "../types/central-types";

type CentralPage<T> = {
  success?: boolean;
  data: T[];
  paging?: {
    current_page: number;
    total_page: number;
  };
};

function centralBaseUrl(): string {
  const baseUrl = process.env.CENTRAL_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("CENTRAL_API_BASE_URL is not configured.");
  }
  return baseUrl.replace(/\/$/, "");
}

function centralToken(): string {
  const token = process.env.CENTRAL_API_TOKEN;
  if (!token) {
    throw new Error("CENTRAL_API_TOKEN is not configured.");
  }
  return token;
}

function unitIdOf(record: {
  unit_id?: string | null;
  unitId?: string | null;
  unit?: string | CentralUnitRef | null;
}): string | null {
  if (record.unit_id) return record.unit_id;
  if (record.unitId) return record.unitId;
  if (record.unit && typeof record.unit === "object" && record.unit.id) {
    return record.unit.id;
  }
  return null;
}

function unitNameOf(record: {
  unit?: string | CentralUnitRef | null;
}): string | null {
  if (typeof record.unit === "string") return record.unit;
  if (record.unit && typeof record.unit === "object") {
    return record.unit.name || null;
  }
  return null;
}

function namedRefNameOf(
  value: string | CentralNamedRef | null | undefined,
): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.name || null;
  return null;
}

function namedRefIdOf(
  record: Record<string, unknown>,
  snakeKey: string,
  camelKey: string,
  objectKey: string,
): string | null {
  const snakeValue = record[snakeKey];
  if (typeof snakeValue === "string" && snakeValue) return snakeValue;

  const camelValue = record[camelKey];
  if (typeof camelValue === "string" && camelValue) return camelValue;

  const objectValue = record[objectKey];
  if (
    objectValue &&
    typeof objectValue === "object" &&
    "id" in objectValue &&
    typeof objectValue.id === "string" &&
    objectValue.id
  ) {
    return objectValue.id;
  }

  return null;
}

async function lookup<T>(path: string, email: string): Promise<T | null> {
  const res = await fetch(
    `${centralBaseUrl()}${path}?email=${encodeURIComponent(email)}`,
    {
      headers: { Authorization: `Bearer ${centralToken()}` },
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`Central lookup failed (${path}):`, res.status, await res.text());
    throw new Error(`Central lookup failed with status ${res.status}`);
  }

  const body = (await res.json()) as { data: T };
  return body.data;
}

async function listPage<T>(path: string): Promise<CentralPage<T>> {
  const res = await fetch(`${centralBaseUrl()}${path}`, {
    headers: { Authorization: `Bearer ${centralToken()}` },
  });

  if (!res.ok) {
    console.error(`Central list failed (${path}):`, res.status, await res.text());
    throw new Error(`Central list failed with status ${res.status}`);
  }

  return (await res.json()) as CentralPage<T>;
}

function normalizeEmployee(
  employee: EmployeeLookupResponse,
): Extract<CentralUser, { source: "employee" }> {
  const unitName = unitNameOf(employee);
  const unitId = unitIdOf(employee);
  const jobPositionId = namedRefIdOf(
    employee,
    "job_position_id",
    "jobPositionId",
    "job_position",
  );
  const jobLevelId = namedRefIdOf(
    employee,
    "job_level_id",
    "jobLevelId",
    "job_level",
  );

  return {
    source: "employee",
    ...employee,
    unit: unitName,
    unit_id: unitId,
    unitId,
    job_position: namedRefNameOf(employee.job_position),
    job_position_id: jobPositionId,
    jobPositionId,
    job_level: namedRefNameOf(employee.job_level),
    job_level_id: jobLevelId,
    jobLevelId,
  };
}

export async function resolveCentralIdentity(
  email: string,
): Promise<CentralUser | null> {
  const employee = await lookup<EmployeeLookupResponse>("/employees/lookup", email);
  if (employee) {
    return normalizeEmployee(employee);
  }

  const student = await lookup<StudentLookupResponse>("/students/lookup", email);
  if (student) {
    const unitId = unitIdOf(student);
    return {
      source: "student",
      ...student,
      unit_id: unitId,
      unitId,
    };
  }

  return null;
}

export async function listActiveEmployees(): Promise<
  Array<Extract<CentralUser, { source: "employee" }>>
> {
  const employees: Array<Extract<CentralUser, { source: "employee" }>> = [];
  let page = 1;
  let totalPage = 1;

  do {
    const body = await listPage<EmployeeLookupResponse>(
      `/employees?page=${page}&size=100&status=ACTIVE`,
    );
    employees.push(...body.data.map(normalizeEmployee));
    totalPage = body.paging?.total_page ?? page;
    page += 1;
  } while (page <= totalPage);

  return employees;
}
