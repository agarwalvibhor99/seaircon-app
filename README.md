# SE Aircon CRM App

This is the repository for the SE Aircon CRM application, a comprehensive customer relationship management system for managing air conditioning sales and services.

## Project Structure

- `src/` - Main source code for the Next.js application
  - `app/` - Next.js app directory structure
  - `components/` - React components
  - `lib/` - Utility functions, services, and types

- `public/` - Static assets

- `docs/` - Documentation, guides, and troubleshooting information
  - See the SE_AIRCON_CRM_COMPREHENSIVE_GUIDE.md for complete documentation

- `tests/` - Tests and debugging utilities
  - Contains test scripts, debugging tools, and QA related files

- `setup/` - Setup scripts and database schema
  - Contains scripts for setting up the application, database schema, and initial data

- `scripts/` - Utility scripts for development and deployment
  - Contains scripts for starting the application in different modes

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   ```
   ./setup/setup.sh
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   
   Or use the script:
   ```
   ./scripts/start-dev.sh
   ```

## Testing

Run tests using:
```
node tests/run-tests.js
```

## Documentation

See the `docs` folder for comprehensive documentation, guides, and troubleshooting information.

## License

Copyright © 2025 SE Aircon
