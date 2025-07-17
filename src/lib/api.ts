// src/lib/api.ts
import { Todo } from "./db";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

const API_BASE_URL = "/api";

class TodoApi {
  // Obtener todas las tareas
  async getTodos(): Promise<ApiResponse<Todo[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`);
      return await response.json();
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }

  // Obtener una tarea específica
  async getTodo(id: number): Promise<ApiResponse<Todo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`);
      return await response.json();
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }

  // Crear nueva tarea
  async createTodo(
    name: string,
    isCompleted = false
  ): Promise<ApiResponse<Todo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, isCompleted }),
      });
      return await response.json();
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }

  // Actualizar tarea completa
  async updateTodo(
    id: number,
    name: string,
    isCompleted: boolean
  ): Promise<ApiResponse<Todo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, isCompleted }),
      });
      return await response.json();
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }

  // Actualizar parcialmente (toggle completed)
  async toggleTodo(id: number): Promise<ApiResponse<Todo>> {
    try {
      // Primero obtenemos la tarea actual
      const currentTodo = await this.getTodo(id);
      if (!currentTodo.success || !currentTodo.data) {
        return currentTodo;
      }

      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCompleted: !currentTodo.data.is_completed }),
      });
      return await response.json();
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }

  // Actualizar solo el nombre
  async updateTodoName(id: number, name: string): Promise<ApiResponse<Todo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      return await response.json();
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }

  // Eliminar tarea
  async deleteTodo(id: number): Promise<ApiResponse<Todo>> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: "Error de conexión",
      };
    }
  }
}

export const todoApi = new TodoApi();
