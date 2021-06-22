/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const CarAccidentInsuranceClaim = require('./models/carAccidentInsuranceClaim');
const ClaimStatus = require('./models/claimStatus');
const InsuranceState = require('./models/insuranceClaimState');

class Insurance extends Contract {
    async fileClaim(ctx, policyNumber, carMaker, carModel, carYear, carRegistration, licencePlateNumber,
        driverName, licenceNumber,
        accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer) {

        const claim = new CarAccidentInsuranceClaim(policyNumber);
        claim.setCarDetails(carMaker, carModel, carYear, carRegistration, licencePlateNumber);
        claim.setAccidentDetails(driverName, licenceNumber);
        claim.setMainDetails(accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer);

        const id = licenceNumber;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(new InsuranceState(ClaimStatus.Filed, claim))));

        return id;
    }

    async getClaim(ctx, id) {
        const stateAsBytes = await ctx.stub.getState(id);

        return stateAsBytes.toString();
    }

    async rejectClaim(ctx, id) {
        const stateAsBytes = await ctx.stub.getState(id);
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.Rejected;

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(state)));
    }

    async establishCoverage(ctx, id, coverageAmount) {
        const stateAsBytes = await ctx.stub.getState(id);
        const state = JSON.parse(stateAsBytes.toString());
        state.coverageAmount = coverageAmount;
        state.status = ClaimStatus.CoverageEstablished;

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(state)));
    }

    async closeClaim(ctx, id) {
        const stateAsBytes = await ctx.stub.getState(id);
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.CoverageIsPaid;

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(state)));
    }
}

module.exports = Insurance;
