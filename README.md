## Introduction
The code in this repo is not production ready
It is to help me explain how to setup live preview to reflect the changes in contentful webapp in a simple way.
Please refer to the below reference for more information

**Reference**

https://www.contentful.com/developers/docs/tutorials/preview/live-preview/

## Content Type setup
Contentful Content Model Setup (Live Preview Demo)

The setup requires two content types:

- previewDemoPage
- contentBlock

### Content Type: Preview Demo Page

#### Name: Preview Demo Page
Content Type ID: previewDemoPage
Display Field: title

Fields
**Title**
- Field ID: title
- Type: Short text

**Slug**
This field is used to fetch the page in GraphQL.
- Field ID: slug
- Type: Short text

**Description**
Used in GraphQL as description { json }.
- Field ID: description
- Type: Rich Text

**Sections**
This field represents the ordered list of sections rendered on the page.
In GraphQL, this field is accessed as sectionsCollection.
- Field ID: sections
- Type: Array of Entry references
- Allowed Content Type: contentBlock

#### Content Type: Content Block
- Name: Content Block
- Content Type ID: contentBlock
- Display Field: internalName

**Fields**
**Internal Name**
- Field ID: internalName
- Type: Short text

**Headline**
- Field ID: headline
- Type: Short text

**Body**
Used in GraphQL as body { json }.
- Field ID: body
- Type: Rich Text

Your Content type should look like this as below. I have more fields in content block. You may not need anything except headline and body

![Fields](https://github.com/ponsaravanan2021/contentful-live-preview-demo/blob/master/content-setup.png)

### Create at least one Content Block entry with:
- internalName
- headline
- body

Publish the entry.
Preview Demo Page Entry

Create a Preview Demo Page entry with:
- title
- slug (for example: home-page)
- description
- one or more linked Content Block entries in sections

Publish the entry.
### GraphQL Query Expectations

The demo expects the following fields to exist and match exactly:

- previewDemoPageCollection
- slug
- title
- description { json }
- sectionsCollection { items }
- ContentBlock.headline
- ContentBlock.body { json }

If any field IDs or content type IDs differ, the query will return null data or fail.



### Create a simple app

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

### Web App SetupWeb App Setup
Got to settings \ Content Preview

Add the URL by Create preview platform

Name and description as appropriate. Select the content type you created for visualising demo. Then use the URL based on what you see in console

```bash
npm run dev 
```

Mine is 
http://localhost:3000/

