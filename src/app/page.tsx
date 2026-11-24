import { supabase } from '@/public/lib/supabase';
import ReservaForm from '@/src/components/ReservaForm';
import { Coffee, Clock, MapPin } from 'lucide-react';

export const revalidate = 60; // Actualiza el menú cada 60 segundos

export default async function Home() {
  const { data: menu } = await supabase
    .from('menu_items')
    .select('*')
    .order('categoria', { ascending: true });

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium">
          <Coffee className="w-4 h-4" /> Café de Especialidad & Panadería Artesanal
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          El arte del buen café, <span className="text-amber-500">taza a taza.</span>
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto text-lg">
          Granos seleccionados de origen único, tostados semanalmente y preparados por baristas apasionados.
        </p>
        <div className="pt-4">
          <a
            href="#reservar"
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition"
          >
            Reservar una mesa
          </a>
        </div>
      </section>

      {/* MENÚ DINÁMICO DESDE SUPABASE */}
      <section id="menu" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center">Nuestra Carta</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {menu?.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex justify-between items-start gap-4"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
                  {item.categoria}
                </span>
                <h3 className="text-xl font-bold mt-1">{item.nombre}</h3>
                <p className="text-stone-400 text-sm mt-1">{item.descripcion}</p>
              </div>
              <span className="text-xl font-bold text-amber-400">
                ${Number(item.precio).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* RESERVAS E INFO */}
      <section id="reservar" className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Visítanos</h2>
          <p className="text-stone-400">
            Asegura tu lugar para trabajar, leer o disfrutar una tarde tranquila con nuestro café recién filtrado.
          </p>
          <div className="space-y-3 text-stone-300">
            <p className="flex items-center gap-3">
              <MapPin className="text-amber-500 w-5 h-5" /> Av. Principal 123, Centro
            </p>
            <p className="flex items-center gap-3">
              <Clock className="text-amber-500 w-5 h-5" /> Lunes a Domingo: 07:30 - 21:00
            </p>
          </div>
        </div>
        <ReservaForm />
      </section>
    </main>
  );
}