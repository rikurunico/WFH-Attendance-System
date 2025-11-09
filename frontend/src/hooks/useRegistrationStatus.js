import { useState, useEffect } from 'react';
import { getRegistrationStatus } from '../api/auth.api';

export const useRegistrationStatus = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check frontend env first
        const frontendEnabled = import.meta.env.VITE_ENABLE_REGISTRATION !== 'false';

        if (!frontendEnabled) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        // Check backend status
        const response = await getRegistrationStatus();
        setIsEnabled(response.enabled);
      } catch (error) {
        console.error('Failed to check registration status:', error);
        // Default to enabled if API fails
        setIsEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { isEnabled, loading };
};