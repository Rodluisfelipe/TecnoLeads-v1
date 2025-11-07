// TecnoLeads - Electron Main Process
// Autor: Felipe Rodriguez - Tecnophone Colombia SAS

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let backendProcess;
let frontendUrl;

// Configuración
const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = 5173;

// Paths - Compatible con desarrollo y producción empaquetada
let backendPath, frontendPath;

if (isDev) {
  // Desarrollo: Rutas relativas desde electron/
  backendPath = path.join(__dirname, '..', 'backend');
  frontendPath = `http://localhost:${FRONTEND_PORT}`;
} else {
  // Producción empaquetada con electron-packager
  // La estructura es: TecnoLeads-win32-x64/resources/app.asar (código electron)
  //                   TecnoLeads-win32-x64/resources/backend/ (copiado manualmente)
  //                   TecnoLeads-win32-x64/resources/frontend/ (copiado manualmente)
  backendPath = path.join(process.resourcesPath, 'backend');
  frontendPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
}

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port, '127.0.0.1');
  });
}

// Iniciar servidor backend
async function startBackend() {
  return new Promise(async (resolve, reject) => {
    console.log('🔧 Iniciando backend...');
    
    // Verificar si el puerto ya está en uso
    const portInUse = await isPortInUse(BACKEND_PORT);
    if (portInUse) {
      console.log(`⚠️ Puerto ${BACKEND_PORT} ya en uso, asumiendo backend corriendo`);
      resolve();
      return;
    }

    const env = {
      ...process.env,
      PORT: BACKEND_PORT,
      NODE_ENV: isDev ? 'development' : 'production',
    };

    // Usar el Node.js integrado de Electron en producción
    const nodeCommand = isDev ? 'node' : process.execPath;
    const args = isDev 
      ? ['src/server.js']
      : [path.join(backendPath, 'src', 'server.js')];

    backendProcess = spawn(nodeCommand, args, {
      cwd: backendPath,
      env,
      stdio: 'pipe',
    });

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output}`);
      
      // Detectar cuando el servidor está listo
      if (output.includes('Servidor corriendo') || output.includes('puerto')) {
        console.log('✅ Backend iniciado correctamente');
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend cerrado con código ${code}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Error al iniciar backend:', err);
      reject(err);
    });

    // Timeout de seguridad
    setTimeout(() => {
      console.log('✅ Backend asumido como iniciado (timeout)');
      resolve();
    }, 5000);
  });
}

// Crear ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#1a1a2e',
    show: false, // No mostrar hasta que esté listo
    autoHideMenuBar: true, // Ocultar menú en producción
  });

  // Cargar aplicación
  console.log(`🌐 Cargando desde: ${frontendUrl}`);
  
  if (isDev) {
    // En desarrollo, cargar desde servidor Vite
    mainWindow.loadURL(frontendUrl);
  } else {
    // En producción, cargar archivo HTML con protocolo file://
    mainWindow.loadFile(frontendUrl).catch(err => {
      console.error('❌ Error cargando archivo:', err);
      dialog.showErrorBox('Error', `No se pudo cargar la aplicación:\n${err.message}`);
    });
  }
  
  // Log cuando termine de cargar
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Página cargada completamente');
  });
  
  // Log de errores de consola
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer] ${message}`);
  });

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Ventana principal mostrada');
  });

  // Abrir DevTools solo en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Interceptar navegación externa
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Manejar cierre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialización de la app
app.whenReady().then(async () => {
  console.log('🚀 TecnoLeads iniciando...');
  console.log(`📁 Backend path: ${backendPath}`);
  
  // Definir URL del frontend
  frontendUrl = frontendPath;
  console.log(`🌐 Frontend URL: ${frontendUrl}`);

  try {
    // Iniciar backend
    await startBackend();

    // Esperar un poco para asegurar que el backend esté listo
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Crear ventana
    createWindow();

    console.log('✅ TecnoLeads iniciado correctamente');
  } catch (error) {
    console.error('❌ Error al iniciar TecnoLeads:', error);
    
    dialog.showErrorBox(
      'Error al iniciar',
      `No se pudo iniciar TecnoLeads:\n\n${error.message}`
    );
    
    app.quit();
  }
});

// Manejar activación (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cerrar backend al salir
app.on('before-quit', () => {
  if (backendProcess) {
    console.log('🛑 Cerrando backend...');
    backendProcess.kill();
  }
});

// Salir cuando todas las ventanas se cierren (excepto macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${BACKEND_PORT}`;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Manejo de errores no capturadas
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
  dialog.showErrorBox(
    'Error Inesperado',
    `Ha ocurrido un error inesperado:\n\n${error.message}`
  );
});

console.log('📱 Proceso principal de Electron cargado');
