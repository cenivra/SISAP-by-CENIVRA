import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app = null;
let auth: any = null;

try {
  // Inicialización condicional y segura: no bloquea el sistema local si Firebase no está configurado
  if (
    firebaseConfig?.apiKey &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    !firebaseConfig.apiKey.includes('PLACEHOLDER') &&
    firebaseConfig.apiKey.length > 10
  ) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('[GoogleDriveService] Firebase opcional no configurado. SISAP opera en modo local soberano:', error);
}

export { auth };

export const isGoogleDriveConfigured = (): boolean => Boolean(auth);

const provider = new GoogleAuthProvider();
// Workspace Drive scope
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    throw new Error('La integración de Google Drive / Firebase es opcional y no está configurada en este entorno.');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso desde Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error de autenticación con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
};

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

const DEFAULT_FOLDER_NAME = 'SISAP CENIVRA - Expedientes Clínicos';

/**
 * Searches for or creates a dedicated folder in Google Drive
 */
export async function getOrCreateClinicalFolder(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Se requiere autenticación activa con Google Drive.');

  // Search for folder
  const query = encodeURIComponent(
    `name = '${DEFAULT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Error al buscar carpeta en Drive: ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DEFAULT_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Expedientes clínicos anonimizados y respaldos institucionales de SISAP by CENIVRA',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Error al crear carpeta en Drive: ${errText}`);
  }

  const createdFolder = await createRes.json();
  return createdFolder.id;
}

/**
 * Uploads a text/json file using multipart upload into the clinical folder
 */
export async function uploadClinicalFileToDrive(
  fileName: string,
  content: string,
  mimeType = 'application/json'
): Promise<DriveFileInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('Se requiere autenticación activa con Google Drive.');

  const folderId = await getOrCreateClinicalFolder();

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Fallo al subir archivo a Drive: ${errText}`);
  }

  return await uploadRes.json();
}

/**
 * Lists clinical files stored in the SISAP folder
 */
export async function listDriveClinicalFiles(): Promise<DriveFileInfo[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const folderId = await getOrCreateClinicalFolder();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,size)&orderBy=createdTime desc`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.warn('Error al consultar lista de archivos de Drive:', await res.text());
      return [];
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listando archivos de Drive:', err);
    return [];
  }
}

/**
 * Deletes a file in Google Drive. Requires explicit user confirmation in the calling UI!
 */
export async function deleteDriveClinicalFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Se requiere autenticación activa.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al eliminar archivo en Drive: ${errText}`);
  }

  return true;
}
