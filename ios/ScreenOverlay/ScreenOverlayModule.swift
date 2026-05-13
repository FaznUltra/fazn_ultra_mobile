import Foundation
import ReplayKit
import UIKit

@objc(ScreenOverlayModule)
class ScreenOverlayModule: NSObject {

  private var overlayWindow: UIWindow?
  private var overlayButton: UIButton?
  private let recorder = RPScreenRecorder.shared()

  // MARK: - Overlay

  @objc func showOverlay(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard self.overlayWindow == nil else {
        resolve("already_shown")
        return
      }

      let window = UIWindow(frame: UIScreen.main.bounds)
      window.windowLevel = UIWindow.Level.alert + 1
      window.backgroundColor = .clear
      window.isHidden = false

      let button = UIButton(frame: CGRect(x: 20, y: 100, width: 70, height: 70))
      button.backgroundColor = UIColor.red.withAlphaComponent(0.85)
      button.layer.cornerRadius = 35
      button.setTitle("REC", for: .normal)
      button.setTitleColor(.white, for: .normal)
      button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 12)
      button.addTarget(self, action: #selector(self.toggleRecording), for: .touchUpInside)

      // Allow dragging the overlay button
      let pan = UIPanGestureRecognizer(target: self, action: #selector(self.handlePan(_:)))
      button.addGestureRecognizer(pan)

      let rootVC = UIViewController()
      rootVC.view.backgroundColor = .clear
      rootVC.view.addSubview(button)
      window.rootViewController = rootVC

      self.overlayWindow = window
      self.overlayButton = button
      resolve("shown")
    }
  }

  @objc func hideOverlay(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.overlayWindow?.isHidden = true
      self.overlayWindow = nil
      self.overlayButton = nil
      resolve("hidden")
    }
  }

  @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
    guard let button = overlayButton else { return }
    let translation = gesture.translation(in: button.superview)
    button.center = CGPoint(x: button.center.x + translation.x, y: button.center.y + translation.y)
    gesture.setTranslation(.zero, in: button.superview)
  }

  // MARK: - Recording

  @objc private func toggleRecording() {
    if recorder.isRecording {
      stopRecording(nil, reject: nil)
    } else {
      startRecording(nil, reject: nil)
    }
  }

  @objc func startRecording(_ resolve: RCTPromiseResolveBlock?, reject: RCTPromiseRejectBlock?) {
    guard !recorder.isRecording else {
      resolve?("already_recording")
      return
    }

    recorder.startRecording { [weak self] error in
      if let error = error {
        reject?("START_FAILED", error.localizedDescription, error)
        return
      }
      DispatchQueue.main.async {
        self?.overlayButton?.backgroundColor = UIColor.green.withAlphaComponent(0.85)
        self?.overlayButton?.setTitle("STOP", for: .normal)
      }
      resolve?("recording_started")
    }
  }

  @objc func stopRecording(_ resolve: RCTPromiseResolveBlock?, reject: RCTPromiseRejectBlock?) {
    guard recorder.isRecording else {
      resolve?("not_recording")
      return
    }

    recorder.stopRecording { [weak self] previewVC, error in
      if let error = error {
        reject?("STOP_FAILED", error.localizedDescription, error)
        return
      }

      DispatchQueue.main.async {
        self?.overlayButton?.backgroundColor = UIColor.red.withAlphaComponent(0.85)
        self?.overlayButton?.setTitle("REC", for: .normal)

        if let previewVC = previewVC {
          previewVC.previewControllerDelegate = self as? RPPreviewViewControllerDelegate
          if let rootVC = UIApplication.shared.windows.first?.rootViewController {
            rootVC.present(previewVC, animated: true)
          }
        }
      }
      resolve?("recording_stopped")
    }
  }

  // Required for RCTBridgeModule
  @objc static func requiresMainQueueSetup() -> Bool { return true }
}
