# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

General small-business owners who need a straightforward view of business health and practical tools to manage day-to-day records.

## Product Purpose

BizPulse helps a business owner understand business performance, manage business records, and make better decisions from one dashboard. The first version is intended to be demonstrated on a PC and may be presented as a cloud computing project.

## Positioning

The product's distinctive position is undecided. The initial experience should demonstrate the combined analytics-and-record-management concept without claiming a unique market advantage.

## Operating Context

The web app is hosted with AWS Amplify and requires a deployed Amplify backend. Developers can run it locally after deploying an Amplify sandbox and generating `amplify_outputs.json`. Users authenticate with Cognito before accessing their own cloud records.

## Capabilities and Constraints

- The first dashboard should present business analytics and support management of sales, expenses, customers, and products.
- Sales, expenses, customers, and products are persisted through Amplify Data (AppSync and DynamoDB), with owner-scoped authorization.
- Private document storage uses Amplify Storage (Amazon S3) and per-user paths.
- The dashboard does not fall back to browser storage; existing sample data is not automatically imported.
- The repository already uses React, Vite, TypeScript, and AWS Amplify.
- Empty accounts start without business records; displayed analytics reflect the signed-in user's cloud data.

## Brand Commitments

The product name is BizPulse.

## Evidence on Hand

The repository contains a React/Vite app with Amplify Gen 2 authentication, owner-authorized AppSync data models, and per-user S3 storage definitions. It contains no real business data, customer evidence, testimonials, or product-specific visual identity.

## Product Principles

- Make business performance understandable at a glance.
- Keep the core records for day-to-day business management accessible alongside analytics.
- Keep each user's business records private to their authenticated account.
- Report cloud loading and save failures instead of showing local-only success.
