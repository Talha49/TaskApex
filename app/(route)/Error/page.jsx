"use client"
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ErrorPage = () => {
  const searchParams = useSearchParams();

  return (
    <div>
      <h1>Error</h1>
      <p>Query: {searchParams.get('query')}</p>
    </div>
  );
};

export default function WrappedErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPage />
    </Suspense>
  );
}
