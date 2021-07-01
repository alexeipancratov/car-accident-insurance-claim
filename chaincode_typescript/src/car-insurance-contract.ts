/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { CarAccidentInsuranceClaim } from './models/car-accident-insurance-claim';
import { ClaimStatus } from './models/claim-status';
import { CLAIMS_ADJUSTER, DRIVER, INSURANCE_COMPANY_MANAGER } from './roles';

@Info({title: 'Car Insurance', description: 'Smart Contract for handling car accident insurance claims.' })
export class CarInsuranceContract extends Contract {
    @Transaction()
    public async fileClaim(ctx: Context, claimDataJson: string): Promise<void> {
        this.checkRoleIsValid(ctx, DRIVER);

        const claim = JSON.parse(claimDataJson) as CarAccidentInsuranceClaim;

        const exists: boolean = await this.claimExists(ctx, claim.id);
        if (exists) {
            throw new Error(`The product ${claim.id} already exists.`);
        }

        this.requireField(claim.accidentDate, 'accidentDate');
        this.requireField(claim.accidentDescription, 'accidentDescription');
        this.requireField(claim.accidentLocation, 'accidentLocation');
        this.requireField(claim.carLicensePlateNumber, 'carLicensePlateNumber');
        this.requireField(claim.carMake, 'carMake');
        this.requireField(claim.carManufactureYear, 'carManufactureYear');
        this.requireField(claim.carModel, 'carModel');
        this.requireField(claim.carRegistration, 'carRegistration');
        this.requireField(claim.driverLicenseNumber, 'driverLicenseNumber');
        this.requireField(claim.driverName, 'driverName');
        this.requireField(claim.injuriesExtent, 'injuriesExtent');
        this.requireField(claim.investigatingOfficer, 'investigatingOfficer');
        this.requireField(claim.numberOfPassengers, 'numberOfPassengers');
        this.requireField(claim.policyNumber, 'policyNumber');
        this.requireField(claim.vehicleDamageExtent, 'vehicleDamageExtent');

        claim.status = ClaimStatus.Filed;
        claim.coverageAmount = 0;

        await ctx.stub.putState(claim.id, Buffer.from(JSON.stringify(claim)));
    }

    @Transaction(false)
    @Returns('CarAccidentInsuranceClaim')
    public async getClaim(ctx: Context, claimId: string) {
        this.checkRoleIsValid(ctx, DRIVER, CLAIMS_ADJUSTER, INSURANCE_COMPANY_MANAGER);

        const exists: boolean = await this.claimExists(ctx, claimId);
        if (!exists) {
            throw new Error(`The claim ${claimId} does not exist.`);
        }

        return this.readClaim(ctx, claimId);
    }

    @Transaction()
    public async rejectClaim(ctx: Context, claimId: string) {
        this.checkRoleIsValid(ctx, CLAIMS_ADJUSTER, INSURANCE_COMPANY_MANAGER);

        const stateAsBytes = await ctx.stub.getState(claimId);
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.Rejected;

        return ctx.stub.putState(claimId, Buffer.from(JSON.stringify(state)));
    }

    @Transaction()
    public async establishCoverage(ctx: Context, claimId: string, coverageAmount: number) {
        this.checkRoleIsValid(ctx, CLAIMS_ADJUSTER);

        const stateAsBytes = await ctx.stub.getState(claimId);
        const state = JSON.parse(stateAsBytes.toString());
        state.coverageAmount = coverageAmount;
        state.status = ClaimStatus.CoverageEstablished;

        return ctx.stub.putState(claimId, Buffer.from(JSON.stringify(state)));
    }

    @Transaction()
    public async closeClaim(ctx: Context, claimId: string) {
        this.checkRoleIsValid(ctx, INSURANCE_COMPANY_MANAGER);

        const stateAsBytes = await ctx.stub.getState(claimId);
        const state = JSON.parse(stateAsBytes.toString());
        state.status = ClaimStatus.CoverageIsPaid;

        return ctx.stub.putState(claimId, Buffer.from(JSON.stringify(state)));
    }

    private async claimExists(ctx: Context, claimId: string): Promise<boolean> {
        const data = await ctx.stub.getState(claimId);
        return (!!data && data.length > 0);
    }

    private async readClaim(ctx: Context, claimId: string): Promise<CarAccidentInsuranceClaim> {
        const data = await ctx.stub.getState(claimId);
        const claim = JSON.parse(data.toString()) as CarAccidentInsuranceClaim;

        return claim;
    }

    private requireField(value: string | number, fieldName: string) {
        if (!value) {
            throw new Error(`The '${fieldName}' field is required.`);
        }
    }

    private checkRoleIsValid(ctx: Context, ...allowedRoles: string[]) {
        const role = ctx.clientIdentity.getAttributeValue('role');
        const isValidRole = role && allowedRoles.includes(role);

        if (!isValidRole) {
            throw new Error('Current user cannot perform this operation.');
        }
    }
}
