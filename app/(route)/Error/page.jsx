// app/(route)/Error/page.jsx
"use client"
import { useSearchParams } from 'next/navigation';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div>
      <h1>Authentication Error</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <p>An unknown error occurred. Please try again.</p>
      )}
    </div>
  );
};

export default ErrorPage;
