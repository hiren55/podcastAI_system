# Podcastr - AI-Powered Podcast Platform

## Project Overview

Podcastr is a modern, AI-powered podcast creation and discovery platform. It's built with Next.js and features a futuristic, glassmorphism-inspired UI. The platform allows users to generate podcast content, including scripts, audio, and thumbnails, using OpenAI's GPT-4 and DALL-E 3.

**Key Technologies:**

*   **Frontend:** Next.js 14.2.3, TypeScript, React, Tailwind CSS, Radix UI
*   **Backend:** Convex (real-time database and file storage)
*   **Authentication:** Clerk
*   **AI:** OpenAI (GPT-4 for text, TTS-1 for speech, DALL-E 3 for images)

## Building and Running

To get the project up and running, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env.local` file and add the following environment variables:
    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
    CLERK_SECRET_KEY=your_clerk_secret
    CONVEX_DEPLOYMENT=your_convex_deployment
    OPENAI_API_KEY=your_openai_key
    ```

3.  **Run the Convex Backend:**
    ```bash
    npx convex dev
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

## Development Conventions

*   **Linting:** The project uses ESLint for code quality. Run `npm run lint` to check for linting errors.
*   **Type Checking:** TypeScript is used for static type checking. Run `npx tsc --noEmit` to check for type errors.
*   **Styling:** Tailwind CSS is used for styling, with a custom theme defined in `tailwind.config.ts`.
*   **Components:** Reusable components are located in the `components` directory. UI components are built with Radix UI and are located in `components/ui`.
*   **Backend Logic:** Backend logic is handled by Convex functions located in the `convex` directory.
*   **State Management:** The application uses Convex for real-time data synchronization, which simplifies state management.
