'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import {
  ShoppingBag,
  Plus,
  Minus,
  MessageCircle,
  Sparkles,
  Search,
  X,
  Clock,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  destacado: boolean;
  requiere_anticipacion: boolean;
  imagen_url?: string;
}

export default function CatalogoInteractivo({
  productos: productosIniciales = [],
  whatsappNumero,
}: {
  productos?: Producto[];
  whatsappNumero: string;
}) {
  const [categorias, setCategorias] = useState<string[]>([
    'Todos',
    'Cookies',
    'Confitería',
    'Saludables',
    'Tortas y Eventos',
  ]);
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [cargando, setCargando] = useState(productosIniciales.length === 0);
  const [errorDb, setErrorDb] = useState('');

  // Estados de búsqueda y filtros
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [ordenPrecio, setOrdenPrecio] = useState<'destacados' | 'menor' | 'mayor'>('destacados');

  // Estado del Modal de Vista Detallada
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidadModal, setCantidadModal] = useState(1);

  const [carrito, setCarrito] = useState<
    { producto: Producto; cantidad: number }[]
  >([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      const { data: catsData } = await supabase
        .from('categorias')
        .select('nombre')
        .order('created_at', { ascending: true });

      if (catsData && catsData.length > 0) {
        setCategorias(['Todos', ...catsData.map((c) => c.nombre)]);
      }

      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('destacado', { ascending: false });

      if (error) {
        setErrorDb(error.message);
      } else if (data) {
        setProductos(data);
      }
      setCargando(false);
    }
    cargarDatos();
  }, []);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProductoSeleccionado(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const abrirDetalle = (prod: Producto) => {
    setProductoSeleccionado(prod);
    setCantidadModal(1);
  };

  const productosFiltrados = productos
    .filter((p) => {
      const coincideCat =
        categoriaActiva === 'Todos' || p.categoria === categoriaActiva;
      const termino = busqueda.toLowerCase().trim();
      const coincideTexto =
        !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino)) ||
        p.categoria.toLowerCase().includes(termino);
      const coincideStock = !soloDisponibles || p.stock > 0;

      return coincideCat && coincideTexto && coincideStock;
    })
    .sort((a, b) => {
      if (ordenPrecio === 'menor') return a.precio - b.precio;
      if (ordenPrecio === 'mayor') return b.precio - a.precio;
      return 0;
    });

  const agregarAlCarrito = (producto: Producto, cantidadSumar = 1) => {
    if (producto.stock <= 0) return;
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);
      if (existe) {
        const nuevaCant = Math.min(producto.stock, existe.cantidad + cantidadSumar);
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: nuevaCant }
            : item
        );
      }
      return [
        ...prev,
        { producto, cantidad: Math.min(producto.stock, cantidadSumar) },
      ];
    });
  };

  const quitarDelCarrito = (id: string) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.producto.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalGs = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );

  const formatearGs = (valor: number) =>
    `Gs. ${valor.toLocaleString('es-PY')}`;

  const enviarPedidoWhatsApp = async () => {
    setEnviando(true);
    const itemsParaGuardar = carrito.map((i) => ({
      producto_id: i.producto.id,
      nombre: i.producto.nombre,
      cantidad: i.cantidad,
      precio: i.producto.precio,
    }));

    await supabase.from('pedidos_whatsapp').insert({
      cliente_nombre: clienteNombre.trim() || 'Cliente Web',
      items: itemsParaGuardar,
      total: totalGs,
      estado: 'pendiente',
    });

    const lineas = carrito.map(
      (item) =>
        `• ${item.cantidad}x ${item.producto.nombre} (${formatearGs(
          item.producto.precio * item.cantidad
        )})`
    );

    const saludo = clienteNombre.trim()
      ? `¡Hola Les Antoja?! Soy *${clienteNombre.trim()}* y quisiera hacer este pedido:`
      : `¡Hola Les Antoja?! Quisiera hacer el siguiente pedido desde la web:`;

    const texto = `${saludo}\n\n${lineas.join(
      '\n'
    )}\n\n*Total estimado: ${formatearGs(
      totalGs
    )}*\n\nQuedo atento/a para confirmar disponibilidad y seña.`;

    setEnviando(false);
    setCarrito([]);
    window.open(
      `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(texto)}`,
      '_blank'
    );
  };

  return (
    <section id="catalogo" className="max-w-6xl mx-auto px-6 py-20">
      {/* Encabezado */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-[#9C6644] font-semibold">
          Hecho a mano todos los días
        </span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold mt-2">
          Explorá Nuestros Antojos
        </h2>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EADCD0] shadow-xs mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9C6644] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cookie, nutella, torta, sin azúcar..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full bg-[#FAF6F2] border border-[#EADCD0] text-sm focus:outline-none focus:border-[#3B1F14]"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F4E37] hover:text-[#3B1F14]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#3B1F14] bg-[#FAF6F2] px-4 py-2.5 rounded-full border border-[#EADCD0] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
                className="accent-[#3B1F14]"
              />
              Solo con stock hoy
            </label>

            <select
              value={ordenPrecio}
              onChange={(e) =>
                setOrdenPrecio(
                  e.target.value as 'destacados' | 'menor' | 'mayor'
                )
              }
              className="text-xs font-semibold text-[#3B1F14] bg-[#FAF6F2] px-4 py-2.5 rounded-full border border-[#EADCD0] focus:outline-none"
            >
              <option value="destacados">Orden: Destacados</option>
              <option value="menor">Precio: Menor a Mayor</option>
              <option value="mayor">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#EADCD0]/60">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 active:scale-95 ${
                categoriaActiva === cat
                  ? 'bg-[#3B1F14] text-[#FAF6F2] shadow-sm'
                  : 'bg-[#F5CBB0]/40 text-[#3B1F14] hover:bg-[#F5CBB0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {cargando && (
        <p className="text-center py-12 text-[#6F4E37] font-medium">
          Cargando catálogo de Les Antoja?...
        </p>
      )}

      {errorDb && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-sm mb-6">
          <strong>Error de Supabase:</strong> {errorDb}
        </div>
      )}

      {!cargando && !errorDb && productosFiltrados.length === 0 && (
        <div className="bg-white border border-[#EADCD0] text-[#6F4E37] p-10 rounded-3xl text-center space-y-3">
          <p className="font-serif text-xl font-bold text-[#3B1F14]">
            No encontramos productos con ese filtro
          </p>
          <p className="text-sm">
            Probá con otra palabra clave o quitá los filtros activos.
          </p>
          <button
            onClick={() => {
              setBusqueda('');
              setCategoriaActiva('Todos');
              setSoloDisponibles(false);
            }}
            className="px-5 py-2 rounded-full bg-[#3B1F14] text-[#FAF6F2] text-xs font-bold"
          >
            Ver todos los productos
          </button>
        </div>
      )}

      {/* Grilla de productos */}
      <div
        key={`${categoriaActiva}-${busqueda}-${soloDisponibles}-${ordenPrecio}`}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7"
      >
        {productosFiltrados.map((prod, index) => {
          const enCarrito = carrito.find((i) => i.producto.id === prod.id);
          const agotado = prod.stock <= 0;

          return (
            <div
              key={prod.id}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`animate-card-enter card-shine group rounded-[2rem] p-6 border transition-all duration-300 flex flex-col justify-between ${
                agotado ? 'opacity-65 grayscale-[40%]' : ''
              } ${
                prod.destacado
                  ? 'bg-[#3B1F14] text-[#FAF6F2] border-[#3B1F14] shadow-xl shadow-[#3B1F14]/15 hover:-translate-y-2'
                  : 'card-artesanal text-[#3B1F14] hover:-translate-y-2'
              }`}
            >
              {/* Área clickeable para abrir el Modal Detallado */}
              <div
                onClick={() => abrirDetalle(prod)}
                className="cursor-pointer"
              >
                <div
                  className={`relative h-48 w-full rounded-2xl mb-5 overflow-hidden flex items-center justify-center ${
                    prod.destacado
                      ? 'bg-[#4E2A1C]'
                      : 'bg-[#FAF6F2] border border-[#EADCD0]/60'
                  }`}
                >
                  {prod.imagen_url ? (
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="text-center p-4 group-hover:scale-105 transition-transform duration-500">
                      <span className="font-serif italic text-2xl opacity-40 block">
                        Les Antoja?
                      </span>
                      <span className="text-[11px] uppercase tracking-widest opacity-50">
                        {prod.categoria}
                      </span>
                    </div>
                  )}

                  {/* Insignia sutil "Ver detalle" al pasar el mouse */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white/95 text-[#3B1F14] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-3.5 h-3.5" /> Ver detalle
                    </span>
                  </div>

                  <span
                    className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md ${
                      prod.destacado
                        ? 'bg-[#F5CBB0] text-[#3B1F14]'
                        : 'bg-white/90 text-[#3B1F14] border border-[#EADCD0]'
                    }`}
                  >
                    {prod.categoria}
                  </span>

                  <span
                    className={`absolute bottom-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      agotado
                        ? 'bg-red-600 text-white'
                        : prod.requiere_anticipacion
                        ? 'bg-[#F5CBB0]/90 text-[#3B1F14]'
                        : 'bg-black/60 text-white backdrop-blur-sm'
                    }`}
                  >
                    {agotado
                      ? 'Agotado hoy'
                      : prod.requiere_anticipacion
                      ? 'Bajo pedido'
                      : `Stock: ${prod.stock}`}
                  </span>
                </div>

                {prod.requiere_anticipacion && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium mb-2 ${
                      prod.destacado ? 'text-[#F5CBB0]' : 'text-[#9C6644]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Pedido con anticipación
                  </span>
                )}

                <h3 className="font-serif text-2xl font-bold leading-snug group-hover:underline decoration-[#F5CBB0] underline-offset-4">
                  {prod.nombre}
                </h3>
                <p
                  className={`text-sm mt-2 leading-relaxed line-clamp-2 ${
                    prod.destacado ? 'text-[#EADCD0]/90' : 'text-[#6F4E37]'
                  }`}
                >
                  {prod.descripcion}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider opacity-60 block">
                    Precio
                  </span>
                  <span className="text-xl font-bold tracking-tight">
                    {formatearGs(prod.precio)}
                  </span>
                </div>

                {agotado ? (
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-stone-300 text-stone-600 cursor-not-allowed">
                    Sin stock
                  </span>
                ) : enCarrito ? (
                  <div className="flex items-center gap-2 bg-[#F5CBB0] text-[#3B1F14] px-3.5 py-2 rounded-full font-bold shadow-sm">
                    <button
                      onClick={() => quitarDelCarrito(prod.id)}
                      className="hover:opacity-70 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm px-1.5">{enCarrito.cantidad}</span>
                    <button
                      onClick={() => agregarAlCarrito(prod)}
                      disabled={enCarrito.cantidad >= prod.stock}
                      className="hover:opacity-70 transition disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => agregarAlCarrito(prod)}
                    className={`group/btn px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-1.5 transition-all duration-300 active:scale-95 ${
                      prod.destacado
                        ? 'bg-[#F5CBB0] text-[#3B1F14] hover:bg-white'
                        : 'bg-[#3B1F14] text-[#FAF6F2] hover:bg-[#5A3222]'
                    }`}
                  >
                    Agregar{' '}
                    <Plus className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALLADO DE PRODUCTO CON ANIMACIÓN */}
      {productoSeleccionado && (
        <div
          onClick={() => setProductoSeleccionado(null)}
          className="animate-backdrop fixed inset-0 z-50 bg-[#3B1F14]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal bg-[#FAF6F2] text-[#3B1F14] rounded-[2.25rem] max-w-3xl w-full overflow-hidden shadow-2xl border border-[#EADCD0] grid md:grid-cols-2 relative"
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-[#F5CBB0] text-[#3B1F14] flex items-center justify-center shadow-md transition"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagen grande izquierda */}
            <div className="relative h-64 md:h-full min-h-[280px] bg-[#EADCD0]/40 flex items-center justify-center">
              {productoSeleccionado.imagen_url ? (
                <img
                  src={productoSeleccionado.imagen_url}
                  alt={productoSeleccionado.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="font-serif italic text-4xl text-[#3B1F14]/35 block">
                    Les Antoja?
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#9C6644] mt-1 block">
                    Pastelería Artesanal
                  </span>
                </div>
              )}

              <span className="absolute top-4 left-4 bg-[#3B1F14] text-[#F5CBB0] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                {productoSeleccionado.categoria}
              </span>
            </div>

            {/* Información detallada derecha */}
            <div className="p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold mb-2">
                  {productoSeleccionado.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {productoSeleccionado.requiere_anticipacion
                        ? 'Disponible por encargo'
                        : `En stock (${productoSeleccionado.stock} disp.)`}
                    </span>
                  ) : (
                    <span className="text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                      Agotado por hoy
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-3xl font-bold leading-tight">
                  {productoSeleccionado.nombre}
                </h3>

                <p className="text-2xl font-bold text-[#9C6644] mt-2">
                  {formatearGs(productoSeleccionado.precio)}
                </p>

                <p className="text-sm text-[#6F4E37] mt-4 leading-relaxed">
                  {productoSeleccionado.descripcion ||
                    'Elaborado artesanalmente con ingredientes seleccionados del día.'}
                </p>

                {/* Detalles extra de servicio */}
                <div className="mt-5 p-3.5 rounded-2xl bg-white border border-[#EADCD0] space-y-1.5 text-xs text-[#6F4E37]">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#9C6644] shrink-0" />
                    {productoSeleccionado.requiere_anticipacion
                      ? 'Solicitar con anticipación • Seña del 50% para confirmar.'
                      : 'Retiro en Capiatá (Ruta 2) o delivery coordinado.'}
                  </p>
                </div>
              </div>

              {/* Controles de cantidad y agregar */}
              {productoSeleccionado.stock > 0 ? (
                <div className="pt-2 flex items-center gap-3">
                  <div className="flex items-center gap-3 bg-white border border-[#EADCD0] px-4 py-3 rounded-full font-bold">
                    <button
                      onClick={() =>
                        setCantidadModal((c) => Math.max(1, c - 1))
                      }
                      className="hover:text-[#9C6644]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm min-w-[20px] text-center">
                      {cantidadModal}
                    </span>
                    <button
                      onClick={() =>
                        setCantidadModal((c) =>
                          Math.min(productoSeleccionado.stock, c + 1)
                        )
                      }
                      className="hover:text-[#9C6644]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      agregarAlCarrito(productoSeleccionado, cantidadModal);
                      setProductoSeleccionado(null);
                    }}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#3B1F14] hover:bg-[#5A3222] text-[#FAF6F2] font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#3B1F14]/15"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Agregar ({formatearGs(productoSeleccionado.precio * cantidadModal)})
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-full bg-stone-300 text-stone-600 font-bold text-sm cursor-not-allowed"
                >
                  Sin stock disponible hoy
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barra flotante de pedido WhatsApp */}
      {carrito.length > 0 && (
        <div className="animate-bar-enter fixed bottom-6 left-1/2 z-40 w-[94%] max-w-3xl bg-[#3B1F14] text-[#FAF6F2] p-4 sm:px-6 rounded-3xl sm:rounded-full shadow-2xl border border-[#F5CBB0]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-[#F5CBB0] text-[#3B1F14] p-2.5 rounded-full shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#F5CBB0]">
                {carrito.reduce((a, b) => a + b.cantidad, 0)} producto(s)
              </p>
              <p className="font-bold text-base">{formatearGs(totalGs)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Tu nombre..."
              className="px-3.5 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#F5CBB0] w-full sm:w-44"
            />
            <button
              onClick={enviarPedidoWhatsApp}
              disabled={enviando}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 transition shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              {enviando ? 'Enviando...' : 'Pedir'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}