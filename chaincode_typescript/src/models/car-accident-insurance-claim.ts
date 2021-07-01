import { Object as FabricObject, Property } from 'fabric-contract-api';
import { ClaimStatus } from './claim-status';

@FabricObject()
export class CarAccidentInsuranceClaim {
    @Property()
    id: string;

    @Property()
    policyNumber: string;

    @Property()
    carMake: string;

    @Property()
    carModel: string;

    @Property()
    carManufactureYear: number;

    @Property()
    carRegistration: string;

    @Property()
    carLicensePlateNumber: string;

    @Property()
    driverName: string;

    @Property()
    driverLicenseNumber: string;

    @Property()
    accidentDate: string;

    @Property()
    accidentLocation: string;

    @Property()
    injuriesExtent: string;

    @Property()
    numberOfPassengers: number;

    @Property()
    vehicleDamageExtent: string;

    @Property()
    accidentDescription: string;

    @Property()
    investigatingOfficer: string;

    @Property()
    coverageAmount: number;

    @Property()
    status: ClaimStatus;
}