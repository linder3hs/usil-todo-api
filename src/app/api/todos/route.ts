// src/app/api/todos/route.ts
import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todas las tareas
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, name, is_completed, created_at, updated_at FROM todos ORDER BY created_at DESC"
    );
    client.release();

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva tarea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isCompleted = false } = body;

    // Validación
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            "El nombre de la tarea es requerido y debe ser un texto válido",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO todos (name, is_completed) VALUES ($1, $2) RETURNING *",
      [name.trim(), Boolean(isCompleted)]
    );
    client.release();

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: "Tarea creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
