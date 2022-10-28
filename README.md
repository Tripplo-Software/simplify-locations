<div align="center">
<img src="https://res.cloudinary.com/wemakeart/image/upload/v1666930560/tripplo/location-service/simplify-locations-icon_xv8bac.gif" width=150px height="150px"  alt="simplify-locations-icon"/>
</div>

# Simplify Locations

This package serves as a basic abstraction utility library for [AWS Location-Service meant](https://aws.amazon.com/location), purposefully built to be used on the back-end with [Serverless Stack](https://sst.dev) or [Serverless Framework](https://www.serverless.com). It currently does not have full coverage of the AWS Location Service, only the parts that we needed, more info below.

# Requirements

* A credential file with a default profile or supplying a custom profile is required to use this package.
* An existing place-index or route-calculator is required depending on which helper you're planning to use.

# Authentication

* Default - The default behavior for this package is to use your `default` AWS profile within the credentials or the default AWS account environment variables.
* Custom Profile - If you wish to use a custom AWS profile, in a sandbox environment for example, you add the optional params `region` & `profile` to your request. The package will then attempt to retrieve the defined profile from your credentials file.

# What is the added value compared to aws-sdk?

* Central package for all re-used AWS Location-Service helpers/utilities.
* Batched Concurrency for handling large amounts of location-service requests.
* Built-in back-off/retry behavior in case of failure. 

# Usage Example

A simple serverless REST-API request handler. Where an address string is passed to the handler and geocoded data is returned for the supplied addres.

<img src="https://res.cloudinary.com/wemakeart/image/upload/v1666931687/tripplo/location-service/geocode-address-npm-example_q4eish.png" width="60%" height="60%" alt="usage-example"/>

Below is an example of the returned result within Insomnia:

<img src="https://res.cloudinary.com/wemakeart/image/upload/v1666932237/tripplo/location-service/geocode-result-npm-example_eut7af.png" width="80%" height="80%" alt="usage-example"/>