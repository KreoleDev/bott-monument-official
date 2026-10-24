import { useEffect, useRef, useState } from "react";
import { useFetchClient } from "@strapi/strapi/admin";
import styled from "styled-components";

type Photo = { id: string; name: string; alternativeText?: string };
type Props = { name: string; value?: Photo[] | null; onChange: (event: { target: { name: string; value: Photo[]; type: "json" } }) => void };

const UploadArea = styled.section`
  display: grid;
  gap: 0.85rem;
  width: 100%;
  color: #32324d;
  font-family: inherit;
`;

const DropZone = styled.div<{ $dragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 7rem;
  padding: 1.1rem 1.25rem;
  border: 1px dashed ${({ $dragging }) => ($dragging ? "#4945ff" : "#d9d8ff")};
  border-radius: 8px;
  background: ${({ $dragging }) => ($dragging ? "#f0efff" : "#f6f5ff")};
  transition: border-color 140ms ease, background 140ms ease;
`;

const UploadGlyph = styled.span`
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #d9d8ff;
  border-radius: 8px;
  color: #4945ff;
  font-size: 1.5rem;
`;

const Instructions = styled.div`
  display: grid;
  flex: 1;
  gap: 0.25rem;
  strong { color: #32324d; font-size: 0.9rem; font-weight: 600; }
  span, small { color: #666687; font-size: 0.78rem; }
  small { margin-top: 0.15rem; }
`;

const BrowseButton = styled.label`
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  padding: 0 0.95rem;
  border: 1px solid #4945ff;
  border-radius: 6px;
  background: #4945ff;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #3733d5; }
  &:focus-within { outline: 2px solid #4945ff; outline-offset: 2px; }
  input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
`;

const PhotoList = styled.ul`
  display: grid;
  gap: 0.45rem;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const PhotoRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.55rem 0.7rem;
  border: 1px solid #eaeaef;
  border-radius: 6px;
  background: #f6f6f9;
  color: #32324d;
  font-size: 0.8rem;
  span { overflow: hidden; flex: 1; text-overflow: ellipsis; white-space: nowrap; }
  button { border: 0; background: transparent; color: #666687; font-size: 0.75rem; cursor: pointer; }
  button:hover { color: #32324d; }
`;

const PhotoThumbnail = styled.img`
  display: block;
  width: 4rem;
  height: 3rem;
  flex: 0 0 auto;
  border: 1px solid #dcdce4;
  border-radius: 4px;
  background: #f0f0f5;
  object-fit: cover;
`;

const PendingPhotos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
  gap: 0.5rem;
`;

const PendingPhoto = styled.div`
  overflow: hidden;
  border: 1px solid #eaeaef;
  border-radius: 6px;
  background: #f6f6f9;
  img { display: block; width: 100%; height: 4.5rem; object-fit: cover; }
  span { display: block; overflow: hidden; padding: 0.35rem 0.45rem; color: #4a4a6a; font-size: 0.7rem; text-overflow: ellipsis; white-space: nowrap; }
`;

export default function PrivateGalleryPhotosInput({ name, value, onChange }: Props) {
  const { get, post } = useFetchClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [pendingPhotos, setPendingPhotos] = useState<Array<{ name: string; url: string }>>([]);
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const [retryIds, setRetryIds] = useState<string[]>([]);
  const retryPreviews = useRef<Array<{ name: string; url: string }> | null>(null);
  const localPreviewUrls = useRef(new Set<string>());
  const photos = Array.isArray(value) ? value : [];
  const photoIds = photos.map((photo) => photo.id).join(",");

  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];
    const ids = photoIds.split(",").filter(Boolean);
    ids.forEach((id) => {
      void get(`/private-gallery/photo/${encodeURIComponent(id)}`, { responseType: "blob" })
        .then(({ data }) => {
          const url = URL.createObjectURL(data as Blob);
          createdUrls.push(url);
          if (cancelled) URL.revokeObjectURL(url);
          else setPreviewUrls((current) => ({ ...current, [id]: url }));
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoIds, get]);

  useEffect(() => () => {
    localPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    localPreviewUrls.current.clear();
  }, []);

  async function upload(selectedFiles: File[], isRetry = false, retryUploadIds: string[] = []) {
    if (!selectedFiles.length) return;
    // Snapshot the FileList before clearing the input. FileList is live in some
    // browsers, so retaining it can turn a multi-select into an empty/single upload.
    const files = [...selectedFiles];
    const uploadIds = isRetry && retryUploadIds.length === files.length
      ? retryUploadIds
      : files.map(() => crypto.randomUUID());
    if (files.length > 20) {
      setError("Choose no more than 20 photos at a time.");
      return;
    }
    if (photos.length + files.length > 20) {
      setError(`This gallery item can contain up to 20 photos. ${photos.length} are already attached.`);
      return;
    }
    const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 25 * 1024 * 1024);
    if (invalidFile) {
      setError(`${invalidFile.name} is not a supported image or is larger than 25 MB.`);
      return;
    }
    const localPreviews = isRetry && retryPreviews.current
      ? retryPreviews.current
      : files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    localPreviews.forEach((photo) => localPreviewUrls.current.add(photo.url));
    setPendingPhotos(localPreviews);
    setUploading(true);
    setError("");
    const failedFiles: File[] = [];
    const failedPreviews: Array<{ name: string; url: string }> = [];
    const failedIds: string[] = [];
    const attachedPhotos = [...photos];
    const attachedPreviewUrls = new Set<string>();
    let firstError = "";
    try {
      // Upload individually so a Strapi restart cannot discard the whole batch.
      for (const [index, file] of files.entries()) {
        setUploadProgress(`${index + 1} of ${files.length}`);
        try {
          let response: Awaited<ReturnType<typeof post>> | undefined;
          for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
              const body = new FormData();
              body.append("files", file);
              response = await post("/private-gallery/upload", body, {
                headers: { "X-Private-Photo-Id": uploadIds[index] },
              });
              break;
            } catch (networkError) {
              const failure = networkError as { message?: string; status?: number };
              const transient = failure.status === undefined || failure.status >= 500;
              if (!transient || attempt === 4) throw networkError;
              await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
            }
          }
          const uploaded = Array.isArray(response.data?.photos) ? response.data.photos as Photo[] : [];
          if (uploaded.length !== 1) throw new Error("The server did not return the uploaded photo.");
          attachedPhotos.push(uploaded[0]);
          attachedPreviewUrls.add(localPreviews[index].url);
          onChange({ target: { name, value: [...attachedPhotos], type: "json" } });
          setPreviewUrls((current) => ({ ...current, [uploaded[0].id]: localPreviews[index].url }));
        } catch (uploadError) {
          const errorWithResponse = uploadError as {
            message?: string;
            response?: { data?: { error?: { message?: string } } };
          };
          firstError ||= errorWithResponse.response?.data?.error?.message || errorWithResponse.message || "Upload failed.";
          failedFiles.push(file);
          failedPreviews.push(localPreviews[index]);
          failedIds.push(uploadIds[index]);
        }
      }
      setRetryFiles(failedFiles);
      setRetryIds(failedIds);
      retryPreviews.current = failedFiles.length ? failedPreviews : null;
      setPendingPhotos(failedPreviews);
      setError(failedFiles.length ? `${failedFiles.length} photo${failedFiles.length === 1 ? "" : "s"} could not upload. ${firstError}` : "");
      const failedUrls = new Set(failedPreviews.map((photo) => photo.url));
      localPreviews.forEach((photo) => {
        if (!failedUrls.has(photo.url) && !attachedPreviewUrls.has(photo.url)) {
          URL.revokeObjectURL(photo.url);
          localPreviewUrls.current.delete(photo.url);
        }
      });
    } finally {
      setUploadProgress("");
      setUploading(false);
    }
  }

  function remove(index: number) {
    onChange({ target: { name, value: photos.filter((_, itemIndex) => itemIndex !== index), type: "json" } });
  }

  return (
    <UploadArea>
      <DropZone
        $dragging={dragging}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(Array.from(event.dataTransfer.files)); }}
        aria-busy={uploading}
      >
        <UploadGlyph aria-hidden="true">↑</UploadGlyph>
        <Instructions>
          <strong>{dragging ? "Drop photos to upload" : "Add private gallery photos"}</strong>
          <span>Drag files here or choose them from your computer.</span>
          <small>JPEG, PNG, WebP or AVIF · Up to 20 photos, 25 MB each</small>
        </Instructions>
        <BrowseButton>
          {uploading ? `Uploading ${uploadProgress}…` : "Choose photos"}
          <input aria-label="Choose private gallery photos from your computer" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading || retryFiles.length > 0} onChange={(event) => { const files = Array.from(event.currentTarget.files || []); event.currentTarget.value = ""; void upload(files); }} />
        </BrowseButton>
      </DropZone>
      {error && <p role="alert" style={{ color: "#b42318", margin: 0, fontSize: "0.8rem" }}>{error}</p>}
      {retryFiles.length > 0 && <button type="button" disabled={uploading} onClick={() => void upload(retryFiles, true, retryIds)} style={{ justifySelf: "start", border: "1px solid #4945ff", borderRadius: 6, padding: "0.45rem 0.75rem", background: "#fff", color: "#4945ff", cursor: uploading ? "wait" : "pointer" }}>Retry upload ({retryFiles.length} {retryFiles.length === 1 ? "photo" : "photos"})</button>}
      {pendingPhotos.length > 0 && <PendingPhotos aria-label="Photo upload previews">{pendingPhotos.map((photo) => <PendingPhoto key={photo.url}><img src={photo.url} alt="" /><span title={photo.name}>{photo.name}</span></PendingPhoto>)}</PendingPhotos>}
      {photos.length > 0 && <PhotoList aria-label={`${photos.length} private photos uploaded`}>
        {photos.map((photo, index) => <PhotoRow key={`${photo.id}-${index}`}><PhotoThumbnail src={previewUrls[photo.id]} alt={photo.alternativeText || photo.name} /><span title={photo.name}>{photo.name}</span><button type="button" onClick={() => remove(index)} aria-label={`Remove ${photo.name}`}>Remove</button></PhotoRow>)}
      </PhotoList>}
    </UploadArea>
  );
}
