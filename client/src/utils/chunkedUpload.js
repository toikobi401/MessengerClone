/**
 * Chunked Upload Utility for Large Files
 * Supports direct upload to Cloudinary for files up to 1GB
 * Using File.slice() algorithm with retry mechanism
 */

export const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB (Cloudinary minimum chunk size)
export const MAX_RETRIES = 3;
export const SMALL_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB

/**
 * Generate unique upload ID for chunked upload session
 */
const generateUploadId = () => {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

/**
 * Upload a single chunk with retry logic
 */
const uploadChunk = async (
  chunk,
  chunkIndex,
  totalChunks,
  uploadId,
  cloudinaryConfig,
  fileSize,
  retries = 0
) => {
  const { cloudName, signature, timestamp, apiKey, folder } = cloudinaryConfig;
  
  // Calculate byte range for this chunk
  const start = chunkIndex * CHUNK_SIZE;
  const end = Math.min(start + chunk.size, fileSize);

  // Prepare FormData - params MUST match what was signed
  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'X-Unique-Upload-Id': uploadId,
          'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Chunk ${chunkIndex + 1} upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error uploading chunk ${chunkIndex + 1}:`, error);
    
    // Retry logic
    if (retries < MAX_RETRIES) {
      console.log(`Retrying chunk ${chunkIndex + 1} (Attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
      return uploadChunk(chunk, chunkIndex, totalChunks, uploadId, cloudinaryConfig, fileSize, retries + 1);
    }
    
    throw error;
  }
};

/**
 * Main chunked upload function
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for progress updates (percentage)
 * @param {Object} signatureData - Cloudinary signature from backend
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
export const uploadLargeFile = async (file, onProgress, signatureData) => {
  // Validate input
  if (!file) {
    throw new Error('No file provided');
  }

  if (!signatureData || !signatureData.signature) {
    throw new Error('Invalid signature data');
  }

  const { signature, timestamp, cloudName, apiKey } = signatureData;
  
  // Calculate chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = generateUploadId();
  
  console.log(`Starting chunked upload: ${file.name}`);
  console.log(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total chunks: ${totalChunks}`);

  let uploadedChunks = 0;
  let finalResponse = null;

  // Upload chunks sequentially to ensure order
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${(chunk.size / 1024).toFixed(2)} KB)`);

    try {
      const response = await uploadChunk(
        chunk,
        chunkIndex,
        totalChunks,
        uploadId,
        {
          cloudName,
          signature,
          timestamp,
          apiKey,
          folder: 'messenger_uploads'
        },
        file.size
      );

      uploadedChunks++;
      
      // Update progress
      const progress = Math.round((uploadedChunks / totalChunks) * 100);
      if (onProgress) {
        onProgress(progress);
      }

      // Store final response (Cloudinary returns full data on last chunk)
      finalResponse = response;

    } catch (error) {
      console.error(`Failed to upload chunk ${chunkIndex + 1} after ${MAX_RETRIES} retries`);
      throw new Error(`Upload failed at chunk ${chunkIndex + 1}: ${error.message}`);
    }
  }

  console.log('✅ Chunked upload completed successfully');
  return finalResponse;
};

/**
 * Standard upload for small files (< 10MB)
 * Uses simple FormData without chunking
 */
export const uploadSmallFile = async (file, signatureData, onProgress) => {
  const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);

  try {
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Small file upload failed: ${error.message}`);
  }
};

/**
 * Smart upload function - chooses strategy based on file size
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback
 * @param {Object} signatureData - Cloudinary signature
 * @returns {Promise<Object>} - Upload result with secure_url
 */
export const uploadFile = async (file, onProgress, signatureData) => {
  if (file.size < SMALL_FILE_THRESHOLD) {
    console.log('Using standard upload for small file');
    return uploadSmallFile(file, signatureData, onProgress);
  } else {
    console.log('Using chunked upload for large file');
    return uploadLargeFile(file, onProgress, signatureData);
  }
};

// Default export for convenience
export default {
  uploadFile,
  uploadLargeFile,
  uploadSmallFile,
  CHUNK_SIZE,
  SMALL_FILE_THRESHOLD
};
