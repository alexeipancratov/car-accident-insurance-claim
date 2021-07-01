/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');
import { describe } from 'mocha';
import { CarAccidentInsuranceClaim } from './models/car-accident-insurance-claim';
import { CarInsuranceContract } from './car-insurance-contract';
import { CLAIMS_ADJUSTER, DRIVER } from './roles';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

const createNewClaim = (): CarAccidentInsuranceClaim => {
    const claim = new CarAccidentInsuranceClaim();
    claim.id = '1005';
    claim.accidentDate = '2021-07-01T21:06:16.727Z';
    claim.accidentDescription = 'Mild crash at a intersection';
    claim.accidentLocation = 'Toronto, ON';
    claim.carLicensePlateNumber = 'CCDN5';
    claim.carMake = 'BMW';
    claim.carManufactureYear = 2017;
    claim.carModel = 'X6';
    claim.carRegistration = 'CAN';
    claim.driverLicenseNumber = '112BBA';
    claim.driverName = 'John Doe';
    claim.injuriesExtent = 'Mild';
    claim.investigatingOfficer = 'Rob Johnson, #123';
    claim.numberOfPassengers = 3;
    claim.policyNumber = 'P11123415';
    claim.vehicleDamageExtent = 'Mild';

    return claim;
};

describe('CarInsuranceContract', () => {

    let contract: CarInsuranceContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new CarInsuranceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from(`{
            "id": "1001",
            "accidentDate": "2021-06-30T21:06:16.727Z",
            "accidentDescription": "Mild crash at a intersection",
            "accidentLocation": "Toronto, ON",
            "carLicensePlateNumber": "CCDN5",
            "carMake": "BMW",
            "carManufactureYear": 2017,
            "carModel": "X6",
            "carRegistration": "CAN",
            "driverLicenseNumber": "112BBA",
            "driverName": "John Doe",
            "injuriesExtent": "Mild",
            "investigatingOfficer": "Rob Johnson, #123",
            "numberOfPassengers": 3,
            "policyNumber": "P11123415",
            "vehicleDamageExtent": "Mild"
        }`));
    });

    describe('#fileClaim', () => {
        beforeEach(() => {
            ctx.clientIdentity.getAttributeValue.withArgs('role').returns(DRIVER);
        });

        it('should accept and save a valid claim', async () => {
            const claim = createNewClaim();
            await contract.fileClaim(ctx, JSON.stringify(claim));
            ctx.stub.putState.should.have.been.calledOnceWith(claim.id);
        });

        it('should throw an error for a product with missing accidentDate', async () => {
            const claim = createNewClaim();
            claim.accidentDate = '';
            await contract.fileClaim(ctx, JSON.stringify(claim)).should.be.rejectedWith(/The 'accidentDate' field is required./);
        });

        it('should throw an error for a product with missing accidentDescription', async () => {
            const claim = createNewClaim();
            claim.accidentDescription = '';
            await contract.fileClaim(ctx, JSON.stringify(claim)).should.be.rejectedWith(/The 'accidentDescription' field is required./);
        });

        it('should throw an error given a user with a role other than "DRIVER"', async () => {
            ctx.clientIdentity.getAttributeValue.withArgs('role').returns(CLAIMS_ADJUSTER);

            const claim = createNewClaim();

            await contract.fileClaim(ctx, JSON.stringify(claim)).should.be.rejectedWith(/Current user cannot perform this operation./);
        });
    });

    describe('#getClaim', () => {
        beforeEach(() => {
            ctx.clientIdentity.getAttributeValue.withArgs('role').returns(DRIVER);
        });

        it('should return a claim', async () => {
            const expectedClaim = new CarAccidentInsuranceClaim();
            expectedClaim.id = '1001';
            expectedClaim.accidentDate = '2021-06-30T21:06:16.727Z';
            expectedClaim.accidentDescription = 'Mild crash at a intersection';
            expectedClaim.accidentLocation = 'Toronto, ON';
            expectedClaim.carLicensePlateNumber = 'CCDN5';
            expectedClaim.carMake = 'BMW';
            expectedClaim.carManufactureYear = 2017;
            expectedClaim.carModel = 'X6';
            expectedClaim.carRegistration = 'CAN';
            expectedClaim.driverLicenseNumber = '112BBA';
            expectedClaim.driverName = 'John Doe';
            expectedClaim.injuriesExtent = 'Mild';
            expectedClaim.investigatingOfficer = 'Rob Johnson, #123';
            expectedClaim.numberOfPassengers = 3;
            expectedClaim.policyNumber = 'P11123415';
            expectedClaim.vehicleDamageExtent = 'Mild';

            await contract.getClaim(ctx, '1001').should.eventually.deep.equal(expectedClaim);
        });

        it('should throw an error for a claim that does not exist', async () => {
            await contract.getClaim(ctx, '2001').should.be.rejectedWith(/The claim 2001 does not exist/);
        });

        it('should throw an error for a user role other than DRIVER, CLAIMS_ADJUSTER or INSURANCE_COMPANY_MANAGER', async () => {
            ctx.clientIdentity.getAttributeValue.withArgs('role').returns('invalidRole');
            await contract.getClaim(ctx, '1001').should.be.rejectedWith(/Current user cannot perform this operation./);
        });
    });
});
