import axios from 'axios';
import { TipoUsuario } from '@prisma/client';

const API_URL = '/api';

export interface LoginResponse {
    user: {
        id: string;
        username: string;
        perfil: TipoUsuario;
        persona: {
            nombre: string;
            apellido: string;
            mail: string | null;
            dni: number;
            fechaNac: Date;
            direccion: string | null;
            telefono: number | null;
        };
    };
    token: string;
}

export interface UserData {
    id: string;
    username: string;
    perfil: TipoUsuario;
    persona: {
        nombre: string;
        apellido: string;
        mail: string | null;
        dni: number;
        fechaNac: Date;
        direccion: string | null;
        telefono: number | null;
    };
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password
            });
            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('userSession');
        localStorage.removeItem('token');
    },

    getCurrentUser: (): UserData | null => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('userSession');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('token');
    }
}; 