## Development

Run `now dev` to start serving the app.

## Deployment

Run `now --target production` to deploy the app via [Now](https://now.sh).

## Bundle Analysis

1. `npm -g install webpack-bundle-analyzer`
2. `yarn run --silent webpack --profile --json > stats.json`
3. `webpack-bundle-analyzer stats.json`
