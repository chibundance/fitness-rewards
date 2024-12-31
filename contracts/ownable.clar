;; ownable.clar
;; Define the trait for contract ownership

(define-trait ownable-trait
    (
        ;; Get the contract owner
        (get-contract-owner () (response principal uint))

        ;; Transfer ownership of the contract
        (transfer-ownership (principal) (response bool uint))

        ;; Check if caller is contract owner
        (is-contract-owner (principal) (response bool uint))
    )
)