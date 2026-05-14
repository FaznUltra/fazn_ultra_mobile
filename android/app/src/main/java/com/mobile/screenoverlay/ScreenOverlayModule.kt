package com.mobile.screenoverlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.view.Gravity
import android.view.MotionEvent
import android.view.WindowManager
import android.widget.Button
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.media.projection.MediaProjectionManager

class ScreenOverlayModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val REQUEST_MEDIA_PROJECTION = 1001
        const val NAME = "ScreenOverlayModule"
        const val EVENT_RECORDING_STATE = "onRecordingStateChanged"

        // Purple semi-transparent overlay color (matches iOS)
        private const val COLOR_IDLE = 0xCC8A2BE2.toInt()
        private const val COLOR_RECORDING = 0xCCBA55D3.toInt()
    }

    private var windowManager: WindowManager? = null
    private var overlayButton: Button? = null
    private var mediaProjectionManager: MediaProjectionManager? = null
    private var isRecording = false

    // Pending promise while waiting for permission result
    private var pendingResolve: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = NAME

    // MARK: - Overlay

    @ReactMethod
    fun showOverlay(promise: Promise) {
        val activity = reactApplicationContext.currentActivity ?: run {
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
                text = if (isRecording) "STOP" else "REC"
                textSize = 14f
                setBackgroundColor(if (isRecording) COLOR_RECORDING else COLOR_IDLE)
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
        reactApplicationContext.currentActivity?.runOnUiThread {
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
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            pendingResolve?.reject("NO_ACTIVITY", "No activity available")
            pendingResolve = null
            return
        }
        val intent = mediaProjectionManager!!.createScreenCaptureIntent()
        activity.startActivityForResult(intent, REQUEST_MEDIA_PROJECTION)
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQUEST_MEDIA_PROJECTION) return
        if (resultCode != Activity.RESULT_OK || data == null) {
            pendingResolve?.reject("CANCELLED", "User cancelled screen capture")
            pendingResolve = null
            return
        }

        // Start the foreground service with the projection result.
        val ctx = reactApplicationContext
        val serviceIntent = Intent(ctx, RecordingService::class.java).apply {
            action = RecordingService.ACTION_START
            putExtra(RecordingService.EXTRA_RESULT_CODE, resultCode)
            putExtra(RecordingService.EXTRA_RESULT_DATA, data)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(serviceIntent)
        } else {
            ctx.startService(serviceIntent)
        }

        isRecording = true
        updateOverlayState()
        emitRecordingState(true)

        pendingResolve?.resolve("recording_started")
        pendingResolve = null
    }

    override fun onNewIntent(intent: Intent) {
        // no-op
    }

    @ReactMethod
    fun startRecording(promise: Promise) {
        if (isRecording) {
            promise.resolve("already_recording")
            return
        }
        pendingResolve = promise
        requestProjectionPermission()
    }

    @ReactMethod
    fun stopRecording(promise: Promise?) {
        if (!isRecording) {
            promise?.resolve("not_recording")
            return
        }

        val ctx = reactApplicationContext
        val stopIntent = Intent(ctx, RecordingService::class.java).apply {
            action = RecordingService.ACTION_STOP
        }
        try {
            ctx.startService(stopIntent)
        } catch (_: Exception) {
            ctx.stopService(Intent(ctx, RecordingService::class.java))
        }

        isRecording = false
        updateOverlayState()
        emitRecordingState(false)

        promise?.resolve("stopped")
    }

    private fun updateOverlayState() {
        reactApplicationContext.currentActivity?.runOnUiThread {
            overlayButton?.text = if (isRecording) "STOP" else "REC"
            overlayButton?.setBackgroundColor(if (isRecording) COLOR_RECORDING else COLOR_IDLE)
        }
    }

    private fun emitRecordingState(recording: Boolean) {
        val payload = Arguments.createMap().apply {
            putBoolean("isRecording", recording)
        }
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_RECORDING_STATE, payload)
    }

    private fun canDrawOverlays(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.provider.Settings.canDrawOverlays(reactApplicationContext)
        } else true
    }

    // Required for RN event emitters
    @ReactMethod
    fun addListener(eventName: String) { /* no-op */ }

    @ReactMethod
    fun removeListeners(count: Int) { /* no-op */ }
}
