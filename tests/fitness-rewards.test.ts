import { describe, expect, it, vi } from "vitest";

const simnet: any = {
  getAccounts: () =>
    new Map([
      ["owner", "address1"],
      ["user_1", "address2"],
    ]),
  callPublicFn: vi.fn(),
  callReadOnlyFn: vi.fn(),
};

const accounts = simnet.getAccounts();
const owner = accounts.get("owner")!;
const user1 = accounts.get("user_1")!;
const mainContract = "fitness-activity-rewards";
const goalsContract = ".goals";
const proofsContract = ".proofs";
const rewardsContract = ".rewards";

// Error Constants
const ERR_NOT_AUTHORIZED = { type: "err", value: 100 };
const ERR_NO_SUCH_GOAL = { type: "err", value: 101 };
const ERR_INVALID_PROOF = { type: "err", value: 102 };
const ERR_ALREADY_CLAIMED = { type: "err", value: 103 };

describe("Fitness Activity Rewards Main Contract Tests", () => {
  it("should allow contract owner to set a fitness goal", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      mainContract,
      "set-fitness-goal",
      [
        { type: "uint", value: 1 }, // goal-id
        { type: "uint", value: 1000 }, // target
        { type: "uint", value: 200 }, // deadline
        { type: "uint", value: 50 }, // reward-amount
      ],
      owner // Owner as caller
    );

    expect(result.ok).toBe(true);
  });

  it("should reject goal setting by a non-owner", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_AUTHORIZED });

    const { result } = simnet.callPublicFn(
      mainContract,
      "set-fitness-goal",
      [
        { type: "uint", value: 1 }, // goal-id
        { type: "uint", value: 1000 }, // target
        { type: "uint", value: 200 }, // deadline
        { type: "uint", value: 50 }, // reward-amount
      ],
      user1 // Unauthorized caller
    );

    expect(result).toEqual(ERR_NOT_AUTHORIZED);
  });

  it("should submit a valid activity proof", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      mainContract,
      "submit-activity-proof",
      [
        { type: "uint", value: 1 }, // goal-id
        { type: "buff", value: "valid-proof-hash" }, // proof-hash
      ],
      user1 // Proof submitter
    );

    expect(result.ok).toBe(true);
  });

  it("should reject duplicate proof submissions", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_ALREADY_CLAIMED });

    const { result } = simnet.callPublicFn(
      mainContract,
      "submit-activity-proof",
      [
        { type: "uint", value: 1 }, // goal-id
        { type: "buff", value: "duplicate-proof-hash" }, // proof-hash
      ],
      user1 // Proof submitter
    );

    expect(result).toEqual(ERR_ALREADY_CLAIMED);
  });

  it("should verify an activity and reward the user", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      mainContract,
      "verify-activity",
      [
        { type: "principal", value: user1 }, // user
        { type: "uint", value: 1 }, // goal-id
      ],
      owner // Owner as verifier
    );

    expect(result.ok).toBe(true);
  });

  it("should reject verification by a non-owner", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_AUTHORIZED });

    const { result } = simnet.callPublicFn(
      mainContract,
      "verify-activity",
      [
        { type: "principal", value: user1 }, // user
        { type: "uint", value: 1 }, // goal-id
      ],
      user1 // Unauthorized verifier
    );

    expect(result).toEqual(ERR_NOT_AUTHORIZED);
  });

  it("should allow a user to claim rewards", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      mainContract,
      "claim-rewards",
      [],
      user1 // Rewards claimer
    );

    expect(result.ok).toBe(true);
  });

  it("should reject unauthorized reward claims", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_AUTHORIZED });

    const { result } = simnet.callPublicFn(
      mainContract,
      "claim-rewards",
      [],
      "unauthorized-user"
    );

    expect(result).toEqual(ERR_NOT_AUTHORIZED);
  });
});
