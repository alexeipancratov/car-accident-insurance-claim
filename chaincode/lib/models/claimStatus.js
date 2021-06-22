'use strict';

const ClaimStatus = Object.freeze({
    NoClaim: 0,
    Filed: 1,
    Rejected: 2,
    CoverageEstablished: 3,
    CoverageIsPaid: 4,
});

module.exports = ClaimStatus;