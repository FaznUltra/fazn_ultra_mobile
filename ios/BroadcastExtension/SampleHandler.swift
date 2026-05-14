import ReplayKit
import AVFoundation
import Photos

class SampleHandler: RPBroadcastSampleHandler {

  private let appGroupID    = "group.com.fazn.musabello"
  private let notifStop     = "com.fazn.broadcast.stop"     // main app → extension
  private let notifStarted  = "com.fazn.broadcast.started"  // extension → main app
  private let notifStopped  = "com.fazn.broadcast.stopped"  // extension → main app

  private var assetWriter:   AVAssetWriter?
  private var videoInput:    AVAssetWriterInput?
  private var audioInput:    AVAssetWriterInput?
  private var outputURL:     URL?
  private var sessionStarted = false

  override func broadcastStarted(withSetupInfo setupInfo: [String: NSObject]?) {
    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("fazn_\(Int(Date().timeIntervalSince1970)).mp4")
    outputURL = url

    guard let writer = try? AVAssetWriter(outputURL: url, fileType: .mp4) else {
      finishBroadcastWithError(makeError("Could not create video writer"))
      return
    }

    let screen = UIScreen.main.bounds.size
    let scale  = UIScreen.main.scale
    let videoSettings: [String: Any] = [
      AVVideoCodecKey:  AVVideoCodecType.h264,
      AVVideoWidthKey:  Int(screen.width * scale),
      AVVideoHeightKey: Int(screen.height * scale),
      AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 2_000_000,
        AVVideoProfileLevelKey:   AVVideoProfileLevelH264HighAutoLevel,
      ]
    ]
    let vInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
    vInput.expectsMediaDataInRealTime = true
    if writer.canAdd(vInput) { writer.add(vInput) }

    let audioSettings: [String: Any] = [
      AVFormatIDKey:         kAudioFormatMPEG4AAC,
      AVSampleRateKey:       44100,
      AVNumberOfChannelsKey: 2,
      AVEncoderBitRateKey:   128_000,
    ]
    let aInput = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
    aInput.expectsMediaDataInRealTime = true
    if writer.canAdd(aInput) { writer.add(aInput) }

    assetWriter = writer
    videoInput  = vInput
    audioInput  = aInput

    // Tell main app we started
    setState("recording")
    postDarwin(notifStarted)

    // Listen for stop signal from main app
    let ptr = Unmanaged.passUnretained(self).toOpaque()
    CFNotificationCenterAddObserver(
      CFNotificationCenterGetDarwinNotifyCenter(), ptr,
      { _, obs, _, _, _ in
        guard let obs else { return }
        let me = Unmanaged<SampleHandler>.fromOpaque(obs).takeUnretainedValue()
        me.finishBroadcastWithError(me.makeError("Stopped by user"))
      },
      notifStop as CFString, nil, .deliverImmediately
    )
  }

  override func broadcastPaused()  {}
  override func broadcastResumed() {}

  override func broadcastFinished() {
    CFNotificationCenterRemoveObserver(
      CFNotificationCenterGetDarwinNotifyCenter(),
      Unmanaged.passUnretained(self).toOpaque(),
      CFNotificationName(notifStop as CFString), nil
    )

    setState("stopped")
    postDarwin(notifStopped)

    videoInput?.markAsFinished()
    audioInput?.markAsFinished()

    assetWriter?.finishWriting { [weak self] in
      guard let url = self?.outputURL else { return }
      PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
        guard status == .authorized || status == .limited else { return }
        PHPhotoLibrary.shared().performChanges({
          PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: url)
        }) { _, _ in try? FileManager.default.removeItem(at: url) }
      }
    }
  }

  override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer,
                                    with type: RPSampleBufferType) {
    guard let writer = assetWriter else { return }
    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)

    if !sessionStarted {
      writer.startWriting()
      writer.startSession(atSourceTime: pts)
      sessionStarted = true
    }

    switch type {
    case .video:
      if videoInput?.isReadyForMoreMediaData == true, writer.status == .writing {
        videoInput?.append(sampleBuffer)
      }
    case .audioApp, .audioMic:
      if audioInput?.isReadyForMoreMediaData == true, writer.status == .writing {
        audioInput?.append(sampleBuffer)
      }
    @unknown default: break
    }
  }

  // MARK: - Helpers

  private func setState(_ state: String) {
    let ud = UserDefaults(suiteName: appGroupID)
    ud?.set(state, forKey: "broadcastState")
    ud?.synchronize()
  }

  private func postDarwin(_ name: String) {
    CFNotificationCenterPostNotification(
      CFNotificationCenterGetDarwinNotifyCenter(),
      CFNotificationName(name as CFString),
      nil, nil, true
    )
  }

  private func makeError(_ msg: String) -> Error {
    NSError(domain: "com.fazn.broadcast", code: 0,
            userInfo: [NSLocalizedDescriptionKey: msg])
  }
}
