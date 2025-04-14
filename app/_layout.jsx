import { Tabs, Slot, SplashScreen, Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name='index' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='(tabs)' options={{
                headerShown: false
            }}/>
            <Stack.Screen name='goal/[goal]' options={{
                headerShown: false
            }}/>
    </Stack>
  );
}
