"use client";

import { cn } from "@/utils";
import { Suspense } from "react";
import SignInFormFields from "./form";
import SignInHeader from "./header";

export default function SignIn() {
  return (
    <div className={cn("flex w-full flex-1 flex-col lg:w-1/2")}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <div>
          <SignInHeader title="E-SPK" />

          <div>
            <Suspense
              fallback={
                <div className="space-y-5" aria-busy="true">
                  <span className="sr-only">Loading sign-in form</span>
                  <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-11 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                </div>
              }
            >
              <SignInFormFields />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
