
# AwsStandardVpcTemplate

This CDK template is a reasonable starting for setting up a standard VPC, and the neccessary bits that make a VPC usable.

### Why need VPC

Most of time, an AWS account at least need to have one VPC. There are some cases when you don't need VPC at all. 

For example, if you are only using these AWS services:

* Lambda : lambda execution environments do not reside inside any of the VPCs owned by you. Instead they run inside a secured VPC called "Lambda Service VPC" which is managed by AWS.
* SQS, DynamoDB, Route 53, S3: same as Lambda, they don't reside in VPCs owned by you.

There are some other AWS services that don't need VPC, here we just deal with the case that need a VPC.


# Terminology

### What is a VPC?

Amazon Virtual Private Cloud (Amazon VPC) enables you to launch AWS resources into a virtual network that you've defined. This virtual network closely resembles a traditional network that you'd operate in your own data center, with the benefits of using the scalable infrastructure of AWS.


### What is a subnet?

A subnet is a range of IP addresses in your VPC. You can launch AWS resources into a specified subnet. Use a public subnet for resources that must be connected to the internet, and a private subnet for resources that won't be connected to the internet.

Subnet is defined with [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) notation.


# What will this template set up?

3 Availability Zones, each availability zone will have one public subnet and one private subnet. We make each subnet a `/19`. This means each subnet can hold `2^(32-19)-3` or `8,189` hosts. Here we have six subnets, so we can have 24,567 hosts.

Here are them:

* Availability Zone 1 : public subnet `10.0.0.0/19`, private subnet `10.0.32.0/19`
* Availability Zone 2 : public subnet `10.0.64.0/19`, private subnet `10.0.96.0/19`
* Availability Zone 3 : public subnet `10.0.128.0/19`, private subnet `10.0.160.0/19`

`10.0.192.0/19` and `10.0.224.0/19` are left as "extra". You could create extra subnets later in an AZ you’re already using.

# VPC Best Practices

* Avoid VPC Peering where possible.
