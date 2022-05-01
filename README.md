
# AwsStandardVpcTemplate

This CDK template is a reasonable starting for setting up a standard VPC.

You can just download this package, and do `cdk deploy` to AWS, and then you will have a VPC ready to use.

I basically followed this [guide](https://medium.com/aws-activate-startup-blog/practical-vpc-design-8412e1a18dcc).

There are two ways of using this package, depends how you use AWS account.

### First case: one VPC per service

This happens when you are using "micro AWS account strategy", basically means each microservice will have:

* A delicated AWS account
* A delicated VPC(if it needs VPC)
* A delicated CDK pacakge for the microservice
* A delicated pipeline

In this case, you just used this package to setup the VPC for your micro-service. This is what I prefer how to use this package, also some companies that I worked for also use the "micro AWS account" stratgy.

See [FactSet's micor AWS account use case](https://aws.amazon.com/blogs/architecture/field-notes-how-factset-uses-microaccounts-to-reduce-developer-friction-and-maintain-security-at-scale/).

In my opinion, this is the approach that's good no matter you are just a startup on early stage or rapidly scaling stage, or a big company that's moving to cloud.

### Section case: shared VPC

This happens when you are using "macro AWS account strategy", basically means that multiple microservices will share the same VPC.

In this case, the package is not that helpful comparing to the first case. It's more like a starting point or even just a reference. 

# When need VPC

Most of time, an AWS account at least need to have one VPC and also probably only need one. There are some cases when you don't need VPC at all. 

For example, if you are only using these AWS services:

* Lambda : lambda execution environments do not reside inside any of the VPCs owned by you. Instead they run inside a secured VPC called "Lambda Service VPC" which is managed by AWS.
* SQS, DynamoDB, Route 53, S3: same as Lambda, they don't reside in VPCs owned by you.

There are some other AWS services that don't need VPC, here we just deal with the case that when a VPC is needed.

# Terminology

### What is a VPC?

Amazon Virtual Private Cloud (Amazon VPC) enables you to launch AWS resources into a virtual network that you've defined. This virtual network closely resembles a traditional network that you'd operate in your own data center, with the benefits of using the scalable infrastructure of AWS.

### Regions and Zones

See [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html).

### What is a subnet?

A subnet is a range of IP addresses in your VPC. You can launch AWS resources into a specified subnet. Use a public subnet for resources that must be connected to the internet, and a private subnet for resources that won't be connected to the internet.

Subnet is defined with [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) notation.


# The components of this VPC

#### Main route table

We don't need to create it, as by default each VPC has a main route table. Main route table has a default route enabling communication between resources in all subnets in a VPC. Default route rule CANNOT be deleted/edited. However, you can add/edit/delete other routing rules to the main route table

#### Address Space

We’ll use `10.0.0.0/16` as the VPC's address space.

#### 3 Availability Zones, each has 1 public subnet and 1 private subnet

This VPC will have 3 Availability Zones. Each availability zone will have one public subnet and one private subnet. We make each subnet a `/19`. This means each subnet can hold `2^(32-19)-3` or `8,189` hosts. Here we have six subnets, so we can have 24,567 hosts.

We need to divide the address space up evenly so the layout of each AZ is the same as the others. When you create resources like autoscaling groups, you want them to be evenly distributed. Failed to do so may cause maintenance nightmare.

Here are them:

* Availability Zone 1 `10.0.0.0/18` : public subnet `10.0.0.0/19`, private subnet `10.0.32.0/19`
* Availability Zone 2 `10.0.64.0/18` : public subnet `10.0.64.0/19`, private subnet `10.0.96.0/19`
* Availability Zone 3 `10.0.128.0/18` : public subnet `10.0.128.0/19`, private subnet `10.0.160.0/19`

Spare Availability Zone :  
* Availability Zone 4 `10.0.192.0/18` : public subnet `10.0.192.0/19`, private subnet `10.0.224.0/19`

`10.0.192.0/19` and `10.0.224.0/19` are left as "extra". You could create extra subnets later in an AZ you’re already using.

#### VPC Endpoints

VPC endpoints allow traffic to flow between a VPC and other services without ever leaving the Amazon network.

Here is the list of VPC Endpoints we are going to setup for the VPC:

__VPC Interface Endpoints:__  

* ECRDockerEndpoint
* ECREndpoint
* SecretManagerEndpoint
* CloudWatchEndpoint
* CloudWatchLogsEndpoint
* CloudWatchEventsEndpoint
* SSMEndpoint

__VPC Gateway Endpoints:__

* S3GatewayEndpoint

# VPC Best Practices

* Avoid VPC Peering where possible.
* Always follow principle of least privilege. Be very cautious about making anything public accessible, also when put resource in public subnet.
* Make availability zone address space evently distributed. Use it well for fault tolerance.
