# Car Accident Insurance Claim

![Card Insurance logo](https://user-images.githubusercontent.com/3188163/124211350-a0875b00-daf5-11eb-9b11-881917e4737f.png)

Car Accident Insurance Claim chaincode for the Hyperledger Fabric based on the FSRA Ontario - https://www.fsrao.ca/consumers/auto-insurance/after-accident-understanding-claims-process

## Business logic states
Chaincode business logic can go through several states:
* No claim (invalid state)
* Claim filed
* Claim rejected
* Coverage Established
* Coverage is paid

![Car Accident Insurance Claim - State Diagram](https://user-images.githubusercontent.com/3188163/124210369-f65b0380-daf3-11eb-9738-8180bf1912bd.png)

## Operations and allowed roles
Operation | Allowed roles
------------ | -------------
fileClaim | Driver
getClaim | Driver, Claims Adjuster, Insurance Company Manager
rejectClaim | Claims Adjuster, Insurance Company Manager
establishCoverage | Claims Adjuster
closeClaim | Insurance Company Manager
