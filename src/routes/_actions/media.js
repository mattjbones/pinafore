import { store } from '../_store/store'
import { uploadMedia } from '../_api/media'
import { toast } from '../_components/toast/toast'
import { scheduleIdleTask } from '../_utils/scheduleIdleTask'
import { mediaUploadFileCache } from '../_utils/mediaUploadFileCache'

export async function doMediaUpload (realm, file) {
  const { currentInstance, accessToken } = store.get()
  store.set({ uploadingMedia: true })
  try {
    const response = await uploadMedia(currentInstance, accessToken, file)
    const composeMedia = store.getComposeData(realm, 'media') || []
    if (composeMedia.length === 4) {
      throw new Error('Only 4 media max are allowed')
    }
    mediaUploadFileCache.set(response.url, file)
    composeMedia.push({
      data: response,
      file: { name: file.name },
      description: ''
    })
    store.setComposeData(realm, {
      media: composeMedia
    })
    scheduleIdleTask(() => store.save())
  } catch (e) {
    console.error(e)
    toast.say('Failed to upload media: ' + (e.message || ''))
  } finally {
    store.set({ uploadingMedia: false })
  }
}

export function deleteMedia (realm, i) {
  const composeMedia = store.getComposeData(realm, 'media')
  composeMedia.splice(i, 1)

  store.setComposeData(realm, {
    media: composeMedia
  })
  scheduleIdleTask(() => store.save())
}
