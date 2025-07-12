import { todosData } from "@/lib/todos";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: todosData,
      total: todosData.length,
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    // Crear nueva tarea
    const newTodo = {
      id: Math.max(...todosData.map((todo) => todo.id)) + 1,
      name: name.trim(),
      isCompleted: Boolean(isCompleted),
    };

    todosData.push(newTodo);

    return NextResponse.json(
      {
        success: true,
        data: newTodo,
        message: "Tarea creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
