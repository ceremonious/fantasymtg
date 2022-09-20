import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="dark h-full">
      <Head />
      <body className="h-full bg-gray-50 dark:bg-slate-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
