'use strict';

const assert = require('assert');
const Insurance = require('../lib/insurance');
const CarAccidentInsuranceClaim = require('../lib/carAccidentInsuranceClaim');

describe('Insurance', () => {
    describe('#fileClaim()', () => {
        it('should return', async () => {
            const insuranceInstance = new Insurance();
            const claim = new CarAccidentInsuranceClaim('P11123415');
            claim.setCarDetails('BMW', 'X6', 2017, 'CAN', 'CCDN5');
            claim.setAccidentDetails('John Wick', '112BBA');
            claim.setMainDetails(new Date().toString(), 'Toronto, ON', 10, 3, 30, 'Mild crash at a intersection', 'Rob Johnson, 111235');

            const result = await insuranceInstance.fileClaim(null, claim.policyNumber);

            assert.ok(result);
        });
    });
});
