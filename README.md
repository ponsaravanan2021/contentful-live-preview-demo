**Reference**

https://www.contentful.com/developers/docs/tutorials/preview/live-preview/

**Create a simple app**

```bash
npx create-next-app@latest live-preview-demo --typescript --app
```

√ Which linter would you like to use? » ESLint

√ Would you like to use React Compiler? ... No / Yes

√ Would you like to use Tailwind CSS? ... No / Yes

√ Would you like your code inside a `src/` directory? ... No / Yes

√ Would you like to customize the import alias (`@/*` by default)? ... No / Yes

Creating a new Next.js app in C:\Projects\live-preview-demo\live-preview-demo.

```bash
cd .\live-preview-demo\
```

Install the live preview sdk
```bash
npm install contentful @contentful/live-preview @contentful/rich-text-react-renderer @contentful/rich-text-types
```

To use graphql
```bash
npm i graphql-tag
npm i graphql
```
create a file called .env.local
```bash
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=<Space id here>
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID=master
NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN=<delivery token here>
NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN=<preview token here>
CONTENTFUL_USE_PREVIEW=true    # optional
```

Edit the page file with your changes you should be able to see the page in browser
You can refer to the Github repo for the code. 

Once you verified the page is running locally by below comment we can start setting up the web app
`npm run dev`

**Web App Setup**
Got to settings \ Content Preview

Add the URL by Create preview platform

Name and description as appropriate. Select the content type you created for visualising demo. Then use the URL based on what you see in console

```bash
npm run dev 
```

Mine is 
http://localhost:3000/

