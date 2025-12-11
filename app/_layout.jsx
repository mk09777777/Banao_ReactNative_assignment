import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: '#0066cc' },
          headerTintColor: '#fff',
          drawerActiveTintColor: '#0066cc',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
          }}
        />
        <Drawer.Screen
          name="gallery"
          options={{
            drawerLabel: 'Gallery',
            title: 'Gallery',
          }}
        />
        <Drawer.Screen
          name="favorites"
          options={{
            drawerLabel: 'Favorites',
            title: 'Favorites',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}