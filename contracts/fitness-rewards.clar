;; Import and implement the ownable trait
(use-trait ownable .ownable)

;; Define contract owner
(define-data contract-owner principal tx-sender)

;; Constants
(const ERR-NOT-AUTHORIZED (err u100))
(const ERR-NO-SUCH-GOAL (err u101))
(const ERR-INVALID-PROOF (err u102))
(const ERR-ALREADY-CLAIMED (err u103))

;; Implementing the ownable trait functions
(impl-trait ownable)

(define-read-only (get-contract-owner)
    (ok contract-owner)
)

(define-public (transfer-ownership (new-owner principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        (map-set contract-owner new-owner)
        (ok true)
    )
)

(define-read-only (is-contract-owner (caller principal))
    (ok (is-eq caller contract-owner))
)

;; Fitness Goal Management
(define-public (set-fitness-goal (goal-id uint) (target uint) (deadline uint) (reward-amount uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        (contract-call? .goals create-goal tx-sender goal-id target deadline reward-amount)
    )
)

;; Proof Submission and Verification
(define-public (submit-activity-proof (goal-id uint) (proof-hash (buff 32)))
    (let (
        (user tx-sender)
        (current-goal (unwrap! (contract-call? .goals get-user-goal user goal-id) ERR-NO-SUCH-GOAL))
    )
        ;; Ensure the goal is not already achieved
        (asserts! (not (get achieved current-goal)) ERR-ALREADY-CLAIMED)
        ;; Ensure the activity proof is submitted before the deadline
        (asserts! (<= blocks-height (get deadline current-goal)) ERR-INVALID-PROOF)
        
        ;; Submit the proof
        (contract-call? .proofs submit-proof user goal-id proof-hash)
    )
)

(define-public (verify-activity (user principal) (goal-id uint))
    (begin
        ;; Ensure only the contract owner can call this function
        (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
        
        ;; Verify the proof for the user's goal
        (try! (contract-call? .proofs verify-proof user goal-id))
        
        ;; Mark goal as achieved
        (try! (contract-call? .goals mark-goal-achieved user goal-id))
        
        ;; Fetch the goal details and add the reward
        (let ((goal (unwrap! (contract-call? .goals get-user-goal user goal-id) ERR-NO-SUCH-GOAL)))
            ;; Add reward and return the result
            (contract-call? .rewards add-reward user (get reward-amount goal))
        )
    )
)

;; Reward Management
(define-public (claim-rewards)
    (contract-call? .rewards claim-user-rewards tx-sender)
)
