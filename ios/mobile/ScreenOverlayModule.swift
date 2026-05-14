import Foundation
import ReplayKit
import UIKit
import AVKit

private let kAppGroup    = "group.com.fazn.musabello"
private let kBundleID    = "com.fazn.musabello.app.BroadcastExtension"
private let kNotifStop   = "com.fazn.broadcast.stop"
private let kNotifStarted = "com.fazn.broadcast.started"
private let kNotifStopped = "com.fazn.broadcast.stopped"

// MARK: - RecordingPiPViewController
class RecordingPiPViewController: AVPictureInPictureVideoCallViewController {
  private let button = UIButton(type: .custom)
  var onTap: (() -> Void)?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor.black.withAlphaComponent(0.5)
    button.setTitle("⏺ REC", for: .normal)
    button.setTitleColor(.white, for: .normal)
    button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 12)
    button.backgroundColor = UIColor.systemPurple.withAlphaComponent(0.75)
    button.layer.cornerRadius = 8
    button.clipsToBounds = true
    button.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(button)
    NSLayoutConstraint.activate([
      button.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 6),
      button.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -6),
      button.topAnchor.constraint(equalTo: view.topAnchor, constant: 6),
      button.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -6),
    ])
    button.addTarget(self, action: #selector(tapped), for: .touchUpInside)
  }

  @objc private func tapped() { onTap?() }

  func setRecording(_ on: Bool) {
    DispatchQueue.main.async {
      self.button.setTitle(on ? "⏹ STOP" : "⏺ REC", for: .normal)
      self.button.backgroundColor = (on ? UIColor.systemGreen : UIColor.systemPurple)
        .withAlphaComponent(0.75)
    }
  }
}

// MARK: - ScreenOverlayModule
@objc(ScreenOverlayModule)
class ScreenOverlayModule: RCTEventEmitter, AVPictureInPictureControllerDelegate {

  private var isRecordingState = false
  private var pipController:   AVPictureInPictureController?
  private var pipVC:           RecordingPiPViewController?
  private var pipSourceWindow: UIWindow?

  override func supportedEvents() -> [String] { ["onRecordingStateChanged"] }
  override static func requiresMainQueueSetup() -> Bool { true }

  // MARK: - Init / Darwin listeners

  override init() {
    super.init()
    listenForExtensionEvents()
  }

  private func listenForExtensionEvents() {
    let ptr = Unmanaged.passUnretained(self).toOpaque()

    // Extension started broadcasting
    CFNotificationCenterAddObserver(
      CFNotificationCenterGetDarwinNotifyCenter(), ptr,
      { _, obs, _, _, _ in
        guard let obs else { return }
        let me = Unmanaged<ScreenOverlayModule>.fromOpaque(obs).takeUnretainedValue()
        me.onBroadcastStarted()
      },
      kNotifStarted as CFString, nil, .deliverImmediately
    )

    // Extension stopped broadcasting
    CFNotificationCenterAddObserver(
      CFNotificationCenterGetDarwinNotifyCenter(), ptr,
      { _, obs, _, _, _ in
        guard let obs else { return }
        let me = Unmanaged<ScreenOverlayModule>.fromOpaque(obs).takeUnretainedValue()
        me.onBroadcastStopped()
      },
      kNotifStopped as CFString, nil, .deliverImmediately
    )
  }

  private func onBroadcastStarted() {
    NSLog("✅ Broadcast started")
    isRecordingState = true
    pipVC?.setRecording(true)
    emitState(true)
  }

  private func onBroadcastStopped() {
    NSLog("🛑 Broadcast stopped")
    isRecordingState = false
    pipVC?.setRecording(false)
    emitState(false)
  }

  private func emitState(_ on: Bool) {
    sendEvent(withName: "onRecordingStateChanged", body: ["isRecording": on])
  }

  // MARK: - Overlay (PiP)

  @objc func showOverlay(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject:  @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard self.pipController == nil else { resolve("already_shown"); return }
      guard AVPictureInPictureController.isPictureInPictureSupported() else {
        reject("PIP_NOT_SUPPORTED", "PiP not supported", nil); return
      }
      guard let scene = UIApplication.shared.connectedScenes
              .compactMap({ $0 as? UIWindowScene })
              .first(where: { $0.activationState == .foregroundActive })
      else { reject("NO_SCENE", "No active scene", nil); return }

      do {
        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: .mixWithOthers)
        try AVAudioSession.sharedInstance().setActive(true)
      } catch { NSLog("⚠️ AVAudioSession: \(error)") }

