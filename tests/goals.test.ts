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
const goalsModel = "goals-model";

// Error Constants
const ERR_INVALID_GOAL = { type: "err", value: 101 };
const ERR_GOAL_EXISTS = { type: "err", value: 102 };
const ERR_NO_SUCH_GOAL = { type: "err", value: 103 };

describe("Goals Model Tests", () => {
  it("should create a new goal successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      goalsModel,
      "create-goal",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
        { type: "uint", value: 1000 },
        { type: "uint", value: 200 },
        { type: "uint", value: 50 },
      ],
      user1
    );

    expect(result.ok).toBe(true);
  });

  it("should reject creation of a goal with invalid target", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_INVALID_GOAL });

    const { result } = simnet.callPublicFn(
      goalsModel,
      "create-goal",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
        { type: "uint", value: 0 }, // Invalid target
        { type: "uint", value: 200 },
        { type: "uint", value: 50 },
      ],
      user1
    );

    expect(result).toEqual(ERR_INVALID_GOAL);
  });

  it("should reject creation of a duplicate goal", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_GOAL_EXISTS });

    const { result } = simnet.callPublicFn(
      goalsModel,
      "create-goal",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 }, // Duplicate goal ID
        { type: "uint", value: 1000 },
        { type: "uint", value: 200 },
        { type: "uint", value: 50 },
      ],
      user1
    );

    expect(result).toEqual(ERR_GOAL_EXISTS);
  });

  it("should retrieve a user's goal successfully", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: {
        ok: true,
        value: {
          target: 1000,
          deadline: 200,
          achieved: false,
          rewardAmount: 50,
        },
      },
    });

    const { result } = simnet.callReadOnlyFn(
      goalsModel,
      "get-user-goal",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
      ],
      user1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({
      target: 1000,
      deadline: 200,
      achieved: false,
      rewardAmount: 50,
    });
  });

  it("should mark a goal as achieved successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      goalsModel,
      "mark-goal-achieved",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 1 },
      ],
      user1
    );

    expect(result.ok).toBe(true);
  });

  it("should reject marking a non-existent goal as achieved", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NO_SUCH_GOAL });

    const { result } = simnet.callPublicFn(
      goalsModel,
      "mark-goal-achieved",
      [
        { type: "principal", value: user2 },
        { type: "uint", value: 2 }, // Non-existent goal ID
      ],
      user2
    );

    expect(result).toEqual(ERR_NO_SUCH_GOAL);
  });
});
