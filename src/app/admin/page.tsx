'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import QrCafeteria from '@/src/components/QrCafeteria';
import {
  Lock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Upload,
  Settings,
  Package,
  ShoppingBag,
  ArrowLeft,
  Search,
  Tag,
} from 'lucide-react';

interface Producto {
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

interface Categoria {
  id: string;
  nombre: string;
}

interface PedidoWhatsapp {
  id: string;
  cliente_nombre: string;
  items: {
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
  total: number;
  estado: string;
  created_at: string;
}

interface PedidoEspecial {
  id: string;
  nombre_cliente: string;
  telefono: string;
  tipo_pedido: string;
  fecha_entrega: string;
  detalles: string;
  estado: string;
  created_at: string;
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinReal, setPinReal] = useState('1234');

  const [tab, setTab] = useState<'productos' | 'pedidos' | 'config'>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pedidosWa, setPedidosWa] = useState<PedidoWhatsapp[]>([]);
  const [pedidosEsp, setPedidosEsp] = useState<PedidoEspecial[]>([]);
  const [whatsappNum, setWhatsappNum] = useState('595994717184');
  const [nuevoPin, setNuevoPin] = useState('');
  const [msgConfig, setMsgConfig] = useState('');

  // Nueva categoría
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Filtros en Admin -> Productos
  const [busquedaProd, setBusquedaProd] = useState('');
  const [filtroCatAdmin, setFiltroCatAdmin] = useState('Todas');
  const [filtroStockAdmin, setFiltroStockAdmin] = useState<'todos' | 'bajo' | 'agotado'>('todos');

  // Filtros en Admin -> Pedidos
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState<'todos' | 'pendiente' | 'confirmado' | 'cancelado'>('todos');

  // Estado formulario producto (Crear / Editar)
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('Cookies');
  const [stock, setStock] = useState('10');
  const [destacado, setDestacado] = useState(false);
  const [requiereAnt, setRequiereAnt] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');
  const [subiendoImg, setSubiendoImg] = useState(false);

  useEffect(() => {
    cargarConfig();
  }, []);

  async function cargarConfig() {
    const { data } = await supabase
      .from('configuracion')
      .select('*')
      .eq('id', 1)
      .single();
    if (data) {
      setPinReal(data.admin_pin);
      setWhatsappNum(data.whatsapp_numero);
    }
  }

  async function cargarDatos() {
    const { data: cats } = await supabase
      .from('categorias')
      .select('*')
      .order('created_at', { ascending: true });
    if (cats) {
      setCategorias(cats);
      if (cats.length > 0 && !categoria) {
        setCategoria(cats[0].nombre);
      }
    }

    const { data: prods } = await supabase
      .from('productos')
      .select('*')
      .order('categoria', { ascending: true });
    if (prods) setProductos(prods);

    const { data: pWa } = await supabase
      .from('pedidos_whatsapp')
      .select('*')
      .order('created_at', { ascending: false });
    if (pWa) setPedidosWa(pWa);

    const { data: pEsp } = await supabase
      .from('pedidos_especiales')
      .select('*')
      .order('created_at', { ascending: false });
    if (pEsp) setPedidosEsp(pEsp);
  }

