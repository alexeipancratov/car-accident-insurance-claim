'use strict';

class CarAccidentInsuranceClaim {
    constructor(policyNumber) {
        this.policyNumber = policyNumber;
    }

    setCarDetails(make, model, year, registration, licensePlateNumber) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.registration = registration;
        this.licensePlateNumber = licensePlateNumber;
    }

    setAccidentDetails(driverName, licenceNumber) {
        this.driverName = driverName;
        this.licenceNumber = licenceNumber;
    }

    setMainDetails(accidentDate, accidentLocation, injuriesExtent, numberOfPassengers, vehicleDamageExtent, accidentDescription, investigatingOfficer) {
        this.accidentDate = accidentDate;
        this.accidentLocation = accidentLocation;
        this.injuriesExtent = injuriesExtent;
        this.numberOfPassengers = numberOfPassengers;
        this.vehicleDamageExtent = vehicleDamageExtent;
        this.accidentDescription = accidentDescription;
        this.investigatingOfficer = investigatingOfficer;
    }

    setCoverageAmount(amount) {
        this.coverageAmount = amount;
    }
}

module.exports = CarAccidentInsuranceClaim;