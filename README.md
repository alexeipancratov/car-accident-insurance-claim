<p align="center">
  <img src="https://user-images.githubusercontent.com/3188163/122795823-62ed2b80-d2c6-11eb-87d2-af4ff18f1518.png" />
</p>

# Car Accident Insurance Claim chaincode for the Hyperledger Fabric

The chaincode is designed to facilitate the process of handling car accident insurance claims.

## Chaincode state machine
The state machine of the chaincode consists of five states. The transitions between them represent chaincode functions which enfore business rules.

![Car Accident Insurance Claim - State Diagram](https://user-images.githubusercontent.com/3188163/122796801-7b117a80-d2c7-11eb-8ea5-423eb08f4d28.png)

## Chaincode functions
* fileClaim - allows users with the role 'driver' to file an insurance claim
* rejectClaim - allows users with the role 'claimsAdjuster' to reject an insurance claim
* establishCoverage - allows users with the role 'claimsAdjuster' to establish the coverage for an insurance claim
* closeClaim - allows users with the role 'insuranceCompanyManager' to close an insurance claim and mark it as paid
