# NFT Generator

This project is an open-source NFT generator that allows users to create NFTs once the code is set up. It is designed to be easy to use and extend.

## Features

- Generate NFTs with customizable attributes
- Interact with blockchain networks
- Easily extendable for additional features

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/nft-generator.git
   cd nft-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Configure your environment variables in a `.env` file:

   ```
   INFURA_PROJECT_ID=your_infura_project_id
   WALLET_PRIVATE_KEY=your_wallet_private_key
   ```

2. Modify the `examples/example-config.js` file to customize your NFT attributes.

3. Run the generator:
   ```bash
   node generate.js
   ```

## Example

See the `examples/` directory for example configurations and usage.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
