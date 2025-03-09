import React from 'react'

export default function Unauthorized() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p>You don’t have permission to view this page.</p>
      </div>
    );
  }