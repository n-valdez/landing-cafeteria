'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import CatalogoInteractivo from '@/src/components/CatalogoInteractivo';
import PedidoEspecialForm from '@/src/components/PedidoEspecialForm';
import { MapPin, Clock, Phone, ArrowRight } from 'lucide-react';

export default function Home() {
  const [whatsapp, setWhatsapp] = useState('595994717184');

  useEffect(() => {
    async function cargarConfig() {
      const { data } = await supabase
        .from('configuracion')
        .select('whatsapp_numero')
        .eq('id', 1)
        .single();
      if (data?.whatsapp_numero) {
        setWhatsapp(data.whatsapp_numero);
      }
    }
    cargarConfig();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-editorial-grid">
      {/* 1. BARRA SUPERIOR DE ANUNCIOS */}
      <div className="bg-[#3B1F14] text-[#FAF6F2] text-xs py-2.5 px-4 text-center tracking-wide">
        🍪 Stock diario limitado en vitrina • Pedidos personalizados con anticipación •{' '}
        <a href="#catalogo" className="underline text-[#F5CBB0] font-semibold">
          Explorar Catálogo
        </a>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#FAF6F2]/90 backdrop-blur-md border-b border-[#EADCD0]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#catalogo" className="hover:text-[#9C6644] transition">
              Catálogo
            </a>
            <a href="#como-pedir" className="hover:text-[#9C6644] transition">
              Cómo Pedir
            </a>
            <a href="#visitanos" className="hover:text-[#9C6644] transition">
              Ubicación
            </a>
          </nav>

          <a href="#" className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Logo Les Antoja"
              className="w-11 h-11 rounded-full object-cover border border-[#3B1F14]/20"
            />
            <span className="font-serif text-2xl font-bold tracking-tight">
              LES ANTOJA?
            </span>
          </a>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            className="bg-[#F5CBB0] hover:bg-[#eeb998] text-[#3B1F14] px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition"
          >
            Pedir Ahora <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* 3. HERO EDITORIAL CON TU IMAGEN HERO-CAFE.JPG */}
      <section className="relative overflow-hidden border-b border-[#EADCD0] bg-gradient-to-br from-[#FAF6F2] via-[#FAF6F2] to-[#F5CBB0]/35 bg-paper-grain">
        {/* Halos de luz cálida en movimiento */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F5CBB0]/45 blur-3xl animate-orb-1"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#E6B89C]/40 blur-3xl animate-orb-2"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Columna Izquierda: Textos y Botones */}
          <div className="text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5CBB0]/60 backdrop-blur-sm text-[#3B1F14] text-xs font-semibold tracking-widest uppercase mb-6 border border-[#3B1F14]/10">
              Pastelería Artesanal & Café de Especialidad
            </span>

            <h1 className="font-serif text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight">
              Momentos dulces recién horneados para vos.
            </h1>

            <p className="text-[#6F4E37] text-lg max-w-xl mx-auto lg:mx-0 mt-6 leading-relaxed">
              Cookies rellenas, iced coffee de especialidad, tortas personalizadas y opciones sin azúcar ni gluten hechas cada día en Capiatá.
            </p>

            <div className="mt-9 flex flex-wrap justify-center lg:justify-start gap-4">
              <a
                href="#catalogo"
                className="px-8 py-4 rounded-full bg-[#3B1F14] hover:bg-[#5A3222] text-[#FAF6F2] font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-[#3B1F14]/15"
              >
                Ver Catálogo y Precios
              </a>
              <a
                href="#encargos"
                className="px-8 py-4 rounded-full bg-white/90 backdrop-blur-sm hover:bg-[#F5CBB0]/40 text-[#3B1F14] border border-[#EADCD0] font-semibold text-sm transition-all duration-300 hover:scale-105"
              >
                Encargar Torta
              </a>
            </div>
          </div>

          {/* Columna Derecha: Tu imagen hero-cafe.jpg flotando */}
          <div className="relative flex justify-center items-center">
            {/* Círculo decorativo durazno de fondo */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#F5CBB0]/60 border border-[#3B1F14]/15" />

            {/* Foto protagonista con animación flotante */}
            <div className="relative z-10 animate-float-cafe">
              <img
                src="/hero-cafe.jpg"
                alt="Iced Latte artesanal Les Antoja"
                className="w-72 h-96 sm:w-80 sm:h-[26rem] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white"
              />

              {/* Tarjeta flotante superior derecha */}
              <div className="absolute -top-4 -right-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#EADCD0] text-left">
                <p className="text-[10px] uppercase tracking-wider text-[#9C6644] font-bold">
                  Especialidad
                </p>
                <p className="font-serif font-bold text-sm text-[#3B1F14]">
                  Iced Latte & Cookies
                </p>
              </div>

              {/* Tarjeta flotante inferior izquierda */}
              <div className="absolute -bottom-5 -left-6 bg-[#3B1F14] text-[#FAF6F2] px-4 py-3 rounded-2xl shadow-xl border border-[#F5CBB0]/30 text-left">
                <p className="text-xs font-bold text-[#F5CBB0]">
                  📍 Capiatá - Ruta 2
                </p>
                <p className="text-[11px] text-[#EADCD0]">
                  Stock fresco todos los días
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CINTA ANIMADA ESTILO EDITORIAL */}
      <div className="bg-[#3B1F14] text-[#F5CBB0] py-3.5 overflow-hidden border-y border-[#3B1F14]">
        <div className="animate-marquee flex items-center gap-8 text-xs font-bold uppercase tracking-[0.25em]">
          <span>🍪 Cookies Rellenas</span>
          <span>•</span>
          <span>☕ Café de Especialidad</span>
          <span>•</span>
          <span>🎂 Tortas Personalizadas</span>
          <span>•</span>
          <span>🌿 Opciones Sin Azúcar & Sin Gluten</span>
          <span>•</span>
          <span>🥐 Stock Diario en Capiatá</span>
          <span>•</span>
          <span>🍪 Cookies Rellenas</span>
          <span>•</span>
          <span>☕ Café de Especialidad</span>
          <span>•</span>
          <span>🎂 Tortas Personalizadas</span>
          <span>•</span>
          <span>🌿 Opciones Sin Azúcar & Sin Gluten</span>
          <span>•</span>
          <span>🥐 Stock Diario en Capiatá</span>
        </div>
      </div>

      {/* 5. BLOQUE 01 - 02 - 03 */}
      <section id="como-pedir" className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              titulo: 'Stock Diario & Encargos',
              desc: 'Contamos con stock limitado todos los días en vitrina. Para tortas o mesas dulces, pedí con 5 días de anticipación.',
            },
            {
              num: '02',
              titulo: 'Seña del 50%',
              desc: 'Para concretar pedidos personalizados se requiere una seña del 50% (no reembolsable).',
            },
            {
              num: '03',
              titulo: 'Retiro y Delivery',
              desc: 'Retirá por Capiatá de Martes a Sábado (8:00 a 19:00) y Domingos (10:00 a 19:00). Consultá delivery con anticipación.',
            },
          ].map((paso) => (
            <div key={paso.num} className="card-artesanal p-8">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F5CBB0] text-[#3B1F14] font-bold text-sm mb-4">
                {paso.num}
              </span>
              <h3 className="font-serif text-xl font-bold mb-2">{paso.titulo}</h3>
              <p className="text-sm text-[#6F4E37] leading-relaxed">{paso.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CATÁLOGO DINÁMICO CON SUPABASE + WHATSAPP */}
      <CatalogoInteractivo whatsappNumero={whatsapp} />

      {/* 7. BANNER DESTACADO MARRÓN CHOCOLATE */}
      <section className="max-w-6xl mx-auto px-6 my-8">
        <div className="bg-[#3B1F14] text-[#FAF6F2] rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden">
          <span className="inline-block px-3 py-1 rounded-full bg-[#F5CBB0] text-[#3B1F14] text-xs font-bold uppercase tracking-wider mb-4">
            Sin Azúcar • Sin Gluten
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold max-w-2xl mx-auto leading-tight">
            ¿Buscás opciones saludables sin resignar sabor?
          </h2>
          <p className="text-[#EADCD0] max-w-xl mx-auto mt-4 text-sm md:text-base">
            Preparamos brownies, tartas y cookies saludables ideales para acompañar tu café de especialidad.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              'Hola Les Antoja?! Quiero consultar las opciones saludables de hoy'
            )}`}
            target="_blank"
            className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-[#F5CBB0] text-[#3B1F14] font-bold text-sm hover:bg-white transition"
          >
            Consultar Disponibilidad de Hoy <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 8. UBICACIÓN Y FORMULARIO DE PEDIDOS ESPECIALES */}
      <section id="visitanos" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.2em] text-[#9C6644] font-semibold">
              Visitanos
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Te esperamos en Capiatá
            </h2>
            <p className="text-[#6F4E37] leading-relaxed">
              Pasá por nuestro local a disfrutar de un café de especialidad recién preparado y elegí tu antojo directo de vitrina.
            </p>

            <div className="bg-white p-6 rounded-3xl border border-[#EADCD0] space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#9C6644] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Dirección</p>
                  <p className="text-sm text-[#6F4E37]">Capiatá - Ruta 2, Paraguay</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#9C6644] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Horarios de Retiro y Atención</p>
                  <p className="text-sm text-[#6F4E37]">Martes a Sábados: 08:00 a 19:00 hs</p>
                  <p className="text-sm text-[#6F4E37]">Domingos: 10:00 a 19:00 hs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#9C6644] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">WhatsApp Pedidos</p>
                  <p className="text-sm text-[#6F4E37]">+{whatsapp}</p>
                </div>
              </div>
            </div>
          </div>

          <div id="encargos">
            <PedidoEspecialForm />
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#3B1F14] text-[#FAF6F2] mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-2xl font-bold">LES ANTOJA?</p>
            <p className="text-xs text-[#EADCD0] mt-1">
              Pastelería artesanal & cafetería de especialidad • Capiatá, PY
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/les_antoja"
              target="_blank"
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-2 transition"
            >
              @les_antoja
            </a>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              className="px-4 py-2 rounded-full bg-[#F5CBB0] text-[#3B1F14] text-xs font-bold transition"
            >
              WhatsApp
            </a>
            <a
              href="/admin"
              className="text-xs text-[#EADCD0]/40 hover:text-[#F5CBB0] transition"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}