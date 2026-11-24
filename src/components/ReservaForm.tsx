'use client';

import { useState } from 'react';
import { supabase } from '@/public/lib/supabase';

export default function ReservaForm() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from('reservas').insert({
      nombre_cliente: formData.get('nombre'),
      email: formData.get('email'),
      fecha: formData.get('fecha'),
      personas: Number(formData.get('personas')),
    });

    setLoading(false);
    if (error) {
      setMensaje('Hubo un error al reservar. Intenta nuevamente.');
    } else {
      setMensaje('¡Mesa reservada con éxito! Te esperamos.');
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-stone-900 p-8 rounded-2xl border border-stone-800">
      <h3 className="text-2xl font-bold text-amber-500">Reserva tu mesa</h3>
      <input
        name="nombre"
        type="text"
        required
        placeholder="Tu nombre"
        className="w-full p-3 rounded-lg bg-stone-800 text-white border border-stone-700"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Tu correo electrónico"
        className="w-full p-3 rounded-lg bg-stone-800 text-white border border-stone-700"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          name="fecha"
          type="date"
          required
          className="w-full p-3 rounded-lg bg-stone-800 text-white border border-stone-700"
        />
        <input
          name="personas"
          type="number"
          min="1"
          max="10"
          defaultValue="2"
          required
          className="w-full p-3 rounded-lg bg-stone-800 text-white border border-stone-700"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg transition"
      >
        {loading ? 'Reservando...' : 'Confirmar Reserva'}
      </button>
      {mensaje && <p className="text-sm text-amber-400 mt-2">{mensaje}</p>}
    </form>
  );
}