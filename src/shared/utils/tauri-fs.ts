// Helper to check if we are running in Tauri
export const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export async function getAppDefaultPath(base: 'Download' | 'Documents'): Promise<string> {
  if (!isTauri()) return '';
  
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    // Call our custom Rust command
    const path = await invoke('get_app_export_path', { base });
    return path as string;
  } catch (e) {
    console.error('Error getting default path:', e);
    return '';
  }
}

export async function pickDirectory(): Promise<string | null> {
  if (!isTauri()) return null;
  
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Export Folder'
    });
    return selected as string | null;
  } catch (e) {
    console.error('Error picking directory:', e);
    return null;
  }
}

// Simple path join helper since we removed the path plugin
export function joinPath(dir: string, file: string) {
    // Detect separator based on dir content or default to /
    const separator = dir.includes('\\') ? '\\' : '/';
    // Remove trailing separator from dir if present
    const cleanDir = dir.endsWith(separator) ? dir.slice(0, -1) : dir;
    return `${cleanDir}${separator}${file}`;
}

async function getNextVideoNumber(dirPath: string): Promise<string> {
    try {
        const { readDir } = await import('@tauri-apps/plugin-fs');
        const entries = await readDir(dirPath);
        let maxNumber = 0;
        
        for (const entry of entries) {
            // Check if it's a file (not a directory)
            // In Tauri v2 fs plugin, entries have isDirectory boolean
            if (entry.isDirectory) continue;
            
            const name = entry.name;
            const match = name.match(/^(\d+)_/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNumber) maxNumber = num;
            }
        }
        
        return (maxNumber + 1).toString().padStart(2, '0');
    } catch (e) {
        console.warn("Error reading dir for auto-numbering:", e);
        return "01";
    }
}

export async function saveVideoFile(blob: Blob, filename: string, options: { defaultDir?: string, skipDialog?: boolean } = {}) {
  const { defaultDir, skipDialog } = options;

  if (!isTauri()) {
    // Web Fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    const { save } = await import('@tauri-apps/plugin-dialog');
    // Tauri v2 fs plugin uses writeFile (for both text and binary) and mkdir
    const { writeFile, mkdir, exists } = await import('@tauri-apps/plugin-fs');

    // Ensure defaultDir exists if provided
    if (defaultDir) {
        try {
            const dirExists = await exists(defaultDir);
            if (!dirExists) {
                await mkdir(defaultDir, { recursive: true });
            }
        } catch (e) {
            console.warn("Could not ensure default dir:", e);
        }
    }

    // Determine filename with auto-numbering if defaultDir is available
    let finalFileName = filename;
    if (defaultDir) {
        const nextNum = await getNextVideoNumber(defaultDir);
        finalFileName = `${nextNum}_${filename}`;
    }

    // Construct full default path manually
    let defaultPath = finalFileName;
    if (defaultDir) {
        defaultPath = joinPath(defaultDir, finalFileName);
    }

    // If skipDialog is true and we have a default path, try to save directly
    if (skipDialog && defaultDir) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            await writeFile(defaultPath, uint8Array);
            
            // Notify success (optional)
            // alert(`Video saved to: ${defaultPath}`);
            return; // Done
        } catch (e) {
            console.error("Direct save failed, falling back to dialog:", e);
            // Fallback to dialog if direct save fails
        }
    }

    // Open Save Dialog
    const filePath = await save({
      title: 'Save Video',
      defaultPath: defaultPath,
      filters: [{
        name: 'Video',
        extensions: ['mp4']
      }]
    });

    if (!filePath) return; // User cancelled

    // Write File
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    await writeFile(filePath, uint8Array);

    // Notify (optional, could use Tauri notification)
    // alert('Video saved successfully!');

  } catch (e) {
    console.error('Error saving video:', e);
    alert('Failed to save video: ' + e);
  }
}
