import axios from 'axios'
import { API_CONFIG } from '@/services/api/apiConfig'

export interface PhotoUploadResult {
  success: boolean
  photoFileName?: string
  error?: string
}

export interface PhotoFetchResult {
  success: boolean
  imageUrl?: string
  error?: string
}

/**
 * Centralized photo service for handling client photo operations
 */
export class PhotoService {
  /**
   * Fetch a client's photo URL
   * @param clientId - The client's ID
   * @param photoFileName - Optional photo filename if known
   * @returns Promise with photo URL or error
   */
  static async fetchClientPhoto(
    clientId: string,
    photoFileName?: string,
  ): Promise<PhotoFetchResult> {
    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        return { success: false, error: 'No authentication token found' }
      }

      // If photoFileName is provided, use it directly
      if (photoFileName && photoFileName.trim()) {
        try {
          const fileName = `clients/${photoFileName}`

          const presignedResponse = await axios.post(
            `${API_CONFIG.baseURL}/generatePreSignedUrlAwsS3`,
            {
              fileName,
              fileType: 'image/*',
              action: 'retrieve',
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          )

          if (presignedResponse.data?.url) {
            return { success: true, imageUrl: presignedResponse.data.url }
          }
        } catch (error) {
          console.error('Error getting presigned URL for provided photoFileName:', error)
        }
      }

      // If no photoFileName provided, get it from the client record
      const clientResponse = await axios.get(`${API_CONFIG.baseURL}/clients`, {
        params: {
          id: clientId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const clientPhotoFileName = clientResponse.data?.photoFileName

      if (clientPhotoFileName && clientPhotoFileName.trim()) {
        try {
          const fileName = `clients/${clientPhotoFileName}`

          const presignedResponse = await axios.post(
            `\/generatePreSignedUrlAwsS3`,
            {
              fileName,
              fileType: 'image/*',
              action: 'retrieve',
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          )

          if (presignedResponse.data?.url) {
            return { success: true, imageUrl: presignedResponse.data.url }
          }
        } catch (error) {
          console.error('Error getting presigned URL for client photo:', error)
        }
      }

      // No photo available
      return { success: true, imageUrl: undefined }
    } catch (error) {
      console.error('Error fetching client photo:', error)
      return {
        success: false,
        error: axios.isAxiosError(error) ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Upload a client photo using the S3 presigned URL workflow
   * @param clientId - The client's ID
   * @param file - The image file to upload
   * @returns Promise with upload result
   */
  static async uploadClientPhoto(
    clientId: string,
    file: File,
    clientData: unknown,
  ): Promise<PhotoUploadResult> {
    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        return { success: false, error: 'No authentication token found' }
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop() || 'jpg'
      const fileName = `clients/${clientId}.${fileExtension}`

      // Step 1: Get presigned URL for upload
      const presignedResponse = await axios.post(
        `\/generatePreSignedUrlAwsS3`,
        {
          fileName,
          fileType: file.type,
          action: 'save',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!presignedResponse.data?.url) {
        return { success: false, error: 'Failed to get presigned URL' }
      }

      // Step 2: Upload file to S3 using presigned URL
      const uploadResponse = await axios.put(presignedResponse.data.url, file, {
        headers: {
          'Content-Type': file.type,
        },
      })

      if (uploadResponse.status !== 200) {
        return { success: false, error: 'Failed to upload file to S3' }
      }

      await axios.put(
        `\/clients/${clientId}`,
        {
          ...(typeof clientData === 'object' && clientData !== null ? clientData : {}),
          photoFileName: fileName.split('/').pop(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      return {
        success: true,
        photoFileName: fileName.split('/').pop(),
      }
    } catch (error) {
      console.error('Error uploading client photo:', error)
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Unknown error occurred',
      }
    }
  }

  /**
   * Delete a client photo
   * @param clientId - The client's ID
   * @returns Promise with deletion result
   */
  static async deleteClientPhoto(clientId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        return { success: false, error: 'No authentication token found' }
      }

      // Clear the photoFileName from the client record
      await axios.put(
        `\/clients`,
        {
          id: clientId,
          photoFileName: '',
        },
        {
          params: {
            id: clientId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      return { success: true }
    } catch (error) {
      console.error('Error deleting client photo:', error)
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Unknown error occurred',
      }
    }
  }
}
