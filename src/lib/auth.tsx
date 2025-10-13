// lib/auth.ts

import { ApiResponse, Login, QueryParams, Usuario } from "@/types/geral";
import { api } from '@/lib/api'

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('token') !== null;
};

class ApiAuth {    
  public async login(data: Login): Promise<ApiResponse> {    
    const req = await  api.request<ApiResponse>('/login', 'POST', data);        
    if (req.success && req.data ) {
      localStorage.setItem('token', req.data as any);           
      return { success: true, data: req.data };
    } else {
      return { success: false, message: req.message };
    }
  }

  // Método para registro de usuário
  public async addlogin(data: Usuario): Promise<ApiResponse> {
    return api.request('/addlogin', 'POST', data);
  }

  // Método para logout
  public logout(): void {
    localStorage.removeItem('token');    
    window.location.href = '/login';
  }    

  //Usuario
  public async getUsuario(params?: QueryParams): Promise<ApiResponse> {
    return api.request<Usuario[]>('/usuario', 'GET', null, params);
}
}

export const apiAuth = new ApiAuth(); // Use o ambiente correto conforme necessário
