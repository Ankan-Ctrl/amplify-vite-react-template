import { useCallback, useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { downloadData, list, remove, uploadData } from 'aws-amplify/storage';
import { Amplify } from 'aws-amplify';
import { Download, File, FolderOpen, RefreshCw, Trash2, Upload } from 'lucide-react';
import './FilesTab.css';

interface StoredFile {
  path: string;
  size?: number;
  lastModified?: Date;
}

interface UploadStatus {
  name: string;
  percent: number;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected storage error occurred.';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileName = (path: string): string => path.slice(path.lastIndexOf('/') + 1);

function CloudFiles() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await fetchAuthSession();
      if (!session.identityId) {
        throw new Error('Your AWS identity is unavailable. Sign out and sign in again.');
      }

      const userPath = `users/${session.identityId}/`;
      const foundFiles: StoredFile[] = [];
      let nextToken: string | undefined;

      do {
        const page = await list({
          path: userPath,
          options: { nextToken, pageSize: 1000 },
        });
        foundFiles.push(...page.items);
        nextToken = page.nextToken;
      } while (nextToken);

      setFiles(foundFiles);
    } catch (loadError) {
      setError(`Could not load files from Amazon S3. ${getErrorMessage(loadError)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const session = await fetchAuthSession();
      if (!session.identityId) {
        throw new Error('Your AWS identity is unavailable. Sign out and sign in again.');
      }

      for (const file of selectedFiles) {
        const safeFileName = file.name.replace(/[\\/]+/g, '_');
        const path = `users/${session.identityId}/${crypto.randomUUID()}-${safeFileName}`;
        setUploadStatus({ name: file.name, percent: 0 });

        await uploadData({
          path,
          data: file,
          options: {
            contentType: file.type || 'application/octet-stream',
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (totalBytes) {
                setUploadStatus({
                  name: file.name,
                  percent: Math.round((transferredBytes / totalBytes) * 100),
                });
              }
            },
          },
        }).result;
      }

      setUploadStatus(null);
      await loadFiles();
    } catch (uploadError) {
      await loadFiles();
      setError(`Upload failed. ${getErrorMessage(uploadError)}`);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const handleDownload = async (file: StoredFile) => {
    setBusyPath(file.path);
    setError(null);

    try {
      const result = await downloadData({ path: file.path }).result;
      const blob = await result.body.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = getFileName(file.path);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (downloadError) {
      setError(`Download failed. ${getErrorMessage(downloadError)}`);
    } finally {
      setBusyPath(null);
    }
  };

  const handleDelete = async (file: StoredFile) => {
    const fileName = getFileName(file.path);
    if (!window.confirm(`Permanently delete "${fileName}" from AWS storage?`)) return;

    setBusyPath(file.path);
    setError(null);
    try {
      await remove({ path: file.path });
      setFiles((currentFiles) => currentFiles.filter((item) => item.path !== file.path));
    } catch (deleteError) {
      setError(`Delete failed. ${getErrorMessage(deleteError)}`);
    } finally {
      setBusyPath(null);
    }
  };

  return (
    <section className="files-workspace">
      <div className="files-toolbar">
        <div className="files-identity">
          <span className="files-private-icon" aria-hidden="true">
            <FolderOpen size={18} />
          </span>
          <p>Your files are private to your signed-in account.</p>
        </div>
        <div className="files-toolbar-actions">
          <button
            type="button"
            className="files-secondary-button"
            onClick={() => void loadFiles()}
            disabled={isLoading || isUploading || busyPath !== null}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <label className={`files-upload-area ${isUploading ? 'is-uploading' : ''}`}>
        <input
          type="file"
          multiple
          onChange={(event) => void handleUpload(event)}
          disabled={isUploading}
          aria-label="Choose files to upload to Amazon S3"
        />
        <span className="files-upload-icon" aria-hidden="true">
          <Upload size={20} />
        </span>
        <span className="files-upload-copy">
          <strong>{isUploading ? 'Uploading to AWS…' : 'Choose files to upload'}</strong>
          <span>Files go directly to your private Amazon S3 folder.</span>
        </span>
        <span className="files-choose-button">{isUploading ? 'Uploading' : 'Browse files'}</span>
      </label>

      {uploadStatus && (
        <div className="files-progress" role="status" aria-live="polite">
          <div className="files-progress-label">
            <span>{uploadStatus.name}</span>
            <span>{uploadStatus.percent}%</span>
          </div>
          <progress value={uploadStatus.percent} max={100} aria-label="File upload progress" />
        </div>
      )}

      {error && (
        <div className="files-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadFiles()}>
            Try again
          </button>
        </div>
      )}

      <div className="files-list-heading">
        <h2>Stored files</h2>
        <span>{isLoading ? 'Loading…' : `${files.length} ${files.length === 1 ? 'file' : 'files'}`}</span>
      </div>

      {isLoading ? (
        <p className="files-list-message" role="status">Connecting to your S3 storage…</p>
      ) : files.length === 0 ? (
        <div className="files-empty-state">
          <File size={22} aria-hidden="true" />
          <p>No files in your private folder yet.</p>
          <span>Choose a file above to upload it to AWS.</span>
        </div>
      ) : (
        <ul className="files-list">
          {files.map((file) => {
            const fileName = getFileName(file.path);
            const isBusy = busyPath === file.path;

            return (
              <li className="files-list-item" key={file.path}>
                <span className="files-item-icon" aria-hidden="true">
                  <File size={18} />
                </span>
                <span className="files-item-details">
                  <strong title={fileName}>{fileName}</strong>
                  <span>
                    {typeof file.size === 'number' ? formatFileSize(file.size) : 'Size unavailable'}
                    {file.lastModified && ` · ${file.lastModified.toLocaleDateString()}`}
                  </span>
                </span>
                <div className="files-item-actions">
                  <button
                    type="button"
                    className="files-icon-button"
                    onClick={() => void handleDownload(file)}
                    disabled={isBusy || isUploading}
                    aria-label={`Download ${fileName}`}
                    title="Download"
                  >
                    <Download size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="files-icon-button files-delete-button"
                    onClick={() => void handleDelete(file)}
                    disabled={isBusy || isUploading}
                    aria-label={`Delete ${fileName}`}
                    title="Delete"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function FilesTab() {
  const config = Amplify.getConfig();
  const storageConfig = config.Storage?.S3;
  const authConfig = config.Auth?.Cognito;

  if (
    !storageConfig?.bucket ||
    !storageConfig.region ||
    !authConfig?.identityPoolId ||
    !authConfig.userPoolId ||
    !authConfig.userPoolClientId
  ) {
    return (
      <section className="files-page">
        <header className="files-page-header">
          <h1>File storage</h1>
          <p>Secure file storage for your business documents.</p>
        </header>
        <div className="files-config-notice" role="status">
          <h2>Storage is not connected yet</h2>
          <p>
            Deploy the Amplify backend with the Storage resource, then reload this app.
            The deployed configuration must include Amazon S3 and Cognito authentication.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="files-page">
      <header className="files-page-header">
        <div>
          <h1>File storage</h1>
          <p>Keep business documents in your private AWS storage space.</p>
        </div>
        <span className="files-aws-badge">Amazon S3</span>
      </header>

      <CloudFiles />
    </section>
  );
}
