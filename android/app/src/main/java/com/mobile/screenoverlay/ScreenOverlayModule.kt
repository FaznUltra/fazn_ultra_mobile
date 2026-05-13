package com.mobile.screenoverlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.MediaRecorder
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Environment
import android.view.Gravity
import android.view.MotionEvent
import android.view.WindowManager
import android.widget.Button
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class ScreenOverlayModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val REQUEST_MEDIA_PROJECTION = 1001
        const val NAME = "ScreenOverlayModule"
    }

    private var windowManager: WindowManager? = null
    private var overlayButton: Button? = null
    private var mediaProjectionManager: MediaProjectionManager? = null
    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var mediaRecorder: MediaRecorder? = null
    private var isRecording = false
    private var outputFilePath: String? = null

    // Pending promise while waiting for permission result
    private var pendingResolve: Promise? = null

    override fun getName() = NAME

    // MARK: - Overlay

    @ReactMethod
    fun showOverlay(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

        if (!canDrawOverlays()) {
            promise.reject("NO_PERMISSION", "SYSTEM_ALERT_WINDOW permission not granted")
            return
        }

        activity.runOnUiThread {
            if (overlayButton != null) {
                promise.resolve("already_shown")
                return@runOnUiThread
            }

            windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                else
                    WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                x = 20
                y = 100
                width = 180
                height = 180
            }

            val button = Button(reactApplicationContext).apply {
                text = "REC"
                textSize = 14f
                setBackgroundColor(0xCCFF4444.toInt())
                setTextColor(0xFFFFFFFF.toInt())
            }

            // Drag support
            var initialX = 0; var initialY = 0
            var touchX = 0f; var touchY = 0f
            button.setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x; initialY = params.y
                        touchX = event.rawX; touchY = event.rawY
                        true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - touchX).toInt()
                        params.y = initialY + (event.rawY - touchY).toInt()
                        windowManager?.updateViewLayout(button, params)
                        true
                    }
                    MotionEvent.ACTION_UP -> {
                        val dx = Math.abs(event.rawX - touchX)
                        val dy = Math.abs(event.rawY - touchY)
                        if (dx < 10 && dy < 10) toggleRecording()
                        true
                    }
                    else -> false
                }
            }

            windowManager?.addView(button, params)
            overlayButton = button
            promise.resolve("shown")
        }
    }

    @ReactMethod
    fun hideOverlay(promise: Promise) {
        currentActivity?.runOnUiThread {
            overlayButton?.let { windowManager?.removeView(it) }
            overlayButton = null
            promise.resolve("hidden")
        }
    }

    // MARK: - Recording

    private fun toggleRecording() {
        if (isRecording) stopRecording(null)
        else requestProjectionPermission()
    }

    private fun requestProjectionPermission() {
        mediaProjectionManager = reactApplicationContext
            .getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        val intent = mediaProjectionManager!!.createScreenCaptureIntent()
        currentActivity?.startActivityForResult(intent, REQUEST_MEDIA_PROJECTION)
    }

    fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQUEST_MEDIA_PROJECTION) return
        if (resultCode != Activity.RESULT_OK || data == null) {
            pendingResolve?.reject("CANCELLED", "User cancelled screen capture")
            pendingResolve = null
            return
        }
        mediaProjection = mediaProjectionManager?.getMediaProjection(resultCode, data)
        startRecordingInternal()
        pendingResolve?.resolve("recording_started")
        pendingResolve = null
    }

    @ReactMethod
    fun startRecording(promise: Promise) {
        pendingResolve = promise
        requestProjectionPermission()
    }

    private fun startRecordingInternal() {
        val projection = mediaProjection ?: return
        val metrics = reactApplicationContext.resources.displayMetrics
        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val density = metrics.densityDpi

        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val dir = reactApplicationContext.getExternalFilesDir(Environment.DIRECTORY_MOVIES)
        val file = File(dir, "recording_$timestamp.mp4")
        outputFilePath = file.absolutePath

        mediaRecorder = MediaRecorder().apply {
            setVideoSource(MediaRecorder.VideoSource.SURFACE)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setVideoEncoder(MediaRecorder.VideoEncoder.H264)
            setVideoSize(width, height)
            setVideoFrameRate(30)
            setVideoEncodingBitRate(5 * 1024 * 1024)
            setOutputFile(outputFilePath)
            prepare()
        }

        virtualDisplay = projection.createVirtualDisplay(
            "ScreenOverlayCapture", width, height, density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            mediaRecorder!!.surface, null, null
        )

        mediaRecorder!!.start()
        isRecording = true

        currentActivity?.runOnUiThread {
            overlayButton?.text = "STOP"
            overlayButton?.setBackgroundColor(0xCC44FF44.toInt())
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise?) {
        if (!isRecording) {
            promise?.resolve("not_recording")
            return
        }

        try {
            mediaRecorder?.stop()
            mediaRecorder?.release()
        } catch (e: Exception) {
            // ignore stop errors
        }

        virtualDisplay?.release()
        mediaProjection?.stop()

        mediaRecorder = null
        virtualDisplay = null
        mediaProjection = null
        isRecording = false

        currentActivity?.runOnUiThread {
            overlayButton?.text = "REC"
            overlayButton?.setBackgroundColor(0xCCFF4444.toInt())
        }

        promise?.resolve(outputFilePath)

        // Notify JS with the saved file path
        sendEvent("onRecordingSaved", outputFilePath ?: "")
    }

    private fun sendEvent(eventName: String, data: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    private fun canDrawOverlays(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.provider.Settings.canDrawOverlays(reactApplicationContext)
        } else true
    }
}
