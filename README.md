## Development

Run `vc dev` to start serving the app.

## Deployment

Run `vc --prod` to deploy the app via [Vercel](https://vercel.com).

## Bundle Analysis

1. `npm -g install webpack-bundle-analyzer`
2. `yarn run --silent webpack --profile --json > stats.json`
3. `webpack-bundle-analyzer stats.json`
