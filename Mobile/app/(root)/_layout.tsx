import { Stack, Redirect, useSegments } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import '../../global.css'

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  // Wait for Clerk to finish loading
  if (!isLoaded) return null;

  // Splash doesn't require auth — let it render so unsigned-in users see it
  // before being routed to login.
  const onSplash = segments[segments.length - 1] === "splash";

  // If not signed in, redirect to login (unless on the splash screen)
  if (!isSignedIn && !onSplash) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
