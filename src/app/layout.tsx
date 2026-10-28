// Locale layouts render <html>; this root layout only passes children through.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
