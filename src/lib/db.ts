// src/lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export { pool };

// Función para inicializar la base de datos
export async function initDatabase() {
  try {
    const client = await pool.connect();

    // Crear tabla todos si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar datos iniciales si la tabla está vacía
    const { rows } = await client.query("SELECT COUNT(*) FROM todos");
    const count = parseInt(rows[0].count);

    if (count === 0) {
      const initialTodos = [
        { name: "Comprar leche y pan en el supermercado", isCompleted: false },
        { name: "Terminar el informe del proyecto", isCompleted: true },
        { name: "Llamar al dentista para agendar cita", isCompleted: false },
        { name: "Hacer ejercicio en el gimnasio", isCompleted: true },
        { name: "Leer 30 páginas del libro actual", isCompleted: false },
        { name: "Organizar el escritorio de trabajo", isCompleted: false },
        { name: "Revisar correos electrónicos pendientes", isCompleted: true },
        { name: "Preparar presentación para la reunión", isCompleted: false },
        { name: "Sacar la basura antes de las 8 AM", isCompleted: true },
        {
          name: "Estudiar para el examen de certificación",
          isCompleted: false,
        },
      ];

      for (const todo of initialTodos) {
        await client.query(
          "INSERT INTO todos (name, is_completed) VALUES ($1, $2)",
          [todo.name, todo.isCompleted]
        );
      }
    }

    client.release();
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    throw error;
  }
}

// Tipos TypeScript
export interface Todo {
  id: number;
  name: string;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}
