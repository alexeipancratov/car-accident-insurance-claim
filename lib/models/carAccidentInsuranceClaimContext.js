'use strict';

const { Context } = require('fabric-contract-api');

class CarAccidentInsuranceClaimContext extends Context {
    async getCurrentStatus() {
        const stateAsBytes = await this.stub.getState();
        const state = JSON.parse(stateAsBytes.toString());

        return state.status;
    }
}

module.exports = CarAccidentInsuranceClaimContext;
