;; Rewards Model
;; Handles reward distribution and management

;; Define contract owner as a variable instead of constant
(define-data-var contract-owner principal tx-sender)

(define-constant ERR-NO-REWARDS (err u106))
(define-constant ERR-NOT-AUTHORIZED (err u107))
(define-constant ERR-INVALID-AMOUNT (err u108))

;; Data structures
(define-map user-rewards principal uint)

;; Read-only functions
(define-read-only (get-user-rewards (user principal))
    (default-to u0 (map-get? user-rewards user))
)

;; Public functions
(define-public (add-reward (user principal) (amount uint))
    (begin
        ;; Only allow the main fitness-rewards contract to add rewards
        (asserts! (is-eq contract-caller .fitness-rewards) ERR-NOT-AUTHORIZED)
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)
        
        (ok (map-set user-rewards
            user
            (+ (get-user-rewards user) amount)
        ))
    )
)

(define-public (claim-user-rewards (user principal))
    (begin
        (asserts! (is-eq tx-sender user) ERR-NOT-AUTHORIZED)
        (let ((reward-amount (get-user-rewards user)))
            (asserts! (> reward-amount u0) ERR-NO-REWARDS)
            
            ;; Reset rewards to 0 before transfer
            (map-set user-rewards user u0)
            
            ;; Transfer STX rewards to user
            (as-contract
                (stx-transfer? reward-amount tx-sender user)
            )
        )
    )
)