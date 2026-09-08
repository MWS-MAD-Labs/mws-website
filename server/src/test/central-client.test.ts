import { afterEach, describe, expect, it } from "bun:test";
import { listActiveEmployees, resolveCentralIdentity } from "../lib/central-client";
import { jsonResponse } from "./test-helpers";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  process.env.CENTRAL_API_BASE_URL = "https://central.test";
  process.env.CENTRAL_API_TOKEN = "central-token";
});

describe("resolveCentralIdentity", () => {
  it("returns an employee identity when employee lookup finds a match", async () => {
    process.env.CENTRAL_API_BASE_URL = "https://central.test/";
    process.env.CENTRAL_API_TOKEN = "central-token";
    const calls: string[] = [];

    global.fetch = (async (input: string | URL | Request) => {
      calls.push(String(input));
      return jsonResponse(200, {
        data: {
          id: "emp-1",
          employee_id: "E001",
          full_name: "Employee",
          nick_name: null,
          email: "employee@millennia21.id",
          photo_url: null,
          unit: { id: "unit-1", name: "MAD Lab" },
          job_position: { id: "job-1", name: "Developer" },
          job_level: { id: "level-1", name: "Staff" },
          status: "ACTIVE",
          employment_type: null,
        },
      });
    }) as unknown as typeof fetch;

    const user = await resolveCentralIdentity("employee@millennia21.id");

    expect(calls[0]).toContain(
      "https://central.test/employees/lookup?email=employee%40millennia21.id",
    );
    expect(user?.source).toBe("employee");
    if (user?.source !== "employee") throw new Error("Expected employee");
    expect(user.unit).toBe("MAD Lab");
    expect(user.unit_id).toBe("unit-1");
    expect(user.job_position).toBe("Developer");
    expect(user.job_position_id).toBe("job-1");
  });

  it("falls through to student lookup after an employee 404", async () => {
    process.env.CENTRAL_API_BASE_URL = "https://central.test";
    process.env.CENTRAL_API_TOKEN = "central-token";
    const calls: string[] = [];

    global.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      calls.push(url);
      if (url.includes("/employees/lookup")) {
        return jsonResponse(404, { errors: "Not found" });
      }
      return jsonResponse(200, {
        data: {
          id: "student-1",
          nis: null,
          nisn: null,
          full_name: "Student",
          nick_name: null,
          email: "student@millennia21.id",
          status: "ACTIVE",
          current_grade: null,
          current_class: null,
          unit_id: "unit-student",
        },
      });
    }) as unknown as typeof fetch;

    const user = await resolveCentralIdentity("student@millennia21.id");
    expect(user?.source).toBe("student");
    expect(calls.some((url) => url.includes("/employees/lookup"))).toBe(true);
    expect(calls.some((url) => url.includes("/students/lookup"))).toBe(true);
  });

  it("throws on Central 401 instead of treating it as not registered", async () => {
    process.env.CENTRAL_API_BASE_URL = "https://central.test";
    process.env.CENTRAL_API_TOKEN = "central-token";
    global.fetch = (async () =>
      jsonResponse(401, { errors: "Unauthorized" })) as unknown as typeof fetch;

    await expect(resolveCentralIdentity("anyone@millennia21.id")).rejects.toThrow(
      "Central lookup failed with status 401",
    );
  });

  it("lists active employees and keeps Central unit ids", async () => {
    process.env.CENTRAL_API_BASE_URL = "https://central.test";
    process.env.CENTRAL_API_TOKEN = "central-token";
    const calls: string[] = [];

    global.fetch = (async (input: string | URL | Request) => {
      calls.push(String(input));
      return jsonResponse(200, {
        data: [
          {
            id: "emp-1",
            employee_id: "E001",
            full_name: "Employee",
            nick_name: null,
            email: "employee@millennia21.id",
            photo_url: null,
            unit: "MAD Lab",
            unit_id: "unit-mad-lab",
            job_position: null,
            job_level: null,
            status: "ACTIVE",
            employment_type: null,
          },
        ],
        paging: { current_page: 1, total_page: 1 },
      });
    }) as unknown as typeof fetch;

    const employees = await listActiveEmployees();
    expect(calls[0]).toContain("/employees?page=1&size=100&status=ACTIVE");
    expect(employees[0]?.unit_id).toBe("unit-mad-lab");
  });
});
