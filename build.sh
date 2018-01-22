rm -rf ./out-tsc
rm -rf ./publish
yarn ngc -p src/lib/tsconfig-build.json -t es2015 --outDir out-tsc/lib/es2015
yarn ngc -p src/lib/tsconfig-build.json -t es5 --outDir out-tsc/lib/es5
yarn rollup -c src/lib/rollup.config.js -f es -i out-tsc/lib/es2015/vdom.js -o publish/esm2015/vdom.js -e tslib
yarn rollup -c src/lib/rollup.config.js -f es -i out-tsc/lib/es5/vdom.js -o publish/esm5/vdom.js -e tslib
yarn rollup -c src/lib/rollup.config.js -f umd -i out-tsc/lib/es5/vdom.js -o publish/bundles/vdom.umd.js
yarn rollup -c src/lib/rollup.config.js -f umd -i out-tsc/lib/es5/vdom.js -o publish/bundles/vdom.umd.min.js --environment MINIFY
rsync -avr --exclude=*.js --exclude=*.map out-tsc/lib/es2015/ publish
cp src/lib/package.json publish
cp README.md publish
