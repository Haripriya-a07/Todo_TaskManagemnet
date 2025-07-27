import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { AuthService } from '@/services/auth';
import { User } from '@/types/task';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '785271468324-dc8r14dqf9l46sa172htvk8eppbmb8sf.apps.googleusercontent.com', 
  });

  useEffect(() => {
    AuthService.setPromptAsyncFunc(promptAsync);
  }, [promptAsync]);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkUser();
  }, []);

  const signIn = async (): Promise<boolean> => {
    setSigningIn(true);
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Sign-in failed:', err);
      return false;
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
  };

  return {
    user,
    loading: loading || signingIn,
    signIn,
    signOut,
  };
}
