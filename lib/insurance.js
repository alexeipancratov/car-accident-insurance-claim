/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const CarAccidentInsuranceClaim = require('./carAccidentInsuranceClaim');
const ClaimStatus = require('./claimStatus');
const InsuranceState = require('./insuranceClaimState');

class Insurance extends Contract {
    async fileClaim(ctx, policyNumber, carMaker, carModel, carYear, carRegistration, licencePlateNumber,
        driverName, licenceNumber,
        accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer) {
        const claim = new CarAccidentInsuranceClaim(policyNumber);
        claim.setCarDetails(carMaker, carModel, carYear, carRegistration, licencePlateNumber);
        claim.setAccidentDetails(driverName, licenceNumber);
        claim.setMainDetails(accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer);

        await ctx.stub.putState(new InsuranceState(ClaimStatus.Filed, claim));
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
        state.status = ClaimStatus.CoverageEstablished;

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
