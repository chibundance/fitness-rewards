;; Proofs Model
;; Handles activity proof submission and verification

(define-constant ERR-INVALID-PROOF (err u104))
(define-constant ERR-ALREADY-CLAIMED (err u105))

;; Data structures
(define-map activity-proofs 
    { user: principal, goal-id: uint } 
    { 
        proof-hash: (buff 32),
        timestamp: uint,
        verified: bool 
    }
)

;; Read-only functions
(define-read-only (get-activity-proof (user principal) (goal-id uint))
    (map-get? activity-proofs { user: user, goal-id: goal-id })
)

(define-public (submit-proof (user principal) (goal-id uint) (proof-hash (buff 32)))
    (let ((existing-proof (get-activity-proof user goal-id)))
        (asserts! (is-none existing-proof) ERR-ALREADY-CLAIMED)
        
        (ok (map-set activity-proofs 
            { user: user, goal-id: goal-id }
            {
                proof-hash: proof-hash,
                timestamp: stacks-block-height,
                verified: false
            }
        ))
    )
)

(define-public (verify-proof (user principal) (goal-id uint))
    (let ((proof (unwrap! (get-activity-proof user goal-id) ERR-INVALID-PROOF)))
        (ok (map-set activity-proofs
            { user: user, goal-id: goal-id }
            (merge proof { verified: true })
        ))
    )
)