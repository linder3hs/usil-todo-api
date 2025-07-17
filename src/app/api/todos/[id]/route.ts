// src/app/api/todos/[id]/route.ts
import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Obtener una tarea específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    const todoId = parseInt(id);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea inválido" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, name, is_completed, created_at, updated_at FROM todos WHERE id = $1",
      [todoId]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener tarea:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una tarea completa
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, isCompleted } = body;

    // Validar que el ID sea un número
    const todoId = parseInt(id);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea inválido" },
        { status: 400 }
      );
    }

    // Validación del nombre
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

    // Verificar que la tarea existe
    const existingTodo = await client.query(
      "SELECT id FROM todos WHERE id = $1",
      [todoId]
    );

    if (existingTodo.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la tarea
    const result = await client.query(
      "UPDATE todos SET name = $1, is_completed = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [name.trim(), Boolean(isCompleted), todoId]
    );
    client.release();

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Tarea actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar parcialmente una tarea (útil para toggle de completed)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validar que el ID sea un número
    const todoId = parseInt(id);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea inválido" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Verificar que la tarea existe
    const existingTodo = await client.query(
      "SELECT * FROM todos WHERE id = $1",
      [todoId]
    );

    if (existingTodo.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Construir la consulta de actualización dinámicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (body.hasOwnProperty("name")) {
      if (
        !body.name ||
        typeof body.name !== "string" ||
        body.name.trim() === ""
      ) {
        client.release();
        return NextResponse.json(
          { success: false, error: "El nombre debe ser un texto válido" },
          { status: 400 }
        );
      }
      updates.push(`name = $${paramCount}`);
      values.push(body.name.trim());
      paramCount++;
    }

    if (body.hasOwnProperty("isCompleted")) {
      updates.push(`is_completed = $${paramCount}`);
      values.push(Boolean(body.isCompleted));
      paramCount++;
    }

    if (updates.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    // Agregar updated_at y el ID
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(todoId);

    const query = `UPDATE todos SET ${updates.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;
    const result = await client.query(query, values);
    client.release();

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Tarea actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una tarea
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    const todoId = parseInt(id);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea inválido" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Verificar que la tarea existe antes de eliminar
    const existingTodo = await client.query(
      "SELECT * FROM todos WHERE id = $1",
      [todoId]
    );

    if (existingTodo.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la tarea
    await client.query("DELETE FROM todos WHERE id = $1", [todoId]);
    client.release();

    return NextResponse.json({
      success: true,
      data: existingTodo.rows[0],
      message: "Tarea eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
