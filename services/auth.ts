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

const firebaseConfig = {
  apiKey: "AIzaSyCSK8UxEGjwXWoyjhhVc7J21CEpCUlhe5M",
  authDomain: "todo-project.firebaseapp.com",
  projectId: "todo-661ea",
  messagingSenderId: "785271468324",
  appId: "6b1c0b14-f6eb-472b-9f74-ec2b7d1c25a3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export class AuthService {
  private static googleAuthProvider = new GoogleAuthProvider();
  private static promptAsyncFunc: (() => Promise<any>) | null = null;
  static setPromptAsyncFunc(promptAsync: () => Promise<any>) {
    this.promptAsyncFunc = promptAsync;
  }

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