      // Tiny invisible source view required by AVPictureInPictureController
      let sourceView = UIView(frame: CGRect(x: 0, y: 0, width: 2, height: 2))
      sourceView.alpha = 0.01
      let srcWindow = UIWindow(windowScene: scene)
      srcWindow.frame = CGRect(x: 0, y: 0, width: 2, height: 2)
      srcWindow.windowLevel = .normal
      srcWindow.backgroundColor = .clear
      srcWindow.isOpaque = false
      let vc = UIViewController()
      vc.view.backgroundColor = .clear
      vc.view.addSubview(sourceView)
      srcWindow.rootViewController = vc
      srcWindow.isHidden = false

      let pipVC = RecordingPiPViewController()
      pipVC.preferredContentSize = CGSize(width: 160, height: 48)
      pipVC.setRecording(self.isRecordingState)
      pipVC.onTap = { [weak self] in self?.handlePiPTap() }

      let pip = AVPictureInPictureController(contentSource:
        .init(activeVideoCallSourceView: sourceView, contentViewController: pipVC))
      pip.delegate = self
      pip.canStartPictureInPictureAutomaticallyFromInline = true

      self.pipVC = pipVC
      self.pipController = pip
      self.pipSourceWindow = srcWindow

      DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { pip.startPictureInPicture() }
      resolve("shown")
    }
  }

  @objc func hideOverlay(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject:  @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.pipController?.stopPictureInPicture()
      self.pipController = nil
      self.pipVC = nil
      self.pipSourceWindow?.isHidden = true
      self.pipSourceWindow = nil
      resolve("hidden")
    }
  }

  // MARK: - PiP tap handler

  private func handlePiPTap() {
    if isRecordingState {
      // Stop: send Darwin notification to extension — stays on current app
      postStopNotification()
    } else {
      // Start: must show broadcast picker — app will come to foreground
      showBroadcastPicker()
    }
  }

  // MARK: - Broadcast control

  private func showBroadcastPicker() {
    DispatchQueue.main.async {
      guard let scene = UIApplication.shared.connectedScenes
              .compactMap({ $0 as? UIWindowScene })
              .first,
            let window = scene.windows.first(where: { $0.isKeyWindow }) ?? scene.windows.first
      else { return }

      let picker = RPSystemBroadcastPickerView(frame: CGRect(x: -200, y: -200, width: 60, height: 60))
      picker.preferredExtension = kBundleID
      picker.showsMicrophoneButton = false
      window.addSubview(picker)
      window.layoutIfNeeded()

      for sub in picker.subviews {
        if let btn = sub as? UIButton {
          btn.sendActions(for: .touchUpInside)
          break
        }
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + 1) { picker.removeFromSuperview() }
    }
  }

  private func postStopNotification() {
    CFNotificationCenterPostNotification(
      CFNotificationCenterGetDarwinNotifyCenter(),
      CFNotificationName(kNotifStop as CFString),
      nil, nil, true
    )
  }

  // MARK: - JS-callable methods

  @objc func startRecording(_ resolve: RCTPromiseResolveBlock?,
                            reject:   RCTPromiseRejectBlock?) {
    showBroadcastPicker()
    resolve?("picker_shown")
  }

  @objc func stopRecording(_ resolve: RCTPromiseResolveBlock?,
                           reject:   RCTPromiseRejectBlock?) {
    postStopNotification()
    resolve?("stop_sent")
  }

  // MARK: - AVPictureInPictureControllerDelegate

  func pictureInPictureController(
    _ pip: AVPictureInPictureController,
    restoreUserInterfaceForPictureInPictureStopWithCompletionHandler h: @escaping (Bool) -> Void
  ) { h(false) }

  func pictureInPictureController(_ pip: AVPictureInPictureController,
                                  failedToStartPictureInPictureWithError e: Error) {
    NSLog("❌ PiP failed: \(e)")
  }
}
