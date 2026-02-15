import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const signUp = async ({ email, password, nombre, apellidos, rol }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Estos nombres deben coincidir exactamente con los del Trigger SQL
        data: {
          first_name: nombre,
          last_name: apellidos,
          role: rol,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = () => supabase.auth.signOut();

  return { signUp, signIn, signOut };
};