  const verificarPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === pinReal) {
      setAutenticado(true);
      setPinError('');
      cargarDatos();
    } else {
      setPinError('PIN incorrecto. Intentá nuevamente.');
    }
  };

  // Crear / Borrar Categorías
  const agregarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpia = nuevaCategoria.trim();
    if (!limpia) return;

    const { error } = await supabase
      .from('categorias')
      .insert({ nombre: limpia });

    if (error) {
      alert('Esa categoría ya existe o hubo un error.');
    } else {
      setNuevaCategoria('');
      setCategoria(limpia);
      cargarDatos();
    }
  };

  const borrarCategoria = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    await supabase.from('categorias').delete().eq('id', cat.id);
    cargarDatos();
  };

  // Subir imagen a Supabase Storage
  const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoImg(true);

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('productos')
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName);
      setImagenUrl(data.publicUrl);
    } else {
      alert('Error al subir imagen. Verificá los permisos del bucket "productos".');
    }
    setSubiendoImg(false);
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre,
      descripcion,
      precio: Number(precio),
      categoria,
      stock: Number(stock),
      destacado,
      requiere_anticipacion: requiereAnt,
      imagen_url: imagenUrl || null,
    };

    if (editandoId) {
      await supabase.from('productos').update(payload).eq('id', editandoId);
    } else {
      await supabase.from('productos').insert(payload);
    }

    limpiarFormulario();
    cargarDatos();
  };

  const editarProducto = (p: Producto) => {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setDescripcion(p.descripcion || '');
    setPrecio(String(p.precio));
    setCategoria(p.categoria);
    setStock(String(p.stock));
    setDestacado(p.destacado);
    setRequiereAnt(p.requiere_anticipacion);
    setImagenUrl(p.imagen_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const borrarProducto = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', id);
    cargarDatos();
  };

  const ajusteRapidoStock = async (id: string, nuevoStock: number) => {
    if (nuevoStock < 0) return;
    await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', id);
    cargarDatos();
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria(categorias[0]?.nombre || 'Cookies');
    setStock('10');
    setDestacado(false);
    setRequiereAnt(false);
    setImagenUrl('');
  };

  const gestionarPedidoWa = async (
    pedido: PedidoWhatsapp,
    nuevoEstado: 'confirmado' | 'cancelado'
  ) => {
    if (pedido.estado !== 'pendiente') return;

    if (nuevoEstado === 'confirmado') {
      for (const item of pedido.items) {
        const prodActual = productos.find((p) => p.id === item.producto_id);
        if (prodActual) {
          const stockRestante = Math.max(0, prodActual.stock - item.cantidad);
          await supabase
            .from('productos')
            .update({ stock: stockRestante })
            .eq('id', prodActual.id);
        }
      }
    }

    await supabase
      .from('pedidos_whatsapp')
      .update({ estado: nuevoEstado })
      .eq('id', pedido.id);

    cargarDatos();
  };

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinFinal = nuevoPin.trim() ? nuevoPin.trim() : pinReal;
    await supabase
      .from('configuracion')
      .update({
        whatsapp_numero: whatsappNum.replace(/\D/g, ''),
        admin_pin: pinFinal,
      })
      .eq('id', 1);

    setPinReal(pinFinal);
    setNuevoPin('');
    setMsgConfig('¡Configuración guardada con éxito!');
    setTimeout(() => setMsgConfig(''), 3000);
  };

  // Listas filtradas en Admin
  const productosAdminFiltrados = productos.filter((p) => {
    const q = busquedaProd.toLowerCase().trim();
    const matchTexto =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q));
    const matchCat =
      filtroCatAdmin === 'Todas' || p.categoria === filtroCatAdmin;
    const matchStock =
      filtroStockAdmin === 'todos' ||
      (filtroStockAdmin === 'agotado' && p.stock === 0) ||
      (filtroStockAdmin === 'bajo' && p.stock > 0 && p.stock <= 5);
    return matchTexto && matchCat && matchStock;
  });

  const pedidosWaFiltrados = pedidosWa.filter((ped) => {
    const q = busquedaPedido.toLowerCase().trim();
    const matchCliente =
      !q ||
      ped.cliente_nombre.toLowerCase().includes(q) ||
      ped.items.some((i) => i.nombre.toLowerCase().includes(q));
    const matchEstado =
      filtroEstadoPedido === 'todos' || ped.estado === filtroEstadoPedido;
    return matchCliente && matchEstado;
  });

  const pedidosEspFiltrados = pedidosEsp.filter((esp) => {
    const q = busquedaPedido.toLowerCase().trim();
    return (
      !q ||
      esp.nombre_cliente.toLowerCase().includes(q) ||
      esp.tipo_pedido.toLowerCase().includes(q) ||
      esp.telefono.includes(q)
    );
  });

  // PANTALLA DE BLOQUEO CON PIN
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#FAF6F2] flex items-center justify-center p-6">
        <form
          onSubmit={verificarPin}
          className="bg-white p-8 rounded-3xl border border-[#EADCD0] shadow-xl max-w-sm w-full text-center space-y-5"
        >
          <div className="w-14 h-14 rounded-full bg-[#F5CBB0] text-[#3B1F14] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">Panel Les Antoja?</h1>
            <p className="text-xs text-[#6F4E37] mt-1">
              Ingresá el PIN de administración
            </p>
          </div>
          <input
            type="password"
            maxLength={8}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="••••"
            className="w-full text-center text-2xl tracking-[0.5em] py-3 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] focus:outline-none focus:border-[#3B1F14]"
          />
          {pinError && <p className="text-xs text-red-600 font-medium">{pinError}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#3B1F14] text-[#FAF6F2] font-bold text-sm hover:bg-[#5A3222] transition"
          >
            Ingresar
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-xs text-[#6F4E37] hover:underline"
          >
            <ArrowLeft className="w-3 h-3" /> Volver a la tienda
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-[#3B1F14] pb-20">
      {/* Header Admin */}
      <header className="bg-[#3B1F14] text-[#FAF6F2] px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="font-serif text-xl font-bold">
            LES ANTOJA? — Admin
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTab('productos')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                tab === 'productos'
                  ? 'bg-[#F5CBB0] text-[#3B1F14]'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Package className="w-4 h-4" /> Catálogo y Stock
            </button>
            <button
              onClick={() => setTab('pedidos')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                tab === 'pedidos'
                  ? 'bg-[#F5CBB0] text-[#3B1F14]'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Pedidos (
              {pedidosWa.filter((p) => p.estado === 'pendiente').length})
            </button>
            <button
              onClick={() => setTab('config')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                tab === 'config'
                  ? 'bg-[#F5CBB0] text-[#3B1F14]'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4" /> Config y QR
            </button>
            <a href="/" className="ml-2 text-xs underline text-[#F5CBB0]">
              Ver Web
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {/* PESTAÑA 1: CATÁLOGO, CATEGORÍAS Y STOCK */}
        {tab === 'productos' && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Columna Izquierda: Formulario Producto + Gestor Categorías */}
            <div className="space-y-6">
              <form
                onSubmit={guardarProducto}
                className="bg-white p-6 rounded-3xl border border-[#EADCD0] space-y-4"
              >
                <h2 className="font-serif text-2xl font-bold">
                  {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>

                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                />

                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción corta..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#6F4E37]">
                      Precio (Gs.)
                    </label>
                    <input
                      type="number"
                      required
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="14000"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#6F4E37]">
                      Stock Hoy
                    </label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-[#6F4E37]">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-[#6F4E37] block">
                    Foto del Producto
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#9C6644] bg-[#FAF6F2] text-xs font-semibold cursor-pointer hover:bg-[#F5CBB0]/30 transition">
                    <Upload className="w-4 h-4" />
                    {subiendoImg
                      ? 'Subiendo foto...'
                      : 'Subir imagen desde dispositivo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirImagen}
                      className="hidden"
                    />
                  </label>
                  {imagenUrl && (
                    <img
                      src={imagenUrl}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-xl border border-[#EADCD0]"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={destacado}
                      onChange={(e) => setDestacado(e.target.checked)}
                    />
                    Destacar tarjeta (fondo marrón chocolate)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiereAnt}
                      onChange={(e) => setRequiereAnt(e.target.checked)}
                    />
                    Requiere pedido con anticipación
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#3B1F14] text-[#FAF6F2] text-xs font-bold hover:bg-[#5A3222] transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {editandoId ? 'Guardar Cambios' : 'Agregar Producto'}
                  </button>
                  {editandoId && (
                    <button
                      type="button"
                      onClick={limpiarFormulario}
                      className="px-4 py-3 rounded-full bg-stone-200 text-xs font-bold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Gestor de Categorías */}
              <div className="bg-white p-6 rounded-3xl border border-[#EADCD0] space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#9C6644]" />
                  <h3 className="font-serif text-xl font-bold">
                    Categorías de la Tienda
                  </h3>
                </div>

                <form onSubmit={agregarCategoria} className="flex gap-2">
                  <input
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Nueva categoría (ej. Café Frío)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#F5CBB0] text-[#3B1F14] text-xs font-bold hover:bg-[#eeb998]"
                  >
                    Crear
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {categorias.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#EADCD0] text-xs font-medium"
                    >
                      {c.nombre}
                      <button
                        onClick={() => borrarCategoria(c)}
                        className="text-red-500 hover:text-red-700 font-bold"
                        title="Eliminar categoría"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Buscador + Lista de Productos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-2xl font-bold">
                  Productos en Catálogo ({productosAdminFiltrados.length})
                </h2>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EADCD0] grid sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9C6644] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaProd}
                    onChange={(e) => setBusquedaProd(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-xs"
                  />
                </div>

                <select
                  value={filtroCatAdmin}
                  onChange={(e) => setFiltroCatAdmin(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-xs font-medium"
                >
                  <option value="Todas">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroStockAdmin}
                  onChange={(e) =>
                    setFiltroStockAdmin(
                      e.target.value as 'todos' | 'bajo' | 'agotado'
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-xs font-medium"
                >
                  <option value="todos">Estado stock: Todos</option>
                  <option value="bajo">Stock bajo (1 a 5)</option>
                  <option value="agotado">Agotados (0)</option>
                </select>
              </div>

              <div className="space-y-3">
                {productosAdminFiltrados.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-2xl border border-[#EADCD0] flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt={p.nombre}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#FAF6F2] flex items-center justify-center text-[10px] text-[#9C6644] font-bold">
                          Sin foto
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9C6644]">
                          {p.categoria}
                        </span>
                        <h3 className="font-bold text-base">{p.nombre}</h3>
                        <p className="text-xs text-[#6F4E37]">
                          Gs. {p.precio.toLocaleString('es-PY')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-[#FAF6F2] px-3 py-1.5 rounded-full border border-[#EADCD0]">
                        <span className="text-[11px] font-semibold">Stock:</span>
                        <button
                          onClick={() => ajusteRapidoStock(p.id, p.stock - 1)}
                          className="w-6 h-6 rounded-full bg-white border text-xs font-bold"
                        >
                          -
                        </button>
                        <span
                          className={`text-sm font-bold min-w-[24px] text-center ${
                            p.stock === 0 ? 'text-red-600' : ''
                          }`}
                        >
                          {p.stock}
                        </span>
                        <button
                          onClick={() => ajusteRapidoStock(p.id, p.stock + 1)}
                          className="w-6 h-6 rounded-full bg-white border text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => editarProducto(p)}
                        className="p-2 rounded-full hover:bg-[#F5CBB0]/50 text-[#3B1F14]"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => borrarProducto(p.id)}
                        className="p-2 rounded-full hover:bg-red-100 text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CONTROL DE PEDIDOS CON BUSCADOR Y FILTROS */}
        {tab === 'pedidos' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-[#EADCD0] flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9C6644] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaPedido}
                  onChange={(e) => setBusquedaPedido(e.target.value)}
                  placeholder="Buscar por nombre de cliente, producto o teléfono..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['todos', 'pendiente', 'confirmado', 'cancelado'] as const).map(
                  (est) => (
                    <button
                      key={est}
                      onClick={() => setFiltroEstadoPedido(est)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition ${
                        filtroEstadoPedido === est
                          ? 'bg-[#3B1F14] text-[#FAF6F2]'
                          : 'bg-[#FAF6F2] text-[#3B1F14] border border-[#EADCD0]'
                      }`}
                    >
                      {est}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">
                  Pedidos vía WhatsApp ({pedidosWaFiltrados.length})
                </h2>
                {pedidosWaFiltrados.length === 0 && (
                  <p className="text-sm text-[#6F4E37]">
                    No hay pedidos que coincidan con la búsqueda.
                  </p>
                )}
                {pedidosWaFiltrados.map((ped) => (
                  <div
                    key={ped.id}
                    className="bg-white p-5 rounded-2xl border border-[#EADCD0] space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{ped.cliente_nombre}</p>
                        <p className="text-xs text-[#6F4E37]">
                          {new Date(ped.created_at).toLocaleString('es-PY')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          ped.estado === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ped.estado === 'cancelado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ped.estado}
                      </span>
                    </div>

                    <ul className="text-xs space-y-1 bg-[#FAF6F2] p-3 rounded-xl">
                      {ped.items.map((it, idx) => (
                        <li key={idx}>
                          • <strong>{it.cantidad}x</strong> {it.nombre} (Gs.{' '}
                          {(it.precio * it.cantidad).toLocaleString('es-PY')})
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-sm">
                        Total: Gs. {ped.total.toLocaleString('es-PY')}
                      </span>

                      {ped.estado === 'pendiente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => gestionarPedidoWa(ped, 'confirmado')}
                            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar y
                            Restar Stock
                          </button>
                          <button
                            onClick={() => gestionarPedidoWa(ped, 'cancelado')}
                            className="px-3.5 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">
                  Solicitudes de Tortas / Mesa Dulce ({pedidosEspFiltrados.length})
                </h2>
                {pedidosEspFiltrados.length === 0 && (
                  <p className="text-sm text-[#6F4E37]">
                    No hay solicitudes especiales que coincidan.
                  </p>
                )}
                {pedidosEspFiltrados.map((esp) => (
                  <div
                    key={esp.id}
                    className="bg-white p-5 rounded-2xl border border-[#EADCD0] space-y-2"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs font-bold uppercase text-[#9C6644]">
                        {esp.tipo_pedido}
                      </span>
                      <span className="text-xs font-bold">
                        Entrega: {esp.fecha_entrega}
                      </span>
                    </div>
                    <p className="font-bold">{esp.nombre_cliente}</p>
                    <p className="text-xs text-[#6F4E37]">{esp.detalles}</p>
                    <a
                      href={`https://wa.me/${esp.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      className="inline-block mt-2 text-xs font-bold text-emerald-700 underline"
                    >
                      Contactar al {esp.telefono} →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: CONFIGURACIÓN Y CÓDIGO QR */}
        {tab === 'config' && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <form
              onSubmit={guardarConfiguracion}
              className="bg-white p-8 rounded-3xl border border-[#EADCD0] space-y-5"
            >
              <h2 className="font-serif text-2xl font-bold">
                Configuración de la Tienda
              </h2>

              <div>
                <label className="text-xs font-bold uppercase text-[#6F4E37] block mb-1">
                  Número de WhatsApp (con código de país, sin +)
                </label>
                <input
                  required
                  value={whatsappNum}
                  onChange={(e) => setWhatsappNum(e.target.value)}
                  placeholder="595994717184"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#6F4E37] block mb-1">
                  Cambiar PIN del Panel Admin (opcional)
                </label>
                <input
                  type="password"
                  value={nuevoPin}
                  onChange={(e) => setNuevoPin(e.target.value)}
                  placeholder="Dejar vacío para mantener el actual"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#3B1F14] text-[#FAF6F2] text-sm font-bold hover:bg-[#5A3222] transition"
              >
                Guardar Configuración
              </button>

              {msgConfig && (
                <p className="text-xs text-center font-bold text-emerald-700">
                  {msgConfig}
                </p>
              )}
            </form>

            <QrCafeteria />
          </div>
        )}
      </main>
    </div>
  );
}