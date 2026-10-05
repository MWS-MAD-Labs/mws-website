import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import { PartnerRepository } from "../repositories/partner-repository";
import { PartnerService } from "../services/partner-service";

const partnerId = "11111111-1111-4111-8111-111111111111";

function partner(overrides: Record<string, unknown> = {}) {
  return {
    id: partnerId,
    name: "Partner",
    description: "Learning partner",
    logo: "/logos/partner.png",
    link: null,
    status: "active",
    createdAt: new Date("2026-10-05T00:00:00.000Z"),
    updatedAt: new Date("2026-10-05T00:00:00.000Z"),
    ...overrides,
  };
}

async function expectResponseError(
  promise: Promise<unknown>,
  status: number,
  messagePart: string,
) {
  try {
    await promise;
    throw new Error("Expected ResponseError.");
  } catch (error) {
    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).status).toBe(status);
    expect((error as ResponseError).message).toContain(messagePart);
  }
}

afterEach(() => {
  mock.restore();
});

describe("PartnerService", () => {
  it("validates partner ids before calling the repository", async () => {
    const findById = spyOn(PartnerRepository.prototype, "findById");

    await expectResponseError(
      PartnerService.get("not-a-uuid"),
      400,
      "Valid UUID partner id is required",
    );

    expect(findById).not.toHaveBeenCalled();
  });

  it("maps missing partners to 404", async () => {
    spyOn(PartnerRepository.prototype, "findById").mockResolvedValue(null);

    await expectResponseError(
      PartnerService.get(partnerId),
      404,
      "Partner not found",
    );
  });

  it("validates create payloads before writing", async () => {
    const create = spyOn(PartnerRepository.prototype, "create");

    await expectResponseError(
      PartnerService.create({ name: "Partner" }),
      400,
      "Partner validation failed",
    );

    expect(create).not.toHaveBeenCalled();
  });

  it("rejects empty updates", async () => {
    spyOn(PartnerRepository.prototype, "findById").mockResolvedValue(partner() as never);
    const update = spyOn(PartnerRepository.prototype, "update");

    await expectResponseError(
      PartnerService.update(partnerId, {}),
      400,
      "At least one field is required",
    );

    expect(update).not.toHaveBeenCalled();
  });

  it("maps duplicate database errors to 409", async () => {
    spyOn(PartnerRepository.prototype, "create").mockImplementation(async () => {
      throw { code: "P2002", meta: { target: ["name"] } };
    });

    await expectResponseError(
      PartnerService.create({
        name: "Partner",
        description: "Learning partner",
        logo: "/logos/partner.png",
        status: "active",
      }),
      409,
      "same name",
    );
  });

  it("maps stale delete database misses to 404", async () => {
    spyOn(PartnerRepository.prototype, "findById").mockResolvedValue(partner() as never);
    spyOn(PartnerRepository.prototype, "delete").mockImplementation(async () => {
      throw { code: "P2025" };
    });

    await expectResponseError(
      PartnerService.delete(partnerId),
      404,
      "Partner not found",
    );
  });
});
