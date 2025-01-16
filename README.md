# NFT Art Generator

This project is an open-source NFT art generator that allows users to create NFTs with customizable attributes. It is designed to be easy to use and extend.

## Features

- Generate NFTs with customizable attributes
- Easily extendable for additional features
- Supports art generation from a collection

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/0xGF/nft-art-generator.git
   cd nft-art-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. **Modify Configuration**: Customize your NFT attributes by modifying the `src/config/config.ts` file. Refer to the `examples/example-config.ts` file for guidance.

2. **Build the Project**: Compile the TypeScript files to JavaScript.

   ```bash
   npm run build
   ```

3. **Generate Collection**: Run the script to generate a collection of attributes.

   ```bash
   npm run generate-collection
   ```

4. **Generate Assets**: Use the generated collection to create NFT assets.

   ```bash
   npm run generate-assets
   ```

5. **Run Playground**: Experiment with different configurations and test your setup.

   ```bash
   npm run playground
   ```

6. **Start the Generator**: Run the main generator script.
   ```bash
   npm run start
   ```

## Testing

To run tests, ensure you have a testing framework set up (e.g., Jest). You can add a test script in your `package.json` and run it:

```json
"scripts": {
  "test": "jest"
}
```

Then execute:

```bash
npm test
```

## Example

See the `examples/` directory for example configurations and usage.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
