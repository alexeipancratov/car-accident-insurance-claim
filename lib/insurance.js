/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const CarAccidentInsuranceClaim = require('./carAccidentInsuranceClaim');

class InsuranceState {
    constructor(status, claim) {
        this.status = status;
        this.claim = claim;
    }
}

const ClaimStatus = Object.freeze({
    NoClaim: 0,
    Filed: 1,
    Rejected: 2,
    CoverageEstablished: 3,
    CoverageIsPaid: 4
});

class Insurance extends Contract {
    async fileClaim(ctx, policyNumber, carMaker, carModel, carYear, carRegistration, licencePlateNumber,
        driverName, licenceNumber,
        accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer) {
        const claim = new CarAccidentInsuranceClaim(policyNumber);
        claim.setCarDetails(carMaker, carModel, carYear, carRegistration, licencePlateNumber);
        claim.setAccidentDetails(driverName, licenceNumber);
        claim.setMainDetails(accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer);

        await ctx.stub.putState(new InsuranceState(ClaimStatus.Filed, claim));

        return claim;
    }

    async rejectClaim(ctx) {
        const stateAsBytes = await ctx.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.Rejected;

        await ctx.stub.putState(state);
    }

    async establishCoverage(ctx, coverageAmount) {
        const stateAsBytes = await ctx.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());
        state.coverageAmount = coverageAmount;

        await ctx.stub.putState(state);
    }

    async closeClaim(ctx) {
        const stateAsBytes = await ctx.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.CoverageIsPaid;

        await ctx.stub.putState(state);
    }
}

module.exports = Insurance;
