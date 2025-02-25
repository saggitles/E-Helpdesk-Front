## 🛠 Installation & Set Up

1. Install and use the correct version of Node using [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)

   ```sh
   nvm install 16.9.1
   nvm use 16.9.1
   ```

2. Install [PNPM](https://pnpm.io/) (a Javascript package manager)

   - Using PowerShell
     ```sh
     iwr https://get.pnpm.io/install.ps1 -useb | iex
     ```
   - Using curl
     ```sh
     curl -fsSL https://get.pnpm.io/install.sh | sh -
     ```
   - Using wget
     ```sh
     wget -qO- https://get.pnpm.io/install.sh | sh -
     ```
   - Using npm
     ```sh
     npm install -g pnpm
     ```
   - Using Homebrew
     ```sh
     brew install pnpm
     ```

3. Install dependencies

   ```sh
   pnpm install
   ```

4. Make a `.env.local` file

   ```
   AUTH0_SECRET='0b043d7f5f44b20ec28977cdf6f4b85162830e475bb96f2cd71ddedd69e5c82e'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://dev-ctupg26weg4tj5mm.us.auth0.com'
   AUTH0_CLIENT_ID='qFeOL8b4eiNHVIYHBZmQOnB7DPbqe0rT'
   AUTH0_CLIENT_SECRET='0555zte-Q6_Wu3ojt0tD4kzjSNp_s3Lo1iGKkyW-hhDFmKw7fRpb7kEtevGGi0Pe'

   AUTH0_MTM_CLIENT_ID='JPQJQI1dZkFKIzHlMtfdwSMGtM1oGk14'
   AUTH0_MTM_CLIENT_SECRET='R3miWTU_AfQLxC0aVBuXkbCXMGkkXBvLGnl4eA4qcAHz-OAqj-dVIed7033aV-uP'
   ```

5. Start the development server

   ```sh
   pnpm dev
   ```

## 🚀 Building and Running for Production

1. Generate a full static production build

   ```sh
   pnpm build
   ```

2. Preview the site as it will appear once deployed

   ```sh
   pnpm start  

   test
   ```
