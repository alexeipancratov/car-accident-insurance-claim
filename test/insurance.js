'use strict';

const { Stub } = require('fabric-shim');
const sinon = require('sinon');
const Insurance = require('../lib/insurance');
const CarAccidentInsuranceClaim = require('../lib/carAccidentInsuranceClaim');
const CarAccidentInsuranceClaimContext = require('../lib/carAccidentInsuranceClaimContext');
const ClaimStatus = require('../lib/claimStatus');
const { expect } = require('chai');
const InsuranceState = require('../lib/insuranceClaimState');

describe('Insurance', () => {
    let sandbox = sinon.createSandbox();
    let mockStubApi;

    beforeEach(() => {
        mockStubApi = sandbox.createStubInstance(Stub);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#fileClaim()', () => {
        it('should set Filed status given correct input data', async () => {
            const insuranceInstance = new Insurance();
            const claim = new CarAccidentInsuranceClaim('P11123415');
            claim.setCarDetails('BMW', 'X6', 2017, 'CAN', 'CCDN5');
            claim.setAccidentDetails('John Wick', '112BBA');
            claim.setMainDetails(new Date().toString(), 'Toronto, ON', 10, 3, 30, 'Mild crash at a intersection', 'Rob Johnson, 111235');

            const ctx = new CarAccidentInsuranceClaimContext();
            ctx.stub = mockStubApi;

            await insuranceInstance.fileClaim(ctx, claim.policyNumber);

            expect(ctx.stub.putState.getCall(0).args).to.satisfy(args => args[0].status === ClaimStatus.Filed);
        });
    });

    describe('#rejectClaim()', () => {
        it('should set Rejected status', async () => {
            const insuranceInstance = new Insurance();
            mockStubApi.getState.resolves(Buffer.from(JSON.stringify(new InsuranceState(null, null))));

            const ctx = new CarAccidentInsuranceClaimContext();
            ctx.stub = mockStubApi;

            await insuranceInstance.rejectClaim(ctx);

            expect(ctx.stub.putState.getCall(0).args).to.satisfy(args => args[0].status === ClaimStatus.Rejected);
        });
    });

    describe('#establishCoverage()', () => {
        it('should set CoverageEstablished status and coverage amount', async () => {
            const insuranceInstance = new Insurance();
            mockStubApi.getState.resolves(Buffer.from(JSON.stringify(new InsuranceState(null, null))));

            const ctx = new CarAccidentInsuranceClaimContext();
            ctx.stub = mockStubApi;

            const coverageAmount = 1000;

            await insuranceInstance.establishCoverage(ctx, coverageAmount);

            expect(ctx.stub.putState.getCall(0).args).to.satisfy(args => args[0].status === ClaimStatus.CoverageEstablished &&
                args[0].coverageAmount === coverageAmount);
        });
    });

    describe('#closeClaim()', () => {
        it('should set CoverageIsPaid status', async () => {
            const insuranceInstance = new Insurance();
            mockStubApi.getState.resolves(Buffer.from(JSON.stringify(new InsuranceState(null, null))));

            const ctx = new CarAccidentInsuranceClaimContext();
            ctx.stub = mockStubApi;

            await insuranceInstance.closeClaim(ctx);

            expect(ctx.stub.putState.getCall(0).args).to.satisfy(args => args[0].status === ClaimStatus.CoverageIsPaid);
        });
    });
});
