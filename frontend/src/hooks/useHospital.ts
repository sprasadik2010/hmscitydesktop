// src/hooks/useHospital.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

interface HospitalConfig {
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  footer_note?: string;
}

export const useHospital = () => {
  const [config, setConfig] = useState<HospitalConfig>({
    name: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalConfig();
  }, []);

  const fetchHospitalConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/hospital`);
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to load hospital config, using defaults');
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, refresh: fetchHospitalConfig };
};