# web socket chat notes to self

https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-wscat.html

place lambdas in root of src directory. This ensures the dependencies are packaged along with them properly when the stack is deployed

# Basic lambda with s3 bucket created using cdk

The cdk stack is located in the 'lib' directory. This file is where all the definitions for the AWS resources go.

The actual lambda function code is a function exported from the 'lambdaHandler' file.

The 'MyLambda' file contains a class constructor for creating a lambda with an S3 bucket and read and write permission from the lambda to the bucket.
The instance of the lambda in this constructor has the lambda handler attached to it.

The output directory of the compiled typescript is in the 'dist' directory. This avoids having a bunch of compiled js files sitting in the working directory

If the contents of the 'dist' directory is too large the lambda code won't deploy. To ensure it stays small the 'npm install' command in the 'MakeFile' has the '--only=production' flag to ensure only the necessary dependencies are added to the 'node_modules'.

Also ensured only the necessary dependencies were under 'dependencies' in the 'package.json' and the rest were under 'devDependencies'

The 'MakeFile' contains a list of commands under the 'pkg' command to package the project up into the 'dist' directory.
The 'clean' command was to clear the working directory because i kept messing up the 'pkg' command lol

Code can be tested by finding the stack created in the aws console cloudwatch and clicking on the lambda function. Theres a button to create a test event and run it there

# Run instructions

clone repo
npm install
cdk bootstrap
make pkg
cdk deploy
note: cdk commands require an aws account and aws cli installed

# Commands

cdk init (to start cdk project)
cdk init --language typescript (start cdk project with typescript)
cdk bootsrap (to set up cdk environment on AWS)
cdk synth (I forget ngl)
make pkg (to compile and package code into dist directory)
cdk deploy (to deploy code to aws)
cdk deploy --context environment=blah (deploy code but add context environments from cmd line(can be added into config instead))
du -sh \* (list sizes of all files/folders in current directory)
