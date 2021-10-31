pkg:
	rm -r dist || true
	rm -r cdk.out || true
	mkdir dist
	./node_modules/.bin/tsc
	cp package.json dist
	cp package-lock.json dist
	cp Makefile dist
	cp .npmrc dist
	cd dist && npm install --only=production
	# only installs node_modules that are essential for production to keep the size small for the lambda handler

clean:
	rm ./lib/myLambda.js
	rm ./lib/myLambda.d.ts
	rm ./lib/cdk-practice-stack.d.ts
	rm ./lib/cdk-practice.test.d.ts
	rm ./lib/cdk-practice-stack.js
	rm ./resources/lambda.d.ts
	rm ./resources/lambda.js
	rm ./bin/cdk-practice.d.ts
	rm ./bin/cdk-practice.js
	rm ./test/cdk-practice.test.d.ts
	rm ./test/cdk-practice.test.js

