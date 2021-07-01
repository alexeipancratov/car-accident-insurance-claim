/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const CarAccidentInsuranceClaim = require('./carAccidentInsuranceClaim');
const ClaimStatus = require('./claimStatus');
const InsuranceState = require('./insuranceClaimState');

class Insurance extends Contract {
    async fileClaim(ctx, claimDataJson) {
        this.checkRoleIsValid(ctx, 'driver');

        const claim = JSON.parse(claimDataJson);
        const id = claim.;

        await ctx.stub.putState(new InsuranceState(ClaimStatus.Filed, claim));
    }

    checkRoleIsValid(ctx, ...allowedRoles) {
        const role = ctx.clientIdentity.getAttributeValue('role');
        const isValidRole = role && allowedRoles.includes(role);

        if (!isValidRole) {
            throw new Error('Current user cannot perform this operation.');
        }
    }

    async rejectClaim(ctx) {
        const cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('hf.role', 'claimsAdjuster')) {
            throw new Error('Only Claims Adjuster can reject claims.');
        }

        const stateAsBytes = await ctx.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.Rejected;

        await ctx.stub.putState(state);
    }

    async establishCoverage(ctx, coverageAmount) {
        const cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('hf.role', 'claimsAdjuster')) {
            throw new Error('Only Claims Adjuster can establish coverage of claims.');
        }

        const stateAsBytes = await ctx.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());
        state.coverageAmount = coverageAmount;
        state.status = ClaimStatus.CoverageEstablished;

        await ctx.stub.putState(state);
    }

    async closeClaim(ctx) {
        const cid = new ClientIdentity(ctx.stub);
        if (cid.assertAttributeValue('hf.role', 'insuranceCompanyManager')) {
            throw new Error('Only the insurance company manager can close claims.');
        }

        const stateAsBytes = await ctx.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.CoverageIsPaid;

        await ctx.stub.putState(state);
    }
}

module.exports = Insurance;
