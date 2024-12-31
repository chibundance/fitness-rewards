;; Goals Model
;; Handles fitness goal data structures and operations

(define-constant ERR-INVALID-GOAL (err u101))
(define-constant ERR-GOAL-EXISTS (err u102))
(define-constant ERR-NO-SUCH-GOAL (err u103))

;; Data structures
(define-map user-goals 
    { user: principal, goal-id: uint } 
    { 
        target: uint,
        deadline: uint,
        achieved: bool,
        reward-amount: uint
    }
)

;; Read-only functions
(define-read-only (get-user-goal (user principal) (goal-id uint))
    (map-get? user-goals { user: user, goal-id: goal-id })
)

(define-public (create-goal (user principal) (goal-id uint) (target uint) (deadline uint) (reward-amount uint))
    (begin
        (asserts! (> target u0) ERR-INVALID-GOAL)
        (asserts! (> deadline stacks-block-height) ERR-INVALID-GOAL)
        (asserts! (is-none (get-user-goal user goal-id)) ERR-GOAL-EXISTS)
        
        (ok (map-set user-goals 
            { user: user, goal-id: goal-id }
            {
                target: target,
                deadline: deadline,
                achieved: false,
                reward-amount: reward-amount
            }
        ))
    )
)

(define-public (mark-goal-achieved (user principal) (goal-id uint))
    (let ((current-goal (unwrap! (get-user-goal user goal-id) ERR-NO-SUCH-GOAL)))
        (ok (map-set user-goals
            { user: user, goal-id: goal-id }
            (merge current-goal { achieved: true })
        ))
    )
)