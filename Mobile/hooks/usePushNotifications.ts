import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "@/lib/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"undetermined" | "granted" | "denied">("undetermined");
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  async function registerForPushNotifications() {
    if (!Device.isDevice) return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus as "granted" | "denied");

    if (finalStatus !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    setExpoPushToken(token);

    // Save token to server using axios
    try {
      await api.post("/api/notifications/token", { token });
    } catch {
      // non-blocking — token save failure shouldn't break the app
    }

    return token;
  }

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // notification received while app is open
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // user tapped the notification
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken, permissionStatus, registerForPushNotifications };
}
