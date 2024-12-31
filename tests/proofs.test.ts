import { describe, expect, it, vi } from "vitest";

const simnet: any = {
  getAccounts: () =>
    new Map([
      ["user_1", "address1"],
      ["user_2", "address2"],
    ]),
  callPublicFn: vi.fn(),
  callReadOnlyFn: vi.fn(),
};

const accounts = simnet.getAccounts();
const user1 = accounts.get("user_1")!;
const user2 = accounts.get("user_2")!;
const proofsModel = "proofs-model";

// Error Constants
const ERR_INVALID_PROOF = { type: "err", value: 104 };
const ERR_ALREADY_CLAIMED = { type: "err", value: 105 };

describe("Proofs Model Tests", () => {
  it("should submit a new activity proof successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const proofHash = "0x" + "a".repeat(64); // Dummy proof hash
    const { result } = simnet.callPublicFn(
      proofsModel,
      "submit-proof",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
        { type: "buff", value: proofHash },
      ],
      user1
    );

    expect(result.ok).toBe(true);
  });

  it("should reject submission of a duplicate proof", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_ALREADY_CLAIMED });

    const proofHash = "0x" + "b".repeat(64); // Dummy proof hash
    const { result } = simnet.callPublicFn(
      proofsModel,
      "submit-proof",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 }, // Existing goal ID
        { type: "buff", value: proofHash },
      ],
      user1
    );

    expect(result).toEqual(ERR_ALREADY_CLAIMED);
  });

  it("should retrieve an existing activity proof successfully", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: {
        ok: true,
        value: {
          proofHash: "0x" + "c".repeat(64), // Dummy proof hash
          timestamp: 100,
          verified: false,
        },
      },
    });

    const { result } = simnet.callReadOnlyFn(
      proofsModel,
      "get-activity-proof",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
      ],
      user1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({
      proofHash: "0x" + "c".repeat(64),
      timestamp: 100,
      verified: false,
    });
  });

  it("should reject retrieval of a non-existent proof", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: { err: ERR_INVALID_PROOF },
    });

    const { result } = simnet.callReadOnlyFn(
      proofsModel,
      "get-activity-proof",
      [
        { type: "principal", value: user2 },
        { type: "uint", value: 2 }, // Non-existent goal ID
      ],
      user2
    );

    expect(result.err).toEqual(ERR_INVALID_PROOF);
  });

  it("should verify an existing activity proof successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      proofsModel,
      "verify-proof",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
      ],
      user1
    );

    expect(result.ok).toBe(true);
  });

  it("should reject verification of a non-existent proof", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_INVALID_PROOF });

    const { result } = simnet.callPublicFn(
      proofsModel,
      "verify-proof",
      [
        { type: "principal", value: user2 },
        { type: "uint", value: 3 }, // Non-existent goal ID
      ],
      user2
    );

    expect(result).toEqual(ERR_INVALID_PROOF);
  });
});
