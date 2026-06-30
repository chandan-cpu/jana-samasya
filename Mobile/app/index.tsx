import { Redirect } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Index() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  if (!authLoaded || !userLoaded) return null;

  if (!isSignedIn) return <Redirect href="/(root)/splash" />;

  const role = user?.publicMetadata?.role as "citizen" | "mla" | undefined;
  return <Redirect href={role === "mla" ? "/(root)/(mla)" : "/(root)/(tabs)"} />;
}