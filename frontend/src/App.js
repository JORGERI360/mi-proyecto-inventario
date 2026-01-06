import React, { useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./App.css";

/* ===============================
   USUARIOS DEL SISTEMA
================================ */
const USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "jefe", password: "jefe123", role: "jefe" },
  { username: "aux", password: "aux123", role: "auxiliar" },
];

function App() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState({ username: "", password: "" });

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    tipo: "",
    ubicacion: "",
    estado: "",
  });

  /* ===============================
     LOGIN
  ================================ */
  const handleLogin = () => {
    const found = USERS.find(
      (u) =>
        u.username === login.username &&
        u.password === login.password
    );
    if (!found) {
      alert("Credenciales incorrectas");
      return;
    }
    setUser(found);
  };

  /* ===============================
     CRUD
  ================================ */
  const saveItem = (item) => {
    const exists = items.find((i) => i.id === item.id);
    const updated = exists
      ? items.map((i) => (i.id === item.id ? item : i))
      : [...items, item];

    setItems(updated);
    setFilteredItems(updated);
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar mobiliario?")) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    setFilteredItems(updated);
  };

  /* ===============================
     FILTROS
  ================================ */
  const applyFilters = () => {
    let result = [...items];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.nombre.toLowerCase().includes(s) ||
          i.codigo.toLowerCase().includes(s) ||
          i.descripcion.toLowerCase().includes(s)
      );
    }

    if (filters.ubicacion) {
      result = result.filter(
        (i) => i.ubicacion === filters.ubicacion
      );
    }

    if (filters.estado) {
      result = result.filter(
        (i) => i.estado === filters.estado
      );
    }

    setFilteredItems(result);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      tipo: "",
      ubicacion: "",
      estado: "",
    });
    setFilteredItems(items);
  };

  /* ===============================
     EXPORTACIONES
  ================================ */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventario de Mobiliario", 10, 10);
    let y = 20;
    filteredItems.forEach((i, idx) => {
      doc.text(
        `${idx + 1}. ${i.nombre} | ${i.codigo} | ${i.ubicacion} | Cant: ${i.cantidad}`,
        10,
        y
      );
      y += 8;
    });
    doc.save("inventario.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([buffer]), "inventario.xlsx");
  };

  /* ===============================
     LOGIN PREMIUM
  ================================ */
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Sistema de Inventario</h1>
          <p className="login-subtitle">
            Instituto Tecnológico de Tehuacán
          </p>

          <div className="login-form">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Ingrese su usuario"
              onChange={(e) =>
                setLogin({
                  ...login,
                  username: e.target.value,
                })
              }
            />

            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              onChange={(e) =>
                setLogin({
                  ...login,
                  password: e.target.value,
                })
              }
            />

            <button
              className="btn-login"
              onClick={handleLogin}
            >
              Iniciar sesión
            </button>
          </div>

          <span className="login-footer">
            Sistema de control de mobiliario institucional
          </span>
        </div>
      </div>
    );
  }

  /* ===============================
     SISTEMA PRINCIPAL
  ================================ */
  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>Inventario</h3>
        <p className="role">{user.role.toUpperCase()}</p>
      </aside>

      <main className="content">
        <header className="topbar">
          <h2>Gestión de Mobiliario</h2>
          <button
            className="btn danger"
            onClick={() => setUser(null)}
          >
            Salir
          </button>
        </header>

        {/* FILTROS */}
        <div className="filter-panel">
          <input
            placeholder="Buscar por nombre, código o descripción"
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
          />

          <select
            value={filters.ubicacion}
            onChange={(e) =>
              setFilters({
                ...filters,
                ubicacion: e.target.value,
              })
            }
          >
            <option value="">Ubicación</option>
            <option>Aula</option>
            <option>Laboratorio</option>
            <option>Oficina</option>
          </select>

          <select
            value={filters.estado}
            onChange={(e) =>
              setFilters({
                ...filters,
                estado: e.target.value,
              })
            }
          >
            <option value="">Estado</option>
            <option>Bueno</option>
            <option>Regular</option>
            <option>Malo</option>
          </select>

          <button className="btn primary" onClick={applyFilters}>
            Aplicar filtro
          </button>
          <button className="btn" onClick={clearFilters}>
            Limpiar
          </button>
        </div>

        {/* ACCIONES */}
        <div className="actions">
          {user.role !== "auxiliar" && (
            <button
              className="btn success"
              onClick={() => setModalOpen(true)}
            >
              + Agregar
            </button>
          )}
          <button className="btn pdf" onClick={exportPDF}>
            PDF
          </button>
          <button
            className="btn excel"
            onClick={exportExcel}
          >
            Excel
          </button>
        </div>

        {/* TABLA */}
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Cantidad</th>
              {user.role !== "auxiliar" && (
                <th>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((i) => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>{i.codigo}</td>
                <td>{i.ubicacion}</td>
                <td>{i.estado}</td>
                <td>{i.cantidad}</td>
                {user.role !== "auxiliar" && (
                  <td>
                    <button
                      className="btn small"
                      onClick={() => {
                        setEditingItem(i);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn small danger"
                      onClick={() =>
                        handleDelete(i.id)
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {modalOpen && (
        <Modal
          onSave={saveItem}
          onClose={() => setModalOpen(false)}
          item={editingItem}
        />
      )}
    </div>
  );
}

/* ===============================
   MODAL
================================ */
function Modal({ onSave, onClose, item }) {
  const [data, setData] = useState(
    item || {
      id: Date.now(),
      nombre: "",
      codigo: "",
      descripcion: "",
      ubicacion: "",
      estado: "",
      cantidad: "",
    }
  );

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>
          {item ? "Editar" : "Agregar"} Mobiliario
        </h3>

        <input
          placeholder="Nombre"
          value={data.nombre}
          onChange={(e) =>
            setData({ ...data, nombre: e.target.value })
          }
        />
        <input
          placeholder="Código"
          value={data.codigo}
          onChange={(e) =>
            setData({ ...data, codigo: e.target.value })
          }
        />
        <input
          placeholder="Descripción"
          value={data.descripcion}
          onChange={(e) =>
            setData({
              ...data,
              descripcion: e.target.value,
            })
          }
        />
        <input
          placeholder="Ubicación"
          value={data.ubicacion}
          onChange={(e) =>
            setData({
              ...data,
              ubicacion: e.target.value,
            })
          }
        />
        <input
          placeholder="Estado"
          value={data.estado}
          onChange={(e) =>
            setData({ ...data, estado: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={data.cantidad}
          onChange={(e) =>
            setData({
              ...data,
              cantidad: e.target.value,
            })
          }
        />

        <div className="modal-actions">
          <button
            className="btn success"
            onClick={() => onSave(data)}
          >
            Guardar
          </button>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

