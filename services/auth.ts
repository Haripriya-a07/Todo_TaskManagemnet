import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import { User } from '@/types/task';
import { StorageService } from './storage';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// ✅ Replace with your real Firebase config
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export class AuthService {
  private static googleAuthProvider = new GoogleAuthProvider();

  // This will be initialized from the auth.tsx page
  private static promptAsyncFunc: (() => Promise<any>) | null = null;

  /**
   * Initializes Google sign-in trigger from outside using `Google.useIdTokenAuthRequest`
   */
  static setPromptAsyncFunc(promptAsync: () => Promise<any>) {
    this.promptAsyncFunc = promptAsync;
  }

  /**
   * Handles Google sign-in
   */
  static async signInWithGoogle(): Promise<User | null> {
    try {
      if (!this.promptAsyncFunc) {
        throw new Error('Google promptAsync function not initialized');
      }

      const result = await this.promptAsyncFunc();

      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);

        const user: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL || undefined,
        };

        await StorageService.saveUser(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return null;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await StorageService.clearUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    return await StorageService.getUser();
  }
}
