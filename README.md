# Fitness Activity Rewards Smart Contract

A Clarity smart contract system that incentivizes and rewards users for achieving fitness goals through blockchain-based verification and reward distribution.

## Overview

This smart contract system enables:
- Setting and tracking fitness goals
- Submitting activity proofs
- Verifying completed activities
- Distributing rewards for achieved goals

## Project Structure

The project is organized into modular components:
- `contracts/`: Contains all smart contract code
- `tests/`: Corresponding tests for all contracts

## Smart Contract Components

### Goals 
Handles the creation and management of fitness goals:
- Goal creation with targets and deadlines
- Goal status tracking
- Goal completion verification

### Proofs 
Manages activity proof submission and verification:
- Proof submission
- Verification process
- Timestamp tracking

### Rewards 
Handles reward distribution and management:
- Reward calculation
- Reward accumulation
- Reward claiming

## Usage

### Setting up a Goal
```clarity
(contract-call? .fitness-rewards set-fitness-goal
    u1              ;; goal-id
    u10000          ;; target (e.g., 10,000 steps)
    u720            ;; deadline (blocks)
    u100000000      ;; reward amount (100 STX)
)
```

### Submitting Activity Proof
```clarity
(contract-call? .fitness-rewards submit-activity-proof
    u1              ;; goal-id
    0x...)          ;; proof-hash
```

### Claiming Rewards
```clarity
(contract-call? .fitness-rewards claim-rewards)
```

## Development

### Prerequisites
- Clarinet
- Node.js
- VSCode with Clarity extension (recommended)

### Testing
Run the test suite:
```bash
npm test
```

```


## License

MIT License