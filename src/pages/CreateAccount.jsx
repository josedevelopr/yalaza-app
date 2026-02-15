import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/login.css';
import MainLayout from '../layouts/MainLayout';


const CreateAccount = () => {
  return (
    <MainLayout>
      <div class="content">
        <div class="glass form-card">
          <form>
            <div class="form-grid">

              <div class="field">
                <label for="nombre">Nombre</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input id="nombre" class="input" type="text" placeholder="Ej. Juan" />
                </div>
              </div>

              <div class="field">
                <label for="apellidos">Apellidos</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input id="apellidos" class="input" type="text" placeholder="Ej. Tenorio" />
                </div>
              </div>

              <div class="field error">
                <label for="email">Correo</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16v16H4z" opacity=".12"></path>
                    <path d="M4 8l8 5 8-5"></path>
                    <path d="M4 8v12h16V8"></path>
                  </svg>
                  <input id="email" class="input" type="email" placeholder="ejemplo@correo.com" value="cris@correo" />
                </div>
              </div>

              <div class="field">
                <label for="telefono">Teléfono</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.09 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.57 2.5a2 2 0 0 1-.45 2.11L9 10.91a16 16 0 0 0 6.09 6.09l1.58-1.23a2 2 0 0 1 2.11-.45c.8.27 1.64.45 2.5.57A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input id="telefono" class="input" type="tel" placeholder="+51 999 999 999" />
                </div>
                <div class="hint">Opcional, pero ayuda para soporte y recuperación.</div>
              </div>

              <div class="field">
                <label for="pass">Contraseña</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input id="pass" class="input" type="password" placeholder="Mínimo 8 caracteres" />
                </div>
                <div class="hint">Usa mayúsculas y números para mayor seguridad.</div>
              </div>

              <div class="field">
                <label for="pass2">Confirmar contraseña</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input id="pass2" class="input" type="password" placeholder="Repite la contraseña" />
                </div>
              </div>

              <div class="field full">
                <label for="rol">Rol</label>
                <div class="control">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z"></path>
                  </svg>
                  <select id="rol" class="select">
                    <option value="ADMIN">Administrador</option>
                    <option value="ORGANIZADOR">Organizador</option>
                    <option value="SOPORTE">Soporte</option>
                  </select>
                </div>
                <div class="hint">Define qué pantallas podrá ver y qué acciones podrá realizar.</div>
              </div>

            </div>

            <div class="row">
              <label class="checkbox">
                <input type="checkbox" checked />
                Usuario activo
              </label>

              <div class="actions">
                <button type="button" class="btn ghost">Cancelar</button>
                <button type="submit" class="btn success">Crear usuario</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateAccount;