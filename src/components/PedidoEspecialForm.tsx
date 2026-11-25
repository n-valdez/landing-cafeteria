'use client';

import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export default function PedidoEspecialForm() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from('pedidos_especiales').insert({
      nombre_cliente: formData.get('nombre'),
      telefono: formData.get('telefono'),
      tipo_pedido: formData.get('tipo'),
      fecha_entrega: formData.get('fecha'),
      detalles: formData.get('detalles'),
    });

    setLoading(false);
    if (!error) {
      setEnviado(true);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 md:p-10 rounded-3xl border border-[#EADCD0] shadow-sm space-y-4"
    >
      <span className="text-xs uppercase tracking-[0.2em] text-[#9C6644] font-semibold">
        Eventos & Fechas Especiales
      </span>
      <h3 className="font-serif text-3xl font-bold">
        Encargá tu Torta o Mesa Dulce
      </h3>
      <p className="text-sm text-[#6F4E37]">
        Recordá solicitar con anticipación. Se requiere seña del 50% para
        confirmar el pedido.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        <input
          name="nombre"
          required
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm focus:outline-none focus:border-[#3B1F14]"
        />
        <input
          name="telefono"
          required
          placeholder="Tu WhatsApp (ej. 0981...)"
          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm focus:outline-none focus:border-[#3B1F14]"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <select
          name="tipo"
          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm focus:outline-none focus:border-[#3B1F14]"
        >
          <option value="Torta Personalizada">Torta Personalizada</option>
          <option value="Mesa Dulce (25/50/100 unid.)">Mesa Dulce</option>
          <option value="Canasta de Desayuno">Canasta de Desayuno</option>
          <option value="Box Brownies / Cookies">Box Personalizado</option>
        </select>
        <input
          name="fecha"
          type="date"
          required
          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm focus:outline-none focus:border-[#3B1F14]"
        />
      </div>

      <textarea
        name="detalles"
        rows={3}
        placeholder="Contanos sabores, temática, cantidad de personas o si necesitás opciones sin azúcar/gluten..."
        className="w-full px-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm focus:outline-none focus:border-[#3B1F14]"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-full bg-[#3B1F14] hover:bg-[#5A3222] text-[#FAF6F2] font-semibold text-sm transition"
      >
        {loading
          ? 'Enviando solicitud...'
          : 'Solicitar Presupuesto y Disponibilidad'}
      </button>

      {enviado && (
        <p className="text-sm text-center font-medium text-emerald-700 bg-emerald-50 py-2.5 rounded-xl">
          ¡Solicitud recibida! Nos comunicaremos a tu WhatsApp a la brevedad.
        </p>
      )}
    </form>
  );
}