"use server"

export default async function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <h1>404</h1>
        <h2>This page could not be found.</h2>
      </body>
    </html>
  );
}