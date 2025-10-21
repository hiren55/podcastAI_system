"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

const ConvexClerkProvider = ({ children }: { children: ReactNode }) => (
  <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    appearance={{
      layout: {
        socialButtonsVariant: 'iconButton',
        logoImageUrl: '/icons/auth-logo.svg'
      },
      variables: {
        colorBackground: '#15171c',
        colorPrimary: '',
        colorText: 'white',
        colorInputBackground: '#1b1f29',
        colorInputText: 'white',
      }
    }}
  >
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  </ClerkProvider>
);

export default ConvexClerkProvider;